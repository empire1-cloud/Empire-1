export type ApprovalStatus =
  | 'PENDING'
  | 'EVIDENCE_REQUESTED'
  | 'APPROVED'
  | 'DENIED'
  | 'VERIFIED';

export type ExecutionStage =
  | 'NOT_STARTED'
  | 'APPROVED'
  | 'TRANSACTION_SUBMITTED'
  | 'PSP_CONFIRMED'
  | 'LEDGER_CONFIRMED'
  | 'CRM_CONFIRMED'
  | 'VERIFIED'
  | 'DENIED';

export type LedgerRecord = {
  id: string;
  manifestId: string;
  action: string;
  decision: 'ALLOW' | 'BLOCK' | 'HUMAN_REVIEW' | 'APPROVED' | 'DENIED' | 'VERIFIED';
  stage: string;
  receiptRef: string;
  createdAt: string;
  source: 'engine' | 'demo-command-loop';
};

export type CommandLog = {
  id: string;
  label: string;
  detail: string;
  tone: 'neutral' | 'good' | 'warning' | 'danger';
};

export type CommandLoopState = {
  cofounderEngaged: boolean;
  approvalStatus: ApprovalStatus;
  executionStage: ExecutionStage;
  approvalId: string;
  manifestId: string;
  pendingApprovals: number;
  ledger: LedgerRecord[];
  logs: CommandLog[];
};

const seedLedger: LedgerRecord[] = Array.from({ length: 19 }, (_, index) => ({
  id: `seed-${String(index + 1).padStart(2, '0')}`,
  manifestId: index < 6 ? `ram_200${index + 1}` : `engine_${String(index + 1).padStart(2, '0')}`,
  action:
    index % 4 === 0
      ? 'send_renewal_message'
      : index % 4 === 1
        ? 'propose_discount'
        : index % 4 === 2
          ? 'request_refund'
          : 'book_sale',
  decision: index % 5 === 0 ? 'BLOCK' : index % 5 === 1 ? 'HUMAN_REVIEW' : 'ALLOW',
  stage: index % 5 === 0 ? 'POLICY_BLOCKED' : 'RECEIPT_SEALED',
  receiptRef: `demo_${(index + 17).toString(16).padStart(8, '0')}`,
  createdAt: `2026-07-21T08:${String(20 + index).padStart(2, '0')}:00Z`,
  source: 'engine',
}));

export const initialCommandLoopState: CommandLoopState = {
  cofounderEngaged: false,
  approvalStatus: 'PENDING',
  executionStage: 'NOT_STARTED',
  approvalId: 'approval_ram_2005',
  manifestId: 'ram_2005',
  pendingApprovals: 1,
  ledger: seedLedger,
  logs: [
    {
      id: 'signal-received',
      label: 'SIGNAL RECEIVED',
      detail: 'Lyrica 3 stem-split error fixture attached as evidence LOG L-2291.',
      tone: 'danger',
    },
    {
      id: 'gateway-pending',
      label: 'GATEWAY HOLD',
      detail: 'Material refund action ram_2005 is waiting for founder authority.',
      tone: 'warning',
    },
  ],
};

export type CommandLoopAction =
  | { type: 'HYDRATE'; state: CommandLoopState }
  | { type: 'ENGAGE_COFOUNDER' }
  | { type: 'REQUEST_EVIDENCE' }
  | { type: 'APPROVE_ONCE' }
  | { type: 'DENY' }
  | { type: 'ADVANCE_EXECUTION' }
  | { type: 'RESET' };

const progression: Record<ExecutionStage, ExecutionStage> = {
  NOT_STARTED: 'NOT_STARTED',
  APPROVED: 'TRANSACTION_SUBMITTED',
  TRANSACTION_SUBMITTED: 'PSP_CONFIRMED',
  PSP_CONFIRMED: 'LEDGER_CONFIRMED',
  LEDGER_CONFIRMED: 'CRM_CONFIRMED',
  CRM_CONFIRMED: 'VERIFIED',
  VERIFIED: 'VERIFIED',
  DENIED: 'DENIED',
};

