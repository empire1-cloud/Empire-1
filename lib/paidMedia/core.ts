import crypto from 'node:crypto';
import { Db, MongoClient } from 'mongodb';

export const PAID_MEDIA_PLATFORMS = ['meta', 'google_ads', 'x_ads'] as const;
export type PaidMediaPlatform = (typeof PAID_MEDIA_PLATFORMS)[number];
export type PaidMediaStatus =
  | 'DRAFTED'
  | 'CREATIVE_APPROVED'
  | 'BUDGET_AUTHORIZED'
  | 'LIVE'
  | 'PAUSE_REQUESTED'
  | 'PAUSED'
  | 'AUTO_PAUSED'
  | 'COMPLETED'
  | 'REVOKED'
  | 'BLOCKED';
export type RecordMap = Record<string, unknown>;

export type PaidMediaCreative = {
  headline: string;
  primary_text: string;
  description?: string;
  call_to_action: string;
  asset_urls: string[];
  claims: string[];
  approved_at: string;
  approved_by: string;
};

export type PaidMediaAuthorization = {
  authorized_by: string;
  currency: string;
  daily_cap_cents: number;
  total_cap_cents: number;
  start_at: string;
  expires_at: string;
  target_geography: string[];
  platform_accounts: Partial<Record<PaidMediaPlatform, string>>;
  max_cost_per_conversion_cents?: number;
  no_conversion_pause_cents?: number;
  direct_billing_confirmed: boolean;
  account_authority_confirmed: boolean;
  budget_caps_confirmed: boolean;
  authorized_at: string;
  revision: number;
};

export type PaidMediaMetrics = {
  spend_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value_cents: number;
  synced_at?: string;
};

export type PaidMediaCampaign = {
  id: string;
  name: string;
  offer_name: string;
  objective: string;
  audience: string;
  landing_url: string;
  platforms: PaidMediaPlatform[];
  status: PaidMediaStatus;
  created_at: string;
  updated_at: string;
  notes?: string;
  creative?: PaidMediaCreative;
  authorization?: PaidMediaAuthorization;
  provider_bindings: Partial<Record<PaidMediaPlatform, {
    campaign_id?: string;
    ad_group_id?: string;
    budget_id?: string;
    status?: string;
    last_message?: string;
  }>>;
  metrics: PaidMediaMetrics;
  pause_reason?: string;
  revoked_at?: string;
  revoked_by?: string;
};

let mongoClientPromise: Promise<MongoClient> | null = null;

export function nowIso(): string {
  return new Date().toISOString();
}

export function envFirst(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return '';
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export async function getDb(): Promise<Db> {
  const uri = envFirst('MONGO_URL', 'MONGODB_ATLAS_EMPIRE_URI', 'MONGODB_ATLAS_SOUTHERN_URI');
  const dbName = envFirst('DB_NAME', 'MONGODB_ATLAS_EMPIRE_DB', 'MONGODB_ATLAS_SOUTHERN_DB');
  if (!uri || !dbName) throw Object.assign(new Error('MongoDB is not configured for paid media governance.'), { status: 503 });
  if (!mongoClientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, minPoolSize: 0, serverSelectionTimeoutMS: 5000 });
    mongoClientPromise = client.connect().catch(error => {
      mongoClientPromise = null;
      throw error;
    });
  }
  return (await mongoClientPromise).db(dbName);
}

export function providerStatus() {
  const key = Boolean(envFirst('EMPIRE_PAID_MEDIA_KEY', 'EMPIRE_PUBLISHER_KEY'));
  const mongo = Boolean(envFirst('MONGO_URL', 'MONGODB_ATLAS_EMPIRE_URI', 'MONGODB_ATLAS_SOUTHERN_URI'))
    && Boolean(envFirst('DB_NAME', 'MONGODB_ATLAS_EMPIRE_DB', 'MONGODB_ATLAS_SOUTHERN_DB'));
  const enabled = parseBoolean(process.env.EMPIRE_PAID_MEDIA_ENABLED, false);
  const dryRun = parseBoolean(process.env.GTM_PAID_MEDIA_DRY_RUN, true);
  const genericGateway = envFirst('GTM_PAID_MEDIA_GATEWAY_URL');
  const gateways = {
    meta: envFirst('GTM_PAID_MEDIA_META_GATEWAY_URL') || genericGateway,
    google_ads: envFirst('GTM_PAID_MEDIA_GOOGLE_GATEWAY_URL') || genericGateway,
    x_ads: envFirst('GTM_PAID_MEDIA_X_GATEWAY_URL') || genericGateway,
  };
  return {
    sealed: !key,
    operator_key_configured: key,
    mongo_configured: mongo,
    execution_enabled: enabled,
    dry_run: dryRun,
    gateways: {
      meta: gateways.meta ? 'configured' : 'not_configured',
      google_ads: gateways.google_ads ? 'configured' : 'not_configured',
      x_ads: gateways.x_ads ? 'configured' : 'not_configured',
    },
    can_execute: key && mongo && enabled && !dryRun,
  };
}

