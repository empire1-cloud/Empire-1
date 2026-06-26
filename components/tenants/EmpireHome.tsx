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
  --obsidian:#111827;
  --obsidian-hover:#1a2744;
  --obsidian-border:rgba(17,24,39,.4);
  --gold:#ffd700;
  --purple:#a855f7;
  --green:#22c55e;
  --bg:#050508;
  --card:var(--obsidian);
  --card-hover:var(--obsidian-hover);
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
  radial-gradient(ellipse 500px 500px at 80% 70%,rgba(255,20,147,.03),transparent 60%);pointer-events:none}
.hero-content{position:relative;z-index:2;max-width:700px}
.hero-eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:3px;color:var(--pink);margin-bottom:20px;display:flex;align-items:center;gap:10px}
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
.stat-item .stat-num span{color:var(--pink)}
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
.badge-core{color:var(--pink);background:var(--pink-glow);border:1px solid var(--pink-border)}
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
.code-block .key{color:var(--pink)}
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
.price-card ul li::before{content:'✓';color:var(--pink);font-size:11px;font-weight:700}
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
    <div class="nav-brand"><span class="nav-dot"></span>HYBRID‑AI‑CORE</div>
    <div class="nav-links">
      <a href="/try-revenue-os">Try Revenue OS</a>
      <a href="/revenue-os">Revenue OS</a>
      <a href="/revenue-receipt">Receipt</a>
      <a href="#principles">Principles</a>
      <a href="#pricing">Pricing</a>
      <a href="mailto:manda@empire1.cloud" class="nav-cta">TALK TO THE ARCHITECT →</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-eyebrow"><span class="pulse"></span> EMPIRE REVENUE OS · PUBLIC DEMO</div>
      <h1>Turn your business into a<br><em>revenue system by Monday.</em></h1>
      <p class="hero-sub">Empire Revenue OS generates your paid offer, buyer list, outreach campaign, payment path, and delivery receipt from one prompt. Public demo available. No admin access required.</p>
      <div class="hero-ctas">
        <a href="/try-revenue-os" class="btn-primary">Try Empire Revenue OS →</a>
        <a href="/revenue-receipt" class="btn-secondary">Generate Revenue Receipt</a>
      </div>
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-num">3</div><div class="stat-label">Priced offers</div></div>
        <div class="stat-item"><div class="stat-num">25</div><div class="stat-label">Buyer profiles</div></div>
        <div class="stat-item"><div class="stat-num">✓</div><div class="stat-label">Cold DMs + emails</div></div>
        <div class="stat-item"><div class="stat-num">10</div><div class="stat-label">Sales pipeline stages</div></div>
      </div>
    </div>
  </div>
</section>

<!-- PROOF BAR -->
<div class="proof-bar">
  <div class="container">
    <div class="proof-chip"><span class="dot" style="background:var(--green)"></span>Try it now — no login</div>
    <div class="proof-chip"><span class="dot" style="background:var(--green)"></span>Cold DMs + email copy</div>
    <div class="proof-chip"><span class="dot" style="background:var(--pink)"></span>Checkout + manual payment</div>
    <div class="proof-chip"><span class="dot" style="background:var(--pink)"></span>Delivery receipt</div>
    <div class="proof-chip"><span class="dot" style="background:var(--gold)"></span>10-stage pipeline</div>
    <div class="proof-chip"><span class="dot" style="background:var(--gold)"></span>Buyer profiles</div>
  </div>
</div>

