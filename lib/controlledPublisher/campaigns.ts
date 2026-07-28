import {
  PUBLISHER_CHANNELS,
  PublisherCampaign,
  PublisherChannel,
  PublisherJob,
  RecordMap,
  boundedInteger,
  cleanString,
  ensureAuthorization,
  getCampaignOrThrow,
  getDb,
  makeId,
  normalizeChannels,
  nowIso,
  optionalString,
  providerStatus,
  sha256,
  writeReceipt,
} from './core';

export async function publisherSummary() {
  const status = providerStatus();
  if (!status.mongo_configured) {
    return {
      provider_status: status,
      metrics: { campaigns: 0, authorized_campaigns: 0, queued: 0, dispatched: 0, replied: 0, converted: 0, verified: 0, failed: 0 },
      campaigns: [], jobs: [], receipts: [], database_error: 'MongoDB is not configured.',
    };
  }
  const db = await getDb();
  const [campaigns, jobs, receipts] = await Promise.all([
    db.collection('gtm_publish_campaigns').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(30).toArray(),
    db.collection('gtm_publish_jobs').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(100).toArray(),
    db.collection('gtm_publish_receipts').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(50).toArray(),
  ]);
  return {
    provider_status: status,
    metrics: {
      campaigns: campaigns.length,
      authorized_campaigns: campaigns.filter((item: RecordMap) => ['AUTHORIZED', 'ACTIVE'].includes(String(item.status))).length,
      queued: jobs.filter((item: RecordMap) => item.status === 'QUEUED').length,
      dispatched: jobs.filter((item: RecordMap) => item.status === 'DISPATCHED').length,
      replied: jobs.filter((item: RecordMap) => item.outcome === 'REPLIED').length,
      converted: jobs.filter((item: RecordMap) => item.outcome === 'CONVERTED').length,
      verified: jobs.filter((item: RecordMap) => item.outcome === 'VERIFIED').length,
      failed: jobs.filter((item: RecordMap) => ['FAILED', 'BLOCKED'].includes(String(item.status))).length,
    },
    campaigns, jobs, receipts,
  };
}

export async function createCampaign(input: RecordMap): Promise<PublisherCampaign> {
  const channels = normalizeChannels(input.channels);
  if (!channels.length) throw Object.assign(new Error('At least one supported channel is required.'), { status: 400 });
  const timestamp = nowIso();
  const campaign: PublisherCampaign = {
    id: makeId('CMP'),
    name: cleanString(input.name, 'Campaign name', 160),
    offer_name: optionalString(input.offer_name, 160) || 'Free AI Workflow Leak Snapshot',
    audience: cleanString(input.audience, 'Audience', 1000),
    objective: cleanString(input.objective, 'Objective', 1000),
    primary_url: optionalString(input.primary_url, 1000) || 'https://empire1.cloud/services/scan',
    channels,
    daily_action_limit: boundedInteger(input.daily_action_limit, 20, 1, 100),
    max_total_actions: boundedInteger(input.max_total_actions, 150, 1, 1000),
    requires_human_reply: input.requires_human_reply !== false,
    status: 'DRAFTED',
    notes: optionalString(input.notes, 4000),
    created_at: timestamp,
    updated_at: timestamp,
    counters: { queued: 0, dispatched: 0, replied: 0, converted: 0, verified: 0, failed: 0 },
  };
  const db = await getDb();
  await db.collection('gtm_publish_campaigns').insertOne(campaign);
  await writeReceipt('CAMPAIGN_CREATED', { campaign_id: campaign.id, status: campaign.status, channels, max_total_actions: campaign.max_total_actions });
  return campaign;
}

export async function approveCampaign(id: string, input: RecordMap): Promise<PublisherCampaign> {
  const campaign = await getCampaignOrThrow(id);
  if (!['DRAFTED', 'FOUNDER_APPROVED'].includes(campaign.status)) {
    throw Object.assign(new Error(`Campaign cannot be approved from ${campaign.status}.`), { status: 409 });
  }
  if (input.confirm_claims_verified !== true || input.confirm_scope_understood !== true) {
    throw Object.assign(new Error('Claims verification and scope confirmation are required.'), { status: 400 });
  }
  const approval = {
    approved_by: cleanString(input.approved_by, 'Approved by', 120),
    note: optionalString(input.approval_note, 1000),
    claims_verified: true,
    scope_understood: true,
    approved_at: nowIso(),
  };
  const db = await getDb();
  await db.collection('gtm_publish_campaigns').updateOne({ id }, { $set: { status: 'FOUNDER_APPROVED', approval, updated_at: approval.approved_at } });
  await writeReceipt('CAMPAIGN_FOUNDER_APPROVED', { campaign_id: id, approval });
  return getCampaignOrThrow(id);
}

