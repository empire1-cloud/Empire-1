import { NextResponse } from 'next/server';
import type {
  FableExecutionJobStatus,
  FableExecutionSnapshot,
} from '@/lib/mission-control/fable5';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REQUEST_TIMEOUT_MS = 8_000;
const KNOWN_STATUSES = new Set<FableExecutionJobStatus>([
  'awaiting_approval',
  'ready',
  'leased',
  'retry_wait',
  'succeeded',
  'failed',
  'canceled',
]);

type RawHealth = {
  status?: unknown;
  jobs?: unknown;
  receipt_count?: unknown;
  receipt_chain_valid?: unknown;
};

type RawJob = {
  id?: unknown;
  kind?: unknown;
  status?: unknown;
  attempt?: unknown;
  max_attempts?: unknown;
  trace_id?: unknown;
  approval_required?: unknown;
  approval_id?: unknown;
  updated_at?: unknown;
};

function configuredBaseUrl(): string | null {
  const raw = process.env.FABLE5_EXECUTION_API_URL ?? process.env.COFOUNDER_API_URL;
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, '');
}

function requestHeaders(): HeadersInit {
  const token = process.env.FABLE5_EXECUTION_BEARER_TOKEN?.trim();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson<T>(baseUrl: string, path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: requestHeaders(),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Fable 5 execution API ${response.status}: ${detail || response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function normalizeJobs(raw: unknown): FableExecutionSnapshot['jobs'] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is RawJob => Boolean(item) && typeof item === 'object')
    .map((job) => {
      const rawStatus = stringOr(job.status, 'failed');
      const status = KNOWN_STATUSES.has(rawStatus as FableExecutionJobStatus)
        ? (rawStatus as FableExecutionJobStatus)
        : 'failed';

      return {
        id: stringOr(job.id, 'unknown-job'),
        kind: stringOr(job.kind, 'unknown'),
        status,
        attempt: numberOrZero(job.attempt),
        maxAttempts: Math.max(1, numberOrZero(job.max_attempts)),
        traceId: stringOr(job.trace_id, 'unknown-trace'),
        approvalRequired: job.approval_required === true,
        approvalId: typeof job.approval_id === 'string' ? job.approval_id : null,
        updatedAt: stringOr(job.updated_at, new Date(0).toISOString()),
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20);
}

function normalizeCounts(raw: unknown): FableExecutionSnapshot['jobsByStatus'] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const counts: FableExecutionSnapshot['jobsByStatus'] = {};
  for (const [key, value] of Object.entries(raw)) {
    if (KNOWN_STATUSES.has(key as FableExecutionJobStatus)) {
      counts[key as FableExecutionJobStatus] = numberOrZero(value);
    }
  }
  return counts;
}

function snapshotResponse(snapshot: FableExecutionSnapshot, status = 200) {
  return NextResponse.json(snapshot, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const baseUrl = configuredBaseUrl();

  if (!baseUrl) {
    return snapshotResponse({
      status: 'not_configured',
      configured: false,
      checkedAt,
      service: 'fable-5-cofounder-execution',
      receiptCount: 0,
      receiptChainValid: null,
      jobsByStatus: {},
      jobs: [],
      error: 'Set FABLE5_EXECUTION_API_URL to the private Empire Auto Cofounder API base URL.',
      writeMode: 'disabled',
    });
  }

  try {
    const [health, jobs] = await Promise.all([
      fetchJson<RawHealth>(baseUrl, '/execution/health'),
      fetchJson<RawJob[]>(baseUrl, '/execution/jobs'),
    ]);

    if (health.status !== 'ok') {
      throw new Error('Fable 5 execution health did not return status=ok');
    }

    const receiptChainValid = health.receipt_chain_valid === true;

    return snapshotResponse({
      status: receiptChainValid ? 'live' : 'degraded',
      configured: true,
      checkedAt,
      service: 'fable-5-cofounder-execution',
      receiptCount: numberOrZero(health.receipt_count),
      receiptChainValid,
      jobsByStatus: normalizeCounts(health.jobs),
      jobs: normalizeJobs(jobs),
      error: receiptChainValid ? null : 'Execution API responded, but the receipt chain failed validation.',
      writeMode: 'disabled',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Fable 5 connection error';
    return snapshotResponse({
      status: 'offline',
      configured: true,
      checkedAt,
      service: 'fable-5-cofounder-execution',
      receiptCount: 0,
      receiptChainValid: null,
      jobsByStatus: {},
      jobs: [],
      error: message,
      writeMode: 'disabled',
    });
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'Fable 5 write actions are disabled. Founder authentication and server-side approval enforcement must be added before Mission Control may enqueue or approve durable jobs.',
    },
    { status: 405, headers: { Allow: 'GET' } },
  );
}
