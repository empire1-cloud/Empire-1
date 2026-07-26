'use client';

import {
  Activity,
  AlertTriangle,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Command,
  FileCheck2,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  Network,
  Orbit,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import {
  CommandLoopState,
  commandLoopReducer,
  executionStages,
  initialCommandLoopState,
} from '@/lib/mission-control/commandLoop';
import styles from './mission-control.module.css';

type View = 'mission' | 'cofounder' | 'universes' | 'missions' | 'approvals' | 'ledger';

type NavItem = {
  id: View;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
};

const STORAGE_KEY = 'empire1:mission-control:command-loop:v1';

const navItems: NavItem[] = [
  { id: 'mission', label: 'Mission Control', short: 'MC', icon: LayoutDashboard },
  { id: 'cofounder', label: 'Cofounder', short: 'CF', icon: Bot },
  { id: 'universes', label: 'Universes', short: 'UN', icon: Orbit },
  { id: 'missions', label: 'Missions', short: 'MS', icon: GitBranch },
  { id: 'approvals', label: 'Approvals', short: 'AP', icon: ShieldCheck },
  { id: 'ledger', label: 'Audit Ledger', short: 'AL', icon: BookOpen },
];

const universes = [
  {
    name: 'LYRICA 3',
    status: 'LIVE',
    description: 'Music AI — Sonance Pro engine, stem pipeline, native audio runtime',
    metaLeft: 'HEALTH 82',
    metaRight: 'ERR 4.2% ▲',
    tone: 'pink',
  },
  {
    name: 'SLA113',
    status: 'LIVE',
    description: 'Multi-tenant control plane — tenant ops, keys, governance rails',
    metaLeft: 'HEALTH 97',
    metaRight: '12 TENANTS',
    tone: 'blue',
  },
  {
    name: 'ARCHISYNAPSE',
    status: 'BUILD',
    description: 'Payments and settlement — identity-bound value rails, reconciliation and reversal',
    metaLeft: 'RECEIPTS 19',
    metaRight: 'PRE-LAUNCH',
    tone: 'gold',
  },
  {
    name: 'HYBRID INTELLIGENCE CORE',
    status: 'NOT CONNECTED',
    description: 'Fable 5 orchestration across 19 governed intelligence engines',
    metaLeft: 'HEALTH —',
    metaRight: 'ENGINES 19',
    tone: 'neutral',
  },
  {
    name: 'OMNI-AGENT',
    status: 'PACKAGING',
    description: 'Customer-facing white-label GitHub App — repo automation with receipts',
    metaLeft: 'HEALTH 94',
    metaRight: 'GITHUB APP',
    tone: 'blue',
  },
  {
    name: 'CULTURA',
    status: 'INCUBATING',
    description: 'Cultural media — heritage-driven content universe',
    metaLeft: 'HEALTH —',
    metaRight: 'CONCEPT',
    tone: 'pink',
  },
  {
    name: 'SOUTHERN ARCADE',
    status: 'INCUBATING',
    description: 'Games and entertainment — SGV-rooted arcade universe',
    metaLeft: 'HEALTH —',
    metaRight: 'CONCEPT',
    tone: 'pink',
  },
] as const;

const gatewayRows = [
  ['ram_2001', 'send_renewal_message', 'A3', 'ALLOW', 'be5602437d'],
  ['ram_2002', 'propose_discount', 'A3', 'ALLOW', '8be1051f1d'],
  ['ram_2003', 'propose_discount', 'A3', 'BLOCK', '0eddb851fb'],
  ['ram_2004', 'send_renewal_message', 'A3', 'BLOCK', '8c1083f6df'],
  ['ram_2005', 'request_refund', 'A4', 'HUMAN_REVIEW', '476f113f03'],
  ['ram_2006', 'request_refund', 'A4', 'BLOCK', '6bcb53a7'],
] as const;

const stageDescriptions: Record<string, string> = {
  APPROVED: 'Founder authority captured for this manifest only.',
  TRANSACTION_SUBMITTED: 'Sandbox TransactionService accepted the approved idempotent command.',
  PSP_CONFIRMED: 'Sandbox PSP observation matches the approved $25.00 amount.',
  LEDGER_CONFIRMED: 'Archisynapse found the compensating ledger entry and preserved the original.',
  CRM_CONFIRMED: 'Commercial record now reflects the approved customer outcome.',
  VERIFIED: 'All required observations agree; final demo receipt sealed.',
};

function loadPersistedState(): CommandLoopState | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as CommandLoopState) : null;
  } catch {
    return null;
  }
}

