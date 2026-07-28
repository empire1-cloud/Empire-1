import {
  PaidMediaAuthorization,
  PaidMediaCampaign,
  PaidMediaPlatform,
  RecordMap,
  boundedInteger,
  cleanString,
  getCampaignOrThrow,
  getDb,
  makeId,
  normalizePlatforms,
  nowIso,
  optionalString,
  providerStatus,
  stringList,
  writeReceipt,
} from './core';

export async function paidMediaSummary() {
  const status = providerStatus();
  if (!status.mongo_configured) {
    return {
      provider_status: status,
      metrics: { campaigns: 0, live: 0, paused: 0, spend_cents: 0, clicks: 0, conversions: 0, conversion_value_cents: 0 },
      campaigns: [], receipts: [], database_error: 'MongoDB is not configured.',
    };
  }
  const db = await getDb();
  const [campaigns, receipts] = await Promise.all([
    db.collection('gtm_paid_media_campaigns').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(50).toArray(),
    db.collection('gtm_paid_media_receipts').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(80).toArray(),
  ]);
  const totals = campaigns.reduce((acc: { spend_cents:number; clicks:number; conversions:number; conversion_value_cents:number }, item: RecordMap) => {
    const campaign = item as unknown as PaidMediaCampaign;
    acc.spend_cents += campaign.metrics?.spend_cents || 0;
    acc.clicks += campaign.metrics?.clicks || 0;
    acc.conversions += campaign.metrics?.conversions || 0;
    acc.conversion_value_cents += campaign.metrics?.conversion_value_cents || 0;
    return acc;
  }, { spend_cents: 0, clicks: 0, conversions: 0, conversion_value_cents: 0 });
  return {
    provider_status: status,
    metrics: {
      campaigns: campaigns.length,
      live: campaigns.filter((item: RecordMap) => item.status === 'LIVE').length,
      paused: campaigns.filter((item: RecordMap) => ['PAUSED', 'AUTO_PAUSED', 'PAUSE_REQUESTED'].includes(String(item.status))).length,
      ...totals,
    },
    campaigns,
    receipts,
  };
}

export async function createPaidMediaCampaign(input: RecordMap): Promise<PaidMediaCampaign> {
  const platforms = normalizePlatforms(input.platforms);
  if (!platforms.length) throw Object.assign(new Error('At least one paid media platform is required.'), { status: 400 });
  const timestamp = nowIso();
  const campaign: PaidMediaCampaign = {
    id: makeId('ADS'),
    name: cleanString(input.name, 'Campaign name', 160),
    offer_name: optionalString(input.offer_name, 160) || 'Free AI Workflow Leak Snapshot',
    objective: cleanString(input.objective, 'Objective', 1000),
    audience: cleanString(input.audience, 'Audience', 1000),
    landing_url: optionalString(input.landing_url, 1000) || 'https://empire1.cloud/services/scan',
    platforms,
    status: 'DRAFTED',
    created_at: timestamp,
    updated_at: timestamp,
    notes: optionalString(input.notes, 4000),
    provider_bindings: {},
    metrics: { spend_cents: 0, impressions: 0, clicks: 0, conversions: 0, conversion_value_cents: 0 },
  };
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').insertOne(campaign);
  await writeReceipt('PAID_MEDIA_CAMPAIGN_CREATED', {
    campaign_id: campaign.id, platforms, landing_url: campaign.landing_url, status: campaign.status,
  });
  return campaign;
}

