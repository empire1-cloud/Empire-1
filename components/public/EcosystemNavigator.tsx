'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type EcosystemItem = {
  tag: string;
  name: string;
  desc: string;
  status: string;
  href?: string;
  displayUrl: string;
  action?: string;
  external?: boolean;
  accent: string;
};

const ITEMS: EcosystemItem[] = [
  {
    tag: 'Intelligence Layer',
    name: 'Hybrid Intelligence Core',
    desc: 'Finished multi-model intelligence layer for routing, canon enforcement, format normalization, drift monitoring, and pipeline composition.',
    status: 'Finished product',
    href: '/hic',
    displayUrl: 'empire1.cloud/hic',
    action: 'Open HIC',
    accent: 'var(--blue)',
  },
  {
    tag: 'Cultural Intelligence',
    name: 'Cultura Vibe Forge',
    desc: 'Finished cultural operating system for authenticity, dialect integrity, heritage logic, creative direction, and culturally grounded execution.',
    status: 'Finished product',
    href: '/cultura',
    displayUrl: 'empire1.cloud/cultura',
    action: 'Enter Cultura',
    accent: 'var(--pink)',
  },
  {
    tag: 'Revenue Engine',
    name: 'Revenue OS',
    desc: 'Public revenue command system for offers, buyers, outreach, pipeline, checkout, delivery receipts, and evidence.',
    status: 'Public product',
    href: '/revenue-os',
    displayUrl: 'empire1.cloud/revenue-os',
    action: 'Open Revenue OS',
    accent: '#41e18b',
  },
  {
    tag: 'Factory',
    name: 'SLA113',
    desc: 'Sovereign factory and control plane for branded operating systems, platform instances, operator consoles, and white-label deployment.',
    status: 'Live — deployed',
    href: 'https://sla113-sigma.vercel.app',
    displayUrl: 'sla113-sigma.vercel.app',
    action: 'Open SLA113',
    external: true,
    accent: 'var(--gold)',
  },
  {
    tag: 'Music Ecosystem',
    name: 'Lyrica 3',
    desc: 'Creator-owned music intelligence for provenance, rights, remix lineage, royalties, and culturally aware creation.',
    status: 'Live — deployed',
    href: 'https://lyrica3-pro-monieq113-6256s-projects.vercel.app',
    displayUrl: 'lyrica3-pro.vercel.app',
    action: 'Open Lyrica 3',
    external: true,
    accent: 'var(--pink)',
  },
  {
    tag: 'Trust Layer',
    name: 'Archisynapse',
    desc: 'Ledger, fraud, royalty, settlement, verification, and payment infrastructure for trusted revenue movement.',
    status: 'Active development',
    href: '/archisynapse',
    displayUrl: 'empire1.cloud/archisynapse',
    action: 'Open proof mode',
    accent: 'var(--gold)',
  },
  {
    tag: 'Public Proof',
    name: 'Southern Lyfestyle',
    desc: 'Independent experience business powered by SLA113 and used as public proof of the factory model.',
    status: 'Awaiting deployment',
    displayUrl: 'Public URL pending',
    accent: 'var(--blue)',
  },
  {
    tag: 'Gaming',
    name: 'Southern Arcade',
    desc: 'Arcade OS built on SLA113 with its own identity, revenue path, and provenance chain.',
    status: 'Awaiting deployment',
    displayUrl: 'Public URL pending',
    accent: 'var(--pink)',
  },
  {
    tag: 'Audio Platform',
    name: 'Sonance Pro',
    desc: 'Professional audio intelligence inside the Lyrica 3 ecosystem for sound design, mastering, and production workflows.',
    status: 'Awaiting deployment',
    displayUrl: 'Public URL pending',
    accent: 'var(--blue)',
  },
  {
    tag: 'Narrative Intelligence',
    name: 'Empire Narrative',
    desc: 'Story intelligence for character consistency, world-building, and narrative coherence across creative projects.',
    status: 'In development',
    displayUrl: 'Public URL not published yet',
    accent: 'var(--muted)',
  },
];

