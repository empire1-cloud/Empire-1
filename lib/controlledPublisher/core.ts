import crypto from 'node:crypto';
import { Db, MongoClient } from 'mongodb';

export const PUBLISHER_CHANNELS = ['linkedin', 'email', 'dm', 'newsletter', 'manual'] as const;
export type PublisherChannel = (typeof PUBLISHER_CHANNELS)[number];
export type CampaignStatus = 'DRAFTED' | 'FOUNDER_APPROVED' | 'AUTHORIZED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REVOKED';
export type JobStatus = 'QUEUED' | 'DISPATCHING' | 'DISPATCHED' | 'MANUAL_READY' | 'BLOCKED' | 'FAILED';
export type Outcome = 'REPLIED' | 'CONVERTED' | 'VERIFIED' | 'BOUNCED' | 'NO_RESPONSE';
export type RecordMap = Record<string, unknown>;

export type PublisherCampaign = {
  id: string;
  name: string;
  offer_name: string;
  audience: string;
  objective: string;
  primary_url: string;
  channels: PublisherChannel[];
  daily_action_limit: number;
  max_total_actions: number;
  requires_human_reply: boolean;
  status: CampaignStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  approval?: {
    approved_by: string;
    note?: string;
    claims_verified: boolean;
    scope_understood: boolean;
    approved_at: string;
  };
  authorization?: {
    authorized_by: string;
    channels: PublisherChannel[];
    max_actions: number;
    expires_at: string;
    external_actions_confirmed: boolean;
    no_mass_spam_confirmed: boolean;
    authorized_at: string;
  };
  counters: { queued: number; dispatched: number; replied: number; converted: number; verified: number; failed: number };
};

export type PublisherJob = {
  id: string;
  campaign_id: string;
  channel: PublisherChannel;
  destination: string;
  subject?: string;
  content: string;
  scheduled_for?: string;
  source_pack_id?: string;
  crm_lead_id?: string;
  metadata?: RecordMap;
  content_sha256: string;
  dedupe_key: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  dispatched_at?: string;
  provider?: string;
  provider_external_id?: string;
  provider_status?: number;
  provider_message?: string;
  outcome?: Outcome;
  outcome_at?: string;
  revenue_value?: number;
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

export async function getDb(): Promise<Db> {
  const uri = envFirst('MONGO_URL', 'MONGODB_ATLAS_EMPIRE_URI', 'MONGODB_ATLAS_SOUTHERN_URI');
  const dbName = envFirst('DB_NAME', 'MONGODB_ATLAS_EMPIRE_DB', 'MONGODB_ATLAS_SOUTHERN_DB');
  if (!uri || !dbName) throw Object.assign(new Error('MongoDB is not configured for the controlled publisher.'), { status: 503 });
  if (!mongoClientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, minPoolSize: 0, serverSelectionTimeoutMS: 5000 });
    mongoClientPromise = client.connect().catch(error => {
      mongoClientPromise = null;
      throw error;
    });
  }
  const client = await mongoClientPromise;
  return client.db(dbName);
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function providerStatus() {
  const key = Boolean(envFirst('EMPIRE_PUBLISHER_KEY'));
  const mongo = Boolean(envFirst('MONGO_URL', 'MONGODB_ATLAS_EMPIRE_URI', 'MONGODB_ATLAS_SOUTHERN_URI'))
    && Boolean(envFirst('DB_NAME', 'MONGODB_ATLAS_EMPIRE_DB', 'MONGODB_ATLAS_SOUTHERN_DB'));
  const email = Boolean(envFirst('RESEND_API_KEY')) && Boolean(envFirst('SENDER_EMAIL', 'GTM_FROM_EMAIL'));
  const social = Boolean(envFirst('GTM_PUBLISH_WEBHOOK_URL'));
  const enabled = parseBoolean(process.env.EMPIRE_PUBLISHER_ENABLED, false);
  const dryRun = parseBoolean(process.env.GTM_PUBLISH_DRY_RUN, true);
  return {
    sealed: !key,
    publisher_key_configured: key,
    mongo_configured: mongo,
    execution_enabled: enabled,
    dry_run: dryRun,
    email_provider: email ? 'resend' : 'not_configured',
    social_provider: social ? 'webhook' : 'not_configured',
    can_dispatch_email: key && mongo && enabled && !dryRun && email,
    can_dispatch_social: key && mongo && enabled && !dryRun && social,
  };
}

export function requireOperator(request: Request): void {
  const expected = envFirst('EMPIRE_PUBLISHER_KEY');
  if (!expected) throw Object.assign(new Error('Publisher is sealed. Configure EMPIRE_PUBLISHER_KEY.'), { status: 503 });
  const provided = request.headers.get('x-empire-publisher-key')?.trim() || '';
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  const valid = expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  if (!valid) throw Object.assign(new Error('Founder operator key is missing or invalid.'), { status: 401 });
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

export function normalizeChannels(value: unknown): PublisherChannel[] {
  if (!Array.isArray(value)) return ['linkedin', 'email', 'dm'];
  const selected = value.filter((channel): channel is PublisherChannel =>
    typeof channel === 'string' && PUBLISHER_CHANNELS.includes(channel as PublisherChannel));
  return Array.from(new Set(selected));
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export function makeId(prefix: string, length = 10): string {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, length).toUpperCase()}`;
}

export async function writeReceipt(event: string, payload: RecordMap): Promise<void> {
  const db = await getDb();
  const createdAt = nowIso();
  const canonical = JSON.stringify({ event, payload, created_at: createdAt });
  await db.collection('gtm_publish_receipts').insertOne({
    id: makeId('RCP', 12), event, payload, created_at: createdAt, receipt_sha256: sha256(canonical),
  });
}

export async function getCampaignOrThrow(id: string): Promise<PublisherCampaign> {
  const db = await getDb();
  const campaign = await db.collection('gtm_publish_campaigns').findOne({ id }, { projection: { _id: 0 } }) as PublisherCampaign | null;
  if (!campaign) throw Object.assign(new Error('Campaign not found.'), { status: 404 });
  return campaign;
}

export async function getJobOrThrow(id: string): Promise<PublisherJob> {
  const db = await getDb();
  const job = await db.collection('gtm_publish_jobs').findOne({ id }, { projection: { _id: 0 } }) as PublisherJob | null;
  if (!job) throw Object.assign(new Error('Publish job not found.'), { status: 404 });
  return job;
}

export function ensureAuthorization(campaign: PublisherCampaign): void {
  if (!campaign.authorization || !['AUTHORIZED', 'ACTIVE'].includes(campaign.status)) {
    throw Object.assign(new Error('Campaign is not authorized for external work.'), { status: 409 });
  }
  if (new Date(campaign.authorization.expires_at).getTime() <= Date.now()) {
    throw Object.assign(new Error('Campaign authorization has expired.'), { status: 409 });
  }
}