<!-- DNA SCORE -->
<section class="section" id="dna-score">
  <div class="container">
    <div class="section-label">The DNA Score</div>
    <h2 class="section-title">Quality function validation.</h2>
    <p class="section-desc">Every decision in HIC is measured against 5 dimensions. This is not abstract theory — this is a living scorecard.</p>
    <div class="mega-grid" style="margin-top:48px">
      <div class="mega-card full">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px">
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:20px;text-align:center">
            <div style="font-family:var(--mono);font-size:32px;font-weight:700;color:var(--pink)">9/10</div>
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin:8px 0 4px">SCALABILITY</div>
            <div style="font-size:12px;color:var(--text-dim)">Microservices; routes work to appropriate engines by task complexity</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:20px;text-align:center">
            <div style="font-family:var(--mono);font-size:32px;font-weight:700;color:var(--gold)">8/10</div>
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin:8px 0 4px">MONETIZABILITY</div>
            <div style="font-size:12px;color:var(--text-dim)">Multi-tenant billing; token counting; premium engine access</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:20px;text-align:center">
            <div style="font-family:var(--mono);font-size:32px;font-weight:700;color:var(--pink)">9/10</div>
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin:8px 0 4px">SELF-CONSISTENCY</div>
            <div style="font-size:12px;color:var(--text-dim)">Unified data model; consistent error handling; tenant isolation</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:20px;text-align:center">
            <div style="font-family:var(--mono);font-size:32px;font-weight:700;color:var(--pink)">9/10</div>
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin:8px 0 4px">EMOTIONAL RESONANCE</div>
            <div style="font-size:12px;color:var(--text-dim)">Anime engines map to character psychology; persona captures intent</div>
          </div>
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:20px;text-align:center">
            <div style="font-family:var(--mono);font-size:32px;font-weight:700;color:var(--pink)">9/10</div>
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin:8px 0 4px">EXECUTION FEASIBILITY</div>
            <div style="font-size:12px;color:var(--text-dim)">19 modular engines; no monolithic bloat; CI/CD ready</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 5 PRINCIPLES -->
<section class="section" id="principles">
  <div class="container">
    <div class="section-label">The Five Core Principles</div>
    <h2 class="section-title">Emergent DNA in production code.</h2>
    <p class="section-desc">Not abstract theory. Every principle maps to actual files, actual engines, actual architectural decisions in Hybrid Intelligence Core.</p>
    <div class="mega-grid">
      <div class="mega-card">
        <span class="card-badge badge-core">PRINCIPLE 1</span>
        <h3>Multi-Layered Decomposition</h3>
        <p>Break complex problems into clean, orchestrated layers where changing one layer doesn't break others. 19 engines = 19 specialized layers.</p>
        <div class="code-block">
          <span class="comment"># Each engine solves ONE problem</span><br>
          engines/<span class="method">blueprint_engine</span>.py  <span class="comment"># design/architecture</span><br>
          engines/<span class="method">evaluator_engine</span>.py   <span class="comment"># judgment/scoring</span><br>
          engines/<span class="method">persona_engine</span>.py      <span class="comment"># character/role</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-core">PRINCIPLE 2</span>
        <h3>Dual-Market Strategy</h3>
        <p>Two offerings — pro power users and mass-market consumers — sharing the same core engine. Different UIs on top of the same architecture.</p>
        <div class="code-block">
          teams/<span class="method">public_api</span>.py      <span class="comment"># consumer tier</span><br>
          routers/<span class="method">persona_router</span>.py   <span class="comment"># pro tier</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-core">PRINCIPLE 3</span>
        <h3>Emotional Intelligence</h3>
        <p>Systems that understand and respect human emotion, culture, and intent — not just functional outcomes. The persona engine maps user intent, anime engines honor character psychology.</p>
        <div class="code-block">
          engines/<span class="method">anime_character_engine</span>.py  <span class="comment"># character psychology</span><br>
          models/<span class="method">persona</span>.py                    <span class="comment"># user intent mapping</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-core">PRINCIPLE 4</span>
        <h3>Fast-Launch OS</h3>
        <p>Ship complete features without rewriting core. The pipeline composer chains engines into workflows. Composition, not customization.</p>
        <div class="code-block">
          engines/<span class="method">pipeline_composer</span>.py  <span class="comment"># chain engines</span><br>
          services/                          <span class="comment"># shared abstraction layer</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-core">PRINCIPLE 5</span>
        <h3>Multi-AI Orchestration</h3>
        <p>AI models as pluggable components. Route tasks to the best model — GPT-4 for creativity, Claude for reasoning, local for latency-sensitive.</p>
        <div class="code-block">
          services/<span class="method">ai_router</span>.py  <span class="comment"># route by task type</span>
        </div>
      </div>
      <div class="mega-card full" style="background:linear-gradient(135deg,var(--obsidian),#0d0d1a);border-color:var(--pink-border)">
        <h3 style="font-size:24px;text-align:center;color:var(--pink)">"Not just here's what good architecture looks like — here's the exact code, here's why each decision was made, here's how you'd extend it."</h3>
      </div>
    </div>
  </div>
