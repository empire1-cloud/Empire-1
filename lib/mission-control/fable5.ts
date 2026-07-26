export type FableConnectionStatus =
  | 'not_configured'
  | 'connecting'
  | 'live'
  | 'degraded'
  | 'offline';

export type FableExecutionJobStatus =
  | 'awaiting_approval'
  | 'ready'
  | 'leased'
  | 'retry_wait'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export type FableExecutionJobSummary = {
  id: string;
  kind: string;
  status: FableExecutionJobStatus;
  attempt: number;
  maxAttempts: number;
  traceId: string;
  approvalRequired: boolean;
  approvalId: string | null;
  updatedAt: string;
};

export type FableExecutionSnapshot = {
  status: FableConnectionStatus;
  configured: boolean;
  checkedAt: string;
  service: 'fable-5-cofounder-execution';
  receiptCount: number;
  receiptChainValid: boolean | null;
  jobsByStatus: Partial<Record<FableExecutionJobStatus, number>>;
  jobs: FableExecutionJobSummary[];
  error: string | null;
  writeMode: 'disabled';
};

export const emptyFableSnapshot: FableExecutionSnapshot = {
  status: 'connecting',
  configured: false,
  checkedAt: new Date(0).toISOString(),
  service: 'fable-5-cofounder-execution',
  receiptCount: 0,
  receiptChainValid: null,
  jobsByStatus: {},
  jobs: [],
  error: null,
  writeMode: 'disabled',
};

export function activeFableJobCount(snapshot: FableExecutionSnapshot): number {
  return (
    (snapshot.jobsByStatus.awaiting_approval ?? 0) +
    (snapshot.jobsByStatus.ready ?? 0) +
    (snapshot.jobsByStatus.leased ?? 0) +
    (snapshot.jobsByStatus.retry_wait ?? 0)
  );
}