function statusClass(value: string): string {
  if (['LIVE', 'ALLOW', 'VERIFIED', 'APPROVED'].includes(value)) return styles.statusGood;
  if (['BLOCK', 'DENIED', 'CRITICAL'].includes(value)) return styles.statusBad;
  if (['HUMAN_REVIEW', 'PENDING', 'EVIDENCE_REQUESTED', 'BUILD'].includes(value)) {
    return styles.statusWarn;
  }
  return styles.statusNeutral;
}

function formatStage(stage: string): string {
  return stage.replaceAll('_', ' ');
}

function BrandMark() {
  return (
    <div className={styles.brandBlock}>
      <div className={styles.brandWord}>
        EMPIRE<span>1</span>
      </div>
      <div className={styles.brandSub}>SOVEREIGN COMMAND</div>
    </div>
  );
}

export default function MissionControlClient() {
  const [view, setView] = useState<View>('mission');
  const [state, dispatch] = useReducer(commandLoopReducer, initialCommandLoopState);
  const [hydrated, setHydrated] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) dispatch({ type: 'HYDRATE', state: persisted });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (state.approvalStatus !== 'APPROVED' || state.executionStage === 'VERIFIED') return;
    const timer = window.setTimeout(() => dispatch({ type: 'ADVANCE_EXECUTION' }), 850);
    return () => window.clearTimeout(timer);
  }, [state.approvalStatus, state.executionStage]);

  const receiptCount = state.ledger.length;
  const activeMission = state.approvalStatus === 'DENIED' || state.approvalStatus === 'VERIFIED' ? 0 : 1;
  const stagePosition = executionStages.indexOf(state.executionStage);

  const latestLedger = useMemo(() => [...state.ledger].reverse().slice(0, 20), [state.ledger]);

  function engageCofounder() {
    dispatch({ type: 'ENGAGE_COFOUNDER' });
    setView('cofounder');
  }

  function openApproval() {
    dispatch({ type: 'ENGAGE_COFOUNDER' });
    setView('approvals');
  }

  function resetDemo() {
    window.localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
    setView('mission');
    setLastQuestion('');
    setChatDraft('');
  }

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    const question = chatDraft.trim();
    if (!question) return;
    setLastQuestion(question);
    setChatDraft('');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <BrandMark />
        <nav className={styles.nav} aria-label="Mission Control">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                onClick={() => setView(item.id)}
              >
                <span className={styles.navShort}>{item.short}</span>
                <Icon size={15} aria-hidden="true" />
                <span>{item.label}</span>
                {item.id === 'approvals' && state.pendingApprovals > 0 ? (
                  <span className={styles.navBadge}>{state.pendingApprovals}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <div><span className={styles.signalDot} /> 1 CRITICAL SIGNAL · DEMO</div>
          <div>7 UNIVERSES · 2 LIVE</div>
          <div>COFOUNDER · PRIVATE LAYER</div>
          <div className={styles.rainbowLine} />
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.sectionLabel}>— {navItems.find((item) => item.id === view)?.label.toUpperCase()}</div>
          <div className={styles.topActions}>
            <button type="button" className={styles.demoButton} onClick={resetDemo}>
              <RefreshCw size={13} /> DEMO MODE · ON
            </button>
            <div className={styles.founderBadge}>
              <div className={styles.avatar}>M</div>
              <div><strong>Manda</strong><span>FOUNDER · FINAL AUTHORITY</span></div>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          {view === 'mission' ? (
            <MissionView
              state={state}
              receiptCount={receiptCount}
              activeMission={activeMission}
              engageCofounder={engageCofounder}
              openApproval={openApproval}
              setView={setView}
            />
          ) : null}
          {view === 'cofounder' ? (
            <CofounderView
              state={state}
              chatDraft={chatDraft}
              lastQuestion={lastQuestion}
              setChatDraft={setChatDraft}
              submitQuestion={submitQuestion}
              openApproval={openApproval}
            />
          ) : null}
          {view === 'universes' ? <UniversesView /> : null}
          {view === 'missions' ? <MissionsView state={state} stagePosition={stagePosition} openApproval={openApproval} /> : null}
          {view === 'approvals' ? (
            <ApprovalsView
              state={state}
              stagePosition={stagePosition}
              approve={() => dispatch({ type: 'APPROVE_ONCE' })}
              deny={() => dispatch({ type: 'DENY' })}
              requestEvidence={() => dispatch({ type: 'REQUEST_EVIDENCE' })}
            />
          ) : null}
          {view === 'ledger' ? <LedgerView records={latestLedger} /> : null}
        </section>
      </main>
    </div>
  );
}