export default function EcosystemNavigator() {
  const [index, setIndex] = useState(0);
  const current = ITEMS[index];

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % ITEMS.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => setIndex((value) => (value + direction + ITEMS.length) % ITEMS.length);

  return (
    <>
      <style>{`
        .eco-console{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:18px;margin-top:40px}.eco-stage,.eco-index{background:linear-gradient(155deg,rgba(17,17,27,.96),rgba(8,8,13,.96));border:1px solid var(--line-strong);border-radius:16px;overflow:hidden}.eco-panel-head{padding:14px 18px;border-bottom:1px solid var(--line);font:10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.eco-stage-body{min-height:430px;padding:32px;display:flex;flex-direction:column;justify-content:space-between}.eco-accent{width:110px;height:2px;margin-bottom:22px}.eco-kicker{font:11px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.eco-stage h2{font-family:'Barlow Condensed',sans-serif;font-size:clamp(42px,7vw,72px);line-height:.95;margin:14px 0 18px}.eco-stage p{font-size:16px;line-height:1.75;color:#c5c5cd;max-width:720px}.eco-url{font:11px 'JetBrains Mono',monospace;color:var(--blue);margin-top:18px}.eco-state{display:inline-flex;align-items:center;gap:8px;margin-top:18px;padding:8px 11px;border:1px solid var(--line);border-radius:999px;font:10px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.eco-state i{width:7px;height:7px;border-radius:50%;background:#41e18b;box-shadow:0 0 9px #41e18b}.eco-stage-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:28px}.eco-open,.eco-pending{display:inline-flex;padding:13px 17px;border-radius:8px;font:11px 'JetBrains Mono',monospace;text-transform:uppercase;font-weight:800}.eco-open{background:#fff;color:#050505}.eco-pending{border:1px solid var(--line);color:var(--muted)}.eco-arrows{display:flex;gap:8px}.eco-arrows button{width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:transparent;color:#fff;font-size:18px;cursor:pointer}.eco-index-list{padding:8px 18px 18px;max-height:500px;overflow:auto}.eco-index button{width:100%;text-align:left;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:var(--text);padding:16px 0;cursor:pointer}.eco-index button:last-child{border-bottom:0}.eco-index button.active strong{color:var(--gold)}.eco-index strong{display:block;font-size:14px;margin-bottom:5px}.eco-index span{font:9.5px 'JetBrains Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}.eco-grid-links{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.eco-mini{padding:18px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025)}.eco-mini b{display:block;margin-bottom:8px}.eco-mini small{font:10px 'JetBrains Mono',monospace;color:var(--muted)}
        @media(max-width:860px){.eco-console{grid-template-columns:1fr}.eco-index-list{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;max-height:none}.eco-grid-links{grid-template-columns:1fr 1fr}}@media(max-width:560px){.eco-stage-body{padding:24px;min-height:470px}.eco-index-list,.eco-grid-links{grid-template-columns:1fr}}
      `}</style>
      <div className="eco-console">
        <div className="eco-stage">
          <div className="eco-panel-head">Universe display</div>
          <div className="eco-stage-body">
            <div>
              <div className="eco-accent" style={{ background: current.accent }} />
              <div className="eco-kicker">{current.tag}</div>
              <h2>{current.name}</h2>
              <p>{current.desc}</p>
              <div className="eco-url">{current.displayUrl}</div>
              <div className="eco-state"><i />{current.status}</div>
            </div>
            <div className="eco-stage-foot">
              {current.href && current.action ? (
                current.external ? <a className="eco-open" href={current.href} target="_blank" rel="noreferrer">{current.action} ↗</a> : <Link className="eco-open" href={current.href}>{current.action} →</Link>
              ) : <span className="eco-pending">Public destination pending</span>}
              <div className="eco-arrows"><button onClick={() => move(-1)} aria-label="Previous product">←</button><button onClick={() => move(1)} aria-label="Next product">→</button></div>
            </div>
          </div>
        </div>
        <aside className="eco-index">
          <div className="eco-panel-head">Universe index</div>
          <div className="eco-index-list">
            {ITEMS.map((item, itemIndex) => <button key={item.name} className={itemIndex === index ? 'active' : ''} onClick={() => setIndex(itemIndex)}><strong>{item.name}</strong><span>{item.status}</span></button>)}
          </div>
        </aside>
      </div>
      <div className="eco-grid-links">
        <Link href="/revenue-os" className="eco-mini"><b>Revenue OS</b><small>empire1.cloud/revenue-os →</small></Link>
        <Link href="/hic" className="eco-mini"><b>Hybrid Intelligence Core</b><small>empire1.cloud/hic →</small></Link>
        <Link href="/cultura" className="eco-mini"><b>Cultura Vibe Forge</b><small>empire1.cloud/cultura →</small></Link>
      </div>
    </>
  );
}