export async function approveCreative(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const campaign = await getCampaignOrThrow(id);
  if (!['DRAFTED', 'CREATIVE_APPROVED'].includes(campaign.status)) {
    throw Object.assign(new Error(`Creative cannot be approved from ${campaign.status}.`), { status: 409 });
  }
  if (input.confirm_claims_verified !== true || input.confirm_landing_page_verified !== true || input.confirm_creative_rights !== true) {
    throw Object.assign(new Error('Claims, landing-page, and creative-rights confirmations are required.'), { status: 400 });
  }
  const approvedAt = nowIso();
  const creative = {
    headline: cleanString(input.headline, 'Headline', 255),
    primary_text: cleanString(input.primary_text, 'Primary text', 5000),
    description: optionalString(input.description, 1000),
    call_to_action: optionalString(input.call_to_action, 100) || 'LEARN_MORE',
    asset_urls: stringList(input.asset_urls, 20, 2000),
    claims: stringList(input.claims, 30, 1000),
    approved_at: approvedAt,
    approved_by: cleanString(input.approved_by, 'Approved by', 120),
  };
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { creative, status: 'CREATIVE_APPROVED', updated_at: approvedAt },
  });
  await writeReceipt('PAID_MEDIA_CREATIVE_APPROVED', {
    campaign_id: id,
    approved_by: creative.approved_by,
    landing_url: campaign.landing_url,
    headline: creative.headline,
    claims: creative.claims,
  });
  return getCampaignOrThrow(id);
}

function normalizeAccounts(value: unknown, platforms: PaidMediaPlatform[]): Partial<Record<PaidMediaPlatform, string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Platform ad-account IDs are required.'), { status: 400 });
  }
  const raw = value as RecordMap;
  const accounts: Partial<Record<PaidMediaPlatform, string>> = {};
  for (const platform of platforms) accounts[platform] = cleanString(raw[platform], `${platform} ad account`, 255);
  return accounts;
}

function authorizationFromInput(
  campaign: PaidMediaCampaign,
  input: RecordMap,
  revision: number,
): PaidMediaAuthorization {
  if (input.confirm_direct_billing !== true || input.confirm_account_authority !== true || input.confirm_budget_caps !== true) {
    throw Object.assign(new Error('Direct billing, account authority, and budget-cap confirmations are required.'), { status: 400 });
  }
  const currency = (optionalString(input.currency, 3) || 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw Object.assign(new Error('Currency must be a three-letter code.'), { status: 400 });
  const dailyCap = boundedInteger(input.daily_cap_cents, 2000, 100, 10_000_000);
  const totalCap = boundedInteger(input.total_cap_cents, 14000, dailyCap, 100_000_000);
  const startAt = optionalString(input.start_at, 60) || nowIso();
  const expiresAt = cleanString(input.expires_at, 'Authorization expiration', 60);
  if (Number.isNaN(new Date(startAt).getTime()) || Number.isNaN(new Date(expiresAt).getTime())) {
    throw Object.assign(new Error('start_at and expires_at must be valid ISO dates.'), { status: 400 });
  }
  if (new Date(expiresAt).getTime() <= Date.now()) throw Object.assign(new Error('Authorization expiration must be in the future.'), { status: 400 });
  if (new Date(expiresAt).getTime() <= new Date(startAt).getTime()) throw Object.assign(new Error('Authorization must expire after its start.'), { status: 400 });
  if (new Date(expiresAt).getTime() - new Date(startAt).getTime() > 90 * 24 * 60 * 60 * 1000) {
    throw Object.assign(new Error('A single paid-media authorization cannot exceed 90 days.'), { status: 400 });
  }
  const maxCpa = input.max_cost_per_conversion_cents == null
    ? undefined
    : boundedInteger(input.max_cost_per_conversion_cents, 0, 100, totalCap);
  const noConversionPause = input.no_conversion_pause_cents == null
    ? undefined
    : boundedInteger(input.no_conversion_pause_cents, 0, 100, totalCap);
  return {
    authorized_by: cleanString(input.authorized_by, 'Authorized by', 120),
    currency,
    daily_cap_cents: dailyCap,
    total_cap_cents: totalCap,
    start_at: new Date(startAt).toISOString(),
    expires_at: new Date(expiresAt).toISOString(),
    target_geography: stringList(input.target_geography, 50, 255),
    platform_accounts: normalizeAccounts(input.platform_accounts, campaign.platforms),
    max_cost_per_conversion_cents: maxCpa,
    no_conversion_pause_cents: noConversionPause,
    direct_billing_confirmed: true,
    account_authority_confirmed: true,
    budget_caps_confirmed: true,
    authorized_at: nowIso(),
    revision,
  };
}

export async function authorizeBudget(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const campaign = await getCampaignOrThrow(id);
  if (campaign.status !== 'CREATIVE_APPROVED') {
    throw Object.assign(new Error('Creative approval is required before budget authorization.'), { status: 409 });
  }
  const authorization = authorizationFromInput(campaign, input, 1);
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { authorization, status: 'BUDGET_AUTHORIZED', updated_at: authorization.authorized_at },
  });
  await writeReceipt('PAID_MEDIA_BUDGET_AUTHORIZED', {
    campaign_id: id,
    authorized_by: authorization.authorized_by,
    currency: authorization.currency,
    daily_cap_cents: authorization.daily_cap_cents,
    total_cap_cents: authorization.total_cap_cents,
    expires_at: authorization.expires_at,
    platform_accounts: authorization.platform_accounts,
    revision: authorization.revision,
  });
  return getCampaignOrThrow(id);
}