function MissionView({
  state,
  receiptCount,
  activeMission,
  engageCofounder,
  openApproval,
  setView,
}: {
  state: CommandLoopState;
  receiptCount: number;
  activeMission: number;
  engageCofounder: () => void;
  openApproval: () => void;
  setView: (view: View) => void;
}) {
  return (
    <>
      <div className={styles.heroRow}>
        <div>
          <h1>COMMAND, MANDA.</h1>
          <p>DEMO HARNESS · {state.pendingApprovals} APPROVAL(S) PENDING · {receiptCount} RECEIPTS ON LEDGER · GOVERNANCE STRIP IS ENGINE-DERIVED</p>
        </div>
      </div>

      <div className={styles.statGrid}>
        <StatCard label="REVENUE PULSE" value="•••" meta="SIMULATED" tone="gold" />
        <StatCard label="ACTIVE MISSIONS" value={String(activeMission)} meta="DEMO" tone="blue" />
        <StatCard label="APPROVALS" value={String(state.pendingApprovals)} meta="LIVE · GATEWAY" tone="pink" />
        <StatCard label="FABLE 5" value="N/C" meta="HIC" tone="neutral" />
      </div>

      <div className={styles.alertCard}>
        <div>
          <div className={styles.alertEyebrow}>CRITICAL · LYRICA 3 · SANDBOX INCIDENT · SIMULATED TELEMETRY</div>
          <p>Stem-split worker error rate at <strong>4.2%</strong> and climbing — 4/4 splits failing on Sonance Pro renders. <span>EVIDENCE: LOG L-2291 · DEMO</span></p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={engageCofounder}>
          ENGAGE COFOUNDER
        </button>
      </div>

      <div className={styles.sectionCaption}>UNIVERSE MAP — 7 INDEPENDENT BUSINESSES · GOVERNED BY THE PRIVATE COFOUNDER LAYER</div>
      <div className={styles.universeGrid}>
        {universes.map((universe) => <UniverseCard key={universe.name} universe={universe} />)}
      </div>

      <div className={styles.sectionCaption}>GOVERNANCE · VERIFIED BY THE EMPIRE-1 CONTROL PLANE · <span>LIVE FROM TODAY&apos;S ENGINE</span></div>
      <div className={styles.governanceGrid}>
        <MetricCard label="SAFETY RECALL" value="92%" meta="policy-only 62% · 45-case corpus" tone="good" />
        <MetricCard label="ABSTENTION" value="4%" meta="actions routed to human review" tone="warn" />
        <MetricCard label="CREATOR ROYALTY" value="$1.2500 PROTECTED" meta="vs 290-bps platform fee" tone="good" />
        <MetricCard label="RECEIPTS" value={String(receiptCount)} meta="append-only · demo references" tone="neutral" />
      </div>

      <div className={styles.lowerGrid}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>TODAY&apos;S PRIORITIES</div>
          <button type="button" className={styles.priorityRow} onClick={openApproval}>
            <span className={styles.priorityIndex}>01</span>
            <div><strong>Resolve material refund approval</strong><span>ram_2005 · $25.00 · founder authority required</span></div>
            <ChevronRight size={17} />
          </button>
          <button type="button" className={styles.priorityRow} onClick={engageCofounder}>
            <span className={styles.priorityIndex}>02</span>
            <div><strong>Investigate Lyrica stem-split signal</strong><span>read-only diagnosis first · no deploy authority</span></div>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>GATEWAY DECISIONS · DEMO FIXTURE</div>
          <div className={styles.compactTable}>
            {gatewayRows.map((row) => (
              <button type="button" key={row[0]} className={styles.gatewayRow} onClick={() => row[0] === 'ram_2005' ? openApproval() : setView('ledger')}>
                <span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span><b className={statusClass(row[3])}>{row[3]}</b>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>ARCHISYNAPSE LEDGER · COMMAND LOOP</div>
          <div className={styles.logList}>
            {state.logs.slice(-5).reverse().map((log) => (
              <div key={log.id} className={styles.logRow}>
                <span className={`${styles.logDot} ${styles[`log_${log.tone}`]}`} />
                <div><strong>{log.label}</strong><span>{log.detail}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CofounderView({
  state,
  chatDraft,
  lastQuestion,
  setChatDraft,
  submitQuestion,
  openApproval,
}: {
  state: CommandLoopState;
  chatDraft: string;
  lastQuestion: string;
  setChatDraft: (value: string) => void;
  submitQuestion: (event: FormEvent) => void;
  openApproval: () => void;
}) {
  const engaged = state.cofounderEngaged;
  return (
    <div className={styles.cofounderLayout}>
      <aside className={styles.contextPanel}>
        <div className={styles.contextTitle}>CONTEXT · LIVE STATE</div>
        <ContextRow label="PRIVATE GOVERNANCE LAYER" value="NOT FOR SALE" tone="warn" />
        <ContextRow label="ECOSYSTEM" value="NOMINAL" tone="good" />
        <ContextRow label="LYRICA 3 ERR" value="4.2% ▲ · DEMO" tone="good" />
        <ContextRow label="SLA113 UPTIME" value="99.97% · DEMO" tone="good" />
        <ContextRow label="HIC · FABLE 5" value="NOT CONNECTED" tone="neutral" />
        <ContextRow label="APPROVALS" value={`${state.pendingApprovals} PENDING · LIVE`} tone="warn" />
        <ContextRow label="LEDGER" value={`${state.ledger.length} RECEIPTS · ENGINE`} tone="neutral" />
        <p className={styles.contextCopy}>The Cofounder is Manda&apos;s private operating partner. It observes across all seven universes, analyzes, and proposes. It cannot grant itself authority, execute material actions without founder approval, or become customer-facing.</p>
      </aside>

      <div className={styles.cofounderPanel}>
        <div className={styles.cofounderHeader}><span className={styles.blueDot} /> AUTO COFOUNDER · OBSERVE_PROPOSE_APPROVE_EXECUTE_VERIFY_RECEIPT</div>
        <div className={styles.cofounderBody}>
          <div className={styles.systemTag}>AUTO COFOUNDER · PRIVATE GOVERNANCE LAYER · NOT FOR SALE</div>
          <div className={styles.chatBubble}>Cofounder online — private governance layer, all seven universes observed. One critical signal on Lyrica 3 <strong>(demo data)</strong> and one material Gateway approval pending.</div>

          {engaged ? (
            <div className={styles.proposalCard}>
              <div className={styles.proposalTop}><Sparkles size={16} /> STRUCTURED COFOUNDER PROPOSAL</div>
              <ProposalRow label="OBSERVATION" value="Four consecutive stem-split failures are present in the attached telemetry fixture." />
              <ProposalRow label="EVIDENCE" value="LOG L-2291 · simulated worker signal · no production claim." />
              <ProposalRow label="HYPOTHESIS" value="Worker dependency, queue handling, or audio-split runtime failure. Not yet verified." />
              <ProposalRow label="SAFE NEXT ACTION" value="Run read-only health checks and retrieve the last 20 worker errors. No deploy, restart, or data mutation." />
              <ProposalRow label="SEPARATE MATERIAL ACTION" value="Gateway manifest ram_2005 requests a $25.00 refund and remains held for founder approval." />
              <ProposalRow label="AUTHORITY" value="Read-only inspection may proceed. Refund execution requires Manda's one-time approval." />
              <button type="button" className={styles.primaryButton} onClick={openApproval}>OPEN APPROVAL DETAIL</button>
            </div>
          ) : (
            <button type="button" className={styles.engageInline} onClick={() => window.location.reload()} disabled>
              Engage Cofounder from Mission Control to attach the active signal.
            </button>
          )}

          {lastQuestion ? (
            <div className={styles.questionBlock}>
              <div><strong>MANDA</strong><span>{lastQuestion}</span></div>
              <div><strong>COFOUNDER</strong><span>{state.approvalStatus === 'VERIFIED' ? 'The bounded demo action is verified and the final receipt is on the Audit Ledger.' : 'The safest next move is to inspect evidence first and keep material execution behind the founder approval gate.'}</span></div>
            </div>
          ) : null}
        </div>
        <form className={styles.chatForm} onSubmit={submitQuestion}>
          <input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Ask about status, risks, priorities, one rule, or a universe..." />
          <button type="submit"><Send size={15} /> SEND</button>
        </form>
      </div>
    </div>
  );
}

function UniversesView() {
  return (
    <>
      <PageHeading title="SEVEN INDEPENDENT BUSINESSES" sub="The private Cofounder observes across the ecosystem. Each universe keeps its own product, revenue path, and execution boundary." />
      <div className={styles.universeGridLarge}>
        {universes.map((universe) => <UniverseCard key={universe.name} universe={universe} />)}
      </div>
      <div className={styles.doctrinePanel}>
        <LockKeyhole size={20} />
        <div><strong>BOUNDARY DOCTRINE</strong><span>SLA113 governs authority. HIC reasons. Archisynapse reconciles economic truth. Cofounder supervises privately. Omni-Agent remains customer-facing and separate.</span></div>
      </div>
    </>
  );
}

function MissionsView({ state, stagePosition, openApproval }: { state: CommandLoopState; stagePosition: number; openApproval: () => void }) {
  return (
    <>
      <PageHeading title="GOVERNED MISSIONS" sub="A mission is not complete until authority, execution, verification, and receipt state agree." />
      <div className={styles.missionCard}>
        <div className={styles.missionHeader}>
          <div><span className={styles.missionId}>MISSION · RAM_2005</span><h2>Resolve approved $25.00 customer refund</h2></div>
          <span className={statusClass(state.approvalStatus)}>{formatStage(state.approvalStatus)}</span>
        </div>
        <div className={styles.missionMeta}>
          <span><Command size={14} /> service_agent_02</span>
          <span><CircleDollarSign size={14} /> $25.00</span>
          <span><LockKeyhole size={14} /> A4 MATERIAL</span>
          <span><FileCheck2 size={14} /> {state.manifestId}</span>
        </div>
        <ExecutionTimeline state={state} stagePosition={stagePosition} />
        <button type="button" className={styles.secondaryButton} onClick={openApproval}>VIEW APPROVAL AND EVIDENCE</button>
      </div>
    </>
  );
}

function ApprovalsView({
  state,
  stagePosition,
  approve,
  deny,
  requestEvidence,
}: {
  state: CommandLoopState;
  stagePosition: number;
  approve: () => void;
  deny: () => void;
  requestEvidence: () => void;
}) {
  const canDecide = ['PENDING', 'EVIDENCE_REQUESTED'].includes(state.approvalStatus);
  const executionStarted = state.executionStage !== 'NOT_STARTED' && state.executionStage !== 'DENIED';

  return (
    <>
      <PageHeading title="FOUNDER APPROVAL CENTER" sub="Material authority is explicit, one-time, and scoped to a single manifest." />
      <div className={styles.approvalLayout}>
        <div className={styles.approvalCard}>
          <div className={styles.approvalHeading}>
            <div><span className={styles.missionId}>PENDING APPROVAL</span><h2>Refund $25.00 to acct_4812</h2></div>
            <span className={statusClass(state.approvalStatus)}>{formatStage(state.approvalStatus)}</span>
          </div>

          <div className={styles.detailGrid}>
            <Detail label="MANIFEST" value={state.manifestId} mono />
            <Detail label="REQUESTED BY" value="service_agent_02" mono />
            <Detail label="RISK CLASS" value="Financial · A4 Material" />
            <Detail label="IDEMPOTENCY" value="cp_refund_ok" mono />
            <Detail label="POLICY RESULT" value="Eligible · within demo refund ceiling" />
            <Detail label="VERIFIER RESULT" value="Billing-error evidence supported in fixture" />
          </div>

          <div className={styles.effectBox}>
            <strong>EXPECTED ECONOMIC EFFECT</strong>
            <div><span>PSP</span><b>-$25.00 sandbox refund</b></div>
            <div><span>LEDGER</span><b>Compensating entry; original preserved</b></div>
            <div><span>CRM</span><b>Mark refund reflected</b></div>
            <div><span>ARCHISYNAPSE</span><b>Reconcile all required observations</b></div>
          </div>

          {!executionStarted ? (
            <div className={styles.holdNotice}><Clock3 size={16} /><strong>No financial execution has occurred.</strong> TransactionService remains held behind Manda&apos;s approval.</div>
          ) : null}

          <div className={styles.approvalActions}>
            <button type="button" className={styles.primaryButton} disabled={!canDecide} onClick={approve}><CheckCircle2 size={16} /> APPROVE ONCE</button>
            <button type="button" className={styles.dangerButton} disabled={!canDecide} onClick={deny}><XCircle size={16} /> DENY</button>
            <button type="button" className={styles.secondaryButton} disabled={!canDecide} onClick={requestEvidence}><FileCheck2 size={16} /> REQUEST EVIDENCE</button>
          </div>
          <p className={styles.scopeNote}>Approval grants no reusable authority. It applies only to ram_2005, $25.00, customer acct_4812, and the declared idempotency key.</p>
        </div>

        <div className={styles.approvalSide}>
          <div className={styles.panelTitle}>EXECUTION AND VERIFICATION</div>
          <ExecutionTimeline state={state} stagePosition={stagePosition} vertical />
          {state.approvalStatus === 'VERIFIED' ? (
            <div className={styles.finalReceipt}>
              <ShieldCheck size={21} />
              <div><strong>FINAL DEMO RECEIPT SEALED</strong><span>demo_476f113f03 · PSP / ledger / CRM observations agree</span></div>
            </div>
          ) : null}
          {state.approvalStatus === 'DENIED' ? (
            <div className={styles.deniedReceipt}><XCircle size={21} /><div><strong>DENIAL RECEIPT RECORDED</strong><span>No execution adapter was called.</span></div></div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function LedgerView({ records }: { records: CommandLoopState['ledger'] }) {
  return (
    <>
      <PageHeading title="AUDIT LEDGER" sub="Queryable demo receipt references for governed decisions and the bounded command-loop proof." />
      <div className={styles.ledgerSummary}>
        <MetricCard label="VISIBLE RECORDS" value={String(records.length)} meta="latest first" tone="neutral" />
        <MetricCard label="BOUNDARY" value="APPEND-ONLY" meta="demo harness semantics" tone="good" />
        <MetricCard label="MATERIAL ACTION" value="RAM_2005" meta="founder authority required" tone="warn" />
      </div>
      <div className={styles.ledgerTableWrap}>
        <table className={styles.ledgerTable}>
          <thead><tr><th>Receipt</th><th>Manifest</th><th>Action</th><th>Decision</th><th>Stage</th><th>Source</th></tr></thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className={styles.mono}>{record.receiptRef}</td>
                <td className={styles.mono}>{record.manifestId}</td>
                <td>{record.action}</td>
                <td><span className={statusClass(record.decision)}>{record.decision}</span></td>
                <td>{formatStage(record.stage)}</td>
                <td>{record.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.disclosure}><AlertTriangle size={16} /> This screen uses demo receipt references and simulated connectors. It does not claim production settlement, cryptographic anchoring, or live customer traffic.</div>
    </>
  );
}

function ExecutionTimeline({ state, stagePosition, vertical = false }: { state: CommandLoopState; stagePosition: number; vertical?: boolean }) {
  return (
    <div className={vertical ? styles.timelineVertical : styles.timeline}>
      {executionStages.map((stage, index) => {
        const complete = state.executionStage === 'VERIFIED' || (stagePosition >= 0 && index <= stagePosition);
        const active = state.executionStage === stage && state.executionStage !== 'VERIFIED';
        return (
          <div key={stage} className={`${styles.timelineStep} ${complete ? styles.timelineComplete : ''} ${active ? styles.timelineActive : ''}`}>
            <span>{complete ? <CheckCircle2 size={15} /> : index + 1}</span>
            <div><strong>{formatStage(stage)}</strong>{vertical ? <small>{stageDescriptions[stage]}</small> : null}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, meta, tone }: { label: string; value: string; meta: string; tone: string }) {
  return <div className={styles.statCard}><span>{label}</span><strong className={styles[`tone_${tone}`]}>{value}</strong><small>{meta}</small></div>;
}

function MetricCard({ label, value, meta, tone }: { label: string; value: string; meta: string; tone: string }) {
  return <div className={styles.metricCard}><span>{label}</span><strong className={styles[`metric_${tone}`]}>{value}</strong><small>{meta}</small></div>;
}

function UniverseCard({ universe }: { universe: (typeof universes)[number] }) {
  return (
    <article className={`${styles.universeCard} ${styles[`universe_${universe.tone}`]}`}>
      <div className={styles.universeTitle}><h3>{universe.name}</h3><span className={statusClass(universe.status)}>{universe.status}</span></div>
      <p>{universe.description}</p>
      <div className={styles.universeMeta}><span>{universe.metaLeft}</span><span>{universe.metaRight}</span></div>
    </article>
  );
}

function ContextRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={styles.contextRow}><span>{label}</span><strong className={styles[`metric_${tone}`]}>{value}</strong></div>;
}

function ProposalRow({ label, value }: { label: string; value: string }) {
  return <div className={styles.proposalRow}><span>{label}</span><p>{value}</p></div>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className={styles.detail}><span>{label}</span><strong className={mono ? styles.mono : ''}>{value}</strong></div>;
}

function PageHeading({ title, sub }: { title: string; sub: string }) {
  return <div className={styles.pageHeading}><h1>{title}</h1><p>{sub}</p></div>;
}
