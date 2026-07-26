'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Universe = {
  tag: string;
  name: string;
  summary: string;
  status: string;
  href: string;
  displayUrl: string;
  action: string;
  external?: boolean;
  accent: 'gold' | 'pink' | 'blue' | 'green';
};

const UNIVERSES: Universe[] = [
  {
    tag: 'Intelligence Layer',
    name: 'Hybrid Intelligence Core',
    summary: 'Finished multi-model intelligence layer for routing, canon enforcement, format normalization, drift monitoring, and pipeline composition.',
    status: 'Finished product',
    href: '/hic',
    displayUrl: 'empire1.cloud/hic',
    action: 'Open HIC',
    accent: 'blue',
  },
  {
    tag: 'Cultural Intelligence',
    name: 'Cultura Vibe Forge',
    summary: 'Finished cultural operating system for authenticity, dialect integrity, heritage logic, creative direction, and culturally grounded execution.',
    status: 'Finished product',
    href: '/cultura',
    displayUrl: 'empire1.cloud/cultura',
    action: 'Enter Cultura',
    accent: 'pink',
  },
  {
    tag: 'Revenue Engine',
    name: 'Revenue OS',
    summary: 'Public revenue command system for offers, buyers, outreach, pipeline, checkout, delivery receipts, and evidence.',
    status: 'Public product',
    href: '/revenue-os',
    displayUrl: 'empire1.cloud/revenue-os',
    action: 'Open Revenue OS',
    accent: 'green',
  },
  {
    tag: 'Factory',
    name: 'SLA113',
    summary: 'Sovereign factory and control plane for branded operating systems, platform instances, operator consoles, and white-label deployment.',
    status: 'Internal operational product',
    href: '/sla113',
    displayUrl: 'sla113.southernlifestyle.org',
    action: 'Open SLA113',
    accent: 'gold',
  },
  {
    tag: 'Music Ecosystem',
    name: 'Lyrica 3',
    summary: 'Creator-owned AI music ecosystem for provenance, rights, remix lineage, royalties, and culturally aware creation.',
    status: 'Active development',
    href: 'https://lyrica3.com',
    displayUrl: 'lyrica3.com',
    action: 'Visit Lyrica 3',
    external: true,
    accent: 'pink',
  },
  {
    tag: 'Trust Layer',
    name: 'Archisynapse',
    summary: 'Ledger, fraud, royalty, settlement, verification, and payment infrastructure for trusted revenue movement.',
    status: 'Active development',
    href: '/enterprise',
    displayUrl: 'Empire-1 trust infrastructure',
    action: 'View enterprise path',
    accent: 'gold',
  },
  {
    tag: 'Public Proof',
    name: 'Southern Lyfestyle',
    summary: 'Independent experience business powered by SLA113 and used as public proof of the factory model.',
    status: 'Public proof experience',
    href: 'https://southernlifestyle.org',
    displayUrl: 'southernlifestyle.org',
    action: 'Visit Southern Lyfestyle',
    external: true,
    accent: 'blue',
  },
  {
    tag: 'Gaming',
    name: 'Southern Arcade',
    summary: 'Arcade OS built on SLA113 with its own identity, revenue path, and provenance chain.',
    status: 'Active development',
    href: 'https://arcade.southernlifestyle.org',
    displayUrl: 'arcade.southernlifestyle.org',
    action: 'Visit Southern Arcade',
    external: true,
    accent: 'pink',
  },
];

const CORE_STATUS = [
  { name: 'Hybrid Intelligence Core', state: 'Finished product', tone: 'ready' },
  { name: 'Cultura Vibe Forge', state: 'Finished product', tone: 'ready' },
  { name: 'Revenue OS', state: 'Public product', tone: 'live' },
  { name: 'SLA113', state: 'Internal operational product', tone: 'active' },
];

