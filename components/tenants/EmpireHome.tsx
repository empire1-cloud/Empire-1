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

/* STATS BAR */
.stats-bar{display:flex;gap:48px;margin-top:56px;padding-top:36px;border-top:1px solid var(--card-border)}
.stat-item .stat-num{font-family:var(--mono);font-size:32px;font-weight:700;color:#fff}
.stat-item .stat-num span{color:var(--pink)}
.stat-item .stat-label{font-size:12px;color:var(--text-dim);margin-top:2px;letter-spacing:.5px}

/* PROOF BAR */
.proof-bar{padding:48px 0;border-bottom:1px solid var(--card-border)}
.proof-bar .container{display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap}
.proof-chip{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:1px;color:var(--text-dim);white-space:nowrap}
.proof-chip .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* MEGA CARDS */
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

/* HOW IT WORKS */
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:28px;margin-top:48px;counter-reset:step}
.step{position:relative}
.step::before{counter-increment:step;content:counter(step,decimal-leading-zero);font-family:var(--mono);font-size:44px;font-weight:700;color:rgba(255,20,147,.12);line-height:1;margin-bottom:14px;display:block}
.step h3{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px}
.step p{font-size:13px;color:var(--text-dim);line-height:1.7}

/* PRICING GRID */
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.price-card{background:var(--card);border:1px solid var(--card-border);border-radius:14px;padding:32px;transition:all .3s;position:relative}
.price-card.pop{border-color:var(--pink-border);box-shadow:0 0 50px rgba(255,20,147,.06)}
.price-card.pop::before{content:'RECOMMENDED';position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:9px;letter-spacing:2px;padding:4px 14px;background:linear-gradient(135deg,var(--pink),var(--purple));color:#fff;border-radius:4px;font-weight:700}
.price-card .tier-name{font-family:var(--mono);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:14px}
.price-card .price{font-size:40px;font-weight:900;color:#fff;line-height:1}
.price-card .price small{font-size:14px;font-weight:400;color:var(--text-dim)}
.price-card .price-desc{font-size:13px;color:var(--text-dim);margin:14px 0 20px;line-height:1.5}
.price-card ul{list-style:none;margin-bottom:24px}
.price-card ul li{font-size:12px;padding:5px 0;color:var(--text-dim);display:flex;align-items:center;gap:6px}
.price-card ul li::before{content:'✓';color:var(--pink);font-size:11px;font-weight:700}
.price-card .btn-primary{width:100%;text-align:center;font-size:12px;padding:12px}

/* ENTERPRISE TIERS */
.enterprise-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:48px;border-radius:14px;overflow:hidden}
.ent-cell{background:var(--card);padding:36px 24px;text-align:center;transition:all .3s}
.ent-cell:hover{background:var(--card-hover)}
.ent-cell .ent-tier{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--pink);margin-bottom:10px}
.ent-cell .ent-price{font-size:28px;font-weight:900;color:#fff}
.ent-cell .ent-sub{font-size:11px;color:var(--text-dim);margin:6px 0 16px}
.ent-cell .ent-name{font-size:15px;font-weight:700;color:#fff;margin-bottom:8px}
.ent-cell .ent-desc{font-size:12px;color:var(--text-dim);line-height:1.6}

/* ICON ROW */
.icon-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.tag{font-family:var(--mono);font-size:11px;padding:6px 14px;background:rgba(255,255,255,.04);border:1px solid var(--card-border);border-radius:6px;color:var(--text-dim);transition:all .2s}
.tag:hover{border-color:var(--pink-border);color:var(--pink)}

/* AUDIENCE CARDS */
.audience-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.audience-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:24px;text-align:center;transition:all .3s}
.audience-card:hover{border-color:var(--pink-border);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.audience-card .audience-icon{font-size:28px;margin-bottom:10px}
.audience-card h3{font-size:15px;font-weight:700;color:#fff;margin-bottom:6px}
.audience-card p{font-size:12px;color:var(--text-dim);line-height:1.5}

/* HIC CAPABILITIES */
.hic-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:36px}
.hic-item{background:var(--card);border:1px solid var(--card-border);border-radius:10px;padding:20px;text-align:center;transition:all .3s}
.hic-item:hover{border-color:var(--pink-border)}
.hic-item .hic-label{font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--pink);margin-bottom:6px}
.hic-item .hic-desc{font-size:12px;color:var(--text-dim);line-height:1.5}

/* CTA */
.final-cta{text-align:center;padding:120px 0}
.final-cta h2{font-size:clamp(32px,5vw,52px);font-weight:900;color:#fff;margin-bottom:20px;line-height:1.1}
.final-cta p{font-size:17px;color:var(--text-dim);margin-bottom:40px;max-width:520px;margin-left:auto;margin-right:auto}
.final-cta .hero-ctas{justify-content:center}

/* FOOTER */
footer{padding:48px 0;border-top:1px solid var(--card-border)}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
.footer-brand p{font-size:12px;color:var(--text-dim);line-height:1.7;margin-top:8px}
.footer-col h4{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:#fff;margin-bottom:14px}
.footer-col a{display:block;font-size:12px;color:var(--text-dim);margin-bottom:8px;transition:color .2s}
.footer-col a:hover{color:var(--pink)}
.footer-bottom{margin-top:36px;padding-top:24px;border-top:1px solid var(--card-border);text-align:center}
.footer-bottom p{font-family:var(--mono);font-size:11px;color:#444;letter-spacing:1px}

/* RESPONSIVE */
@media(max-width:900px){
  .mega-grid{grid-template-columns:1fr}
  .mega-card.full{grid-column:span 1}
  .pricing-grid{grid-template-columns:1fr}
  .enterprise-grid{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr;gap:20px}
  .audience-grid{grid-template-columns:1fr 1fr}
  .hic-grid{grid-template-columns:1fr 1fr}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:600px){
  .stats-bar{flex-direction:column;gap:16px}
  .nav-links{display:none}
  .pricing-grid{grid-template-columns:1fr}
  .enterprise-grid{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr}
  .audience-grid{grid-template-columns:1fr}
  .hic-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .section{padding:60px 0}
}
`;

const LANDING_HTML = `

<!-- NAV -->
<nav>
  <div class="container">
    <div class="nav-brand"><span class="nav-dot"></span>EMPIRE REVENUE OS</div>
    <div class="nav-links">
      <a href="/try-revenue-os">Try Revenue OS</a>
      <a href="/revenue-os">Revenue OS</a>
      <a href="/revenue-receipt">Receipt</a>
      <a href="#pricing">Pricing</a>
      <a href="#hic">HIC</a>
      <a href="/try-revenue-os" class="nav-cta">TRY THE DEMO →</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-eyebrow"><span class="pulse"></span> EMPIRE REVENUE OS · PUBLIC DEMO</div>
      <h1>Turn your business into a<br><em>revenue system by Monday.</em></h1>
      <p class="hero-sub">Empire Revenue OS generates your paid offer, buyer list, GTM signals, outreach campaign, payment path, and delivery receipt from one prompt. Public demo available. No admin access required.</p>
      <div class="hero-ctas">
        <a href="/try-revenue-os" class="btn-primary">Try Empire Revenue OS →</a>
        <a href="/revenue-receipt" class="btn-secondary">Generate Revenue Receipt</a>
        <a href="/revenue-os" style="font-family:var(--mono);font-size:12px;padding:14px 16px;color:var(--text-dim);transition:color .2s">Revenue OS Cockpit →</a>
      </div>
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-num">3</div><div class="stat-label">Priced offers</div></div>
        <div class="stat-item"><div class="stat-num">25</div><div class="stat-label">Buyer profiles</div></div>
        <div class="stat-item"><div class="stat-num">✓</div><div class="stat-label">GTM scores + signals</div></div>
        <div class="stat-item"><div class="stat-num">✓</div><div class="stat-label">Cold DMs + emails</div></div>
        <div class="stat-item"><div class="stat-num">10</div><div class="stat-label">Pipeline stages</div></div>
        <div class="stat-item"><div class="stat-num">✓</div><div class="stat-label">Checkout + delivery</div></div>
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
    <div class="proof-chip"><span class="dot" style="background:var(--gold)"></span>GTM buyer scoring</div>
  </div>
</div>

<!-- WHAT REVENUE OS GENERATES -->
<section class="section" id="what-it-generates">
  <div class="container">
    <div class="section-label">What Revenue OS generates</div>
    <h2 class="section-title">From one prompt to a sellable revenue system.</h2>
    <p class="section-desc">Enter a business, repo, creator brand, or agency offer. Empire outputs everything you need to go from zero to paid customer.</p>
    <div class="mega-grid">
      <div class="mega-card">
        <span class="card-badge badge-revenue">OFFER LADDER</span>
        <h3>Paid Offer Ladder</h3>
        <p>Generate starter, core, and sprint offers with clear pricing and delivery scope based on your existing product or service.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-live">BUYER PROFILES</span>
        <h3>Buyer Profiles</h3>
        <p>Identify target buyer personas, their pain points, and which offer fits each segment. Personas only — no real contact data.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-core">GTM INTELLIGENCE</span>
        <h3>GTM Intelligence</h3>
        <p>Score buyers by ICP fit, detect why-now signals, assign buyer tiers, and recommend campaign actions targeting the highest-value prospects first.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-live">OUTREACH COPY</span>
        <h3>Outreach Copy</h3>
        <p>Create cold DMs, emails, follow-ups, objection replies, and close messages ready to copy and send. No email sending — copy-paste only.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-api">PAYMENT PATH</span>
        <h3>Payment Path</h3>
        <p>Stripe checkout when configured, or manual payment fallback with clear instructions for MVP selling. No subscription billing yet.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-revenue">DELIVERY RECEIPT</span>
        <h3>Delivery Receipt</h3>
        <p>Produce a customer-facing proof artifact after the work is delivered. Includes delivered assets, next 7 days, and upsell recommendation.</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:36px">
      <a href="/try-revenue-os" class="btn-primary">Try the public demo →</a>
    </div>
  </div>
</section>

<!-- START HERE PRICING -->
<section class="section" id="pricing">
  <div class="container">
    <div class="section-label">Start here</div>
    <h2 class="section-title">Try the product first, then scale.</h2>
    <p class="section-desc">You do not need to start with enterprise adoption. Try the public demo, upgrade to a Revenue Receipt or Sprint, and expand when the system pays for itself.</p>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="tier-name">Free Demo</div>
        <div class="price">Free</div>
        <div class="price-desc">Try the public Revenue OS flow. Use the demo payload or enter your own business to see what a revenue system looks like.</div>
        <ul>
          <li>Full Revenue OS output</li>
          <li>3 priced offers</li>
          <li>25 buyer profiles</li>
          <li>Cold DMs + email copy</li>
          <li>GTM intelligence preview</li>
          <li>72-hour action plan</li>
        </ul>
        <a href="/try-revenue-os" class="btn-primary">Try Empire Revenue OS →</a>
      </div>
      <div class="price-card pop">
        <div class="tier-name">Revenue Receipt</div>
        <div class="price">$299</div>
        <div class="price-desc">One generated revenue system: paid offers, buyer profiles, GTM signals, outreach copy, payment path, and delivery receipt. The goal is to help you close one customer.</div>
        <ul>
          <li>Everything in Free Demo</li>
          <li>Full offer ladder</li>
          <li>GTM layer scoring</li>
          <li>Campaign sequence</li>
          <li>Checkout integration</li>
          <li>Delivery receipt</li>
        </ul>
        <a href="/revenue-receipt" class="btn-primary">Generate Receipt →</a>
      </div>
      <div class="price-card">
        <div class="tier-name">Revenue Sprint</div>
        <div class="price">$999</div>
        <div class="price-desc">A deeper done-with-you sprint to refine the offer, GTM sequence, lead pipeline, and delivery receipt. Designed to help you launch revenue motion faster.</div>
        <ul>
          <li>Everything in Revenue Receipt</li>
          <li>Custom offer refinement</li>
          <li>GTM sequence setup</li>
          <li>Lead pipeline configuration</li>
          <li>Delivery receipt customization</li>
          <li>Follow-up session</li>
        </ul>
        <a href="mailto:manda@empire1.cloud" class="btn-primary">Book Revenue Sprint</a>
      </div>
    </div>
    <p style="text-align:center;font-size:13px;color:var(--text-dim);margin-top:24px">If a $299 Revenue Receipt helps you close one $500–$1,000 customer, it can pay for itself.</p>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section" id="how-it-works">
  <div class="container">
    <div class="section-label">How it works</div>
    <h2 class="section-title">From input to revenue in minutes.</h2>
    <p class="section-desc">No setup, no admin access, no onboarding call. Enter your business and get a complete revenue system.</p>
    <div class="steps">
      <div class="step">
        <h3>Enter your business</h3>
        <p>Fill in your offer, target customer, and revenue goal. Or click "Use Demo Payload" to see it in action immediately.</p>
      </div>
      <div class="step">
        <h3>Revenue OS generates</h3>
        <p>The system outputs your offer ladder, buyer profiles, outreach copy, payment path, and delivery receipt — all from one prompt.</p>
      </div>
      <div class="step">
        <h3>GTM scores buyers</h3>
        <p>Buyers are scored by ICP fit, tiered by priority, and matched with why-now signals. The campaign is built for the highest-value targets first.</p>
      </div>
      <div class="step">
        <h3>Copy or save</h3>
        <p>Copy cold DMs and emails directly from the result. Save your lead info to keep the output for later reference.</p>
      </div>
      <div class="step">
        <h3>Collect payment</h3>
        <p>Use Stripe checkout when configured, or follow the manual payment instructions. Mark paid and deliver the receipt as proof of work.</p>
      </div>
    </div>
  </div>
</section>

<!-- WHO IT IS FOR -->
<section class="section" id="audience">
  <div class="container">
    <div class="section-label">Who it is for</div>
    <h2 class="section-title">Built for operators who need revenue motion now.</h2>
    <p class="section-desc">Revenue OS is designed for people who already have something to sell and need a complete system to get paid this week.</p>
    <div class="audience-grid">
      <div class="audience-card">
        <div class="audience-icon">👤</div>
        <h3>Solo founders</h3>
        <p>One-person operations who need a complete revenue system without hiring a sales team.</p>
      </div>
      <div class="audience-card">
        <div class="audience-icon">🏢</div>
        <h3>Small agencies</h3>
        <p>Agency owners who want to package and sell their services with clear offers and outreach.</p>
      </div>
      <div class="audience-card">
        <div class="audience-icon">🎨</div>
        <h3>Creator brands</h3>
        <p>Creators with an audience who need a sellable offer and a path to convert followers into customers.</p>
      </div>
      <div class="audience-card">
        <div class="audience-icon">📍</div>
        <h3>Local service businesses</h3>
        <p>Electricians, cleaners, landscapers who want to stop relying on word-of-mouth and build a sales pipeline.</p>
      </div>
      <div class="audience-card">
        <div class="audience-icon">💻</div>
        <h3>Indie SaaS builders</h3>
        <p>Developers with a product who need buyer profiles, GTM signals, and outreach copy to get first customers.</p>
      </div>
      <div class="audience-card">
        <div class="audience-icon">⚡</div>
        <h3>Operators with no GTM</h3>
        <p>Anyone who has a repo, product, or service but no revenue motion. Revenue OS builds the motion for you.</p>
      </div>
    </div>
    <div style="margin-top:32px;padding:20px;background:rgba(255,20,147,.04);border:1px solid var(--pink-border);border-radius:10px;text-align:center">
      <p style="font-size:13px;color:var(--text-dim)"><strong style="color:var(--pink)">Not for:</strong> People who only want free consulting, have no offer, no urgency, no buying authority, or no ability to deliver.</p>
    </div>
  </div>
</section>

<!-- GTM LAYER -->
<section class="section" id="gtm">
  <div class="container">
    <div class="section-label">GTM Layer</div>
    <h2 class="section-title">Targeting brain inside Revenue OS.</h2>
    <p class="section-desc">Revenue OS does not just generate copy. It decides who to target first, why now, and what sequence to send.</p>
    <div class="mega-grid">
      <div class="mega-card">
        <span class="card-badge badge-core">ICP SCORING</span>
        <h3>ICP Fit Scoring</h3>
        <p>Each buyer profile is scored on a 70-point ICP fit model covering buyer fit, urgency fit, budget/pain fit, and delivery fit — plus a 30-point signal score for a total of 100.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-live">BUYER TIERS</span>
        <h3>Buyer Tiers</h3>
        <p>Buyers are ranked into 5 tiers: Tier 1 (80–100), Tier 2 (60–79), Tier 3 (40–59), Monitor (20–39), and Exclude (0–19). The campaign targets the highest-value prospects first.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-revenue">WHY-NOW SIGNALS</span>
        <h3>Why-Now Signals</h3>
        <p>Detect signals that indicate a buyer is ready to act: new founder launch, funding round, revenue plateau, competitor move, regulatory change, or seasonal peak.</p>
      </div>
      <div class="mega-card">
        <span class="card-badge badge-api">SEQUENCE ENGINE</span>
        <h3>Signal-to-Sequence Logic</h3>
        <p>Each signal maps to a recommended sequence type — personalized, educational, case-study, or event-triggered. The campaign plan is generated from the highest-priority signals.</p>
      </div>
      <div class="mega-card full">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
          <div>
            <h3>What comes out</h3>
            <ul>
              <li>Scored buyer profiles with ICP + signal breakdown</li>
              <li>Buyer tier assignment per profile</li>
              <li>Detected why-now signals with priority levels</li>
              <li>Recommended campaign with sequences and steps</li>
              <li>Weekly GTM update plan</li>
              <li>Next actions prioritized by impact</li>
            </ul>
          </div>
          <div>
            <h3>Scoring model</h3>
            <p style="font-size:13px;color:var(--text-dim);line-height:1.8"><strong style="color:#fff">ICP fit: 70 points</strong><br>Buyer fit: 25 · Urgency fit: 20<br>Budget/pain fit: 15 · Delivery fit: 10<br><strong style="color:#fff">Signal score: 30 points</strong><br>Strength + timing + relevance<br><strong style="color:#fff">Total: 100 points</strong><br>5 tiers from Tier 1 to Exclude</p>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:36px">
      <a href="/try-revenue-os" class="btn-primary">Try the GTM-powered demo →</a>
    </div>
  </div>
</section>

<!-- POWERED BY HIC -->
<section class="section" id="hic">
  <div class="container">
    <div class="section-label">Powered by Hybrid Intelligence Core</div>
    <h2 class="section-title">The engine underneath Revenue OS.</h2>
    <p class="section-desc">Hybrid Intelligence Core is the multi-engine orchestration layer that powers Revenue OS: routing, pipelines, GTM intelligence, billing, and execution logging.</p>
    <div class="hic-grid">
      <div class="hic-item"><div class="hic-label">ROUTING</div><div class="hic-desc">Multi-engine router dispatches each Revenue OS task to the appropriate capability — offer generation, buyer scoring, outreach writing, pipeline modeling.</div></div>
      <div class="hic-item"><div class="hic-label">MONEY PIPELINE</div><div class="hic-desc">Revenue pipeline generator structures offers, pricing, pipeline stages, and checkout recommendations into a sellable workflow.</div></div>
      <div class="hic-item"><div class="hic-label">PIPELINE COMPOSER</div><div class="hic-desc">Chains engines into multi-step workflows. Revenue OS commands are composed pipelines — not one monolithic call.</div></div>
      <div class="hic-item"><div class="hic-label">GTM LAYER</div><div class="hic-desc">ICP scoring, buyer tiering, signal detection, and campaign sequencing that turns buyer profiles into targeted outreach.</div></div>
      <div class="hic-item"><div class="hic-label">EXECUTION LOGGER</div><div class="hic-desc">Every Revenue OS command run is logged with engine path, status, and input/output data for audit and analytics.</div></div>
      <div class="hic-item"><div class="hic-label">API / KEY INFRA</div><div class="hic-desc">REST API layer with key management, usage tracking, and rate limiting powers both the Revenue OS endpoints and the public try flow.</div></div>
      <div class="hic-item"><div class="hic-label">BILLING / CHECKOUT</div><div class="hic-desc">Stripe integration when configured, manual payment fallback when not. The checkout desk routes through the existing billing router.</div></div>
      <div class="hic-item"><div class="hic-label">REVENUE COMMANDS</div><div class="hic-desc">The Revenue OS command center is a unified interface that chains all HIC capabilities into one prompt-to-receipt workflow.</div></div>
    </div>
  </div>
</section>

<!-- IMPLEMENTATION / ENTERPRISE -->
<section class="section" id="enterprise">
  <div class="container">
    <div class="section-label">Implementation & Enterprise</div>
    <h2 class="section-title">Scale into custom infrastructure.</h2>
    <p class="section-desc">The $299 Revenue Receipt is the entry product. Higher tiers are for implementation, white-label, and full Hybrid Intelligence Core adoption.</p>
    <div class="enterprise-grid">
      <div class="ent-cell">
        <div class="ent-tier">IMPLEMENTATION</div>
        <div class="ent-price">$5K+</div>
        <div class="ent-sub">/engagement</div>
        <div class="ent-name">Revenue OS Implementation</div>
        <div class="ent-desc">Customized Revenue OS installation connected to your existing workflow. Offer refinement, GTM setup, and pipeline integration.</div>
      </div>
      <div class="ent-cell" style="border:1px solid var(--pink-border)">
        <div class="ent-tier" style="color:var(--gold)">ADOPTION</div>
        <div class="ent-price">$50K+</div>
        <div class="ent-sub">/engagement</div>
        <div class="ent-name">HIC Core Adoption</div>
        <div class="ent-desc">Custom AI infrastructure with dashboards, routing, execution workflows, API access, and private HIC implementation for your team.</div>
      </div>
      <div class="ent-cell">
        <div class="ent-tier" style="color:var(--purple)">PARTNER</div>
        <div class="ent-price">25%</div>
        <div class="ent-sub">revenue share</div>
        <div class="ent-name">Platform / White-Label License</div>
        <div class="ent-desc">For partners or agencies who want to use Empire as the engine behind client delivery. Your brand, our infrastructure.</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:36px">
      <a href="mailto:manda@empire1.cloud" class="btn-secondary">Talk to the Architect</a>
    </div>
  </div>
</section>

<!-- EMPIRE ECOSYSTEM -->
<section class="section" style="padding-bottom:0">
  <div class="container">
    <div class="section-label">Empire ecosystem</div>
    <h2 class="section-title">Revenue OS is the commercial front door.</h2>
    <p class="section-desc">The broader Empire ecosystem powers specialized domains. Each one is an independent business running on the same core infrastructure.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:36px;border-radius:14px;overflow:hidden">
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">PARENT</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">SLA113</div>
        <div style="font-size:11px;color:var(--text-dim)">Parent / control plane</div>
      </div>
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">U1</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">Lyrica 3</div>
        <div style="font-size:11px;color:var(--text-dim)">Creator-owned music platform</div>
      </div>
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">U2</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">Cultura</div>
        <div style="font-size:11px;color:var(--text-dim)">Cultural intelligence OS</div>
      </div>
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">U3</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">Southern</div>
        <div style="font-size:11px;color:var(--text-dim)">White-label game/lifestyle engine</div>
      </div>
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">U4</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">Soulfire</div>
        <div style="font-size:11px;color:var(--text-dim)">Ecosystem orchestration</div>
      </div>
      <div style="background:var(--card);padding:28px 16px;text-align:center">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);margin-bottom:6px">U5</div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">Archisynapse</div>
        <div style="font-size:11px;color:var(--text-dim)">Payments / ledger infrastructure</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px">
      <p style="font-size:12px;color:var(--text-dim)">Plus: Hybrid Intelligence Core — engine / orchestration layer powering all of the above.</p>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta">
  <div class="container">
    <h2>Ready to try the revenue machine?</h2>
    <p>Start with the public demo. If it helps you see a path to one customer, upgrade into a Revenue Receipt or Sprint.</p>
    <div class="hero-ctas" style="justify-content:center">
      <a href="/try-revenue-os" class="btn-primary">Try Empire Revenue OS →</a>
      <a href="/revenue-receipt" class="btn-secondary">Generate Revenue Receipt</a>
      <a href="mailto:manda@empire1.cloud" class="btn-secondary">Talk to the Architect</a>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div style="font-family:var(--mono);font-weight:700;font-size:15px;color:#fff;letter-spacing:1px">EMPIRE REVENUE OS</div>
        <p>Revenue OS is the commercial front door. Hybrid Intelligence Core is the engine underneath. Built in El Monte, CA · SGV since day one.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <a href="/try-revenue-os">Try Revenue OS</a>
        <a href="/revenue-os">Revenue OS Cockpit</a>
        <a href="/revenue-receipt">Revenue Receipt</a>
      </div>
      <div class="footer-col">
        <h4>Ecosystem</h4>
        <a href="#hic">Hybrid Intelligence Core</a>
        <a href="#enterprise">Enterprise</a>
        <a href="#pricing">Pricing</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="mailto:manda@empire1.cloud">manda@empire1.cloud</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>EMPIRE REVENUE OS · POWERED BY HYBRID INTELLIGENCE CORE</p>
    </div>
  </div>
</footer>

`;

export default function EmpireHome() {
  useEffect(() => {
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
