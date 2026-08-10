'use client';

import { useEffect } from 'react';
import RevenueProof from './RevenueProof';

const CSS = String.raw`
:root{
    --bg:#050505;
    --surface:#0a0a0d;
    --line: rgba(245,245,247,0.09);
    --line-strong: rgba(245,245,247,0.16);
    --text:#f2f2f4;
    --muted:#8c8c95;
    --gold:#e8b923;
    --pink:#e6007a;
    --blue:#007aff;
  }
  *{ box-sizing:border-box; }
  html{ scroll-behavior:smooth; }
  @media (prefers-reduced-motion: reduce){
    html{ scroll-behavior:auto; }
    *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
  }
  body{
    margin:0;
    background:var(--bg);
    color:var(--text);
    font-family:'Inter', system-ui, sans-serif;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  a{ color:inherit; text-decoration:none; }
  .mono{ font-family:'JetBrains Mono', monospace; }
  .display{ font-family:'Barlow Condensed', sans-serif; }

  .eyebrow{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    letter-spacing:0.22em;
    text-transform:uppercase;
    color:var(--gold);
    display:flex;
    align-items:center;
    gap:10px;
  }
  .eyebrow::before{
    content:'';
    width:14px; height:1px;
    background:var(--gold);
    display:inline-block;
  }

  .wrap{
    max-width:960px;
    margin:0 auto;
    padding:0 28px;
    position:relative;
  }

  /* ===== DNA THREAD — signature element ===== */
  .dna-rail{
    position:fixed;
    left:0; top:0;
    width:64px;
    height:100vh;
    pointer-events:none;
    z-index:1;
    opacity:0.55;
  }
  @media (max-width: 860px){ .dna-rail{ display:none; } }
  .dna-rail svg{ width:100%; height:100%; }

  /* ===== HEADER ===== */
  header{
    position:sticky; top:0; z-index:20;
    background:rgba(5,5,5,0.82);
    backdrop-filter: blur(10px);
    border-bottom:1px solid var(--line);
  }
  .header-inner{
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 28px;
    max-width:960px; margin:0 auto;
  }
  .mark{ display:flex; align-items:center; gap:12px; }
  .mark svg{ width:30px; height:30px; }
  .wordmark{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:18px;
    letter-spacing:0.08em;
    text-transform:uppercase;
  }
  .wordmark span{ color:var(--pink); }
  nav{ display:flex; gap:20px; }
  nav a{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:var(--muted);
    transition:color .2s;
  }
  nav a:hover{ color:var(--text); }
  nav a.nav-cta{
    background:var(--gold);
    color:#0a0a0a;
    padding:8px 14px;
    font-weight:600;
  }
  nav a.nav-cta:hover{ box-shadow:0 4px 16px rgba(232,185,35,0.25); }
  @media (max-width:700px){ nav{ display:none; } }

  section{ position:relative; z-index:2; }

  /* ===== HERO ===== */
  .hero{ padding:120px 28px 90px; }
  .hero .eyebrow{ margin-bottom:28px; opacity:0; animation:rise .7s ease forwards .1s; }
  .hero h1{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:800;
    font-size:clamp(40px, 7vw, 76px);
    line-height:0.98;
    letter-spacing:-0.01em;
    margin:0 0 26px;
    opacity:0; animation:rise .8s ease forwards .25s;
  }
  .hero p.lead{
    font-size:18px;
    line-height:1.6;
    color:#c7c7cd;
    max-width:600px;
    margin:0 0 40px;
    opacity:0; animation:rise .8s ease forwards .4s;
  }
  .cta-row{ display:flex; gap:14px; flex-wrap:wrap; margin-bottom:56px; opacity:0; animation:rise .8s ease forwards .55s; }
  .btn{
    font-family:'JetBrains Mono', monospace;
    font-size:12.5px;
    letter-spacing:0.05em;
    text-transform:uppercase;
    padding:15px 26px;
    border-radius:2px;
    display:inline-flex; align-items:center; gap:8px;
    transition:transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
  }
  .btn-primary{
    background:var(--gold);
    color:#0a0a0a;
    font-weight:600;
  }
  .btn-primary:hover{ transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,185,35,0.25); }
  .btn-ghost{
    border:1px solid var(--line-strong);
    color:var(--text);
  }
  .btn-ghost:hover{ border-color:var(--pink); color:var(--pink); }

  .stat-row{
    display:flex; flex-wrap:wrap; gap:0;
    border-top:1px solid var(--line);
    opacity:0; animation:rise .8s ease forwards .7s;
  }
  .stat{
    flex:1 1 auto;
    min-width:140px;
    padding:20px 22px 0 0;
    font-family:'JetBrains Mono', monospace;
  }
  .stat .v{ font-size:13px; color:var(--text); }
  .stat .l{ font-size:10.5px; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; margin-top:4px; }

  @keyframes rise{ from{ opacity:0; transform:translateY(14px);} to{ opacity:1; transform:translateY(0);} }

  /* ===== SECTION SCAFFOLDING ===== */
  .section{
    padding:86px 28px;
    border-top:1px solid var(--line);
  }
  .section-head{ margin-bottom:34px; }
  .section h2{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:clamp(30px, 4.2vw, 46px);
    line-height:1.05;
    margin:14px 0 0;
    max-width:680px;
  }

  /* ===== STANCE ===== */
  .stance-grid{
    display:grid;
    grid-template-columns:1.1fr 1fr;
    gap:60px;
    align-items:start;
  }
  @media (max-width:760px){ .stance-grid{ grid-template-columns:1fr; gap:28px; } }
  .stance-quote{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:600;
    font-size:clamp(22px,3vw,30px);
    line-height:1.25;
    color:var(--text);
  }
  .stance-quote em{ font-style:normal; color:var(--pink); }
  .stance-body p{ color:#b4b4bb; line-height:1.75; font-size:15.5px; margin:0 0 18px; }
  .stance-body p:last-child{ margin-bottom:0; }
  .stance-body strong{ color:var(--text); font-weight:600; }

  /* ===== CORE (DNA) ===== */
  .core-layout{
    display:grid;
    grid-template-columns:220px 1fr;
    gap:50px;
    align-items:center;
  }
  @media (max-width:760px){ .core-layout{ grid-template-columns:1fr; } }
  .helix-box{ display:flex; justify-content:center; }
  .helix-box svg{ width:150px; height:220px; }
  .core-body p{ color:#c7c7cd; line-height:1.75; font-size:16px; max-width:600px; margin:0 0 28px; }
  .tag-row{ display:flex; flex-wrap:wrap; gap:10px; }
  .tag{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    letter-spacing:0.04em;
    text-transform:uppercase;
    padding:8px 13px;
    border:1px solid var(--line-strong);
    border-radius:2px;
    color:#b4b4bb;
  }

  /* ===== THE LAW ===== */
  .law-section{
    background:linear-gradient(180deg, rgba(230,0,122,0.05), transparent 60%);
  }
  .law-inner{
    border-left:2px solid var(--pink);
    padding-left:32px;
  }
  .law-inner h2{ margin-top:10px; }
  .law-inner p{ color:#c7c7cd; line-height:1.75; font-size:16px; max-width:620px; margin:20px 0 26px; }
  .law-tag{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    letter-spacing:0.1em;
    text-transform:uppercase;
    color:var(--pink);
  }

  /* ===== FOUNDER ===== */
  .founder-quote{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:500;
    font-size:clamp(19px,2.6vw,24px);
    line-height:1.55;
    color:#e6e6e9;
    max-width:680px;
  }
  .founder-sign{
    margin-top:28px;
    font-family:'JetBrains Mono', monospace;
    font-size:12px;
    color:var(--muted);
    letter-spacing:0.04em;
  }
  .founder-sign b{ color:var(--text); font-weight:600; }

  /* ===== CORE — FOUR COMPONENT GRID ===== */
  .core-grid{
    display:grid;
    grid-template-columns:repeat(4, 1fr);
    gap:1px;
    background:var(--line-strong);
    margin-top:44px;
    border:1px solid var(--line-strong);
  }
  @media (max-width:760px){ .core-grid{ grid-template-columns:1fr 1fr; } }
  @media (max-width:480px){ .core-grid{ grid-template-columns:1fr; } }
  .core-card{
    background:var(--surface);
    padding:26px 22px;
  }
  .core-card-num{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    color:var(--gold);
    letter-spacing:0.06em;
    margin-bottom:14px;
  }
  .core-card h3{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:19px;
    margin:0 0 10px;
  }
  .core-card p{
    font-size:13px;
    line-height:1.6;
    color:#b4b4bb;
    margin:0;
  }

  /* ===== OS COCKPIT ===== */
  .cockpit-panel{
    background:var(--surface);
    border:1px solid var(--line-strong);
    border-radius:4px;
    overflow:hidden;
  }
  .cockpit-head{
    font-family:'JetBrains Mono', monospace;
    font-size:11.5px;
    color:var(--muted);
    padding:14px 22px;
    border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:9px;
  }
  .cockpit-dot{
    width:7px; height:7px; border-radius:50%;
    background:#3ddc84; box-shadow:0 0 8px #3ddc84;
    display:inline-block;
  }
  .cockpit-body{ padding:22px 22px 8px; }
  .cockpit-line{
    font-family:'JetBrains Mono', monospace;
    font-size:13px;
    color:#c7c7cd;
    padding:9px 0;
    display:flex; align-items:center; gap:10px;
    border-bottom:1px solid var(--line);
  }
  .cockpit-line:last-of-type{ border-bottom:none; }
  .cockpit-line .ok{ color:#3ddc84; }
  .cockpit-line .cockpit-val{ margin-left:auto; color:var(--gold); }
  .cockpit-line.muted{ color:var(--muted); font-style:italic; justify-content:center; border-bottom:none; padding-top:14px; }
  .cockpit-stats{
    display:flex; flex-wrap:wrap;
    border-top:1px solid var(--line-strong);
  }
  .cstat{
    flex:1 1 auto; min-width:140px;
    padding:20px 22px;
    border-right:1px solid var(--line);
    font-family:'JetBrains Mono', monospace;
  }
  .cstat:last-child{ border-right:none; }
  .cstat .v{ font-size:20px; color:var(--text); font-weight:600; }
  .cstat .l{ font-size:10px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:6px; }

  /* ===== ENTRY POINTS / LEDGER PRICING ===== */
  .ledger{ border-top:1px solid var(--line-strong); }
  .ledger-row{
    display:grid;
    grid-template-columns:120px 1fr 140px;
    gap:24px;
    padding:30px 0;
    border-bottom:1px solid var(--line);
    align-items:start;
  }
  @media (max-width:700px){
    .ledger-row{ grid-template-columns:1fr; gap:10px; }
    .ledger-price{ text-align:left !important; }
  }
  .ledger-tier.gradient{
    background:linear-gradient(90deg,var(--gold),var(--pink),var(--blue));
    color:var(--gold);
  }
  @supports (background-clip: text) or (-webkit-background-clip: text){
    .ledger-tier.gradient{
      -webkit-background-clip:text; background-clip:text; color:transparent;
    }
  }
  .ledger-tier{
    font-family:'JetBrains Mono', monospace;
    font-size:11.5px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:var(--gold);
    padding-top:3px;
  }
  .ledger-tier.pink{ color:var(--pink); }
  .ledger-tier.blue{ color:var(--blue); }
  .ledger-body h3{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:22px;
    margin:0 0 8px;
  }
  .ledger-body p{ color:#b4b4bb; font-size:14.5px; line-height:1.6; margin:0 0 12px; max-width:460px; }
  .ledger-includes{ color:#8c8c95; font-size:12.5px; font-family:'JetBrains Mono', monospace; line-height:1.9; }
  .ledger-price{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:30px;
    text-align:right;
    padding-top:2px;
  }
  .ledger-note{
    margin-top:24px;
    color:var(--muted);
    font-size:13.5px;
    font-style:italic;
  }

  /* ===== REVENUE OS SECTION ===== */
  .revos-panel{
    background:var(--surface);
    border:1px solid var(--line-strong);
    border-radius:4px;
    overflow:hidden;
    margin-top:34px;
  }
  .revos-head{
    font-family:'JetBrains Mono', monospace;
    font-size:11.5px;
    color:var(--muted);
    padding:14px 22px;
    border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:9px;
  }
  .revos-body{ padding:22px; }
  .revos-grid{
    display:grid;
    grid-template-columns:repeat(3, 1fr);
    gap:1px;
    background:var(--line-strong);
    margin-top:22px;
    border:1px solid var(--line-strong);
  }
  @media (max-width:760px){ .revos-grid{ grid-template-columns:1fr; } }
  .revos-card{
    background:var(--surface);
    padding:20px 18px;
  }
  .revos-card-num{
    font-family:'JetBrains Mono', monospace;
    font-size:10px;
    color:var(--gold);
    letter-spacing:0.06em;
    margin-bottom:10px;
  }
  .revos-card h4{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700;
    font-size:17px;
    margin:0 0 8px;
  }
  .revos-card p{
    font-size:12.5px;
    line-height:1.55;
    color:#b4b4bb;
    margin:0;
  }


  /* ===== VERIFIED REVENUE PROOF ===== */
  .proof-state{
    border:1px solid var(--line-strong);
    background:var(--surface);
    color:#b4b4bb;
    padding:24px;
    font-family:'JetBrains Mono', monospace;
    font-size:12px;
    line-height:1.7;
  }
  .proof-state-warn{ border-color:rgba(232,185,35,.35); color:var(--gold); }
  .proof-metrics{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    border:1px solid var(--line-strong);
    background:var(--line);
    gap:1px;
  }
  .proof-metric{ background:var(--surface); padding:22px; }
  .proof-metric span{
    display:block; color:var(--muted); font-family:'JetBrains Mono',monospace;
    font-size:10px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:8px;
  }
  .proof-metric strong{ font-family:'JetBrains Mono',monospace; font-size:22px; color:var(--text); }
  .proof-grid{ display:grid; grid-template-columns:1fr 1.2fr; gap:14px; margin-top:14px; }
  .proof-card{ border:1px solid var(--line-strong); background:var(--surface); padding:22px; }
  .proof-card h3{
    margin:0 0 16px; color:var(--gold); font-family:'JetBrains Mono',monospace;
    font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  }
  .proof-products,.proof-activity{ display:flex; flex-direction:column; gap:10px; }
  .proof-product,.proof-activity-row{
    display:grid; grid-template-columns:8px 1fr auto; align-items:center; gap:10px;
    color:#c7c7cd; font-size:12px; padding-bottom:10px; border-bottom:1px solid var(--line);
  }
  .proof-product:last-child,.proof-activity-row:last-child{ border-bottom:0; padding-bottom:0; }
  .proof-product strong{ color:var(--text); font-family:'JetBrains Mono',monospace; }
  .proof-activity-row time{ color:var(--muted); font-family:'JetBrains Mono',monospace; font-size:10px; }
  .proof-dot{ width:7px; height:7px; border-radius:50%; display:inline-block; }
  .proof-muted{ color:var(--muted); font-size:13px; margin:0; }
  .proof-intake{
    display:grid; grid-template-columns:minmax(220px,1.4fr) minmax(180px,1fr) minmax(180px,1fr) auto;
    gap:10px; align-items:end; margin-top:30px; padding:20px;
    border:1px solid var(--line-strong); background:var(--surface);
  }
  .proof-intake label{
    display:block; color:var(--text); font-family:'JetBrains Mono',monospace;
    font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:5px;
  }
  .proof-intake p{ color:var(--muted); font-size:11px; line-height:1.5; margin:0; }
  .proof-intake input,.proof-intake select{
    width:100%; min-height:44px; background:#050505; color:var(--text);
    border:1px solid var(--line-strong); padding:0 12px; font:12px 'JetBrains Mono',monospace;
  }
  .proof-intake button{
    min-height:44px; border:0; background:var(--gold); color:#050505;
    padding:0 18px; font:600 11px 'JetBrains Mono',monospace; text-transform:uppercase; cursor:pointer;
  }
  .proof-intake button:disabled{ opacity:.55; cursor:wait; }
  .proof-form-ok,.proof-form-error{
    grid-column:1/-1; font:11px 'JetBrains Mono',monospace;
  }
  .proof-form-ok{ color:#3ddc84; }
  .proof-form-error{ color:#ef4444; }
  @media (max-width:760px){
    .proof-metrics,.proof-grid,.proof-intake{ grid-template-columns:1fr; }
    .proof-activity-row{ grid-template-columns:8px 1fr; }
    .proof-activity-row time{ grid-column:2; }
  }

  /* ===== FOOTER ===== */
  footer{ padding:60px 28px 40px; border-top:1px solid var(--line); }
  .footer-inner{
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;
  }
  .footer-inner .mark{ opacity:0.8; }
  .status{
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    color:var(--muted);
    display:flex; align-items:center; gap:8px;
    text-transform:uppercase;
    letter-spacing:0.06em;
  }
  .dot{ width:6px; height:6px; border-radius:50%; background:#3ddc84; box-shadow:0 0 8px #3ddc84; }
  .copy{ font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--muted); margin-top:24px; }

  ::selection{ background:var(--pink); color:#fff; }
  a:focus-visible, button:focus-visible{ outline:2px solid var(--blue); outline-offset:3px; }
`;