export async function amendBudget(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const campaign = await getCampaignOrThrow(id);
  if (!campaign.authorization) throw Object.assign(new Error('No budget authorization exists to amend.'), { status: 409 });
  if (!['PAUSED', 'AUTO_PAUSED', 'BUDGET_AUTHORIZED'].includes(campaign.status)) {
    throw Object.assign(new Error('Pause the campaign before changing its budget authorization.'), { status: 409 });
  }
  const authorization = authorizationFromInput(campaign, input, campaign.authorization.revision + 1);
  const increase = authorization.daily_cap_cents > campaign.authorization.daily_cap_cents
    || authorization.total_cap_cents > campaign.authorization.total_cap_cents;
  if (increase && input.confirm_budget_increase !== true) {
    throw Object.assign(new Error('Budget increases require an explicit increase confirmation.'), { status: 400 });
  }
  const reason = cleanString(input.reason, 'Budget amendment reason', 1000);
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { authorization, status: 'BUDGET_AUTHORIZED', updated_at: authorization.authorized_at },
    $unset: { pause_reason: '' },
  });
  await writeReceipt(increase ? 'PAID_MEDIA_BUDGET_INCREASE_AUTHORIZED' : 'PAID_MEDIA_BUDGET_AMENDED', {
    campaign_id: id,
    authorized_by: authorization.authorized_by,
    reason,
    previous_daily_cap_cents: campaign.authorization.daily_cap_cents,
    new_daily_cap_cents: authorization.daily_cap_cents,
    previous_total_cap_cents: campaign.authorization.total_cap_cents,
    new_total_cap_cents: authorization.total_cap_cents,
    revision: authorization.revision,
  });
  return getCampaignOrThrow(id);
}

export async function revokePaidMediaCampaign(id: string, input: RecordMap): Promise<PaidMediaCampaign> {
  const campaign = await getCampaignOrThrow(id);
  const revokedBy = cleanString(input.revoked_by, 'Revoked by', 120);
  const reason = cleanString(input.reason, 'Revocation reason', 1000);
  const timestamp = nowIso();
  const db = await getDb();
  await db.collection('gtm_paid_media_campaigns').updateOne({ id }, {
    $set: { status: 'REVOKED', revoked_by: revokedBy, revoked_at: timestamp, pause_reason: reason, updated_at: timestamp },
  });
  await writeReceipt('PAID_MEDIA_AUTHORIZATION_REVOKED', {
    campaign_id: id, revoked_by: revokedBy, reason, previous_status: campaign.status,
  });
  return getCampaignOrThrow(id);
}
