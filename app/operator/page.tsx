'use client';

import { useEffect, useState } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

const TOOLS = [
  {
    id: 'revenue-os',
    label: 'Revenue OS',
    sub: 'Command Center',
    desc: 'Run the full revenue system — offers, buyers, GTM, outreach, checkout, delivery.',
    href: '/revenue-os',
    cta: 'Open Cockpit',
    color: '#D4AF37',
    badge: 'LIVE',
  },
  {
    id: 'try-revenue-os',
    label: 'Public Demo',
    sub: 'Revenue OS Try Flow',
    desc: 'The public-facing demo your prospects land on. Test it as a visitor.',
    href: '/try-revenue-os',
    cta: 'Open Demo',
    color: '#22c55e',
    badge: 'PUBLIC',
  },
  {
    id: 'revenue-receipt',
    label: 'Revenue Receipt',
    sub: '$299 Artifact',
    desc: 'Standalone receipt generator. One prompt → full revenue artifact.',
    href: '/revenue-receipt',
    cta: 'Generate',
    color: '#FF8C00',
    badge: '$299',
  },
  {
    id: 'sla113',
    label: 'Game Studio',
    sub: 'SLA113 Console',
    desc: 'AI game dev pipeline — vision, logic, audio, compliance, deploy.',
    href: '/sla113',
    cta: 'Open Studio',
    color: '#00BFFF',
    badge: 'ADMIN',
  },
  {
    id: 'dashboard',
    label: 'Business Portal',
    sub: 'Billing & Subscription',
    desc: 'Subscription tiers, Stripe billing, active node overview.',
    href: '/dashboard',
    cta: 'Open Portal',
    color: '#a855f7',
    badge: 'BILLING',
  },
  {
    id: 'southern',
    label: 'Southern Lyfestyle',
    sub: 'southernlifestyle.org',
    desc: 'Custom digital builds for car clubs, barbershops, families, and community.',
    href: 'https://southernlifestyle.org',
    cta: 'Open Site',
    color: '#C41E3A',
    badge: 'CULTURE',
  },
];

const QUICK_LINKS = [
  { label: 'Revenue OS Cockpit', href: '/revenue-os' },
  { label: 'Generate Receipt', href: '/revenue-receipt' },
  { label: 'SLA113 Console', href: '/sla113' },
  { label: 'CRM Pipeline', href: '/admin/crm' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'GTM Panel', href: '/admin/gtm' },
  { label: 'AI Studio', href: '/admin/ai-studio' },
  { label: 'Machines', href: '/admin/machines' },
  { label: 'Stem Deck', href: '/admin/stem-deck' },
  { label: 'Tenants', href: '/admin/tenants' },
];

export default function OperatorPage() {
  const [time, setTime]       = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth]   = useState<'checking'|'online'|'offline'>('checking');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);

    fetch('/api/health')
      .then(r => setHealth(r.ok ? 'online' : 'offline'))
      .catch(() => setHealth('offline'));

    fetch('/api/crm/metrics', { headers: getSla113AdminHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setMetrics(d.metrics); })
      .catch(() => {});

    return () => clearInterval(t);
  }, []);

  const pipelineValue = metrics
    ? Object.values(metrics.stage_counts || {}).reduce((s: number, _v: any) => s, 0)
    : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#050508', color: '#e0e0e0',
      fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden',
    }}>
      {/* Grid BG */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(212,175,55,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.025) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
        background: 'rgba(5,5,8,.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid rgba(212,175,55,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
            EMPIRE <span style={{ color: '#FF1493' }}>1</span>
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#444', textTransform: 'uppercase' }}>
            Operator Console
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: health === 'online' ? '#22c55e' : health === 'offline' ? '#ef4444' : '#555',
              boxShadow: health === 'online' ? '0 0 6px #22c55e' : 'none',
            }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#555', textTransform: 'uppercase' }}>
              {health === 'checking' ? 'Checking…' : health === 'online' ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#333' }}>{time}</span>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 8 }}>
            Empire 1 · Operator Access
          </p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-.02em', lineHeight: 1.05 }}>
            Command Center
          </h1>
        </div>

        {/* Live stats strip */}
        <div style={{
          display: 'flex', gap: 0,
          border: '1px solid rgba(255,255,255,.06)', borderRadius: 8,
          overflow: 'hidden', marginBottom: 32,
        }}>
          {[
            { label: 'Total Leads',    val: metrics?.total_leads ?? '—',      color: '#fff'    },
            { label: 'Pipeline Value', val: metrics ? `$${(metrics.total_pipeline_value ?? 0).toLocaleString()}` : '—', color: '#D4AF37' },
            { label: 'Active Clients', val: metrics?.stage_counts?.active ?? '—', color: '#22c55e' },
            { label: 'Backend',        val: health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : '…', color: health === 'online' ? '#22c55e' : '#ef4444' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: '16px 24px', background: '#0d0d12',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,.06)' : 'none',
            }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Tool grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {TOOLS.map(tool => (
            <a key={tool.id} href={tool.href} style={{
              display: 'block', textDecoration: 'none',
              background: '#0d0d12',
              border: `1px solid rgba(255,255,255,.06)`,
              borderRadius: 10, padding: 24,
              transition: 'border-color .2s, box-shadow .2s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}40`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${tool.color}10`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.06)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2,
                  padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase',
                  background: `${tool.color}18`, color: tool.color, border: `1px solid ${tool.color}30`,
                }}>{tool.badge}</span>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: tool.color, marginBottom: 16, boxShadow: `0 0 8px ${tool.color}` }} />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{tool.sub}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{tool.label}</h3>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65, margin: '0 0 20px' }}>{tool.desc}</p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, color: tool.color, textTransform: 'uppercase' }}>
                {tool.cta} →
              </span>
            </a>
          ))}
        </div>

        {/* Quick links */}
        <div style={{
          background: '#0d0d12', border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 10, padding: '20px 24px',
        }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 16 }}>Quick Access</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1,
                padding: '7px 14px', background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.07)', borderRadius: 4,
                color: '#777', textDecoration: 'none', textTransform: 'uppercase',
                transition: 'color .15s, border-color .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#777'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