</section>

<!-- TIERS -->
<section class="section" id="tiers">
  <div class="container">
    <div class="section-label">How to work with us</div>
    <h2 class="section-title">Four ways to adopt the DNA</h2>
    <p class="section-desc">From learning the methodology to licensing the full platform. Pick your entry point.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:48px;border-radius:14px;overflow:hidden">
      <div style="background:var(--card);padding:36px 24px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--pink);margin-bottom:10px">TIER 1</div>
        <div style="font-size:28px;font-weight:900;color:#fff">$5-25K</div>
        <div style="font-size:11px;color:var(--text-dim);margin:6px 0 16px">/year</div>
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px">Methodology License</div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.6">Video course, workbooks, templates, decision trees. Your team learns to think architecturally.</div>
      </div>
      <div style="background:var(--card);padding:36px 24px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--pink);margin-bottom:10px">TIER 2</div>
        <div style="font-size:28px;font-weight:900;color:#fff">$5-15K</div>
        <div style="font-size:11px;color:var(--text-dim);margin:6px 0 16px">/project</div>
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px">Architecture Consulting</div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.6">3-week engagement. Discovery → Blueprint → Implementation guide. We map the DNA to your stack.</div>
      </div>
      <div style="background:var(--card);padding:36px 24px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--gold);margin-bottom:10px">TIER 3</div>
        <div style="font-size:28px;font-weight:900;color:#fff">$50-250K</div>
        <div style="font-size:11px;color:var(--text-dim);margin:6px 0 16px">/engagement</div>
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px">Done-for-You Systems</div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.6">8-12 weeks. We design, spec, and launch your entire platform. MVP in a quarter.</div>
      </div>
      <div style="background:var(--card);padding:36px 24px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--purple);margin-bottom:10px">TIER 4</div>
        <div style="font-size:28px;font-weight:900;color:#fff">25%</div>
        <div style="font-size:11px;color:var(--text-dim);margin:6px 0 16px">revenue share</div>
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px">Platform Licensing</div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.6">White-label the HIC. Your brand, your domain, our architecture. 25% of revenue. Passive income, infinite scale.</div>
      </div>
    </div>
  </div>
</section>