export default function EmpireCommandCenter() {
  const [active, setActive] = useState(0);
  const current = UNIVERSES[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % UNIVERSES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const routedDestinations = useMemo(() => UNIVERSES.length, []);
  const move = (direction: number) => setActive((index) => (index + direction + UNIVERSES.length) % UNIVERSES.length);

  return (
    <main className="command-root">
      <style>{`
        :root{--bg:#040407;--panel:#0b0b12;--panel2:#101019;--line:rgba(255,255,255,.1);--text:#f5f5f7;--muted:#9a9aa5;--gold:#e8b923;--pink:#e6007a;--blue:#3388ff;--green:#41e18b}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif}a{color:inherit;text-decoration:none}
        .command-root{min-height:100vh;background:radial-gradient(circle at 10% 0%,rgba(51,136,255,.12),transparent 34%),radial-gradient(circle at 90% 8%,rgba(230,0,122,.1),transparent 32%),#040407;overflow:hidden}.cmd-shell{max-width:1240px;margin:0 auto;padding:0 28px}
        .cmd-nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(20px);background:rgba(4,4,7,.78);border-bottom:1px solid var(--line)}.cmd-nav-inner{max-width:1240px;margin:auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:12px}.brand img{width:38px;height:38px;object-fit:contain;border-radius:8px}.brand-copy strong{display:block;font-size:15px;letter-spacing:.12em}.brand-copy span{font:10px 'JetBrains Mono',monospace;color:var(--muted);letter-spacing:.12em;text-transform:uppercase}.nav-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.nav-link,.nav-primary{font:11px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:11px 14px;border:1px solid var(--line);border-radius:8px}.nav-primary{background:var(--gold);color:#050505;border-color:var(--gold);font-weight:800}.nav-link:hover{border-color:var(--gold)}
        .hero{padding:82px 0 46px;display:grid;grid-template-columns:1.15fr .85fr;gap:38px;align-items:center}.eyebrow{font:11px 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:18px}.hero h1{font-family:'Barlow Condensed',sans-serif;font-size:clamp(54px,8vw,94px);line-height:.9;margin:0 0 22px;letter-spacing:-.035em}.hero h1 span{background:linear-gradient(90deg,var(--gold),var(--pink),var(--blue));-webkit-background-clip:text;background-clip:text;color:transparent}.hero p{color:#c5c5cd;font-size:18px;line-height:1.7;max-width:680px;margin:0 0 28px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.hero-actions a{font:12px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em;padding:15px 20px;border-radius:8px;border:1px solid var(--line)}.hero-actions .primary{background:var(--gold);color:#050505;border-color:var(--gold);font-weight:800}
        .hero-console{background:linear-gradient(160deg,rgba(16,16,25,.96),rgba(7,7,12,.96));border:1px solid var(--line);border-radius:18px;box-shadow:0 28px 100px rgba(0,0,0,.5);overflow:hidden}.console-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);font:10px 'JetBrains Mono',monospace;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}.lights{display:flex;gap:6px}.lights i{display:block;width:7px;height:7px;border-radius:50%;background:var(--gold)}.lights i:nth-child(2){background:var(--pink)}.lights i:nth-child(3){background:var(--blue)}.console-body{padding:18px}.console-row{display:grid;grid-template-columns:1fr auto;gap:16px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.07);font:12px 'JetBrains Mono',monospace}.console-row:last-child{border-bottom:0}.console-row span{color:#bcbcc5}.console-row b{font-weight:600;color:var(--green)}
        .dashboard{padding:34px 0 84px}.section-title{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:22px}.section-title h2{font-family:'Barlow Condensed',sans-serif;font-size:clamp(34px,5vw,56px);margin:6px 0 0}.section-title p{color:var(--muted);max-width:480px;line-height:1.6}.dash-grid{display:grid;grid-template-columns:1.45fr .55fr;gap:18px}.panel{background:linear-gradient(160deg,rgba(16,16,25,.92),rgba(8,8,13,.92));border:1px solid var(--line);border-radius:18px;overflow:hidden}.panel-label{padding:14px 18px;border-bottom:1px solid var(--line);font:10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
        .carousel{min-height:430px;padding:30px;position:relative;display:flex;flex-direction:column;justify-content:space-between}.accent-line{height:2px;width:110px;background:var(--gold);margin-bottom:22px}.carousel[data-accent='pink'] .accent-line{background:var(--pink)}.carousel[data-accent='blue'] .accent-line{background:var(--blue)}.carousel[data-accent='green'] .accent-line{background:var(--green)}.carousel-tag{font:11px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.13em;color:var(--muted)}.carousel h3{font-family:'Barlow Condensed',sans-serif;font-size:clamp(38px,6vw,64px);line-height:1;margin:12px 0 18px}.carousel p{color:#c6c6cf;font-size:16px;line-height:1.7;max-width:680px}.public-url{margin-top:16px;font:11px 'JetBrains Mono',monospace;color:var(--blue);letter-spacing:.04em}.status-pill{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:8px 11px;border:1px solid var(--line);border-radius:999px;font:10px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.07em}.status-pill i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green)}.carousel-foot{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:28px;flex-wrap:wrap}.carousel-link{display:inline-flex;padding:13px 17px;border-radius:8px;background:#fff;color:#050505;font:11px 'JetBrains Mono',monospace;text-transform:uppercase;font-weight:800}.carousel-controls{display:flex;gap:8px}.carousel-controls button{width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:transparent;color:#fff;font-size:18px;cursor:pointer}.dots{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.dots button{width:24px;height:4px;border:0;background:#34343d;border-radius:999px;cursor:pointer;padding:0}.dots button.active{background:var(--gold)}
        .status-list{padding:8px 18px 18px}.status-item{padding:17px 0;border-bottom:1px solid rgba(255,255,255,.07)}.status-item:last-child{border-bottom:0}.status-item strong{display:block;font-size:14px;margin-bottom:7px}.status-state{display:flex;align-items:center;gap:8px;font:10px 'JetBrains Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}.status-state i{width:7px;height:7px;border-radius:50%;background:var(--gold)}.status-state.ready i,.status-state.live i{background:var(--green);box-shadow:0 0 8px rgba(65,225,139,.7)}
        .metric-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-top:18px}.metric{background:#0a0a10;padding:22px}.metric b{font-family:'Barlow Condensed',sans-serif;font-size:30px}.metric span{display:block;margin-top:5px;font:10px 'JetBrains Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
        .command-deck{padding:82px 0;border-top:1px solid var(--line)}.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:28px}.quick-card{padding:22px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025);transition:.2s}.quick-card:hover{transform:translateY(-3px);border-color:var(--gold);background:rgba(232,185,35,.04)}.quick-card small{font:10px 'JetBrains Mono',monospace;color:var(--gold);letter-spacing:.1em;text-transform:uppercase}.quick-card h3{font-family:'Barlow Condensed',sans-serif;font-size:25px;margin:13px 0 8px}.quick-card p{color:var(--muted);font-size:13px;line-height:1.55}.quick-card span{display:block;margin-top:18px;font:10px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.footer{border-top:1px solid var(--line);padding:30px 0 46px;color:var(--muted);font:10px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}
        @media(max-width:900px){.hero,.dash-grid{grid-template-columns:1fr}.hero{padding-top:58px}.hero-console{max-width:680px}.quick-grid{grid-template-columns:1fr 1fr}.metric-strip{grid-template-columns:1fr 1fr}}@media(max-width:620px){.cmd-nav-inner{padding:13px 18px}.cmd-shell{padding:0 18px}.nav-actions .nav-link{display:none}.hero h1{font-size:58px}.carousel{padding:22px;min-height:470px}.quick-grid,.metric-strip{grid-template-columns:1fr}.section-title{align-items:start;flex-direction:column}}
      `}</style>

      <header className="cmd-nav">
        <div className="cmd-nav-inner">
          <Link href="/" className="brand">
            <img src="/empire1_logo.jpeg" alt="Empire-1" />
            <div className="brand-copy"><strong>EMPIRE 1</strong><span>Command Center</span></div>
          </Link>
          <nav className="nav-actions">
            <Link href="/ecosystem" className="nav-link">Ecosystem</Link>
            <Link href="/cultura" className="nav-link">Cultura</Link>
            <Link href="/licensing" className="nav-link">Licensing</Link>
            <Link href="/revenue-os" className="nav-primary">Open Revenue OS</Link>
          </nav>
        </div>
      </header>

      <div className="cmd-shell">
        <section className="hero">
          <div>
            <div className="eyebrow">Empire-1 · Hybrid Intelligence Ecosystem</div>
            <h1>Not another landing page.<br /><span>Your empire command layer.</span></h1>
            <p>Navigate the finished intelligence products, public revenue system, factory control plane, and independent product universes from one interactive operating view.</p>
            <div className="hero-actions">
              <Link href="/revenue-os" className="primary">Launch Revenue OS →</Link>
              <Link href="/ecosystem">Explore Every Universe →</Link>
              <Link href="/cultura">Enter Cultura →</Link>
            </div>
          </div>
          <div className="hero-console" aria-label="Empire-1 system overview">
            <div className="console-head"><div className="lights"><i /><i /><i /></div><span>empire://system-map</span></div>
            <div className="console-body">
              <div className="console-row"><span>Hybrid Intelligence Core</span><b>FINISHED</b></div>
              <div className="console-row"><span>Cultura Vibe Forge</span><b>FINISHED</b></div>
              <div className="console-row"><span>Revenue OS</span><b>PUBLIC</b></div>
              <div className="console-row"><span>SLA113 Factory</span><b>OPERATIONAL</b></div>
              <div className="console-row"><span>Universe links</span><b>{routedDestinations} ROUTED</b></div>
            </div>
          </div>
        </section>

        <section className="dashboard">
          <div className="section-title">
            <div><div className="eyebrow">Universe Navigator</div><h2>Move through the empire.</h2></div>
            <p>This is a functional product navigator, not a wall of placeholder cards. Every public destination has a real route or external URL.</p>
          </div>
          <div className="dash-grid">
            <div className="panel">
              <div className="panel-label">Interactive universe carousel</div>
              <div className="carousel" data-accent={current.accent}>
                <div>
                  <div className="accent-line" />
                  <div className="carousel-tag">{current.tag}</div>
                  <h3>{current.name}</h3>
                  <p>{current.summary}</p>
                  <div className="public-url">{current.displayUrl}</div>
                  <div className="status-pill"><i />{current.status}</div>
                </div>
                <div>
                  <div className="carousel-foot">
                    {current.external ? <a className="carousel-link" href={current.href} target="_blank" rel="noreferrer">{current.action} ↗</a> : <Link className="carousel-link" href={current.href}>{current.action} →</Link>}
                    <div className="carousel-controls"><button onClick={() => move(-1)} aria-label="Previous universe">←</button><button onClick={() => move(1)} aria-label="Next universe">→</button></div>
                  </div>
                  <div className="dots" aria-label="Select universe">{UNIVERSES.map((item, index) => <button key={item.name} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show ${item.name}`} />)}</div>
                </div>
              </div>
            </div>
            <aside className="panel">
              <div className="panel-label">Product state</div>
              <div className="status-list">{CORE_STATUS.map((item) => <div className="status-item" key={item.name}><strong>{item.name}</strong><div className={`status-state ${item.tone}`}><i />{item.state}</div></div>)}</div>
            </aside>
          </div>
          <div className="metric-strip">
            <div className="metric"><b>2</b><span>Finished core products</span></div>
            <div className="metric"><b>1</b><span>Public revenue product</span></div>
            <div className="metric"><b>1</b><span>Operational factory</span></div>
            <div className="metric"><b>{routedDestinations}</b><span>Routed destinations</span></div>
          </div>
        </section>

        <section className="command-deck">
          <div className="eyebrow">Command Deck</div>
          <div className="section-title"><h2>Go directly to the work.</h2></div>
          <div className="quick-grid">
            <Link href="/revenue-os" className="quick-card"><small>Revenue</small><h3>Revenue OS</h3><p>Open the full revenue dashboard and command workflow.</p><span>Launch product →</span></Link>
            <Link href="/hic" className="quick-card"><small>Intelligence</small><h3>HIC</h3><p>Open the finished intelligence layer and licensing pathways.</p><span>Open HIC →</span></Link>
            <Link href="/cultura" className="quick-card"><small>Cultural OS</small><h3>Cultura</h3><p>Enter the finished authenticity and heritage intelligence system.</p><span>Enter Cultura →</span></Link>
            <Link href="/sla113" className="quick-card"><small>Factory</small><h3>SLA113</h3><p>Open the sovereign control plane and white-label factory.</p><span>Open factory →</span></Link>
          </div>
        </section>

        <footer className="footer"><span>© 2026 Empire-1 · founder@empire1.cloud</span><span>WE EVOLVE. NEVER DELETE.</span></footer>
      </div>
    </main>
  );
}