function appendLog(
  state: CommandLoopState,
  label: string,
  detail: string,
  tone: CommandLog['tone'],
): CommandLog[] {
  const id = `${state.logs.length + 1}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return [...state.logs, { id, label, detail, tone }];
}

function verifiedReceipt(state: CommandLoopState): LedgerRecord {
  return {
    id: 'final-ram-2005',
    manifestId: state.manifestId,
    action: 'request_refund',
    decision: 'VERIFIED',
    stage: 'PSP_LEDGER_CRM_RECONCILED',
    receiptRef: 'demo_476f113f03',
    createdAt: '2026-07-21T09:02:00Z',
    source: 'demo-command-loop',
  };
}

function deniedReceipt(state: CommandLoopState): LedgerRecord {
  return {
    id: 'denied-ram-2005',
    manifestId: state.manifestId,
    action: 'request_refund',
    decision: 'DENIED',
    stage: 'FOUNDER_DENIED',
    receiptRef: 'demo_deny2005',
    createdAt: '2026-07-21T09:02:00Z',
    source: 'demo-command-loop',
  };
}

export function commandLoopReducer(
  state: CommandLoopState,
  action: CommandLoopAction,
): CommandLoopState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ENGAGE_COFOUNDER':
      if (state.cofounderEngaged) return state;
      return {
        ...state,
        cofounderEngaged: true,
        logs: appendLog(
          state,
          'COFOUNDER ENGAGED',
          'Private Cofounder prepared a bounded, approval-controlled investigation and refund proposal.',
          'good',
        ),
      };

    case 'REQUEST_EVIDENCE':
      if (state.approvalStatus === 'VERIFIED' || state.approvalStatus === 'DENIED') return state;
      return {
        ...state,
        approvalStatus: 'EVIDENCE_REQUESTED',
        logs: appendLog(
          state,
          'EVIDENCE REQUESTED',
          'Execution remains frozen while supporting billing evidence is requested.',
          'warning',
        ),
      };

    case 'APPROVE_ONCE':
      if (state.approvalStatus === 'APPROVED' || state.approvalStatus === 'VERIFIED') return state;
      return {
        ...state,
        cofounderEngaged: true,
        approvalStatus: 'APPROVED',
        executionStage: 'APPROVED',
        pendingApprovals: 0,
        logs: appendLog(
          state,
          'FOUNDER APPROVED ONCE',
          'Manda authorized only manifest ram_2005. No standing financial authority was granted.',
          'good',
        ),
      };

    case 'DENY': {
      if (state.approvalStatus === 'DENIED' || state.approvalStatus === 'VERIFIED') return state;
      const alreadyRecorded = state.ledger.some((record) => record.id === 'denied-ram-2005');
      return {
        ...state,
        approvalStatus: 'DENIED',
        executionStage: 'DENIED',
        pendingApprovals: 0,
        ledger: alreadyRecorded ? state.ledger : [...state.ledger, deniedReceipt(state)],
        logs: appendLog(
          state,
          'FOUNDER DENIED',
          'The financial action was blocked before TransactionService or any external system was called.',
          'danger',
        ),
      };
    }

    case 'ADVANCE_EXECUTION': {
      if (state.approvalStatus !== 'APPROVED') return state;
      const next = progression[state.executionStage];
      if (next === state.executionStage) return state;

      const messages: Record<ExecutionStage, [string, string, CommandLog['tone']]> = {
        NOT_STARTED: ['NOT STARTED', 'No execution has occurred.', 'neutral'],
        APPROVED: ['APPROVED', 'Founder approval recorded.', 'good'],
        TRANSACTION_SUBMITTED: [
          'TRANSACTION SERVICE',
          'A sandbox refund command was submitted with the approved idempotency key.',
          'neutral',
        ],
        PSP_CONFIRMED: ['PSP CONFIRMED', 'Sandbox provider reports a $25.00 refund result.', 'good'],
        LEDGER_CONFIRMED: [
          'LEDGER CONFIRMED',
          'Archisynapse found the matching compensating entry; the original remains immutable.',
          'good',
        ],
        CRM_CONFIRMED: ['CRM CONFIRMED', 'Customer state reflects the approved refund.', 'good'],
        VERIFIED: [
          'RECEIPT SEALED',
          'Gateway authorization and PSP, ledger, and CRM observations reconcile in the demo harness.',
          'good',
        ],
        DENIED: ['DENIED', 'Execution was denied.', 'danger'],
      };

      const [label, detail, tone] = messages[next];
      const isVerified = next === 'VERIFIED';
      const alreadyRecorded = state.ledger.some((record) => record.id === 'final-ram-2005');

      return {
        ...state,
        executionStage: next,
        approvalStatus: isVerified ? 'VERIFIED' : state.approvalStatus,
        ledger:
          isVerified && !alreadyRecorded ? [...state.ledger, verifiedReceipt(state)] : state.ledger,
        logs: appendLog(state, label, detail, tone),
      };
    }

    case 'RESET':
      return initialCommandLoopState;

    default:
      return state;
  }
}

export const executionStages: ExecutionStage[] = [
  'APPROVED',
  'TRANSACTION_SUBMITTED',
  'PSP_CONFIRMED',
  'LEDGER_CONFIRMED',
  'CRM_CONFIRMED',
  'VERIFIED',
];