<!-- THE PROOF: HIC -->
<section class="section" id="proof" style="padding-top:0">
  <div class="container">
    <div class="section-label">The Proof</div>
    <h2 class="section-title">Hybrid Intelligence Core — reference implementation</h2>
    <p class="section-desc">20 engines, 6 universes, $78K MRR. This is what the DNA builds. Empire-1 is the living blueprint.</p>
    <div class="revenue-grid">
      <div class="rev-card"><div class="rev-label">Total MRR</div><div class="rev-num" style="color:var(--pink)">$78K</div><div class="rev-sub">+10% MoM</div></div>
      <div class="rev-card"><div class="rev-label">Active Operators</div><div class="rev-num">69</div><div class="rev-sub">This month</div></div>
      <div class="rev-card"><div class="rev-label">ARR Run Rate</div><div class="rev-num">$936K</div><div class="rev-sub">Annualized MRR</div></div>
      <div class="rev-card"><div class="rev-label">Engines Deployed</div><div class="rev-num">20</div><div class="rev-sub">Production ready</div></div>
    </div>
    <div class="universe-row" style="margin-top:36px">
      <div class="u-cell">
        <div class="u-id">HIC</div>
        <div class="u-name">Empire-1</div>
        <div class="u-role">Hybrid Intelligence Core</div>
        <div class="u-bar" style="background:var(--pink)"></div>
      </div>
      <div class="u-cell" style="opacity:0.4">
        <div class="u-id">U0</div>
        <div class="u-name">SLA-113</div>
        <div class="u-role">Control Plane · Private</div>
        <div class="u-bar" style="background:var(--purple)"></div>
      </div>
      <div class="u-cell">
        <div class="u-id">U1</div>
        <div class="u-name">Lyrica 3</div>
        <div class="u-role">AI Music Studio</div>
        <div class="u-bar" style="background:var(--pink)"></div>
      </div>
      <div class="u-cell">
        <div class="u-id">U2</div>
        <div class="u-name">Cultura Vibe</div>
        <div class="u-role">Cultural OS</div>
        <div class="u-bar" style="background:#ff6b35"></div>
      </div>
      <div class="u-cell">
        <div class="u-id">U3</div>
        <div class="u-name">Southern</div>
        <div class="u-role">Lifestyle Engine</div>
        <div class="u-bar" style="background:var(--gold)"></div>
      </div>
      <div class="u-cell">
        <div class="u-id">U4</div>
        <div class="u-name">Soulfire</div>
        <div class="u-role">Ecosystem OS</div>
        <div class="u-bar" style="background:var(--pink)"></div>
      </div>
      <div class="u-cell">
        <div class="u-id">U5</div>
        <div class="u-name">Archisynapse</div>
        <div class="u-role">Payment Ledger</div>
        <div class="u-bar" style="background:var(--gold)"></div>
      </div>
    </div>
  </div>
</section>

<!-- PLATFORM FEATURES -->
<section class="section" id="platform" style="padding-top:0">
  <div class="container">
    <div class="section-label">The Platform</div>
    <h2 class="section-title">Everything a sovereign AI business needs</h2>
    <p class="section-desc">20 engines, pipeline composer, revenue command, multi-tenant auth, and a control plane. All built with Emergent DNA.</p>
    <div class="mega-grid">
      <div class="mega-card">
        <span class="card-badge badge-core">20 Engines Live</span>
        <h3>Engine Dashboard</h3>
        <p>Browse, test, and deploy 20 production AI engines. Each one has its own API endpoint, test interface, and execution tracking.</p>
        <ul>
          <li>Strategy, Analysis, Plan Builder engines</li>
          <li>Persona, Anime Character/Lore/Story engines</li>
          <li>Art Direction, Money Pipeline, Pricing engines</li>
          <li>Execution Engine — routes pipelines across universes</li>
        </ul>
        <div class="card-visual">
          <span class="engine-tag">POST /strategy</span>
          <span class="engine-tag">POST /analyze</span>
          <span class="engine-tag">POST /execute</span>
          <span class="engine-tag">POST /pipeline/compose</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-live">Pipeline Composer</span>
        <h3>Chain engines into workflows</h3>
        <p>Drag-and-drop engine chaining. Build multi-step AI workflows. The Execution Engine routes pipelines to the right universe.</p>
        <ul>
          <li>Visual pipeline builder — click to add engines</li>
          <li>Initial input → engine chain → composed output</li>
          <li>Save & load pipeline presets</li>
          <li>Cross-universe routing via Execution Engine</li>
        </ul>
        <div class="card-visual">
          <span class="engine-tag">Strategy → Plan → Execution → Lyrica3</span>
        </div>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-revenue">Revenue Command</span>
        <h3>Real MRR. Real operators. Real-time.</h3>
        <p>Live revenue tracking across all 6 universes. Per-operator analytics. The architecture pays for itself.</p>
        <ul>
          <li>MRR by universe — live dashboards</li>
          <li>Operator growth & cohort tracking</li>
          <li>6-month revenue projections</li>
          <li>Per-universe profitability</li>
        </ul>
      </div>
      <div class="mega-card full">
        <span class="card-badge badge-api">Revenue Breakdown</span>
        <h3>$78K MRR across 6 universes</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:16px">
          <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:16px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;margin-bottom:4px">FEDERAL CONTROL PLANE</div>
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--pink)">$24.8K</div>
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