export function requireOperator(request: Request): void {
  const expected = envFirst('EMPIRE_PAID_MEDIA_KEY', 'EMPIRE_PUBLISHER_KEY');
  if (!expected) throw Object.assign(new Error('Paid media is sealed. Configure EMPIRE_PAID_MEDIA_KEY or EMPIRE_PUBLISHER_KEY.'), { status: 503 });
  const provided = request.headers.get('x-empire-paid-media-key')?.trim()
    || request.headers.get('x-empire-publisher-key')?.trim()
    || '';
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  const valid = expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  if (!valid) throw Object.assign(new Error('Founder paid-media key is missing or invalid.'), { status: 401 });
}

export function cleanString(value: unknown, field: string, maxLength = 10000): string {
  if (typeof value !== 'string' || !value.trim()) throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  return value.trim().slice(0, maxLength);
}

export function optionalString(value: unknown, maxLength = 10000): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim().slice(0, maxLength);
}

export function boundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export function normalizePlatforms(value: unknown): PaidMediaPlatform[] {
  if (!Array.isArray(value)) return ['meta', 'google_ads', 'x_ads'];
  const selected = value.filter((platform): platform is PaidMediaPlatform =>
    typeof platform === 'string' && PAID_MEDIA_PLATFORMS.includes(platform as PaidMediaPlatform));
  return Array.from(new Set(selected));
}

export function stringList(value: unknown, maxItems = 50, maxLength = 500): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value
    .filter(item => typeof item === 'string' && item.trim())
    .map(item => String(item).trim().slice(0, maxLength))))
    .slice(0, maxItems);
}

export function makeId(prefix: string, length = 10): string {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, length).toUpperCase()}`;
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export async function writeReceipt(event: string, payload: RecordMap): Promise<void> {
  const db = await getDb();
  const createdAt = nowIso();
  const canonical = JSON.stringify({ event, payload, created_at: createdAt });
  await db.collection('gtm_paid_media_receipts').insertOne({
    id: makeId('PMR', 12), event, payload, created_at: createdAt, receipt_sha256: sha256(canonical),
  });
}

export async function getCampaignOrThrow(id: string): Promise<PaidMediaCampaign> {
  const db = await getDb();
  const campaign = await db.collection('gtm_paid_media_campaigns')
    .findOne({ id }, { projection: { _id: 0 } }) as PaidMediaCampaign | null;
  if (!campaign) throw Object.assign(new Error('Paid media campaign not found.'), { status: 404 });
  return campaign;
}

export function ensureBudgetAuthorization(campaign: PaidMediaCampaign): PaidMediaAuthorization {
  if (!campaign.authorization || !['BUDGET_AUTHORIZED', 'LIVE', 'PAUSE_REQUESTED', 'PAUSED', 'AUTO_PAUSED', 'BLOCKED'].includes(campaign.status)) {
    throw Object.assign(new Error('Campaign does not have an active budget authorization.'), { status: 409 });
  }
  if (new Date(campaign.authorization.expires_at).getTime() <= Date.now()) {
    throw Object.assign(new Error('Campaign budget authorization has expired.'), { status: 409 });
  }
  return campaign.authorization;
}

export function gatewayUrl(platform: PaidMediaPlatform): string {
  const generic = envFirst('GTM_PAID_MEDIA_GATEWAY_URL');
  const specific = platform === 'meta'
    ? envFirst('GTM_PAID_MEDIA_META_GATEWAY_URL')
    : platform === 'google_ads'
      ? envFirst('GTM_PAID_MEDIA_GOOGLE_GATEWAY_URL')
      : envFirst('GTM_PAID_MEDIA_X_GATEWAY_URL');
  return specific || generic;
}
