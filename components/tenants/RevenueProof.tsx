'use client';

import { FormEvent, useEffect, useState } from 'react';

type PublicActivity = {
  product: string;
  product_label: string;
  stage: string;
  date: string | null;
};

type PublicSummary = {
  success: boolean;
  state: 'live' | 'empty';
  generated_at: string;
  metrics: {
    total_leads: number;
    pipeline_value: number;
    active_revenue: number;
    lane_counts: Record<string, number>;
    stage_counts: Record<string, number>;
  };
  recent_activity: PublicActivity[];
};

const PRODUCT_COLORS: Record<string, string> = {
  revenue_receipt: '#e8b923',
  revenue_sprint: '#ff8c00',
  revenue_enterprise: '#ff6600',
  southern_build: '#c41e3a',
  game_studio: '#007aff',
  sonance_music: '#a855f7',
  free_demo: '#3ddc84',
  other: '#8c8c95',
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'entered',
  qualified: 'qualified',
  proposal: 'proposal',
  negotiation: 'negotiation',
  onboarding: 'onboarding',
  active: 'active',
  at_risk: 'at risk',
  churned: 'closed',
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function RevenueProof() {
  const [summary, setSummary] = useState<PublicSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [email, setEmail] = useState('');
  const [lane, setLane] = useState('revenue_receipt');
  const [intakeStatus, setIntakeStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/crm/public-summary', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error(`Pipeline summary failed: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!data?.success || !data?.metrics || !Array.isArray(data?.recent_activity)) {
          throw new Error('Pipeline summary contract mismatch');
        }
        setSummary(data);
        setStatus('ready');
      })
      .catch(error => {
        if (error?.name !== 'AbortError') setStatus('unavailable');
      });

    return () => controller.abort();
  }, []);

  async function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || intakeStatus === 'sending') return;

    setIntakeStatus('sending');
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: email.split('@')[0],
          email: email.trim(),
          source: 'empire1_landing',
          lane,
          notes: 'Submitted from the verified revenue movement section.',
        }),
      });
      if (!response.ok) throw new Error(`Lead intake failed: ${response.status}`);
      const data = await response.json();
      if (!data?.success) throw new Error('Lead intake contract mismatch');
      setEmail('');
      setIntakeStatus('done');
    } catch {
      setIntakeStatus('error');
    }
  }

  const products = summary
    ? Object.entries(summary.metrics.lane_counts)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
    : [];

  return (
    <section className="section" id="revenue-proof">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">VERIFIED REVENUE MOVEMENT</div>
          <h2>What&apos;s moving—without invented wins.</h2>
        </div>

        {status === 'loading' && (
          <div className="proof-state">Checking the live pipeline…</div>
        )}

        {status === 'unavailable' && (
          <div className="proof-state proof-state-warn">
            Live pipeline evidence is unavailable. No activity or revenue is being claimed.
          </div>
        )}

        {status === 'ready' && summary?.state === 'empty' && (
          <div className="proof-state">
            No verified pipeline activity yet. This space stays empty until real leads arrive.
          </div>
        )}

        {status === 'ready' && summary?.state === 'live' && (
          <>
            <div className="proof-metrics">
              <div className="proof-metric">
                <span>Total leads</span>
                <strong>{summary.metrics.total_leads}</strong>
              </div>
              <div className="proof-metric">
                <span>Qualified pipeline</span>
                <strong>{money.format(summary.metrics.pipeline_value)}</strong>
              </div>
              <div className="proof-metric">
                <span>Active + onboarding</span>
                <strong>{money.format(summary.metrics.active_revenue)}</strong>
              </div>
            </div>

            <div className="proof-grid">
              <div className="proof-card">
                <h3>By product</h3>
                {products.length === 0 ? (
                  <p className="proof-muted">Leads exist, but no product lane is assigned yet.</p>
                ) : (
                  <div className="proof-products">
                    {products.map(([product, count]) => (
                      <div className="proof-product" key={product}>
                        <span
                          className="proof-dot"
                          style={{ background: PRODUCT_COLORS[product] || PRODUCT_COLORS.other }}
                        />
                        <span>{summary.recent_activity.find(item => item.product === product)?.product_label || 'Other'}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="proof-card">
                <h3>Recent anonymous activity</h3>
                <div className="proof-activity">
                  {summary.recent_activity.map((item, index) => (
                    <div className="proof-activity-row" key={`${item.product}-${item.date}-${index}`}>
                      <span
                        className="proof-dot"
                        style={{ background: PRODUCT_COLORS[item.product] || PRODUCT_COLORS.other }}
                      />
                      <span>
                        {item.product_label} · {STAGE_LABELS[item.stage] || item.stage}
                      </span>
                      <time>{item.date || 'date unavailable'}</time>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="cta-row" style={{ marginTop: 30, marginBottom: 0 }}>
          <a href="/try-revenue-os" className="btn btn-primary">Try Revenue OS Free →</a>
          <a href="#entry" className="btn btn-ghost">See ways in</a>
        </div>

        <form className="proof-intake" onSubmit={submitInterest}>
          <div>
            <label htmlFor="proof-email">Join the real pipeline</label>
            <p>Choose what you want and leave your email. The selected product is recorded directly—no hidden follow-up patch.</p>
          </div>
          <select
            aria-label="Product interest"
            value={lane}
            onChange={event => setLane(event.target.value)}
          >
            <option value="revenue_receipt">Revenue Receipt · $299</option>
            <option value="revenue_sprint">Revenue Sprint · $999</option>
            <option value="revenue_enterprise">Enterprise implementation</option>
            <option value="southern_build">Southern Build</option>
            <option value="game_studio">Game Studio Build</option>
            <option value="sonance_music">Sonance / Music</option>
          </select>
          <input
            id="proof-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <button type="submit" disabled={intakeStatus === 'sending'}>
            {intakeStatus === 'sending' ? 'Sending…' : 'Join →'}
          </button>
          {intakeStatus === 'done' && <span className="proof-form-ok">Received. You&apos;re in the real pipeline.</span>}
          {intakeStatus === 'error' && <span className="proof-form-error">Could not submit. Please try again.</span>}
        </form>
      </div>
    </section>
  );
}
