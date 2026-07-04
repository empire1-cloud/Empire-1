'use client';

import { useState, useEffect } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

/* ── Empire 1 product lanes ── */
const PRODUCT_LANES = [
  { id: 'revenue_receipt',   label: 'Revenue Receipt',        price: '$299',    color: 'bg-amber-100 text-amber-800',   dot: '#D4AF37' },
  { id: 'revenue_sprint',    label: 'Revenue Sprint',         price: '$999',    color: 'bg-yellow-100 text-yellow-800', dot: '#FF8C00' },
  { id: 'revenue_enterprise',label: 'Enterprise Impl.',       price: '$5K+',    color: 'bg-orange-100 text-orange-800', dot: '#FF6600' },
  { id: 'southern_build',    label: 'Southern Build',         price: '$250–1K', color: 'bg-red-100 text-red-800',       dot: '#C41E3A' },
  { id: 'game_studio',       label: 'Game Studio Build',      price: 'Custom',  color: 'bg-blue-100 text-blue-800',     dot: '#00BFFF' },
  { id: 'sonance_music',     label: 'Sonance / Music',        price: 'Custom',  color: 'bg-purple-100 text-purple-800', dot: '#a855f7' },
  { id: 'free_demo',         label: 'Free Demo Lead',         price: '$0',      color: 'bg-green-100 text-green-800',   dot: '#22c55e' },
  { id: 'other',             label: 'Other',                  price: '—',       color: 'bg-gray-100 text-gray-600',     dot: '#555'    },
];

const PIPELINE_STAGES = ['lead','qualified','proposal','negotiation','onboarding','active','at_risk','churned'];
const LEAD_SOURCES    = ['empire1_landing','southern_request','revenue_os_try','referral','linkedin','cold_outreach','other'];

const stageColor: Record<string,string> = {
  lead:        'bg-gray-100 text-gray-700',
  qualified:   'bg-blue-100 text-blue-700',
  proposal:    'bg-purple-100 text-purple-700',
  negotiation: 'bg-amber-100 text-amber-700',
  onboarding:  'bg-cyan-100 text-cyan-700',
  active:      'bg-emerald-100 text-emerald-700',
  at_risk:     'bg-orange-100 text-orange-700',
  churned:     'bg-red-100 text-red-700',
};

const laneMap = Object.fromEntries(PRODUCT_LANES.map(l => [l.id, l]));

interface Lead {
  id: string; name: string; company?: string; email?: string;
  phone?: string; source: string; pipeline_stage: string;
  lane?: string; value: number; notes?: string;
  created_at: string; updated_at: string;
}

interface Metrics {
  total_leads: number; total_pipeline_value: number;
  stage_counts: Record<string,number>; lane_counts: Record<string,number>;
}

