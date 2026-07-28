import crypto from 'node:crypto';
import {
  Outcome,
  PublisherCampaign,
  PublisherJob,
  RecordMap,
  cleanString,
  ensureAuthorization,
  envFirst,
  getCampaignOrThrow,
  getDb,
  getJobOrThrow,
  nowIso,
  optionalString,
  providerStatus,
  writeReceipt,
} from './core';

type ProviderResult = { provider: string; statusCode: number; externalId?: string; message: string };

async function parseProviderResponse(response: Response): Promise<RecordMap> {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text) as RecordMap; } catch { return { raw: text.slice(0, 2000) }; }
}

async function sendEmail(job: PublisherJob): Promise<ProviderResult> {
  const apiKey = envFirst('RESEND_API_KEY');
  const sender = envFirst('GTM_FROM_EMAIL', 'SENDER_EMAIL');
  if (!apiKey || !sender) throw Object.assign(new Error('Resend email provider is not configured.'), { status: 503 });
  if (!job.subject) throw Object.assign(new Error('Email jobs require a subject.'), { status: 400 });
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': job.id },
    body: JSON.stringify({ from: sender, to: [job.destination], subject: job.subject, text: job.content }),
    cache: 'no-store',
  });
  const payload = await parseProviderResponse(response);
  if (!response.ok) throw Object.assign(new Error(String(payload.message || payload.raw || `Resend returned ${response.status}.`)), { status: 502 });
  return { provider: 'resend', statusCode: response.status, externalId: typeof payload.id === 'string' ? payload.id : undefined, message: 'Email accepted by Resend.' };
}

async function sendWebhook(job: PublisherJob, campaign: PublisherCampaign): Promise<ProviderResult> {
  const url = envFirst('GTM_PUBLISH_WEBHOOK_URL');
  if (!url) throw Object.assign(new Error('Social publishing webhook is not configured.'), { status: 503 });
  const token = envFirst('GTM_PUBLISH_WEBHOOK_TOKEN');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Idempotency-Key': job.id };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method: 'POST', headers, cache: 'no-store',
    body: JSON.stringify({
      event: 'empire1.controlled_publish',
      campaign: { id: campaign.id, name: campaign.name, offer_name: campaign.offer_name, primary_url: campaign.primary_url },
      job: { id: job.id, channel: job.channel, destination: job.destination, subject: job.subject, content: job.content, content_sha256: job.content_sha256, metadata: job.metadata || {} },
    }),
  });
  const payload = await parseProviderResponse(response);
  if (!response.ok) throw Object.assign(new Error(String(payload.message || payload.raw || `Webhook returned ${response.status}.`)), { status: 502 });
  const externalId = typeof payload.id === 'string' ? payload.id : typeof payload.external_id === 'string' ? payload.external_id : undefined;
  return { provider: 'webhook', statusCode: response.status, externalId, message: 'Publish job accepted by the configured webhook.' };
}

async function recordCrmActivity(job: PublisherJob, description: string, stage?: string): Promise<void> {
  if (!job.crm_lead_id) return;
  const db = await getDb();
  if (!await db.collection('crm_leads').findOne({ id: job.crm_lead_id })) return;
  const timestamp = nowIso();
  const update: RecordMap = { updated_at: timestamp };
  if (stage) update.pipeline_stage = stage;
  await db.collection('crm_leads').updateOne({ id: job.crm_lead_id }, { $set: update });
  await db.collection('crm_activities').insertOne({ id: crypto.randomUUID(), lead_id: job.crm_lead_id, type: 'controlled_publisher', description, timestamp });
}

