import {
  PaidMediaCampaign,
  PaidMediaMetrics,
  PaidMediaPlatform,
  RecordMap,
  cleanString,
  ensureBudgetAuthorization,
  envFirst,
  gatewayUrl,
  getCampaignOrThrow,
  getDb,
  nowIso,
  providerStatus,
  writeReceipt,
} from './core';

export type GatewayResult = {
  platform: PaidMediaPlatform;
  statusCode: number;
  campaignId?: string;
  adGroupId?: string;
  budgetId?: string;
  message: string;
  metrics?: Partial<PaidMediaMetrics>;
};

async function parseResponse(response: Response): Promise<RecordMap> {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text) as RecordMap; } catch { return { raw: text.slice(0, 4000) }; }
}

async function callGateway(
  campaign: PaidMediaCampaign,
  platform: PaidMediaPlatform,
  action: 'launch' | 'pause' | 'sync' | 'revoke',
  input: RecordMap,
): Promise<GatewayResult> {
  const url = gatewayUrl(platform);
  if (!url) throw Object.assign(new Error(`${platform} paid-media gateway is not configured.`), { status: 503 });
  const token = envFirst('GTM_PAID_MEDIA_GATEWAY_TOKEN');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (action !== 'sync') headers['Idempotency-Key'] = `${campaign.id}:${platform}:${action}:${campaign.authorization?.revision || 0}`;
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method: 'POST', headers, cache: 'no-store',
    body: JSON.stringify({
      event: `empire1.paid_media.${action}`,
      platform,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        offer_name: campaign.offer_name,
        objective: campaign.objective,
        audience: campaign.audience,
        landing_url: campaign.landing_url,
        creative: campaign.creative,
        authorization: campaign.authorization,
        provider_binding: campaign.provider_bindings[platform] || {},
      },
      input,
    }),
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw Object.assign(new Error(String(payload.message || payload.raw || `${platform} gateway returned ${response.status}.`)), { status: response.status === 503 ? 503 : 502 });
  }
  const metrics = payload.metrics && typeof payload.metrics === 'object' && !Array.isArray(payload.metrics)
    ? payload.metrics as Partial<PaidMediaMetrics>
    : undefined;
  return {
    platform,
    statusCode: response.status,
    campaignId: typeof payload.campaign_id === 'string' ? payload.campaign_id : undefined,
    adGroupId: typeof payload.ad_group_id === 'string' ? payload.ad_group_id : undefined,
    budgetId: typeof payload.budget_id === 'string' ? payload.budget_id : undefined,
    message: typeof payload.message === 'string' ? payload.message : `${action} accepted by ${platform} gateway.`,
    metrics,
  };
}

async function blockCampaign(campaign: PaidMediaCampaign, reason: string, actor: string): Promise<PaidMediaCampaign> {
  const timestamp = nowIso();
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id: campaign.id }, {
    $set: { status: 'BLOCKED', pause_reason: reason, updated_at: timestamp },
  });
  await writeReceipt('PAID_MEDIA_CAMPAIGN_BLOCKED', { campaign_id: campaign.id, reason, actor });
  return getCampaignOrThrow(campaign.id);
}

export async function launchPaidMediaCampaign(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  if (input.confirm_external_spend !== true) throw Object.assign(new Error('Explicit external-spend confirmation is required.'), { status: 400 });
  const launchedBy = cleanString(input.launched_by, 'Launched by', 120);
  const campaign = await getCampaignOrThrow(id);
  const authorization = ensureBudgetAuthorization(campaign);
  if (!['BUDGET_AUTHORIZED', 'BLOCKED', 'LIVE'].includes(campaign.status)) throw Object.assign(new Error(`Campaign cannot launch from ${campaign.status}.`), { status: 409 });
  if (!campaign.creative) throw Object.assign(new Error('Approved creative is missing.'), { status: 409 });
  if (new Date(authorization.start_at).getTime() > Date.now()) throw Object.assign(new Error('Campaign authorization has not started yet.'), { status: 409 });
  const config = providerStatus();
  if (!config.execution_enabled || config.dry_run) {
    const reason = !config.execution_enabled
      ? 'Paid-media execution is disabled. Set EMPIRE_PAID_MEDIA_ENABLED=true.'
      : 'Paid media is in dry-run mode. Set GTM_PAID_MEDIA_DRY_RUN=false.';
    return blockCampaign(campaign, reason, launchedBy);
  }

  const bindings = { ...campaign.provider_bindings };
  const failures: string[] = [];
  for (const platform of campaign.platforms) {
    if (bindings[platform]?.status === 'LIVE') continue;
    try {
      const result = await callGateway(campaign, platform, 'launch', { launched_by: launchedBy });
      bindings[platform] = {
        campaign_id: result.campaignId,
        ad_group_id: result.adGroupId,
        budget_id: result.budgetId,
        status: 'LIVE',
        last_message: result.message,
      };
      await writeReceipt('PAID_MEDIA_PLATFORM_LAUNCHED', {
        campaign_id: id,
        platform,
        provider_campaign_id: result.campaignId || null,
        provider_budget_id: result.budgetId || null,
        daily_cap_cents: authorization.daily_cap_cents,
        total_cap_cents: authorization.total_cap_cents,
        launched_by: launchedBy,
      });
    } catch (error) {
      failures.push(`${platform}: ${error instanceof Error ? error.message : 'launch failed'}`);
      bindings[platform] = { ...(bindings[platform] || {}), status: 'BLOCKED', last_message: failures[failures.length - 1] };
    }
  }
  const liveCount = Object.values(bindings).filter(binding => binding?.status === 'LIVE').length;
  const timestamp = nowIso();
  const db = await getDb();
  const launchUpdate: RecordMap = {
    $set: {
      provider_bindings: bindings,
      status: liveCount > 0 ? 'LIVE' : 'BLOCKED',
      updated_at: timestamp,
      ...(failures.length ? { pause_reason: failures.join(' | ').slice(0, 2000) } : {}),
    },
    ...(failures.length ? {} : { $unset: { pause_reason: '' } }),
  };
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, launchUpdate);
  await writeReceipt(liveCount > 0 ? 'PAID_MEDIA_CAMPAIGN_LIVE' : 'PAID_MEDIA_CAMPAIGN_BLOCKED', {
    campaign_id: id, launched_by: launchedBy, live_platforms: liveCount, failures,
  });
  return getCampaignOrThrow(id);
}

