'use client';

import { Activity, AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, ServerOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  activeFableJobCount,
  emptyFableSnapshot,
  type FableExecutionSnapshot,
} from '@/lib/mission-control/fable5';
import styles from './fable5-connection.module.css';

const POLL_INTERVAL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 8_000;

function statusLabel(snapshot: FableExecutionSnapshot): string {
  switch (snapshot.status) {
    case 'live':
      return 'LIVE';
    case 'degraded':
      return 'DEGRADED';
    case 'offline':
      return 'OFFLINE';
    case 'not_configured':
      return 'NOT CONFIGURED';
    default:
      return 'CONNECTING';
  }
}

function tone(snapshot: FableExecutionSnapshot): string {
  if (snapshot.status === 'live') return styles.live;
  if (snapshot.status === 'degraded' || snapshot.status === 'not_configured') return styles.warn;
  if (snapshot.status === 'offline') return styles.bad;
  return styles.connecting;
}

function Icon({ snapshot }: { snapshot: FableExecutionSnapshot }) {
  if (snapshot.status === 'live') return <CheckCircle2 size={16} />;
  if (snapshot.status === 'offline') return <ServerOff size={16} />;
  if (snapshot.status === 'degraded') return <AlertTriangle size={16} />;
  return <Activity size={16} />;
}

export default function Fable5Connection({ detailed = false }: { detailed?: boolean }) {
  const [snapshot, setSnapshot] = useState<FableExecutionSnapshot>(emptyFableSnapshot);
  const [refreshing, setRefreshing] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    setRefreshing(true);

    try {
      const response = await fetch('/api/mission-control/fable', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Mission Control bridge returned ${response.status}`);
      }

      const value = (await response.json()) as FableExecutionSnapshot;
      if (!controller.signal.aborted) setSnapshot(value);
    } catch (error) {
      if (!controller.signal.aborted) {
        setSnapshot({
          ...emptyFableSnapshot,
          status: 'offline',
          configured: true,
          checkedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Fable 5 connection failed',
        });
      }
    } finally {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
      activeRequest.current?.abort();
    };
  }, [refresh]);

  const activeJobs = useMemo(() => activeFableJobCount(snapshot), [snapshot]);
  const checkTime = snapshot.checkedAt && snapshot.checkedAt !== new Date(0).toISOString()
    ? new Date(snapshot.checkedAt).toLocaleTimeString()
    : 'not checked';

  if (!detailed) {
    return (
      <aside className={`${styles.dock} ${tone(snapshot)}`} aria-live="polite">
        <div className={styles.dockIcon}><Icon snapshot={snapshot} /></div>
        <div className={styles.dockCopy}>
          <div className={styles.dockTop}>
            <strong>FABLE 5 · COFOUNDER EXECUTION</strong>
            <span>{statusLabel(snapshot)}</span>
          </div>
          <div className={styles.dockMeta}>
            {snapshot.status === 'live'
              ? `${activeJobs} active jobs · ${snapshot.receiptCount} receipts · chain valid`
              : snapshot.error ?? 'Checking the private execution store'}
          </div>
        </div>
        <a href="/mission-control/fable" className={styles.iconButton} aria-label="Open Fable 5 connection details">
          <ExternalLink size={14} />
        </a>
        <button type="button" className={styles.iconButton} onClick={() => void refresh()} aria-label="Refresh Fable 5 status">
          <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
        </button>
      </aside>
    );
  }

  return (
    <div className={styles.detailShell}>
      <header className={styles.detailHeader}>
        <div>
          <div className={styles.eyebrow}>EMPIRE-1 · PRIVATE EXECUTION LINK</div>
          <h1>Fable 5 Connection</h1>
          <p>Server-side, read-only visibility into the Empire Auto Cofounder durable execution store.</p>
        </div>
        <button type="button" className={styles.refreshButton} onClick={() => void refresh()}>
          <RefreshCw size={14} className={refreshing ? styles.spinning : ''} /> CHECK NOW
        </button>
      </header>

      <section className={`${styles.connectionCard} ${tone(snapshot)}`}>
        <div className={styles.connectionStatus}>
          <Icon snapshot={snapshot} />
          <div><span>CONNECTION</span><strong>{statusLabel(snapshot)}</strong></div>
        </div>
        <div><span>ACTIVE JOBS</span><strong>{activeJobs}</strong></div>
        <div><span>RECEIPTS</span><strong>{snapshot.receiptCount}</strong></div>
        <div><span>CHAIN</span><strong>{snapshot.receiptChainValid === true ? 'VALID' : snapshot.receiptChainValid === false ? 'FAILED' : 'UNKNOWN'}</strong></div>
        <div><span>LAST CHECK</span><strong>{checkTime}</strong></div>
      </section>

      {snapshot.error ? <div className={styles.errorBox}><AlertTriangle size={16} /> {snapshot.error}</div> : null}

      <section className={styles.boundaryCard}>
        <h2>Connection boundary</h2>
        <p>Mission Control reads the same governed execution contract used by the private Fable 5 control-plane app: health, durable jobs, and receipt-chain state. Browser code never receives the private upstream base URL or bearer token.</p>
        <p><strong>Writes remain disabled.</strong> Enqueue and approval actions stay closed until founder authentication and server-side authorization are connected.</p>
        <p>The older Empire-1 HIC model router is not used by this bridge because its current provider list includes Google/Gemini and stale model identifiers. Fable 5 execution visibility is connected without violating the Empire-1 non-Google rule.</p>
      </section>

      <section className={styles.jobsCard}>
        <div className={styles.jobsHeader}><h2>Durable execution jobs</h2><span>latest 20 · payloads withheld</span></div>
        <div className={styles.jobTable}>
          <div className={`${styles.jobRow} ${styles.jobHead}`}><span>JOB</span><span>KIND</span><span>TRACE</span><span>ATTEMPT</span><span>APPROVAL</span><span>STATUS</span></div>
          {snapshot.jobs.length === 0 ? <div className={styles.empty}>No durable jobs are available from the connected store.</div> : null}
          {snapshot.jobs.map((job) => (
            <div className={styles.jobRow} key={job.id}>
              <span className={styles.mono}>{job.id.slice(0, 10)}</span>
              <span>{job.kind}</span>
              <span className={styles.mono}>{job.traceId.slice(0, 10)}</span>
              <span>{job.attempt}/{job.maxAttempts}</span>
              <span>{job.approvalId ?? (job.approvalRequired ? 'REQUIRED' : 'NOT REQUIRED')}</span>
              <span className={styles.jobStatus}>{job.status.replaceAll('_', ' ').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}><a href="/mission-control">← Return to Mission Control</a><span>WRITE MODE · DISABLED</span></footer>
    </div>
  );
}