const LANDING_HTML = String.raw`
<div class="dna-rail" aria-hidden="true">
  <svg viewBox="0 0 64 1200" preserveAspectRatio="none">
    <defs>
      <linearGradient id="strandA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8b923"/>
        <stop offset="50%" stop-color="#e6007a"/>
        <stop offset="100%" stop-color="#007aff"/>
      </linearGradient>
    </defs>
    <g stroke="url(#strandA)" stroke-width="1.4" fill="none" opacity="0.9">
      <path d="M20,0 C44,60 -4,120 20,180 C44,240 -4,300 20,360 C44,420 -4,480 20,540 C44,600 -4,660 20,720 C44,780 -4,840 20,900 C44,960 -4,1020 20,1080 C44,1140 -4,1180 20,1200"/>
      <path d="M44,0 C20,60 68,120 44,180 C20,240 68,300 44,360 C20,420 68,480 44,540 C20,600 68,660 44,720 C20,780 68,840 44,900 C20,960 68,1020 44,1080 C20,1140 68,1180 44,1200"/>
    </g>
    <g stroke="var(--line-strong)" stroke-width="1">
      <line x1="20" y1="30" x2="44" y2="30"/>
      <line x1="20" y1="150" x2="44" y2="150"/>
      <line x1="20" y1="270" x2="44" y2="270"/>
      <line x1="20" y1="390" x2="44" y2="390"/>
      <line x1="20" y1="510" x2="44" y2="510"/>
      <line x1="20" y1="630" x2="44" y2="630"/>
      <line x1="20" y1="750" x2="44" y2="750"/>
      <line x1="20" y1="870" x2="44" y2="870"/>
      <line x1="20" y1="990" x2="44" y2="990"/>
      <line x1="20" y1="1110" x2="44" y2="1110"/>
    </g>
  </svg>
</div>

<header>
  <div class="header-inner">
    <div class="mark">
      <img src="empire1_logo.jpeg" alt="Empire 1" style="width:34px;height:34px;object-fit:contain;border-radius:4px;">
      <div class="wordmark">EMPIRE <span>1</span></div>
    </div>
    <nav>
      <a href="/">Home</a>
      <a href="/revenue-os">Revenue OS</a>
      <a href="/ecosystem">Ecosystem</a>
      <a href="/hic">HIC</a>
      <a href="/enterprise">Enterprise</a>
      <a href="/licensing">Licensing</a>
      <a href="/try-revenue-os" class="nav-cta">Try Free →</a>
    </nav>
  </div>
</header>

<section class="hero wrap">
  <div class="eyebrow">EMPIRE 1 · HYBRID INTELLIGENCE CORE</div>
  <h1>We don't build apps.<br>We architect empires.</h1>
  <p class="lead">Empire-1 runs on the Hybrid Intelligence Core — a self-governing architecture built on Emergent DNA, where every universe carries its own identity, its own provenance, and its own obligation to survive on revenue, not permission.</p>
  <div class="cta-row">
    <a href="#core" class="btn btn-primary">Enter the Empire →</a>
    <a href="#founder" class="btn btn-ghost">Read the Thesis</a>
  </div>
  <div class="stat-row">
    <div class="stat"><div class="v">5</div><div class="l">Universes</div></div>
    <div class="stat"><div class="v">1</div><div class="l">Founder, one hand</div></div>
    <div class="stat"><div class="v">SGV</div><div class="l">Inland Empire</div></div>
    <div class="stat"><div class="v">DNA</div><div class="l">Provenance-first</div></div>
  </div>
</section>

<section class="section">
  <div class="wrap stance-grid">
    <div class="stance-quote">
      Most AI companies are shipping toys. Chat wrappers, generation gimmicks, demos dressed up as products. <em>They optimize for a launch tweet.</em>
    </div>
    <div class="stance-body">
      <p>We optimize for permanence.</p>
      <p>Empire-1 was built by one founder, from the ground up, with no team and no shortcuts — because <strong>an empire that depends on anyone else's permission to exist isn't sovereign. It's rented.</strong></p>
      <p>Empire-1 HIC, SLA113, Lyrica 3, and Archisynapse — every piece answers to the same core, the same law, the same architecture. Nothing here is a bet dressed up as a business.</p>
    </div>
  </div>
</section>

<section class="section" id="structure">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">The Structure</div>
      <h2>One core. One factory. Real businesses running on both.</h2>
    </div>

    <div class="ledger">
      <div class="ledger-row">
        <div class="ledger-tier blue">Empire-1 HIC</div>
        <div class="ledger-body">
          <h3>The Intelligence Core</h3>
          <p>The standalone intelligence core — routing, canon, specialized engines, drift monitoring, and operator intelligence.</p>
        </div>
        <div></div>
      </div>
      <div class="ledger-row" style="padding-left:28px;">
        <div class="ledger-tier gradient">SLA113</div>
        <div class="ledger-body">
          <h3>The Factory</h3>
          <p>The hybrid factory and control plane that produces white-label operating systems, platforms, and branded business instances.</p>
        </div>
        <div></div>
      </div>
      <div class="ledger-row" style="padding-left:56px;">
        <div class="ledger-tier" style="color:var(--muted);">Southern Lifestyle</div>
        <div class="ledger-body">
          <h3>Proof, Not Theory</h3>
          <p>An independent experience business powered by SLA113, including Southern Arcade OS.</p>
        </div>
        <div></div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier pink">Lyrica 3</div>
        <div class="ledger-body">
          <h3>The Music Ecosystem</h3>
          <p>Creator-owned music intelligence — provenance, rights, and cultural context carried with every piece of work from creation forward.</p>
        </div>
        <div></div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier" style="color:var(--gold);">Archisynapse</div>
        <div class="ledger-body">
          <h3>The Trust Layer</h3>
          <p>The trust, ledger, fraud, royalty, and payment infrastructure.</p>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="core">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">The Core</div>
      <h2>Three frontier models. One system that never shows its seams.</h2>
    </div>
    <div class="core-layout">
      <div class="helix-box">
        <svg viewBox="0 0 150 220" fill="none">
          <defs>
            <linearGradient id="strandB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e8b923"/>
              <stop offset="50%" stop-color="#e6007a"/>
              <stop offset="100%" stop-color="#007aff"/>
            </linearGradient>
          </defs>
          <g stroke="url(#strandB)" stroke-width="2" fill="none">
            <path d="M40,0 C90,27 10,55 40,82 C90,110 10,137 40,165 C90,192 10,210 40,220"/>
            <path d="M110,0 C60,27 140,55 110,82 C60,110 140,137 110,165 C60,192 140,210 110,220"/>
          </g>
          <g fill="#f2f2f4" opacity="0.85">
            <circle cx="40" cy="14" r="2.4"/><circle cx="110" cy="14" r="2.4"/>
            <circle cx="40" cy="55" r="2.4"/><circle cx="110" cy="55" r="2.4"/>
            <circle cx="40" cy="96" r="2.4"/><circle cx="110" cy="96" r="2.4"/>
            <circle cx="40" cy="137" r="2.4"/><circle cx="110" cy="137" r="2.4"/>
            <circle cx="40" cy="178" r="2.4"/><circle cx="110" cy="178" r="2.4"/>
          </g>
          <g stroke="var(--line-strong)" stroke-width="1">
            <line x1="40" y1="14" x2="110" y2="14"/>
            <line x1="40" y1="55" x2="110" y2="55"/>
            <line x1="40" y1="96" x2="110" y2="96"/>
            <line x1="40" y1="137" x2="110" y2="137"/>
            <line x1="40" y1="178" x2="110" y2="178"/>
          </g>
        </svg>
      </div>
      <div class="core-body">
        <p>The Hybrid Intelligence Core routes every task to whichever model is actually built for it — reasoning and code to one, long-context analysis to another, fast simple work to a third. Nothing gets forced through a single model just because it's the one you happened to open.</p>
        <p>What comes out the other side reads as one voice, one system, one standard — never three different AIs stitched together. That consistency is engineered, not accidental.</p>
      </div>
    </div>

    <div class="core-grid">
      <div class="core-card">
        <div class="core-card-num">01</div>
        <h3>Routing Engine</h3>
        <p>Every task gets analyzed and sent to the model that's actually strongest at it — not whichever one is cheapest or loudest that quarter.</p>
      </div>
      <div class="core-card">
        <div class="core-card-num">02</div>
        <h3>Canon Enforcer</h3>
        <p>Strips the tells — the "Certainly!", the filler, the model breaking character — so three different providers sound like one disciplined system.</p>
      </div>
      <div class="core-card">
        <div class="core-card-num">03</div>
        <h3>Format Normalizer</h3>
        <p>Code, markdown, JSON, lists — standardized on the way out, regardless of which model generated the raw response.</p>
      </div>
      <div class="core-card">
        <div class="core-card-num">04</div>
        <h3>Drift Monitor</h3>
        <p>Tracks every model against its own baseline — tone, quality, compliance, error rate — and flags decay before a customer ever notices it.</p>
      </div>
    </div>

    <div class="tag-row" style="margin-top:34px;">
      <span class="tag">Emergent DNA</span>
      <span class="tag">Sovereign Control Plane</span>
      <span class="tag">Multi-Model Routing</span>
      <span class="tag">Multi-Universe Governance</span>
    </div>
  </div>
</section>

<section class="section law-section" id="law">
  <div class="wrap">
    <div class="law-inner">
      <div class="law-tag">The Law — No Exceptions</div>
      <h2>If it doesn't generate revenue, it doesn't stay.</h2>
      <p>Every universe under Empire-1 answers to the same law: pull your own weight or get cut. No universe survives on story alone. No universe survives on founder sentiment. This isn't a portfolio of ideas we're precious about — it's an empire, and empires don't carry dead weight.</p>
      <p>What survives here is built to demonstrate it can generate real revenue on its own terms.</p>
      <div class="law-tag" style="color:var(--muted)">We evolve. Never delete. But nothing freeloads.</div>
    </div>
  </div>
</section>

<section class="section" id="cockpit">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">OS Cockpit</div>
      <h2>See the Core's operating contract.</h2>
    </div>
    <p style="color:#b4b4bb; font-size:15.5px; line-height:1.7; max-width:600px; margin:0 0 34px;">
      This public trace explains the control sequence Empire-1 requires. It is architecture—not live telemetry—and it makes no claim that a request ran unless a runtime receipt proves it.
    </p>

    <div class="cockpit-panel">
      <div class="cockpit-head">
        <span class="cockpit-dot"></span> hic://core/pipeline · architecture
      </div>
      <div class="cockpit-body">
        <div class="cockpit-line"><span class="ok">01</span> Route contract — classify before provider selection <span class="cockpit-val">required</span></div>
        <div class="cockpit-line"><span class="ok">02</span> Canon contract — enforce universe identity <span class="cockpit-val">required</span></div>
        <div class="cockpit-line"><span class="ok">03</span> Format contract — normalize the requested output <span class="cockpit-val">required</span></div>
        <div class="cockpit-line"><span class="ok">04</span> Evidence contract — compare output to a dated baseline <span class="cockpit-val">receipt required</span></div>
        <div class="cockpit-line muted">— one voice out, regardless of which model answered —</div>
      </div>
      <div class="cockpit-stats">
        <div class="cstat"><div class="v">Multi</div><div class="l">Provider-capable</div></div>
        <div class="cstat"><div class="v">Required</div><div class="l">Canon Gate</div></div>
        <div class="cstat"><div class="v">Defined</div><div class="l">Revenue Law</div></div>
        <div class="cstat"><div class="v">Receipt</div><div class="l">Runtime Proof Required</div></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="revenue-os">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">PUBLIC PRODUCT ENTRY</div>
      <h2>Turn your business into a revenue system.</h2>
    </div>
    <p style="color:#b4b4bb; font-size:15.5px; line-height:1.7; max-width:600px; margin:0 0 34px;">
      Revenue OS has a public product surface. Submit real business context, inspect the returned output and its generation mode, then decide whether the Receipt or Sprint is worth buying.
    </p>

    <div class="revos-panel">
      <div class="revos-head">
        <span class="cockpit-dot"></span> revenue-os://product · public entry
      </div>
      <div class="revos-body">
        <div class="cockpit-line"><span class="ok">01</span> Buyer research — generated from submitted context <span class="cockpit-val">output</span></div>
        <div class="cockpit-line"><span class="ok">02</span> GTM sequence — staged outreach and action plan <span class="cockpit-val">output</span></div>
        <div class="cockpit-line"><span class="ok">03</span> Receipt boundary — generation mode must stay explicit <span class="cockpit-val">evidence</span></div>
        <div class="cockpit-line muted">— public product surface; runtime claims require dated evidence —</div>
      </div>
    </div>

    <div class="revos-grid">
      <div class="revos-card">
        <div class="revos-card-num">01</div>
        <h4>Free Demo</h4>
        <p>See Revenue OS run against your business. No account, no commitment — just the system doing what it does.</p>
      </div>
      <div class="revos-card">
        <div class="revos-card-num">02</div>
        <h4>Revenue Receipt — $299</h4>
        <p>One complete run. Not a report — a working output you can act on same day. Proof of work, not a promise.</p>
      </div>
      <div class="revos-card">
        <div class="revos-card-num">03</div>
        <h4>Revenue Sprint — $999</h4>
        <p>Done-with-you. The Core runs, then we refine together until it's sharp enough to close with.</p>
      </div>
    </div>

    <div class="cta-row" style="margin-top:34px;">
      <a href="/try-revenue-os" class="btn btn-primary">Try Revenue OS Free →</a>
      <a href="/revenue-os" class="btn btn-ghost">Full Product →</a>
    </div>
  </div>
</section>

<section class="section" id="founder">
  <div class="wrap">
    <div class="eyebrow">Founder's Note</div>
    <p class="founder-quote" style="margin-top:20px;">"I built the Hybrid Intelligence Core alone, with one working hand, from the San Gabriel Valley — because sovereignty isn't something you're granted. You architect it.<br><br>Even the mark carries that belief. Its geometry comes from an Aztec step-fret pattern — because provenance isn't just architecture to me. It's heritage.<br><br>This is not a pitch. This is the law the whole empire runs on."</p>
    <div class="founder-sign"><b>Manda Mora</b> — Founder, Empire-1</div>
  </div>
</section>

<section class="section" id="entry">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">Ways In</div>
      <h2>From a free look to full service.</h2>
    </div>
    <div class="ledger">
      <div class="ledger-row">
        <div class="ledger-tier blue">Access</div>
        <div class="ledger-body">
          <h3>Free</h3>
          <p>See the Core run. No account, no commitment — just the system doing what it does, on a real input.</p>
          <div class="ledger-includes">— Full system demo<br>— No login required<br>— See the output before you pay for anything</div>
        </div>
        <div class="ledger-price">$0</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier">Receipt</div>
        <div class="ledger-body">
          <h3>Receipt</h3>
          <p>One complete run of the Core against your business. Not a report — a working output you can act on same day.</p>
          <div class="ledger-includes">— Everything in Access<br>— Full generation, your inputs<br>— Delivered as proof of work, not a promise</div>
        </div>
        <div class="ledger-price">$299</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier pink">Sprint</div>
        <div class="ledger-body">
          <h3>Sprint</h3>
          <p>Done-with-you. The Core runs, then we refine it together until it's sharp enough to close with.</p>
          <div class="ledger-includes">— Everything in Receipt<br>— Custom refinement pass<br>— Direct session with the founder</div>
        </div>
        <div class="ledger-price">$999</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier" style="color:var(--text);">Full Service · Empire Partnership</div>
        <div class="ledger-body">
          <h3>Partnership</h3>
          <p>Done-for-you, ongoing. We build and operate your universe on the Hybrid Intelligence Core — custom integration, managed pipeline, direct line to the founder for as long as the partnership runs.</p>
          <div class="ledger-includes">— Everything in Sprint<br>— Custom universe build &amp; integration<br>— Ongoing managed operation, not a one-time delivery</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier blue">License · Empire-1 HIC</div>
        <div class="ledger-body">
          <h3>License the Engine</h3>
          <p>For builders who already have a product and just need the intelligence layer underneath it — routing, canon enforcement, drift monitoring. Drops into your stack. Nothing of ours is customer-facing.</p>
          <div class="ledger-includes">— Routing Engine, Canon Enforcer, Format Normalizer, Drift Monitor<br>— Fully white-labeled, zero Empire-1 branding<br>— Core intelligence only — your product, your customers, your name</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier gradient">License · SLA113 Platform</div>
        <div class="ledger-body">
          <h3>License the Factory</h3>
          <p>Not just the engine — the whole operator platform. Full console, 18+ specialized engines, Empire-1 HIC underneath it, and self-service white-label instance minting. Built to demonstrate factory output.</p>
          <div class="ledger-includes">— Everything in the HIC license<br>— Full operator console + specialized engine set<br>— Self-service branded instance minting</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
    </div>
    <div class="ledger-note">If the Receipt helps you close one deal, it already paid for itself. Partnership is us running it for you — License is you running it yourself, either just the engine or the whole factory.</div>
  </div>
</section>

<footer>
  <div class="wrap footer-inner">
    <div class="mark">
      <img src="empire1_logo.jpeg" alt="Empire 1" style="width:26px;height:26px;object-fit:contain;border-radius:4px;">
      <div class="wordmark" style="font-size:15px;">EMPIRE <span>1</span></div>
    </div>
    <div style="display:flex; gap:20px; flex-wrap:wrap;">
      <a href="/revenue-os" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em;">Revenue OS</a>
      <a href="/ecosystem" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em;">Ecosystem</a>
      <a href="/hic" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em;">HIC</a>
      <a href="/enterprise" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em;">Enterprise</a>
      <a href="/licensing" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em;">Licensing</a>
    </div>
  </div>
  <div class="wrap copy">© 2026 EMPIRE 1 · founder@empire1.cloud</div>
</footer>
`;

const REVENUE_PROOF_MARKER = '<section class="section" id="founder">';
const revenueProofIndex = LANDING_HTML.indexOf(REVENUE_PROOF_MARKER);
const LANDING_BEFORE_REVENUE_PROOF = revenueProofIndex >= 0
  ? LANDING_HTML.slice(0, revenueProofIndex)
  : LANDING_HTML;
const LANDING_AFTER_REVENUE_PROOF = revenueProofIndex >= 0
  ? LANDING_HTML.slice(revenueProofIndex)
  : '';

export default function EmpireHome() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const target = document.querySelector(anchor.getAttribute('href') || '');
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_BEFORE_REVENUE_PROOF }} />
      <RevenueProof />
      {LANDING_AFTER_REVENUE_PROOF && (
        <div dangerouslySetInnerHTML={{ __html: LANDING_AFTER_REVENUE_PROOF }} />
      )}
    </>
  );
}