export async function pausePaidMediaCampaign(id: string, input: RecordMap, automatic = false): Promise<PaidMediaCampaign> {
  const pausedBy = automatic ? 'Empire-1 guardrail' : cleanString(input.paused_by, 'Paused by', 120);
  const reason = cleanString(input.reason, 'Pause reason', 1000);
  const campaign = await getCampaignOrThrow(id);
  if (!['LIVE', 'PAUSE_REQUESTED', 'BLOCKED'].includes(campaign.status)) {
    throw Object.assign(new Error(`Campaign cannot be paused from ${campaign.status}.`), { status: 409 });
  }
  const db = await getDb();
  const requestedAt = nowIso();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { status: 'PAUSE_REQUESTED', pause_reason: reason, updated_at: requestedAt },
  });
  const failures: string[] = [];
  const bindings = { ...campaign.provider_bindings };
  for (const platform of campaign.platforms) {
    if (!bindings[platform]?.campaign_id) continue;
    try {
      const result = await callGateway(campaign, platform, 'pause', { paused_by: pausedBy, reason });
      bindings[platform] = { ...bindings[platform], status: 'PAUSED', last_message: result.message };
    } catch (error) {
      failures.push(`${platform}: ${error instanceof Error ? error.message : 'pause failed'}`);
      bindings[platform] = { ...bindings[platform], status: 'PAUSE_REQUESTED', last_message: failures[failures.length - 1] };
    }
  }
  const timestamp = nowIso();
  const finalStatus = failures.length ? 'PAUSE_REQUESTED' : automatic ? 'AUTO_PAUSED' : 'PAUSED';
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { status: finalStatus, provider_bindings: bindings, pause_reason: failures.length ? `${reason} | ${failures.join(' | ')}`.slice(0, 2000) : reason, updated_at: timestamp },
  });
  await writeReceipt(failures.length ? 'PAID_MEDIA_PAUSE_INCOMPLETE' : automatic ? 'PAID_MEDIA_AUTO_PAUSED' : 'PAID_MEDIA_PAUSED', {
    campaign_id: id, paused_by: pausedBy, reason, failures,
  });
  return getCampaignOrThrow(id);
}

