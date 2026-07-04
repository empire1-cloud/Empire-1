'use client';

import { useState, useEffect } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

const PRODUCTS = [
  { id: 'free_demo',          label: 'Free Demo',            price: 0,    color: '#22c55e' },
  { id: 'revenue_receipt',    label: 'Revenue Receipt',      price: 299,  color: '#D4AF37' },
  { id: 'revenue_sprint',     label: 'Revenue Sprint',       price: 999,  color: '#FF8C00' },
  { id: 'revenue_enterprise', label: 'Enterprise Impl.',     price: 5000, color: '#FF6600' },
  { id: 'southern_build',     label: 'Southern Build',       price: 500,  color: '#C41E3A' },
  { id: 'game_studio',        label: 'Game Studio Build',    price: 0,    color: '#00BFFF' },
  { id: 'sonance_music',      label: 'Sonance / Music',      price: 0,    color: '#a855f7' },
];

const FUNNEL_STAGES = [
  { stage: 'lead',        label: 'New Lead',   color: '#555' },
  { stage: 'qualified',   label: 'Qualified',  color: '#00BFFF' },
  { stage: 'proposal',    label: 'Proposal',   color: '#a855f7' },
  { stage: 'negotiation', label: 'Negotiating',color: '#FF8C00' },
  { stage: 'active',      label: 'Paid/Active',color: '#22c55e' },
];

type Tab = 'funnel' | 'revenue' | 'platform';

