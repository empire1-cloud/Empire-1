'use client';

import React, { useEffect } from 'react';

const LANDING_STYLES = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'Inter',system-ui,sans-serif;background:#050508;color:#e0e0e0;line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}

:root{
  --pink:#ff1493;
  --pink-glow:rgba(255,20,147,.12);
  --pink-border:rgba(255,20,147,.25);
  --cyan:#00ffd5;
  --cyan-glow:rgba(0,255,213,.08);
  --gold:#ffd700;
  --purple:#a855f7;
  --green:#22c55e;
  --bg:#050508;
  --card:#0c0c10;
  --card-hover:#111118;
  --card-border:rgba(255,255,255,.06);
  --text:#e0e0e0;
  --text-dim:#777;
  --mono:'JetBrains Mono',monospace;
}

.container{max-width:1200px;margin:0 auto;padding:0 24px}
.mono{font-family:var(--mono)}
.section{padding:100px 0}
.section-label{font-family:var(--mono);font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--pink);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.section-label::before{content:'';width:24px;height:1px;background:var(--pink)}
.section-title{font-size:clamp(28px,4vw,44px);font-weight:800;line-height:1.12;margin-bottom:20px;color:#fff}
.section-desc{font-size:17px;color:var(--text-dim);max-width:600px;line-height:1.7}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;backdrop-filter:blur(24px);background:rgba(5,5,8,.85);border-bottom:1px solid var(--card-border)}
nav .container{display:flex;align-items:center;justify-content:space-between}
.nav-brand{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-weight:700;font-size:15px;color:#fff;letter-spacing:1px}
.nav-dot{width:8px;height:8px;border-radius:50%;background:var(--pink);box-shadow:0 0 12px var(--pink)}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{font-size:13px;color:var(--text-dim);transition:color .2s}
.nav-links a:hover{color:var(--pink)}
.nav-cta{font-family:var(--mono);font-size:12px;padding:10px 24px;border:1px solid var(--pink);color:var(--pink);border-radius:6px;transition:all .2s;letter-spacing:1px}
.nav-cta:hover{background:var(--pink);color:#000}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;position:relative;padding-top:80px}
.hero::before{content:'';position:absolute;inset:0;background:
  radial-gradient(ellipse 700px 500px at 50% 25%,rgba(255,20,147,.06),transparent 70%),
  radial-gradient(ellipse 500px 500px at 80% 70%,rgba(0,255,213,.03),transparent 60%);pointer-events:none}
.hero-content{position:relative;z-index:2;max-width:700px}
.hero-eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:3px;color:var(--cyan);margin-bottom:20px;display:flex;align-items:center;gap:10px}
.hero-eyebrow .pulse{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px var(--green)}50%{opacity:.3}}
.hero h1{font-size:clamp(36px,5.5vw,62px);font-weight:900;line-height:1.06;color:#fff;margin-bottom:24px;letter-spacing:-.02em}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,var(--pink),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:clamp(16px,2vw,19px);color:var(--text-dim);line-height:1.7;margin-bottom:36px;max-width:540px}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap}
.btn-primary{font-family:var(--mono);font-size:13px;padding:14px 32px;background:linear-gradient(135deg,var(--pink),#d000a0);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;letter-spacing:1px;transition:all .25s;text-transform:uppercase;display:inline-block}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(255,20,147,.25)}
.btn-secondary{font-family:var(--mono);font-size:13px;padding:14px 32px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:8px;cursor:pointer;letter-spacing:1px;transition:all .25s;display:inline-block}
.btn-secondary:hover{border-color:var(--pink);color:var(--pink)}

/* LIVE STATS BAR */
.stats-bar{display:flex;gap:48px;margin-top:56px;padding-top:36px;border-top:1px solid var(--card-border)}
.stat-item .stat-num{font-family:var(--mono);font-size:32px;font-weight:700;color:#fff}
.stat-item .stat-num span{color:var(--cyan)}
.stat-item .stat-label{font-size:12px;color:var(--text-dim);margin-top:2px;letter-spacing:.5px}

/* PROOF BAR */
.proof-bar{padding:48px 0;border-bottom:1px solid var(--card-border)}
.proof-bar .container{display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap}
.proof-chip{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:1px;color:var(--text-dim);white-space:nowrap}
.proof-chip .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* FEATURE MEGA CARDS */
.mega-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
.mega-card{background:var(--card);border:1px solid var(--card-border);border-radius:16px;padding:40px;position:relative;overflow:hidden;transition:all .3s}
.mega-card:hover{border-color:var(--pink-border);box-shadow:0 20px 60px rgba(0,0,0,.4)}
.mega-card.full{grid-column:span 2}
.mega-card .card-badge{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:4px;display:inline-block;margin-bottom:20px}
.badge-live{color:var(--green);background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2)}
.badge-core{color:var(--cyan);background:var(--cyan-glow);border:1px solid rgba(0,255,213,.2)}
.badge-revenue{color:var(--gold);background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2)}
.badge-api{color:var(--purple);background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2)}
.mega-card h3{font-size:22px;font-weight:700;color:#fff;margin-bottom:10px}
.mega-card p{font-size:14px;color:var(--text-dim);line-height:1.7;margin-bottom:20px}
.mega-card ul{list-style:none}
.mega-card ul li{font-size:13px;color:var(--text-dim);padding:5px 0;display:flex;align-items:flex-start;gap:8px}
.mega-card ul li::before{content:'→';color:var(--pink);font-family:var(--mono);flex-shrink:0}
.card-visual{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.engine-tag{font-family:var(--mono);font-size:11px;padding:6px 14px;background:rgba(255,255,255,.04);border:1px solid var(--card-border);border-radius:6px;color:var(--text-dim);transition:all .2s}
.engine-tag:hover{border-color:var(--pink-border);color:var(--pink)}

/* CODE BLOCK */
.code-block{background:#0a0a0e;border:1px solid var(--card-border);border-radius:10px;padding:20px 24px;margin-top:20px;font-family:var(--mono);font-size:12px;line-height:1.8;overflow-x:auto;color:var(--text-dim)}
.code-block .comment{color:#555}
.code-block .key{color:var(--cyan)}
.code-block .str{color:var(--pink)}
.code-block .method{color:var(--gold)}

/* UNIVERSE MAP */
.universe-row{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-top:48px;border-radius:14px;overflow:hidden}
.u-cell{background:var(--card);padding:28px 16px;text-align:center;transition:all .3s;position:relative}
.u-cell:hover{background:var(--card-hover);transform:scale(1.03);z-index:2}
.u-cell .u-id{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px}
.u-cell .u-name{font-weight:700;font-size:14px;color:#fff;margin-bottom:4px}
.u-cell .u-role{font-size:11px;color:var(--text-dim)}
.u-cell .u-bar{width:32px;height:3px;border-radius:2px;margin:10px auto 0}

/* REVENUE PREVIEW */
.revenue-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:36px}
.rev-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:24px;text-align:center}
.rev-card .rev-label{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin-bottom:8px}
.rev-card .rev-num{font-family:var(--mono);font-size:28px;font-weight:700;color:#fff}
.rev-card .rev-sub{font-size:12px;color:var(--green);margin-top:4px}

/* HOW IT WORKS */
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:48px;counter-reset:step}
.step{position:relative}
.step::before{counter-increment:step;content:counter(step,decimal-leading-zero);font-family:var(--mono);font-size:44px;font-weight:700;color:rgba(255,20,147,.12);line-height:1;margin-bottom:14px;display:block}
.step h3{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px}
.step p{font-size:13px;color:var(--text-dim);line-height:1.7}

/* PRICING */
.pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px}
.price-card{background:var(--card);border:1px solid var(--card-border);border-radius:14px;padding:32px;transition:all .3s;position:relative}
.price-card.pop{border-color:var(--pink-border);box-shadow:0 0 50px rgba(255,20,147,.06)}
.price-card.pop::before{content:'MOST POPULAR';position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:9px;letter-spacing:2px;padding:4px 14px;background:linear-gradient(135deg,var(--pink),var(--purple));color:#fff;border-radius:4px;font-weight:700}
.price-card .tier-name{font-family:var(--mono);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:14px}
.price-card .price{font-size:40px;font-weight:900;color:#fff;line-height:1}
.price-card .price small{font-size:14px;font-weight:400;color:var(--text-dim)}
.price-card .price-desc{font-size:13px;color:var(--text-dim);margin:14px 0 20px;line-height:1.5}
.price-card ul{list-style:none;margin-bottom:24px}
.price-card ul li{font-size:12px;padding:5px 0;color:var(--text-dim);display:flex;align-items:center;gap:6px}
.price-card ul li::before{content:'✓';color:var(--cyan);font-size:11px;font-weight:700}
.price-card .btn-primary{width:100%;text-align:center;font-size:12px;padding:12px}

/* ENGINE WALL */
.engine-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-top:48px}
.engine-pill{font-family:var(--mono);font-size:10px;padding:10px 14px;background:var(--card);border:1px solid var(--card-border);border-radius:6px;color:var(--text-dim);transition:all .2s;display:flex;align-items:center;gap:7px}
.engine-pill:hover{border-color:var(--pink-border);color:var(--pink)}
.engine-pill .ed{width:4px;height:4px;border-radius:50%;flex-shrink:0}

/* CTA */
.final-cta{text-align:center;padding:120px 0}
.final-cta h2{font-size:clamp(32px,5vw,52px);font-weight:900;color:#fff;margin-bottom:20px;line-height:1.1}
.final-cta p{font-size:17px;color:var(--text-dim);margin-bottom:40px;max-width:480px;margin-left:auto;margin-right:auto}
.final-cta .hero-ctas{justify-content:center}

/* FOOTER */
footer{padding:36px 0;border-top:1px solid var(--card-border);text-align:center}
footer p{font-family:var(--mono);font-size:11px;color:#444;letter-spacing:1px}

/* RESPONSIVE */
@media(max-width:900px){
  .mega-grid{grid-template-columns:1fr}
  .mega-card.full{grid-column:span 1}
  .pricing-grid{grid-template-columns:1fr 1fr}
  .revenue-grid{grid-template-columns:1fr 1fr}
  .steps{grid-template-columns:1fr 1fr}
  .universe-row{grid-template-columns:1fr 1fr 1fr}
  .universe-row .u-cell:last-child{grid-column:span 1}
}
@media(max-width:600px){
  .stats-bar{flex-direction:column;gap:16px}
  .nav-links{display:none}
  .pricing-grid{grid-template-columns:1fr}
  .universe-row{grid-template-columns:1fr 1fr}
  .revenue-grid{grid-template-columns:1fr 1fr}
  .steps{grid-template-columns:1fr}
  .section{padding:60px 0}
}
`;

const LANDING_HTML = `

<!-- NAV -->
<nav>
  <div class="container">
    <div class="nav-brand"><span class="nav-dot"></span>HIC · EMPIRE-1</div>
    <div class="nav-links">
      <a href="#platform">Platform</a>
      <a href="#universes">Universes</a>
      <a href="#pricing">Pricing</a>
      <a href="#engines">Engines</a>
      <a href="https://empire1.cloud" class="nav-cta">OPEN CONSOLE →</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-eyebrow"><span class="pulse"></span> ALL SYSTEMS HEALTHY · 20 ENGINES ONLINE</div>
      <h1>Hybrid Intelligence <em>Core</em></h1>
      <p class="hero-sub">Empire-1 is the Hybrid Intelligence Core — 20 production engines across 6 universes. One control plane. Full-stack AI sovereignty with pipeline composer, revenue command, and cultural intelligence built in.</p>
      <div class="hero-ctas">
        <a href="https://empire1.cloud" class="btn-primary">Open Console →</a>
        <a href="#universes" class="btn-secondary">Explore Universes</a>
      </div>
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-num">20</div><div class="stat-label">Active engines</div></div>
        <div class="stat-item"><div class="stat-num">3</div><div class="stat-label">LLM models</div></div>
        <div class="stat-item"><div class="stat-num"><span>$78K</span></div><div class="stat-label">Operator MRR</div></div>
        <div class="stat-item"><div class="stat-num">69</div><div class="stat-label">Active operators</div></div>
      </div>
    </div>
  </div>
</section>

<!-- PROOF BAR -->
<div class="proof-bar">
  <div class="container">
    <div class="proof-chip"><span class="dot" style="background:var(--green)"></span>GPT-5.2</div>
    <div class="proof-chip"><span class="dot" style="background:var(--green)"></span>Claude Sonnet 4.5</div>
    <div class="proof-chip"><span class="dot" style="background:var(--green)"></span>Gemini 3 Flash</div>
    <div class="proof-chip"><span class="dot" style="background:var(--cyan)"></span>265+ total engines</div>
    <div class="proof-chip"><span class="dot" style="background:var(--cyan)"></span>7 live universes</div>
    <div class="proof-chip"><span class="dot" style="background:var(--gold)"></span>100% creator equity</div>
  </div>
</div>

<!-- REVENUE COMMAND PREVIEW -->
<section class="section">
  <div class="container">
    <div class="section-label">Revenue Command</div>
    <h2 class="section-title">Real revenue. Real operators. Real-time.</h2>
    <p class="section-desc">Empire-1's Revenue Command tracks MRR across every universe. Every operator, every pipeline, every dollar — visible at a glance.</p>
    <div class="revenue-grid">
      <div class="rev-card"><div class="rev-label">Total MRR</div><div class="rev-num" style="color:var(--cyan)">$78K</div><div class="rev-sub">+10% MoM</div></div>
      <div class="rev-card"><div class="rev-label">Operators</div><div class="rev-num">69</div><div class="rev-sub">Active this month</div></div>
      <div class="rev-card"><div class="rev-label">ARR Run Rate</div><div class="rev-num">$936K</div><div class="rev-sub">Annualized MRR</div></div>
      <div class="rev-card"><div class="rev-label">Avg Rev / Op</div><div class="rev-num">$1.1K</div><div class="rev-sub">Per operator MRR</div></div>
    </div>
  </div>
</section>

<!-- PLATFORM FEATURES -->
<section class="section" id="platform" style="padding-top:40px">
  <div class="container">
    <div class="section-label">The Platform</div>
    <h2 class="section-title">Everything a sovereign AI business needs</h2>
    <p class="section-desc">The Hybrid Intelligence Core. 20 engines, 6 universes, federated revenue. Not another wrapper — a full sovereign AI operating system.</p>

    <div class="mega-grid">
      <!-- ENGINE DASHBOARD -->
      <div class="mega-card">
        <span class="card-badge badge-core">20 Engines Live</span>
        <h3>Engine Dashboard</h3>
        <p>Browse, test, and deploy 20 production AI engines. Each one has its own API endpoint, test interface, and execution tracking.</p>
        <ul>
          <li>Strategy, Analysis, Plan Builder engines</li>
          <li>Persona, Anime Character/Lore/Story engines</li>
          <li>Art Direction, Money Pipeline, Pricing engines</li>
          <li>One-click test interface with JSON payloads</li>
        </ul>
        <div class="card-visual">
          <span class="engine-tag">POST /strategy</span>
          <span class="engine-tag">POST /analyze</span>
          <span class="engine-tag">POST /persona</span>
          <span class="engine-tag">POST /pricing</span>
          <span class="engine-tag">POST /blueprint</span>
        </div>
      </div>

      <!-- PIPELINE COMPOSER -->
      <div class="mega-card">
        <span class="card-badge badge-live">Pipeline Composer</span>
        <h3>Chain engines into workflows</h3>
        <p>Drag-and-drop engine chaining. Build complex multi-step AI workflows by composing engines together. Save presets for repeat use.</p>
        <ul>
          <li>Visual pipeline builder — click to add engines</li>
          <li>Initial input → engine chain → composed output</li>
          <li>Save & load pipeline presets</li>
          <li>POST /pipeline/compose for programmatic access</li>
        </ul>
        <div class="card-visual">
          <span class="engine-tag">Strategy → Plan Builder → Blueprint</span>
        </div>
      </div>

      <!-- ANALYTICS -->
      <div class="mega-card">
        <span class="card-badge badge-revenue">Monitoring & Analytics</span>
        <h3>Real-time performance intelligence</h3>
        <p>Live-polling analytics dashboard with execution tracking, latency monitoring per engine, AI quality & drift detection, and error rates.</p>
        <ul>
          <li>Requests per engine — live bar charts</li>
          <li>Average response time (ms) per engine</li>
          <li>Error rates with severity classification</li>
          <li>AI Quality & Drift monitoring tab</li>
          <li>System Health with real-time WebSocket polling</li>
        </ul>
      </div>

      <!-- API ACCESS -->
      <div class="mega-card">
        <span class="card-badge badge-api">Developer API</span>
        <h3>API keys in 30 seconds</h3>
        <p>Generate API keys with full access to all engines. Standard REST endpoints. Bearer token auth. Build anything on top of Empire-1.</p>
        <div class="code-block">
          <span class="comment"># Create your pipeline</span><br>
          curl -X POST https://api.empire1.cloud/pipeline/compose \\<br>
          &nbsp;&nbsp;-H "<span class="key">Authorization</span>: Bearer <span class="str">hic_your_api_key</span>" \\<br>
          &nbsp;&nbsp;-d '{<br>
          &nbsp;&nbsp;&nbsp;&nbsp;"<span class="key">engines</span>": ["<span class="str">strategy</span>", "<span class="str">plan</span>", "<span class="str">blueprint</span>"],<br>
          &nbsp;&nbsp;&nbsp;&nbsp;"<span class="key">input</span>": "<span class="str">Build an AI music studio</span>"<br>
          &nbsp;&nbsp;}'
        </div>
      </div>

      <!-- REVENUE COMMAND - FULL WIDTH -->
      <div class="mega-card full">
        <span class="card-badge badge-revenue">Revenue Command</span>
        <h3>Track revenue across every universe</h3>
        <p>MRR by universe, operator growth trends, 6-month revenue charts, and per-operator analytics. See exactly how your multi-product AI business is performing.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:16px">
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">FEDERAL CONTROL PLANE</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--cyan)">$24.8K</div>
            <div style="font-size:11px;color:var(--text-dim)">13 operators · 32%</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">LYRICA 3 PRO</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--pink)">$17.4K</div>
            <div style="font-size:11px;color:var(--text-dim)">21 operators · 22%</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">FINANCIAL LAYER</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--gold)">$11.6K</div>
            <div style="font-size:11px;color:var(--text-dim)">6 operators · 15%</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">CULTURAL SAFETY</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:#ff6b35">$9K</div>
            <div style="font-size:11px;color:var(--text-dim)">10 operators · 12%</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">SOUTHERN ARCADE</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--green)">$7K</div>
            <div style="font-size:11px;color:var(--text-dim)">7 operators · 9%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- UNIVERSE MAP -->
<section class="section" id="universes" style="padding-top:0">
  <div class="container">
    <div class="section-label">The Multiverse</div>
    <h2 class="section-title">Six universes. One Hybrid Intelligence Core.</h2>
    <p class="section-desc">Each universe is a sovereign app with its own domain, revenue stream, and intelligence. Empire-1 federates them all.</p>
    <div class="universe-row">
      <a href="https://empire-1.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">HIC</div>
        <div class="u-name">Empire-1</div>
        <div class="u-role">Hybrid Intelligence Core</div>
        <div class="u-bar" style="background:var(--cyan)"></div>
      </a>
      <a href="https://sla113.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">U0</div>
        <div class="u-name">SLA-113</div>
        <div class="u-role">Admin Console</div>
        <div class="u-bar" style="background:var(--purple)"></div>
      </a>
      <a href="https://lyrica3-pro.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">U1</div>
        <div class="u-name">Lyrica 3</div>
        <div class="u-role">AI Music Studio</div>
        <div class="u-bar" style="background:var(--pink)"></div>
      </a>
      <a href="https://cultura-vibe-forge.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">U2</div>
        <div class="u-name">Cultura Vibe</div>
        <div class="u-role">Cultural OS</div>
        <div class="u-bar" style="background:#ff6b35"></div>
      </a>
      <a href="https://southernlifestyle.org" class="u-cell" style="text-decoration:none">
        <div class="u-id">U3</div>
        <div class="u-name">Southern</div>
        <div class="u-role">Lifestyle Engine</div>
        <div class="u-bar" style="background:var(--gold)"></div>
      </a>
      <a href="https://soulfire-ecosystem.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">U4</div>
        <div class="u-name">Soulfire</div>
        <div class="u-role">Ecosystem OS</div>
        <div class="u-bar" style="background:var(--pink)"></div>
      </a>
      <a href="https://archisynapse.vercel.app" class="u-cell" style="text-decoration:none">
        <div class="u-id">U5</div>
        <div class="u-name">Archisynapse</div>
        <div class="u-role">Payment Ledger</div>
        <div class="u-bar" style="background:var(--gold)"></div>
      </a>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section">
  <div class="container">
    <div class="section-label">Get started</div>
    <h2 class="section-title">From zero to sovereign in four steps</h2>
    <div class="steps">
      <div class="step">
        <h3>Create your API key</h3>
        <p>Sign up, generate a Bearer token, and authenticate against any engine in seconds.</p>
      </div>
      <div class="step">
        <h3>Pick your engines</h3>
        <p>Choose from 20 production engines — strategy, analysis, persona, art direction, money pipeline, execution, and more.</p>
      </div>
      <div class="step">
        <h3>Compose pipelines</h3>
        <p>Chain engines together into workflows. Strategy → Plan → Blueprint. Save presets for repeat use.</p>
      </div>
      <div class="step">
        <h3>Monitor & monetize</h3>
        <p>Track every execution, monitor latency and drift, and watch your MRR grow in Revenue Command.</p>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section" id="pricing">
  <div class="container">
    <div class="section-label">Pricing</div>
    <h2 class="section-title">Pick your node. Build sovereign.</h2>
    <p class="section-desc">Every tier includes full engine access, API keys, and analytics. Scale from solo builder to enterprise.</p>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="tier-name">Developer</div>
        <div class="price">$99<small>/mo</small></div>
        <div class="price-desc">Solo builders and indie devs exploring the stack</div>
        <ul>
          <li>3 engine access</li>
          <li>API key generation</li>
          <li>1,000 API calls/mo</li>
          <li>Basic analytics</li>
          <li>Community support</li>
        </ul>
        <a href="https://empire1.cloud" class="btn-primary">Start Building</a>
      </div>
      <div class="price-card">
        <div class="tier-name">Node Alpha</div>
        <div class="price">$499<small>/mo</small></div>
        <div class="price-desc">Studios and labels running a single product line</div>
        <ul>
          <li>All 20 engines</li>
          <li>Pipeline Composer</li>
          <li>10,000 API calls/mo</li>
          <li>Revenue Command</li>
          <li>Multi-tenant (50 users)</li>
          <li>Priority support</li>
        </ul>
        <a href="https://empire1.cloud" class="btn-primary">Launch Alpha</a>
      </div>
      <div class="price-card pop">
        <div class="tier-name">Node Omega</div>
        <div class="price">$1,499<small>/mo</small></div>
        <div class="price-desc">Platforms running multiple products and universes</div>
        <ul>
          <li>All engines + Game OS</li>
          <li>Unlimited pipelines</li>
          <li>100,000 API calls/mo</li>
          <li>Full analytics + drift</li>
          <li>Multi-tenant (500 users)</li>
          <li>Dedicated support</li>
          <li>Micro-royalty distribution</li>
        </ul>
        <a href="https://empire1.cloud" class="btn-primary">Launch Omega</a>
      </div>
      <div class="price-card">
        <div class="tier-name">Node Sovereign</div>
        <div class="price">$4,999<small>/mo</small></div>
        <div class="price-desc">Full multi-universe stack. White-label. Unlimited.</div>
        <ul>
          <li>All universes unlocked</li>
          <li>White-label everything</li>
          <li>Unlimited API calls</li>
          <li>SLA-113 control plane</li>
          <li>Custom engine development</li>
          <li>Revenue share model</li>
          <li>Direct engineering line</li>
        </ul>
        <a href="https://empire1.cloud" class="btn-primary">Go Sovereign</a>
      </div>
    </div>
  </div>
</section>

<!-- ENGINE WALL -->
<section class="section" id="engines">
  <div class="container">
    <div class="section-label">Engine Registry</div>
    <h2 class="section-title">20 production engines. 245+ in the vault.</h2>
    <p class="section-desc">Every engine has its own API endpoint, test interface, and execution tracking. Browse the live registry.</p>
    <div class="engine-wall">
      <div class="engine-pill"><span class="ed" style="background:var(--cyan)"></span>Hybrid Intelligence Core</div>
      <div class="engine-pill"><span class="ed" style="background:var(--cyan)"></span>Routing Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Strategy Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Plan Builder</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Analysis Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Opportunity Mapper</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Evaluator Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Pricing Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--purple)"></span>Blueprint Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--purple)"></span>Persona Engine</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Anime Character</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Anime Lore</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Anime Story</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Art Direction</div>
      <div class="engine-pill"><span class="ed" style="background:var(--green)"></span>Money Pipeline</div>
      <div class="engine-pill"><span class="ed" style="background:var(--green)"></span>Pipeline Composer</div>
      <div class="engine-pill"><span class="ed" style="background:var(--text-dim)"></span>Canon Enforcer</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Drift Monitor</div>
      <div class="engine-pill"><span class="ed" style="background:var(--text-dim)"></span>Error Handler</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Execution Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Soulfire Engine</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Empire Lyric Master</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Acid Vocal Chain</div>
      <div class="engine-pill"><span class="ed" style="background:var(--cyan)"></span>Omni Agent Runtime</div>
      <div class="engine-pill"><span class="ed" style="background:var(--cyan)"></span>Identity Firewall</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Arcade Controller</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Cultura Forge</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Heritage Logic</div>
      <div class="engine-pill"><span class="ed" style="background:var(--purple)"></span>Black Box Vault</div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta">
  <div class="container">
    <h2>Sovereignty<br>begins <span style="color:var(--pink)">here</span></h2>
    <p>Stop renting someone else's platform. Build on infrastructure that respects creator equity by design.</p>
    <div class="hero-ctas" style="justify-content:center">
      <a href="https://empire1.cloud" class="btn-primary">Create Your API Key →</a>
      <a href="mailto:manda@empire1.cloud" class="btn-secondary">Talk to the founder</a>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p>EMPIRE-1 · HYBRID INTELLIGENCE CORE · 6 UNIVERSES · 20 ENGINES · 265+ IN VAULT</p>
    <p style="margin-top:6px;color:#333">Built in El Monte, CA · SGV since day one</p>
  </div>
</footer>

`;

export default function EmpireHome() {
  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Alex+Brush&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </>
  );
}