export async function authorizeCampaign(id: string, input: RecordMap): Promise<PublisherCampaign> {
  const campaign = await getCampaignOrThrow(id);
  if (campaign.status !== 'FOUNDER_APPROVED') throw Object.assign(new Error('Founder approval is required before authorization.'), { status: 409 });
  if (input.confirm_external_actions !== true || input.confirm_no_mass_spam !== true) {
    throw Object.assign(new Error('External action and anti-spam confirmations are required.'), { status: 400 });
  }
  const channels = normalizeChannels(input.channels).filter(channel => campaign.channels.includes(channel));
  if (!channels.length) throw Object.assign(new Error('Authorization must include at least one campaign channel.'), { status: 400 });
  const expiresInHours = boundedInteger(input.expires_in_hours, 168, 1, 720);
  const authorizedAt = nowIso();
  const authorization = {
    authorized_by: cleanString(input.authorized_by, 'Authorized by', 120),
    channels,
    max_actions: Math.min(campaign.max_total_actions, boundedInteger(input.max_actions, campaign.max_total_actions, 1, campaign.max_total_actions)),
    expires_at: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString(),
    external_actions_confirmed: true,
    no_mass_spam_confirmed: true,
    authorized_at: authorizedAt,
  };
  const db = await getDb();
  await db.collection('gtm_publish_campaigns').updateOne({ id }, { $set: { status: 'AUTHORIZED', authorization, updated_at: authorizedAt } });
  await writeReceipt('CAMPAIGN_AUTHORIZED', { campaign_id: id, authorization });
  return getCampaignOrThrow(id);
}

function validateDestination(channel: PublisherChannel, destination: string): void {
  if (channel === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination) || destination.includes(','))) {
    throw Object.assign(new Error('Each email job must target exactly one valid email address.'), { status: 400 });
  }
}

export async function queueJobs(campaignId: string, input: RecordMap): Promise<{ jobs: PublisherJob[]; skipped_duplicates: number }> {
  const campaign = await getCampaignOrThrow(campaignId);
  ensureAuthorization(campaign);
  if (!Array.isArray(input.jobs) || !input.jobs.length) throw Object.assign(new Error('At least one publish job is required.'), { status: 400 });
  if (input.jobs.length > 50) throw Object.assign(new Error('A single queue request is limited to 50 explicit jobs.'), { status: 400 });
  const db = await getDb();
  const existingCount = await db.collection('gtm_publish_jobs').countDocuments({ campaign_id: campaign.id });
  const limit = Math.min(campaign.max_total_actions, campaign.authorization!.max_actions);
  if (existingCount + input.jobs.length > limit) throw Object.assign(new Error(`Queue would exceed the authorized campaign limit of ${limit} actions.`), { status: 409 });

  const queued: PublisherJob[] = [];
  let skippedDuplicates = 0;
  for (const raw of input.jobs as RecordMap[]) {
    const channel = cleanString(raw.channel, 'Channel', 40) as PublisherChannel;
    if (!PUBLISHER_CHANNELS.includes(channel) || !campaign.authorization!.channels.includes(channel)) {
      throw Object.assign(new Error(`Channel ${channel} is not authorized for this campaign.`), { status: 400 });
    }
    const destination = cleanString(raw.destination, 'Destination', 1000);
    validateDestination(channel, destination);
    const subject = optionalString(raw.subject, 500);
    const content = cleanString(raw.content, 'Content', 50000);
    const scheduledFor = optionalString(raw.scheduled_for, 60);
    if (scheduledFor && Number.isNaN(new Date(scheduledFor).getTime())) throw Object.assign(new Error('scheduled_for must be a valid ISO date.'), { status: 400 });
    const contentHash = sha256([channel, destination, subject || '', content].join('|'));
    const dedupeKey = sha256([campaign.id, contentHash].join('|'));
    if (await db.collection('gtm_publish_jobs').findOne({ campaign_id: campaign.id, dedupe_key: dedupeKey })) {
      skippedDuplicates += 1;
      continue;
    }
    const timestamp = nowIso();
    const job: PublisherJob = {
      id: makeId('PUB'), campaign_id: campaign.id, channel, destination, subject, content,
      scheduled_for: scheduledFor,
      source_pack_id: optionalString(raw.source_pack_id, 120),
      crm_lead_id: optionalString(raw.crm_lead_id, 120),
      metadata: typeof raw.metadata === 'object' && raw.metadata && !Array.isArray(raw.metadata) ? raw.metadata as RecordMap : undefined,
      content_sha256: contentHash, dedupe_key: dedupeKey, status: 'QUEUED', created_at: timestamp, updated_at: timestamp,
    };
    await db.collection('gtm_publish_jobs').insertOne(job);
    queued.push(job);
    await writeReceipt('PUBLISH_JOB_QUEUED', { campaign_id: campaign.id, job_id: job.id, channel, destination, content_sha256: contentHash });
  }
  if (queued.length) {
    await db.collection('gtm_publish_campaigns').updateOne({ id: campaign.id }, { $set: { status: 'ACTIVE', updated_at: nowIso() }, $inc: { 'counters.queued': queued.length } });
  }
  return { jobs: queued, skipped_duplicates: skippedDuplicates };
}

export async function revokeCampaign(id: string, input: RecordMap): Promise<PublisherCampaign> {
  const campaign = await getCampaignOrThrow(id);
  const revokedBy = cleanString(input.revoked_by, 'Revoked by', 120);
  const reason = cleanString(input.reason, 'Reason', 1000);
  const timestamp = nowIso();
  const db = await getDb();
  await db.collection('gtm_publish_campaigns').updateOne({ id }, { $set: { status: 'REVOKED', revoked_by: revokedBy, revoke_reason: reason, revoked_at: timestamp, updated_at: timestamp } });
  await db.collection('gtm_publish_jobs').updateMany({ campaign_id: id, status: { $in: ['QUEUED', 'BLOCKED', 'FAILED'] } }, { $set: { status: 'BLOCKED', provider_message: 'Campaign authorization revoked.', updated_at: timestamp } });
  await writeReceipt('CAMPAIGN_REVOKED', { campaign_id: id, revoked_by: revokedBy, reason, previous_status: campaign.status });
  return getCampaignOrThrow(id);
}