<!-- ENGINE WALL -->
<section class="section" id="engines">
  <div class="container">
    <div class="section-label">Engine Registry</div>
    <h2 class="section-title">20 production engines. 265+ in the vault.</h2>
    <p class="section-desc">Every engine is a capability in the Emergent DNA architecture. Browse the registry.</p>
    <div class="engine-wall">
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Hybrid Intelligence Core</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Routing Engine</div>
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
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Omni Agent Runtime</div>
      <div class="engine-pill"><span class="ed" style="background:var(--pink)"></span>Identity Firewall</div>
      <div class="engine-pill"><span class="ed" style="background:var(--gold)"></span>Arcade Controller</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Cultura Forge</div>
      <div class="engine-pill"><span class="ed" style="background:#ff6b35"></span>Heritage Logic</div>
      <div class="engine-pill"><span class="ed" style="background:var(--purple)"></span>Black Box Vault</div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section" id="pricing">
  <div class="container">
    <div class="section-label">Pricing</div>
    <h2 class="section-title">Adopt the DNA at any scale.</h2>
    <p class="section-desc">From methodology license to platform licensing. Pick your entry point into architectural sovereignty.</p>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="tier-name">Methodology</div>
        <div class="price">$5K<small>/yr</small></div>
        <div class="price-desc">Learn the 7-layer decomposition model. Templates, decision trees, quarterly office hours.</div>
        <ul>
          <li>Video course (4 hours)</li>
          <li>Workbooks + templates</li>
          <li>Decision tree framework</li>
          <li>Quarterly office hours</li>
          <li>Community access</li>
        </ul>
        <a href="mailto:manda@empire1.cloud" class="btn-primary">License the DNA</a>
      </div>
      <div class="price-card">
        <div class="tier-name">Consulting</div>
        <div class="price">$10K<small>/project</small></div>
        <div class="price-desc">3-week engagement. We map the Emergent DNA to your specific problem and deliver a blueprint.</div>
        <ul>
          <li>Discovery week</li>
          <li>Architecture blueprint</li>
          <li>Implementation guide</li>
          <li>Leverage point analysis</li>
          <li>30-day follow-up</li>
        </ul>
        <a href="mailto:manda@empire1.cloud" class="btn-primary">Book a Call</a>
      </div>
      <div class="price-card pop">
        <div class="tier-name">Done-for-You</div>
        <div class="price">$100K<small>/engagement</small></div>
        <div class="price-desc">8-12 weeks. We design, build, and launch your platform. MVP in a quarter.</div>
        <ul>
          <li>Full architecture design</li>
          <li>System decomposition</li>
          <li>MVP buildout</li>
          <li>Engine development</li>
          <li>Deployment + monitoring</li>
          <li>Team knowledge transfer</li>
        </ul>
        <a href="mailto:manda@empire1.cloud" class="btn-primary">Build Your Empire</a>
      </div>
      <div class="price-card">
        <div class="tier-name">Platform License</div>
        <div class="price">25%<small> rev share</small></div>
        <div class="price-desc">White-label the HIC. Your brand, your domain, your customers. We handle the architecture.</div>
        <ul>
          <li>Full HIC white-label</li>
          <li>Custom engine configuration</li>
          <li>Private SLA-113 control plane for your team</li>
          <li>Unlimited scaling</li>
          <li>Revenue share model</li>
          <li>Direct engineering line</li>
        </ul>
        <a href="mailto:manda@empire1.cloud" class="btn-primary">License the Platform</a>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta">
  <div class="container">
    <h2>Why 99% of AI products fail.<br><span style="color:var(--pink)">Bad architecture.</span></h2>
    <p>We don't build features. We architect empires. The DNA is your moat. Once you own it, you own the market for systems architecture at scale.</p>
    <div class="hero-ctas" style="justify-content:center">
      <a href="mailto:manda@empire1.cloud" class="btn-primary">Talk to the Architect →</a>
      <a href="#engines" class="btn-secondary">See the Engine Registry</a>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p>EMERGENT DNA · HYBRID INTELLIGENCE CORE · 6 UNIVERSES · 20 ENGINES · $936K ARR</p>
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