export default function BusinessAnalyticsPanel() {
  const [tab, setTab]         = useState<Tab>('funnel');
  const [leads, setLeads]     = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [usage, setUsage]     = useState<any>(null);
  const [kpi, setKpi]         = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const headers = getSla113AdminHeaders();
      const [pipeRes, revRes, usageRes, kpiRes] = await Promise.all([
        fetch('/api/crm/pipeline',                { headers }),
        fetch('/api/business-analytics/revenue',  { headers }),
        fetch('/api/business-analytics/usage',    { headers }),
        fetch('/api/business-analytics/kpi',      { headers }),
      ]);
      const pipe  = await pipeRes.json();
      const rev   = await revRes.json();
      const usg   = await usageRes.json();
      const kp    = await kpiRes.json();
      if (pipe.success)  setLeads(pipe.leads || []);
      if (rev.success)   setRevenue(rev);
      if (usg.success)   setUsage(usg);
      if (kp.success)    setKpi(kp);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  /* ── Funnel calculations ── */
  const funnelData = FUNNEL_STAGES.map(fs => ({
    ...fs,
    count: leads.filter(l => l.pipeline_stage === fs.stage).length,
    value: leads.filter(l => l.pipeline_stage === fs.stage).reduce((s: number, l: any) => s + (l.value || 0), 0),
  }));
  const maxCount = Math.max(1, ...funnelData.map(f => f.count));

  /* ── Product breakdown ── */
  const productData = PRODUCTS.map(p => ({
    ...p,
    total:    leads.filter(l => l.lane === p.id).length,
    pipeline: leads.filter(l => l.lane === p.id && ['qualified','proposal','negotiation'].includes(l.pipeline_stage)).length,
    paid:     leads.filter(l => l.lane === p.id && ['active','onboarding'].includes(l.pipeline_stage)).length,
    value:    leads.filter(l => l.lane === p.id).reduce((s: number, l: any) => s + (l.value || 0), 0),
  })).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  const totalPipeline = leads.filter(l => ['qualified','proposal','negotiation'].includes(l.pipeline_stage)).reduce((s: number, l: any) => s + (l.value || 0), 0);
  const totalPaid     = leads.filter(l => ['active','onboarding'].includes(l.pipeline_stage)).reduce((s: number, l: any) => s + (l.value || 0), 0);
  const convRate      = leads.length > 0 ? Math.round((leads.filter(l => l.pipeline_stage === 'active').length / leads.length) * 100) : 0;

  /* ── Next actions ── */
  const proposals = leads.filter(l => l.pipeline_stage === 'proposal');
  const qualified  = leads.filter(l => l.pipeline_stage === 'qualified');

  if (loading) return (
    <div style={{ background: '#050508', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      Loading analytics…
    </div>
  );

  return (
    <div style={{ background: '#050508', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 6 }}>Sales Intelligence</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Analytics</h1>
          </div>
          <button onClick={loadAll} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, padding: '8px 16px', background: 'transparent', border: '1px solid rgba(212,175,55,.3)', color: '#D4AF37', borderRadius: 4, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {/* Summary strip */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
          {[
            { label: 'Total Leads',      val: leads.length,                         color: '#fff'    },
            { label: 'In Pipeline',      val: `$${totalPipeline.toLocaleString()}`, color: '#D4AF37' },
            { label: 'Active Revenue',   val: `$${totalPaid.toLocaleString()}`,     color: '#22c55e' },
            { label: 'Conversion Rate',  val: `${convRate}%`,                       color: '#00BFFF' },
            { label: 'Need Follow-up',   val: proposals.length + qualified.length,  color: '#FF8C00' },
          ].map((c, i) => (
            <div key={c.label} style={{
              flex: 1, padding: '18px 20px', background: '#0d0d12',
              borderRight: i < 4 ? '1px solid rgba(255,255,255,.06)' : 'none',
            }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: c.color, margin: 0 }}>{c.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {(['funnel','revenue','platform'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2,
              padding: '8px 18px', textTransform: 'capitalize', borderRadius: 4, cursor: 'pointer',
              background: tab === t ? '#D4AF37' : 'transparent',
              color: tab === t ? '#000' : '#555',
              border: tab === t ? 'none' : '1px solid rgba(255,255,255,.08)',
              fontWeight: tab === t ? 700 : 400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── FUNNEL TAB ── */}
      {tab === 'funnel' && (
        <div style={{ padding: '0 32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Funnel visual */}
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 20 }}>Sales Funnel</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {funnelData.map((f, i) => {
                  const width = `${Math.max(20, (f.count / maxCount) * 100)}%`;
                  const prev = i > 0 ? funnelData[i-1].count : f.count;
                  const dropOff = prev > 0 ? Math.round(((prev - f.count) / prev) * 100) : 0;
                  return (
                    <div key={f.stage}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#555', width: 88, textTransform: 'uppercase', flexShrink: 0 }}>{f.label}</span>
                        <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,.04)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                          <div style={{ height: '100%', background: f.color, width, opacity: 0.85, borderRadius: 3, transition: 'width .5s ease', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#000' }}>{f.count}</span>
                          </div>
                        </div>
                        {f.value > 0 && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: f.color, width: 70, textAlign: 'right', flexShrink: 0 }}>${f.value.toLocaleString()}</span>}
                      </div>
                      {i > 0 && dropOff > 0 && (
                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#444', marginLeft: 98, marginBottom: 0 }}>↓ {dropOff}% drop</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next actions */}
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#FF8C00', textTransform: 'uppercase', marginBottom: 16 }}>Action Required</p>
              {[...proposals, ...qualified].length === 0 ? (
                <p style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>No leads need immediate follow-up.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...proposals, ...qualified].slice(0, 8).map((l: any) => (
                    <div key={l.id} style={{ background: 'rgba(255,140,0,.06)', border: '1px solid rgba(255,140,0,.15)', borderRadius: 4, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{l.name}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#FF8C00', textTransform: 'capitalize' }}>{l.pipeline_stage}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        {l.lane && <span style={{ fontSize: 11, color: '#555' }}>{l.lane.replace(/_/g,' ')}</span>}
                        {l.value > 0 && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#22c55e' }}>${l.value.toLocaleString()}</span>}
                        {l.email && <span style={{ fontSize: 11, color: '#555' }}>{l.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 10 }}>Top Products to Push</p>
                {PRODUCTS.slice(0, 3).map(p => {
                  const inPipeline = leads.filter(l => l.lane === p.id && ['qualified','proposal'].includes(l.pipeline_stage)).length;
                  if (inPipeline === 0) return null;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#c8c8d0' }}>{p.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: p.color }}>{inPipeline} ready to close</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product breakdown */}
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24, gridColumn: '1 / -1' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>By Product</p>
              {productData.length === 0 ? (
                <p style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>No leads with a product assigned yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {productData.map(p => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${p.color}30`, borderRadius: 6, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.label}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[{ k: 'Total', v: p.total }, { k: 'Pipeline', v: p.pipeline }, { k: 'Paid', v: p.paid }].map(r => (
                          <div key={r.k}>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: 1, color: '#444', textTransform: 'uppercase', marginBottom: 2 }}>{r.k}</p>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: r.k === 'Paid' ? '#22c55e' : '#fff', margin: 0 }}>{r.v}</p>
                          </div>
                        ))}
                      </div>
                      {p.value > 0 && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: p.color, marginTop: 8 }}>${p.value.toLocaleString()} pipeline</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {tab === 'revenue' && revenue && (
        <div style={{ padding: '0 32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 8 }}>Active Revenue</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: '#22c55e', margin: '0 0 20px' }}>${revenue.total_mrr?.toLocaleString() || 0}</p>
              <p style={{ fontSize: 12, color: '#555' }}>From {revenue.active_clients || 0} active clients across all products.</p>
            </div>
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>Revenue by Product Lane</p>
              {PRODUCTS.map(p => {
                const val = revenue.lane_mrr?.[p.id] || 0;
                const max = Math.max(1, ...PRODUCTS.map(q => revenue.lane_mrr?.[q.id] || 0));
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#c8c8d0', width: 160, flexShrink: 0 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: p.color, width: `${(val / max) * 100}%` }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff', width: 64, textAlign: 'right' }}>${val.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── PLATFORM TAB ── */}
      {tab === 'platform' && (
        <div style={{ padding: '0 32px 40px' }}>
          {kpi && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { k: 'Total Users',     v: kpi.kpis?.total_users     || 0, color: '#fff'    },
                { k: 'Active Teams',    v: kpi.kpis?.active_teams    || 0, color: '#00BFFF' },
                { k: 'CRM Leads',       v: kpi.kpis?.crm_leads       || 0, color: '#D4AF37' },
                { k: 'Active Clients',  v: kpi.kpis?.active_clients  || 0, color: '#22c55e' },
                { k: 'Conversion Rate', v: `${kpi.kpis?.conversion_rate || 0}%`, color: '#a855f7' },
                { k: 'Pending Invites', v: kpi.kpis?.pending_invites || 0, color: '#FF8C00' },
              ].map(c => (
                <div key={c.k} style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '18px 22px' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 6 }}>{c.k}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, color: c.color, margin: 0 }}>{c.v}</p>
                </div>
              ))}
            </div>
          )}
          {usage && (
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>Top Engines</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {(usage.metrics?.top_engines || []).map((e: any) => (
                  <div key={e.engine} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 4 }}>
                    <span style={{ fontSize: 12, color: '#c8c8d0' }}>{e.engine}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#D4AF37' }}>{e.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