function normalizeMetric(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

export async function syncPaidMediaCampaign(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const syncedBy = cleanString(input.synced_by, 'Synced by', 120);
  const campaign = await getCampaignOrThrow(id);
  const authorization = campaign.authorization;
  if (!authorization) throw Object.assign(new Error('Campaign does not have a budget authorization.'), { status: 409 });
  if (!['LIVE', 'PAUSE_REQUESTED', 'PAUSED', 'AUTO_PAUSED', 'BLOCKED'].includes(campaign.status)) {
    throw Object.assign(new Error(`Campaign cannot sync from ${campaign.status}.`), { status: 409 });
  }
  const aggregate: PaidMediaMetrics = { spend_cents: 0, impressions: 0, clicks: 0, conversions: 0, conversion_value_cents: 0, synced_at: nowIso() };
  const bindings = { ...campaign.provider_bindings };
  const failures: string[] = [];
  for (const platform of campaign.platforms) {
    if (!bindings[platform]?.campaign_id) continue;
    try {
      const result = await callGateway(campaign, platform, 'sync', { synced_by: syncedBy });
      const metrics = result.metrics || {};
      aggregate.spend_cents += normalizeMetric(metrics.spend_cents);
      aggregate.impressions += normalizeMetric(metrics.impressions);
      aggregate.clicks += normalizeMetric(metrics.clicks);
      aggregate.conversions += normalizeMetric(metrics.conversions);
      aggregate.conversion_value_cents += normalizeMetric(metrics.conversion_value_cents);
      bindings[platform] = { ...bindings[platform], last_message: result.message };
    } catch (error) {
      failures.push(`${platform}: ${error instanceof Error ? error.message : 'sync failed'}`);
    }
  }
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { metrics: aggregate, provider_bindings: bindings, updated_at: aggregate.synced_at },
  });
  await writeReceipt('PAID_MEDIA_SPEND_SYNCED', {
    campaign_id: id, synced_by: syncedBy, metrics: aggregate, failures,
  });

  const costPerConversion = aggregate.conversions > 0 ? Math.floor(aggregate.spend_cents / aggregate.conversions) : undefined;
  let guardrailReason = '';
  if (aggregate.spend_cents >= authorization.total_cap_cents) {
    guardrailReason = `Authorized total budget cap of ${authorization.total_cap_cents} cents reached.`;
  } else if (Date.now() >= new Date(authorization.expires_at).getTime()) {
    guardrailReason = 'Budget authorization expired.';
  } else if (authorization.no_conversion_pause_cents && aggregate.conversions === 0 && aggregate.spend_cents >= authorization.no_conversion_pause_cents) {
    guardrailReason = `No-conversion pause threshold of ${authorization.no_conversion_pause_cents} cents reached.`;
  } else if (authorization.max_cost_per_conversion_cents && costPerConversion && costPerConversion > authorization.max_cost_per_conversion_cents) {
    guardrailReason = `Cost per conversion of ${costPerConversion} cents exceeded the approved maximum of ${authorization.max_cost_per_conversion_cents} cents.`;
  }
  if (guardrailReason && campaign.status === 'LIVE') {
    return pausePaidMediaCampaign(id, { reason: guardrailReason }, true);
  }
  return getCampaignOrThrow(id);
}

export async function revokeProviderCampaigns(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const revokedBy = cleanString(input.revoked_by, 'Revoked by', 120);
  const reason = cleanString(input.reason, 'Revocation reason', 1000);
  const campaign = await getCampaignOrThrow(id);
  const bindings = { ...campaign.provider_bindings };
  const failures: string[] = [];
  for (const platform of campaign.platforms) {
    if (!bindings[platform]?.campaign_id) continue;
    try {
      const result = await callGateway(campaign, platform, 'revoke', { revoked_by: revokedBy, reason });
      bindings[platform] = { ...bindings[platform], status: 'REVOKED', last_message: result.message };
    } catch (error) {
      failures.push(`${platform}: ${error instanceof Error ? error.message : 'revoke failed'}`);
    }
  }
  const db = await getDb();
  const timestamp = nowIso();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: {
      status: failures.length ? 'PAUSE_REQUESTED' : 'REVOKED',
      provider_bindings: bindings,
      pause_reason: failures.length ? `${reason} | ${failures.join(' | ')}`.slice(0, 2000) : reason,
      revoked_by: revokedBy,
      revoked_at: timestamp,
      updated_at: timestamp,
    },
  });
  await writeReceipt(failures.length ? 'PAID_MEDIA_REVOKE_INCOMPLETE' : 'PAID_MEDIA_PROVIDER_REVOKED', {
    campaign_id: id, revoked_by: revokedBy, reason, failures,
  });
  return getCampaignOrThrow(id);
}

export async function syncAllPaidMediaCampaigns(input: RecordMap) {
  const syncedBy = cleanString(input.synced_by, 'Synced by', 120);
  const db = await getDb();
  const campaigns = await db.collection('gtm_paid_media_campaigns')
    .find({ status: { $in: ['LIVE', 'PAUSE_REQUESTED'] } }, { projection: { _id: 0, id: 1 } })
    .sort({ updated_at: 1 })
    .limit(50)
    .toArray();
  const results: Array<{ campaign_id:string; status:string; detail?:string }> = [];
  for (const item of campaigns) {
    const campaignId = String(item.id || '');
    if (!campaignId) continue;
    try {
      const campaign = await syncPaidMediaCampaign(campaignId, { synced_by: syncedBy });
      results.push({ campaign_id: campaignId, status: campaign.status });
    } catch (error) {
      results.push({ campaign_id: campaignId, status: 'FAILED', detail: error instanceof Error ? error.message : 'Sync failed.' });
    }
  }
  await writeReceipt('PAID_MEDIA_SYNC_ALL_COMPLETED', { synced_by: syncedBy, attempted: results.length, results });
  return { attempted: results.length, results };
}