export async function dispatchJob(id: string, input: RecordMap): Promise<PublisherJob> {
  if (input.confirm_external_action !== true) throw Object.assign(new Error('Explicit external-action confirmation is required.'), { status: 400 });
  const confirmedBy = cleanString(input.confirmed_by, 'Confirmed by', 120);
  const job = await getJobOrThrow(id);
  const campaign = await getCampaignOrThrow(job.campaign_id);
  ensureAuthorization(campaign);
  if (job.status === 'DISPATCHED') return job;
  if (!['QUEUED', 'BLOCKED', 'FAILED'].includes(job.status)) throw Object.assign(new Error(`Job cannot dispatch from ${job.status}.`), { status: 409 });
  if (job.scheduled_for && new Date(job.scheduled_for).getTime() > Date.now()) throw Object.assign(new Error('This job is scheduled for a future time.'), { status: 409 });

  const db = await getDb();
  const timestamp = nowIso();
  if (job.channel === 'manual') {
    await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: { status: 'MANUAL_READY', provider: 'manual', provider_message: 'Copy-ready; requires manual publication.', updated_at: timestamp } });
    await writeReceipt('PUBLISH_JOB_MANUAL_READY', { campaign_id: campaign.id, job_id: id, confirmed_by: confirmedBy });
    return getJobOrThrow(id);
  }

  const config = providerStatus();
  if (!config.execution_enabled || config.dry_run) {
    const message = !config.execution_enabled ? 'External execution is disabled. Set EMPIRE_PUBLISHER_ENABLED=true.' : 'Publisher is in dry-run mode. Set GTM_PUBLISH_DRY_RUN=false.';
    await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: { status: 'BLOCKED', provider_message: message, updated_at: timestamp } });
    await writeReceipt('PUBLISH_JOB_BLOCKED', { campaign_id: campaign.id, job_id: id, reason: message, confirmed_by: confirmedBy });
    return getJobOrThrow(id);
  }

  const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sentToday = await db.collection('gtm_publish_jobs').countDocuments({ campaign_id: campaign.id, status: 'DISPATCHED', dispatched_at: { $gte: dayStart } });
  if (sentToday >= campaign.daily_action_limit) {
    const message = `Daily action limit of ${campaign.daily_action_limit} has been reached.`;
    await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: { status: 'BLOCKED', provider_message: message, updated_at: timestamp } });
    await writeReceipt('PUBLISH_JOB_BLOCKED', { campaign_id: campaign.id, job_id: id, reason: message, confirmed_by: confirmedBy });
    return getJobOrThrow(id);
  }

  await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: { status: 'DISPATCHING', updated_at: timestamp } });
  try {
    const result = job.channel === 'email' ? await sendEmail(job) : await sendWebhook(job, campaign);
    const dispatchedAt = nowIso();
    await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: {
      status: 'DISPATCHED', provider: result.provider, provider_external_id: result.externalId,
      provider_status: result.statusCode, provider_message: result.message, dispatched_at: dispatchedAt, updated_at: dispatchedAt,
    } });
    await db.collection('gtm_publish_campaigns').updateOne({ id: campaign.id }, { $set: { updated_at: dispatchedAt }, $inc: { 'counters.dispatched': 1 } });
    await writeReceipt('PUBLISH_JOB_DISPATCHED', {
      campaign_id: campaign.id, job_id: id, channel: job.channel, destination: job.destination,
      provider: result.provider, provider_external_id: result.externalId || null, provider_status: result.statusCode,
      content_sha256: job.content_sha256, confirmed_by: confirmedBy,
    });
    await recordCrmActivity(job, `Controlled publisher dispatched ${job.channel} outreach (${job.id}).`);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Provider dispatch failed.';
    const status = (cause as { status?: number })?.status || 502;
    const blocked = status === 503;
    const failedAt = nowIso();
    await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: { status: blocked ? 'BLOCKED' : 'FAILED', provider_message: message.slice(0, 1000), updated_at: failedAt } });
    if (!blocked) await db.collection('gtm_publish_campaigns').updateOne({ id: campaign.id }, { $set: { updated_at: failedAt }, $inc: { 'counters.failed': 1 } });
    await writeReceipt(blocked ? 'PUBLISH_JOB_BLOCKED' : 'PUBLISH_JOB_FAILED', { campaign_id: campaign.id, job_id: id, reason: message, confirmed_by: confirmedBy });
    throw Object.assign(new Error(message), { status });
  }
  return getJobOrThrow(id);
}

export async function recordOutcome(id: string, input: RecordMap): Promise<PublisherJob> {
  const outcome = cleanString(input.outcome, 'Outcome', 40) as Outcome;
  if (!['REPLIED', 'CONVERTED', 'VERIFIED', 'BOUNCED', 'NO_RESPONSE'].includes(outcome)) throw Object.assign(new Error('Unsupported outcome.'), { status: 400 });
  const job = await getJobOrThrow(id);
  if (!['DISPATCHED', 'MANUAL_READY'].includes(job.status)) throw Object.assign(new Error('Outcomes can only be recorded after dispatch or manual readiness.'), { status: 409 });
  const revenueValue = typeof input.revenue_value === 'number' && Number.isFinite(input.revenue_value) ? Math.max(0, input.revenue_value) : undefined;
  const outcomeAt = nowIso();
  const db = await getDb();
  const update: RecordMap = { outcome, outcome_at: outcomeAt, updated_at: outcomeAt };
  if (revenueValue !== undefined) update.revenue_value = revenueValue;
  await db.collection('gtm_publish_jobs').updateOne({ id }, { $set: update });
  const counter = outcome === 'REPLIED' ? 'counters.replied' : outcome === 'CONVERTED' ? 'counters.converted' : outcome === 'VERIFIED' ? 'counters.verified' : null;
  if (counter) await db.collection('gtm_publish_campaigns').updateOne({ id: job.campaign_id }, { $set: { updated_at: outcomeAt }, $inc: { [counter]: 1 } });
  const stage = outcome === 'REPLIED' ? 'qualified' : outcome === 'CONVERTED' ? 'onboarding' : outcome === 'VERIFIED' ? 'active' : undefined;
  await recordCrmActivity(job, `Controlled publisher outcome ${outcome} recorded for ${job.id}.`, stage);
  await writeReceipt('PUBLISH_JOB_OUTCOME_RECORDED', { campaign_id: job.campaign_id, job_id: job.id, outcome, revenue_value: revenueValue ?? null, recorded_by: optionalString(input.recorded_by, 120) || 'founder' });
  return getJobOrThrow(id);
}