export default function CRMPanel() {
  const [tab, setTab]               = useState<'pipeline'|'add'|'metrics'>('pipeline');
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [metrics, setMetrics]       = useState<Metrics | null>(null);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Lead | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError]           = useState<string | null>(null);
  const [actNote, setActNote]       = useState('');

  const [fName, setFName]     = useState('');
  const [fEmail, setFEmail]   = useState('');
  const [fPhone, setFPhone]   = useState('');
  const [fCo, setFCo]         = useState('');
  const [fSource, setFSource] = useState('empire1_landing');
  const [fLane, setFLane]     = useState('revenue_receipt');
  const [fValue, setFValue]   = useState('');
  const [fNotes, setFNotes]   = useState('');
  const [fStage, setFStage]   = useState('lead');

  useEffect(() => { load(); loadMetrics(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/crm/pipeline', { headers: getSla113AdminHeaders() });
      if (!r.ok) throw new Error(`Pipeline fetch failed: ${r.status}`);
      const d = await r.json();
      if (d.success) setLeads(d.leads);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadMetrics() {
    try {
      const r = await fetch('/api/crm/metrics', { headers: getSla113AdminHeaders() });
      if (!r.ok) return;
      const d = await r.json();
      if (d.success) setMetrics(d.metrics);
    } catch {}
  }

  async function openLead(lead: Lead) {
    setSelected(lead);
    try {
      const r = await fetch(`/api/crm/leads/${lead.id}`, { headers: getSla113AdminHeaders() });
      if (!r.ok) return;
      const d = await r.json();
      if (d.success) setActivities(d.activities || []);
    } catch {}
  }

  async function addLead() {
    if (!fName.trim()) return;
    try {
      const body: any = { name: fName, source: fSource };
      if (fEmail) body.email = fEmail;
      if (fPhone) body.phone = fPhone;
      if (fCo)    body.company = fCo;
      if (fNotes) body.notes = fNotes;
      const r = await fetch('/api/crm/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...getSla113AdminHeaders() },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Create failed');
      const d = await r.json();
      if (d.success && (fLane !== 'other' || fValue || fStage !== 'lead')) {
        await fetch(`/api/crm/leads/${d.lead.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', ...getSla113AdminHeaders() },
          body: JSON.stringify({ lane: fLane, value: fValue ? parseFloat(fValue) : undefined, pipeline_stage: fStage }),
        });
      }
      setFName(''); setFEmail(''); setFPhone(''); setFCo('');
      setFNotes(''); setFStage('lead'); setFValue('');
      load(); loadMetrics();
      setTab('pipeline');
    } catch (e: any) { setError(e.message); }
  }

  async function moveStage(id: string, stage: string) {
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...getSla113AdminHeaders() },
      body: JSON.stringify({ pipeline_stage: stage }),
    });
    load();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, pipeline_stage: stage } : null);
  }

  async function addActivity() {
    if (!selected || !actNote.trim()) return;
    await fetch('/api/crm/activities', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...getSla113AdminHeaders() },
      body: JSON.stringify({ lead_id: selected.id, type: 'note', description: actNote }),
    });
    setActNote(''); openLead(selected);
  }

  /* ── What's Selling bar ── */
  const productTotals = PRODUCT_LANES.map(p => ({
    ...p,
    count: leads.filter(l => l.lane === p.id).length,
    value: leads.filter(l => l.lane === p.id).reduce((s, l) => s + (l.value || 0), 0),
  })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

  const activeRevenue = leads
    .filter(l => ['active','onboarding'].includes(l.pipeline_stage))
    .reduce((s, l) => s + (l.value || 0), 0);

  const pipelineValue = leads
    .filter(l => ['qualified','proposal','negotiation'].includes(l.pipeline_stage))
    .reduce((s, l) => s + (l.value || 0), 0);

  const byStage = (s: string) => leads.filter(l => l.pipeline_stage === s);

  return (
    <div style={{ background: '#050508', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 6 }}>Sales Pipeline</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>CRM</h1>
          </div>
          <button onClick={() => { load(); loadMetrics(); }} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, padding: '8px 16px', background: 'transparent', border: '1px solid rgba(212,175,55,.3)', color: '#D4AF37', borderRadius: 4, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {/* ── WHAT'S SELLING ── */}
        <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.15)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 12 }}>
            What's Selling
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {productTotals.length === 0
              ? <span style={{ fontSize: 12, color: '#555' }}>No leads yet — add one or wait for public form submissions.</span>
              : productTotals.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, padding: '6px 12px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#D4AF37' }}>{p.count}</span>
                  {p.value > 0 && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555' }}>${p.value.toLocaleString()}</span>}
                </div>
              ))
            }
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#555', textTransform: 'uppercase' }}>Pipeline Value  </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#D4AF37' }}>${pipelineValue.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#555', textTransform: 'uppercase' }}>Active Revenue  </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#22c55e' }}>${activeRevenue.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#555', textTransform: 'uppercase' }}>Total Leads  </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#fff' }}>{leads.length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(196,30,58,.1)', border: '1px solid rgba(196,30,58,.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#e8294a' }}>{error}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {(['pipeline','add','metrics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2,
              padding: '8px 18px', textTransform: 'uppercase', borderRadius: 4, cursor: 'pointer',
              background: tab === t ? '#D4AF37' : 'transparent',
              color: tab === t ? '#000' : '#555',
              border: tab === t ? 'none' : '1px solid rgba(255,255,255,.08)',
              fontWeight: tab === t ? 700 : 400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── PIPELINE ── */}
      {tab === 'pipeline' && (
        <div style={{ padding: '0 32px 40px', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading pipeline…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', gap: 12 }}>
              {PIPELINE_STAGES.slice(0, 4).map(stage => (
                <StageColumn key={stage} stage={stage} leads={byStage(stage)} selected={selected} onOpen={openLead} />
              ))}
            </div>
          )}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
              {PIPELINE_STAGES.slice(4).map(stage => (
                <StageColumn key={stage} stage={stage} leads={byStage(stage)} selected={selected} onOpen={openLead} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD LEAD ── */}
      {tab === 'add' && (
        <div style={{ padding: '0 32px 40px' }}>
          <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 28, maxWidth: 560 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 20 }}>Add Lead</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Name *"><input value={fName} onChange={e => setFName(e.target.value)} placeholder="Contact name" style={inputStyle} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Email"><input value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="email@co.com" style={inputStyle} /></Field>
                <Field label="Phone"><input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="(555) 000-0000" style={inputStyle} /></Field>
              </div>
              <Field label="Company"><input value={fCo} onChange={e => setFCo(e.target.value)} placeholder="Company / brand" style={inputStyle} /></Field>
              <Field label="Product Interest">
                <select value={fLane} onChange={e => setFLane(e.target.value)} style={inputStyle}>
                  {PRODUCT_LANES.map(p => <option key={p.id} value={p.id}>{p.label} {p.price !== '—' ? `— ${p.price}` : ''}</option>)}
                </select>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="Source">
                  <select value={fSource} onChange={e => setFSource(e.target.value)} style={inputStyle}>
                    {LEAD_SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </Field>
                <Field label="Stage">
                  <select value={fStage} onChange={e => setFStage(e.target.value)} style={inputStyle}>
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Deal Value $"><input value={fValue} onChange={e => setFValue(e.target.value)} placeholder="299" type="number" style={inputStyle} /></Field>
              </div>
              <Field label="Notes"><textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Context, next steps…" rows={3} style={{ ...inputStyle, resize: 'none' }} /></Field>
              <button onClick={addLead} style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#FFD700,#D4AF37)', color: '#000', border: 'none', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}>
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── METRICS ── */}
      {tab === 'metrics' && metrics && (
        <div style={{ padding: '0 32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Leads', val: metrics.total_leads, color: '#fff' },
              { label: 'Pipeline Value', val: `$${pipelineValue.toLocaleString()}`, color: '#D4AF37' },
              { label: 'Active Revenue', val: `$${activeRevenue.toLocaleString()}`, color: '#22c55e' },
              { label: 'Active Clients', val: metrics.stage_counts?.active || 0, color: '#00BFFF' },
            ].map(c => (
              <div key={c.label} style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '20px 24px' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: c.color }}>{c.val}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>Leads by Product</p>
              {PRODUCT_LANES.map(p => {
                const cnt = metrics.lane_counts?.[p.id] || 0;
                const max = Math.max(1, ...PRODUCT_LANES.map(q => metrics.lane_counts?.[q.id] || 0));
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#c8c8d0', width: 160, flexShrink: 0 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: p.dot, width: `${(cnt / max) * 100}%`, transition: 'width .3s' }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff', width: 20, textAlign: 'right' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>Pipeline Stages</p>
              {PIPELINE_STAGES.map(s => {
                const cnt = metrics.stage_counts?.[s] || 0;
                const max = Math.max(1, ...PIPELINE_STAGES.map(q => metrics.stage_counts?.[q] || 0));
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#c8c8d0', width: 100, flexShrink: 0, textTransform: 'capitalize' }}>{s}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: '#D4AF37', width: `${(cnt / max) * 100}%`, opacity: 0.7 }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff', width: 20, textAlign: 'right' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LEAD DETAIL DRAWER ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelected(null)}>
          <div style={{ background: '#0d0d12', border: '1px solid rgba(212,175,55,.2)', borderRadius: 10, width: '100%', maxWidth: 500, margin: 16, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{selected.name}</p>
                {selected.company && <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{selected.company}</p>}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', padding: 0 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { k: 'Product', v: laneMap[selected.lane || '']?.label || selected.lane || '—' },
                  { k: 'Value', v: `$${selected.value?.toLocaleString() || 0}` },
                  { k: 'Source', v: selected.source?.replace(/_/g, ' ') || '—' },
                  { k: 'Email', v: selected.email || '—' },
                ].map(r => (
                  <div key={r.k}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 3 }}>{r.k}</p>
                    <p style={{ fontSize: 13, color: '#e0e0e0' }}>{r.v}</p>
                  </div>
                ))}
              </div>

              {/* Move stage */}
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 8 }}>Move Stage</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {PIPELINE_STAGES.map(s => (
                  <button key={s} onClick={() => moveStage(selected.id, s)} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1, padding: '5px 10px',
                    textTransform: 'capitalize', borderRadius: 3, cursor: 'pointer',
                    background: selected.pipeline_stage === s ? '#D4AF37' : 'rgba(255,255,255,.06)',
                    color: selected.pipeline_stage === s ? '#000' : '#777',
                    border: 'none', fontWeight: selected.pipeline_stage === s ? 700 : 400,
                  }}>{s}</button>
                ))}
              </div>

              {selected.notes && (
                <div style={{ background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 4, padding: 12, marginBottom: 20 }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 6 }}>Notes</p>
                  <p style={{ fontSize: 13, color: '#c8c8d0', lineHeight: 1.65 }}>{selected.notes}</p>
                </div>
              )}

              {/* Activity */}
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 8 }}>Activity ({activities.length})</p>
              <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activities.length === 0 && <p style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>No activity yet.</p>}
                {activities.map((a: any) => (
                  <div key={a.id} style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 4, padding: '8px 12px' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#444', marginBottom: 4 }}>{new Date(a.timestamp).toLocaleString()}</p>
                    <p style={{ fontSize: 12, color: '#c8c8d0' }}>{a.description}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={actNote} onChange={e => setActNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addActivity()} placeholder="Add note…" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addActivity} style={{ padding: '9px 16px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helpers ── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,.5)',
  border: '1px solid rgba(255,255,255,.1)', borderRadius: 4,
  color: '#e0e0e0', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function StageColumn({ stage, leads, selected, onOpen }: { stage: string; leads: Lead[]; selected: Lead | null; onOpen: (l: Lead) => void }) {
  const laneMap2 = Object.fromEntries(PRODUCT_LANES.map(p => [p.id, p]));
  return (
    <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#777', textTransform: 'capitalize' }}>{stage}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555' }}>{leads.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {leads.map(l => {
          const prod = laneMap2[l.lane || ''];
          return (
            <button key={l.id} onClick={() => onOpen(l)} style={{
              textAlign: 'left', background: selected?.id === l.id ? 'rgba(212,175,55,.1)' : 'rgba(0,0,0,.4)',
              border: `1px solid ${selected?.id === l.id ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.07)'}`,
              borderRadius: 4, padding: '10px 12px', cursor: 'pointer', transition: 'all .15s',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</p>
              {l.company && <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{l.company}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                {prod && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, color: prod.dot }}>
                    {prod.label}
                  </span>
                )}
                {l.value > 0 && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#22c55e', marginLeft: 'auto' }}>
                    ${l.value.toLocaleString()}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
