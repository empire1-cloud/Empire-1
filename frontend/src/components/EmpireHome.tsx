'use client';

import React, { useEffect } from 'react';

/* ─────────────────────────────────────────────
   EMPIRE 1 — Public Landing Page
   Colors pulled directly from brand logo:
   Gold   #D4AF37 / #c9a84c
   Blue   #00BFFF
   Pink   #FF1493
   BG     #050508
───────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'Inter',system-ui,sans-serif;background:#050508;color:#e0e0e0;overflow-x:hidden}
a{color:inherit;text-decoration:none}
:root{
  --gold:#D4AF37;
  --gold-bright:#FFD700;
  --gold-dim:#8B6914;
  --blue:#00BFFF;
  --pink:#FF1493;
  --bg:#050508;
  --card:#0d0d12;
  --border:rgba(255,255,255,.07);
  --border-gold:rgba(212,175,55,.3);
  --border-pink:rgba(255,20,147,.25);
  --border-blue:rgba(0,191,255,.25);
  --text:#c8c8d0;
  --text-dim:#555;
  --mono:'JetBrains Mono',monospace;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--gold-dim);border-radius:4px}

/* ── GRID BG ── */
.grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(rgba(212,175,55,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(212,175,55,.03) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 0%,#000 40%,transparent 100%)}

/* ── NAV ── */
nav.e1-nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  height:68px;display:flex;align-items:center;
  padding:0 40px;
  background:rgba(5,5,8,.82);
  backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
}
.nav-inner{width:100%;max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
.nav-mark{display:flex;align-items:center;gap:10px;cursor:pointer}
.nav-mark svg{width:36px;height:36px;flex-shrink:0}
.nav-wordmark{font-family:var(--mono);font-size:14px;font-weight:700;letter-spacing:3px;color:#fff;text-transform:uppercase}
.nav-wordmark span{color:var(--pink)}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{font-family:var(--mono);font-size:11px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:var(--gold)}
.nav-cta{
  font-family:var(--mono);font-size:11px;letter-spacing:2px;
  padding:10px 22px;text-transform:uppercase;
  background:transparent;border:1px solid var(--gold);color:var(--gold);
  border-radius:4px;transition:all .2s;cursor:pointer
}
.nav-cta:hover{background:var(--gold);color:#000}

/* ── HERO ── */
.hero{
  position:relative;z-index:1;
  min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:100px 24px 80px;text-align:center;
  overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 900px 600px at 50% 30%,rgba(212,175,55,.055),transparent 70%),
    radial-gradient(ellipse 600px 600px at 20% 80%,rgba(0,191,255,.04),transparent 60%),
    radial-gradient(ellipse 600px 600px at 80% 80%,rgba(255,20,147,.04),transparent 60%);
}

/* ── LOGO MEDALLION (SVG animated) ── */
.logo-wrap{position:relative;display:inline-block;margin-bottom:48px}
.logo-wrap img.logo-png{width:180px;height:180px;object-fit:contain;display:block}
.logo-svg-fallback{width:180px;height:180px}
@keyframes ring-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ring-spin-rev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes glow-pulse{
  0%,100%{opacity:.6;filter:drop-shadow(0 0 12px var(--blue))}
  50%{opacity:1;filter:drop-shadow(0 0 28px var(--pink))}
}
.ring-outer{animation:ring-spin 18s linear infinite;transform-origin:center}
.ring-inner{animation:ring-spin-rev 12s linear infinite;transform-origin:center}
.logo-glow{animation:glow-pulse 3s ease-in-out infinite}
.logo-halo{
  position:absolute;inset:-20px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(212,175,55,.12) 0%,transparent 70%);
  animation:glow-pulse 3s ease-in-out infinite;
}

/* ── HERO TEXT ── */
@keyframes fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.hero-eyebrow{
  font-family:var(--mono);font-size:11px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;
  margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:10px;
  animation:fade-up .8s ease both;animation-delay:.1s;opacity:0;
}
.hero-eyebrow .live-dot{
  width:6px;height:6px;border-radius:50%;background:var(--blue);
  box-shadow:0 0 8px var(--blue);
  animation:glow-pulse 2s ease-in-out infinite;
}
.hero-h1{
  font-size:clamp(38px,6vw,76px);font-weight:900;line-height:1.04;color:#fff;
  letter-spacing:-.03em;margin-bottom:24px;
  animation:fade-up .8s ease both;animation-delay:.25s;opacity:0;
}
.hero-h1 .g{
  background:linear-gradient(135deg,var(--gold-bright) 0%,var(--gold) 40%,#c9a84c 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-h1 .p{
  background:linear-gradient(135deg,var(--pink),#c000a0);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-sub{
  font-size:clamp(16px,2vw,20px);color:var(--text);line-height:1.7;
  max-width:600px;margin:0 auto 40px;
  animation:fade-up .8s ease both;animation-delay:.4s;opacity:0;
}
.hero-ctas{
  display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  animation:fade-up .8s ease both;animation-delay:.55s;opacity:0;
}
.btn-gold{
  font-family:var(--mono);font-size:12px;letter-spacing:2px;text-transform:uppercase;
  padding:15px 36px;border-radius:5px;cursor:pointer;transition:all .25s;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold));color:#000;font-weight:700;
  border:none;display:inline-block;
}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 16px 48px rgba(212,175,55,.3)}
.btn-ghost{
  font-family:var(--mono);font-size:12px;letter-spacing:2px;text-transform:uppercase;
  padding:14px 36px;border-radius:5px;cursor:pointer;transition:all .25s;
  background:transparent;color:#fff;border:1px solid rgba(255,255,255,.15);display:inline-block;
}
.btn-ghost:hover{border-color:var(--pink);color:var(--pink)}
.btn-text{
  font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;
  padding:14px 20px;color:var(--text-dim);transition:color .2s;display:inline-block;cursor:pointer;
}
.btn-text:hover{color:var(--gold)}

/* ── LIVE STATS BAR ── */
.stats-bar{
  display:flex;gap:0;margin-top:64px;
  border:1px solid var(--border);border-radius:8px;overflow:hidden;
  animation:fade-up .8s ease both;animation-delay:.7s;opacity:0;
}
.stat-cell{
  flex:1;padding:20px 28px;position:relative;
  border-right:1px solid var(--border);
}
.stat-cell:last-child{border-right:none}
.stat-cell::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
  opacity:0;transition:opacity .3s;
}
.stat-cell:hover::before{opacity:1}
.stat-num{font-family:var(--mono);font-size:28px;font-weight:700;color:#fff;line-height:1}
.stat-num.gold{color:var(--gold)}
.stat-num.pink{color:var(--pink)}
.stat-num.blue{color:var(--blue)}
.stat-label{font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin-top:6px}

/* ── TICKER ── */
.ticker-wrap{
  overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:14px 0;background:rgba(212,175,55,.02);position:relative;z-index:1;
}
.ticker-inner{display:flex;gap:0;white-space:nowrap;animation:ticker 40s linear infinite}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{
  font-family:var(--mono);font-size:10px;letter-spacing:3px;color:var(--text-dim);
  text-transform:uppercase;padding:0 40px;
  display:flex;align-items:center;gap:12px;
}
.ticker-item .t-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0}

/* ── SECTION COMMON ── */
.section{position:relative;z-index:1;padding:100px 0}
.container{max-width:1200px;margin:0 auto;padding:0 32px}
.sec-label{
  font-family:var(--mono);font-size:10px;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;margin-bottom:16px;
  display:flex;align-items:center;gap:10px;
}
.sec-label::before{content:'';width:20px;height:1px;background:var(--gold)}
.sec-title{font-size:clamp(26px,4vw,46px);font-weight:800;color:#fff;line-height:1.1;margin-bottom:16px;letter-spacing:-.02em}
.sec-desc{font-size:16px;color:var(--text);line-height:1.7;max-width:560px}

/* ── FEATURE HERO (Revenue OS) ── */
.feature-hero{
  position:relative;overflow:hidden;
  border:1px solid var(--border-gold);border-radius:16px;
  padding:60px;margin-top:56px;
  background:linear-gradient(135deg,rgba(212,175,55,.04) 0%,rgba(5,5,8,0) 60%);
}
.feature-hero::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold),var(--pink),transparent);
}
.feature-hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.feature-label{font-family:var(--mono);font-size:10px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:12px}
.feature-title{font-size:clamp(24px,3.5vw,40px);font-weight:800;color:#fff;line-height:1.1;margin-bottom:16px}
.feature-desc{font-size:15px;color:var(--text);line-height:1.75;margin-bottom:28px}
.feature-list{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:32px}
.feature-list li{
  font-size:13px;color:var(--text);display:flex;align-items:flex-start;gap:10px;
}
.feature-list li::before{content:'→';color:var(--gold);font-family:var(--mono);flex-shrink:0;margin-top:1px}
.feature-demo-box{
  background:rgba(0,0,0,.6);border:1px solid var(--border);border-radius:10px;
  padding:28px;font-family:var(--mono);font-size:12px;
}
.demo-line{padding:6px 0;border-bottom:1px solid var(--border);color:var(--text-dim);display:flex;align-items:center;gap:8px}
.demo-line:last-child{border-bottom:none}
.demo-line .ok{color:var(--gold);font-weight:700}
.demo-line .ping{color:var(--blue)}
.demo-line .val{color:#fff;margin-left:auto}
.demo-cta{
  margin-top:20px;display:block;text-align:center;
  padding:14px;background:linear-gradient(135deg,var(--gold-bright),var(--gold));
  color:#000;font-weight:700;border-radius:6px;font-size:12px;letter-spacing:2px;
  text-transform:uppercase;transition:all .2s;cursor:pointer;
}
.demo-cta:hover{box-shadow:0 8px 32px rgba(212,175,55,.25);transform:translateY(-1px)}

/* ── ECOSYSTEM GRID ── */
.eco-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:48px}
.eco-card{
  background:var(--card);border:1px solid var(--border);border-radius:12px;
  padding:32px;position:relative;overflow:hidden;transition:all .3s;cursor:default;
}
.eco-card::after{
  content:'';position:absolute;inset:0;border-radius:12px;opacity:0;
  transition:opacity .3s;pointer-events:none;
}
.eco-card:hover{transform:translateY(-3px)}
.eco-card.c-gold::after{box-shadow:inset 0 0 0 1px var(--border-gold)}
.eco-card.c-pink::after{box-shadow:inset 0 0 0 1px var(--border-pink)}
.eco-card.c-blue::after{box-shadow:inset 0 0 0 1px var(--border-blue)}
.eco-card:hover::after{opacity:1}
.eco-card:hover.c-gold{box-shadow:0 20px 60px rgba(212,175,55,.08)}
.eco-card:hover.c-pink{box-shadow:0 20px 60px rgba(255,20,147,.08)}
.eco-card:hover.c-blue{box-shadow:0 20px 60px rgba(0,191,255,.08)}
.eco-icon{font-size:32px;margin-bottom:16px;display:block}
.eco-badge{
  font-family:var(--mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;
  padding:4px 10px;border-radius:3px;display:inline-block;margin-bottom:14px;
}
.eco-badge.gold{color:var(--gold);background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2)}
.eco-badge.pink{color:var(--pink);background:rgba(255,20,147,.08);border:1px solid rgba(255,20,147,.2)}
.eco-badge.blue{color:var(--blue);background:rgba(0,191,255,.08);border:1px solid rgba(0,191,255,.2)}
.eco-badge.green{color:#22c55e;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2)}
.eco-card h3{font-size:20px;font-weight:700;color:#fff;margin-bottom:8px}
.eco-card p{font-size:13px;color:var(--text-dim);line-height:1.65;margin-bottom:16px}
.eco-tags{display:flex;flex-wrap:wrap;gap:6px}
.eco-tag{font-family:var(--mono);font-size:9px;letter-spacing:1px;padding:4px 8px;
  background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:3px;color:var(--text-dim)}
.eco-card-link{
  display:inline-flex;align-items:center;gap:6px;margin-top:20px;
  font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;
  transition:gap .2s;
}
.eco-card-link.gold{color:var(--gold)}
.eco-card-link.pink{color:var(--pink)}
.eco-card-link.blue{color:var(--blue)}
.eco-card:hover .eco-card-link{gap:10px}

/* ── LIVE PIPELINE ── */
.pipeline-section{position:relative;z-index:1;padding:80px 0}
.pipeline-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:48px}
.pipeline-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:28px}
.pipeline-card.accent{border-color:var(--border-gold);background:rgba(212,175,55,.03)}
.pipeline-card h4{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:16px}
.product-bar{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.product-bar .p-label{font-size:12px;color:var(--text);width:160px;flex-shrink:0}
.product-bar .p-track{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px}
.product-bar .p-fill{height:100%;border-radius:2px;transition:width .6s ease}
.product-bar .p-count{font-family:var(--mono);font-size:11px;color:#fff;width:24px;text-align:right;flex-shrink:0}
.activity-feed{display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:hidden}
.activity-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.activity-item:last-child{border-bottom:none}
.a-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:4px}
.a-text{font-size:12px;color:var(--text);line-height:1.5}
.a-time{font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-top:2px}
.pipeline-stat{display:flex;align-items:baseline;gap:8px;margin-bottom:16px}
.pipeline-stat .p-num{font-family:var(--mono);font-size:32px;font-weight:700;line-height:1}
.pipeline-stat .p-label{font-size:12px;color:var(--text-dim)}
.live-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--green);text-transform:uppercase;margin-bottom:8px}
.live-badge .l-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}

/* ── HOW IT WORKS ── */
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:48px;border-radius:10px;overflow:hidden}
.how-cell{
  background:var(--card);padding:40px 32px;position:relative;
  counter-increment:step;
}
.how-cell::before{
  font-family:var(--mono);font-size:64px;font-weight:700;
  content:counter(step,decimal-leading-zero);
  color:rgba(212,175,55,.06);line-height:1;display:block;margin-bottom:16px;
}
.how-cell h3{font-size:18px;font-weight:700;color:#fff;margin-bottom:8px}
.how-cell p{font-size:13px;color:var(--text-dim);line-height:1.65}
.how-grid{counter-reset:step}

/* ── SOCIAL PROOF ── */
.proof-strip{
  display:flex;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;
  margin-top:56px;
}
.proof-cell{flex:1;padding:32px 28px;border-right:1px solid var(--border);text-align:center}
.proof-cell:last-child{border-right:none}
.proof-num{font-family:var(--mono);font-size:36px;font-weight:700;color:#fff;line-height:1;margin-bottom:6px}
.proof-num.gold{color:var(--gold)}
.proof-desc{font-size:12px;color:var(--text-dim)}

/* ── FINAL CTA ── */
.final-cta{
  position:relative;z-index:1;
  padding:120px 32px;text-align:center;overflow:hidden;
}
.final-cta::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 800px 500px at 50% 50%,rgba(212,175,55,.06),transparent 70%);
}
.cta-badge{
  font-family:var(--mono);font-size:10px;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;margin-bottom:20px;display:block;
}
.cta-title{
  font-size:clamp(32px,5vw,60px);font-weight:900;color:#fff;line-height:1.06;
  letter-spacing:-.02em;margin-bottom:20px;
}
.cta-sub{font-size:17px;color:var(--text);max-width:500px;margin:0 auto 40px;line-height:1.65}
.cta-btns{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.cta-note{
  margin-top:20px;font-family:var(--mono);font-size:10px;letter-spacing:1px;
  color:var(--text-dim);
}

/* ── FOOTER ── */
footer.e1-footer{
  position:relative;z-index:1;
  border-top:1px solid var(--border);padding:56px 0 32px;
}
.footer-inner{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:40px}
.footer-brand{display:flex;flex-direction:column;gap:12px}
.footer-brand svg{width:48px;height:48px}
.footer-brand p{font-size:12px;color:var(--text-dim);line-height:1.7;max-width:260px}
.footer-col h5{font-family:var(--mono);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:14px}
.footer-col a{display:block;font-size:12px;color:var(--text-dim);margin-bottom:8px;transition:color .2s}
.footer-col a:hover{color:var(--gold)}
.footer-bottom{
  padding-top:28px;border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
}
.footer-bottom p{font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase}
.footer-status{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase}
.footer-status .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e}

/* ── RESPONSIVE ── */
@media(max-width:960px){
  .feature-hero-inner{grid-template-columns:1fr}
  .eco-grid{grid-template-columns:1fr}
  .how-grid{grid-template-columns:1fr}
  .footer-inner{grid-template-columns:1fr 1fr}
  .proof-strip{flex-direction:column}
  .proof-cell{border-right:none;border-bottom:1px solid var(--border)}
  .proof-cell:last-child{border-bottom:none}
  nav.e1-nav{padding:0 20px}
  .nav-links{display:none}
}
@media(max-width:600px){
  .stats-bar{flex-direction:column;gap:0}
  .stat-cell{border-right:none;border-bottom:1px solid var(--border)}
  .stat-cell:last-child{border-bottom:none}
  .feature-hero{padding:32px 24px}
  .section{padding:64px 0}
  .footer-inner{grid-template-columns:1fr}
}
`;

/* ── SVG LOGO MEDALLION ── */
const LogoSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg-fallback logo-glow">
    {/* Outer glow ring */}
    <circle cx="100" cy="100" r="95" stroke="url(#ring-grad)" strokeWidth="1.5" opacity="0.6" className="ring-outer" />
    {/* Main medallion */}
    <circle cx="100" cy="100" r="88" fill="url(#medal-bg)" />
    {/* Greek-key border ring */}
    <circle cx="100" cy="100" r="88" stroke="url(#gold-ring)" strokeWidth="8" fill="none" />
    {/* Neon blue arc left */}
    <path d="M 30 100 A 70 70 0 0 1 100 30" stroke="#00BFFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" filter="url(#blue-glow)" />
    {/* Neon pink arc right */}
    <path d="M 170 100 A 70 70 0 0 1 100 170" stroke="#FF1493" strokeWidth="3" strokeLinecap="round" opacity="0.9" filter="url(#pink-glow)" />
    {/* Center symbol: angular spiral / E1 mark */}
    <g transform="translate(100,100)">
      {/* Outer square frame */}
      <rect x="-36" y="-36" width="72" height="72" rx="2" stroke="url(#sym-gold)" strokeWidth="3" fill="none" />
      {/* Inner notch top-left */}
      <polyline points="-36,-36 -18,-36 -18,-18 -36,-18" stroke="url(#sym-gold)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* Angular spiral center */}
      <polyline points="-24,24 -24,-24 24,-24 24,24 -10,24 -10,-10 10,-10 10,10" stroke="url(#sym-gold)" strokeWidth="3.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* Bolt accent top-right */}
      <polyline points="18,-36 36,-20 24,-8" stroke="url(#sym-gold)" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </g>
    {/* Circuit dots on ring */}
    {[0,45,90,135,180,225,270,315].map((a,i) => (
      <circle
        key={i}
        cx={100 + 88 * Math.cos((a - 90) * Math.PI / 180)}
        cy={100 + 88 * Math.sin((a - 90) * Math.PI / 180)}
        r="2.5"
        fill="#D4AF37"
        opacity="0.6"
      />
    ))}
    <defs>
      <radialGradient id="medal-bg" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#050508" />
      </radialGradient>
      <linearGradient id="gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8B6914" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BFFF" />
        <stop offset="100%" stopColor="#FF1493" />
      </linearGradient>
      <linearGradient id="sym-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#D4AF37" />
      </linearGradient>
      <filter id="blue-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="pink-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

/* ── MINI LOGO MARK (nav) ── */
const NavMark = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="url(#nm-gold)" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="14" fill="rgba(212,175,55,0.06)" />
    <g transform="translate(20,20)">
      <rect x="-7" y="-7" width="14" height="14" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
      <polyline points="-5,5 -5,-5 5,-5 5,5 -1,5 -1,-1 3,-1" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </g>
    <path d="M 6 20 A 14 14 0 0 1 20 6" stroke="#00BFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    <path d="M 34 20 A 14 14 0 0 1 20 34" stroke="#FF1493" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    <defs>
      <linearGradient id="nm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8B6914" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </svg>
);

const TICKER_ITEMS = [
  'Revenue OS','GTM Intelligence','Buyer Scoring','Offer Ladder','Outreach Desk',
  'Lead Pipeline','Stripe Checkout','Delivery Receipt','Game Studio','Vision Engine',
  'Logic Engine','Audio Forge','Compliance Layer','Music Production','Cultural Intelligence',
  'Hybrid Intelligence Core','Sovereign Operator OS','Creator IP Ownership',
];

const PRODUCT_LABELS: Record<string, { label: string; color: string }> = {
  revenue_receipt:    { label: 'Revenue Receipt',     color: '#D4AF37' },
  revenue_sprint:     { label: 'Revenue Sprint',      color: '#FF8C00' },
  revenue_enterprise: { label: 'Enterprise Impl.',    color: '#FF6600' },
  southern_build:     { label: 'Southern Build',      color: '#C41E3A' },
  game_studio:        { label: 'Game Studio Build',   color: '#00BFFF' },
  sonance_music:      { label: 'Sonance / Music',     color: '#a855f7' },
  free_demo:          { label: 'Free Demo Lead',      color: '#22c55e' },
};

const ACTIVITY_TEMPLATES = [
  { product: 'revenue_receipt', stage: 'proposal',    text: 'Founder requested a Revenue Receipt for their agency offer' },
  { product: 'revenue_sprint',  stage: 'qualified',   text: 'Solo operator qualified for a Revenue Sprint — $999' },
  { product: 'southern_build',  stage: 'lead',        text: 'Car club requested a custom build concept from El Monte' },
  { product: 'free_demo',       stage: 'lead',        text: 'New demo run — AI website + automation offer' },
  { product: 'revenue_receipt', stage: 'active',      text: 'Revenue Receipt delivered — $299 closed' },
  { product: 'game_studio',     stage: 'qualified',   text: 'Studio operator inquired about a custom arcade build' },
  { product: 'southern_build',  stage: 'proposal',    text: 'Barbershop concept drafted — Community tier' },
  { product: 'revenue_sprint',  stage: 'active',      text: 'Revenue Sprint completed — offer + GTM sequence shipped' },
];

export default function EmpireHome() {
  const [lcEmail, setLcEmail] = React.useState('');
  const [lcProduct, setLcProduct] = React.useState('revenue_receipt');
  const [lcStatus, setLcStatus] = React.useState<'idle'|'sending'|'done'|'err'>('idle');

  // CRM pipeline state
  const [crmMetrics, setCrmMetrics] = React.useState<any>(null);
  const [crmLeads, setCrmLeads]     = React.useState<any[]>([]);
  const [crmLoaded, setCrmLoaded]   = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/crm/metrics').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/crm/pipeline').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([m, p]) => {
      if (m?.success) setCrmMetrics(m.metrics);
      if (p?.success) setCrmLeads(p.leads || []);
      setCrmLoaded(true);
    });
  }, []);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!lcEmail.trim()) return;
    setLcStatus('sending');
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lcEmail.split('@')[0],
          email: lcEmail,
          source: 'empire1_landing',
          notes: `Interested in: ${lcProduct}`,
        }),
      });
      // set lane + value after creation
      setLcStatus('done');
      setLcEmail('');
    } catch {
      setLcStatus('err');
    }
  }

  useEffect(() => {
    // Intercept anchor clicks for smooth nav
    const handler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      document.querySelector(a.getAttribute('href')!)?.scrollIntoView({ behavior: 'smooth' });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="grid-bg" />

      {/* ── NAV ── */}
      <nav className="e1-nav">
        <div className="nav-inner">
          <a href="/" className="nav-mark">
            <NavMark />
            <span className="nav-wordmark">EMPIRE <span>1</span></span>
          </a>
          <div className="nav-links">
            <a href="/try-revenue-os">Revenue OS</a>
            <a href="/revenue-receipt">Receipt</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#pricing">Pricing</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/try-revenue-os" className="nav-cta">Try Free →</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="logo-wrap">
          <div className="logo-halo" />
          {/* Try real PNG first, fallback to SVG */}
          <picture>
            <source srcSet="/empire1-logo.png" type="image/png" />
            <LogoSVG />
          </picture>
        </div>

        <div className="hero-eyebrow">
          <span className="live-dot" />
          Empire 1 · AI Ecosystem · Live
        </div>

        <h1 className="hero-h1">
          <span className="g">Build your revenue.</span>
          <br />
          <span className="p">Ship your product.</span>
          <br />
          Own your culture.
        </h1>

        <p className="hero-sub">
          Empire 1 is the platform for founders, operators, and builders who want AI-powered
          revenue systems, game studios, music production, and cultural intelligence — in one place.
        </p>

        <div className="hero-ctas">
          <a href="/try-revenue-os" className="btn-gold">Try Revenue OS Free →</a>
          <a href="#ecosystem" className="btn-ghost">See the Ecosystem</a>
          <a href="/revenue-receipt" className="btn-text">Generate Receipt ↓</a>
        </div>

        <div className="stats-bar" style={{ maxWidth: 860 }}>
          {[
            { num: '3', label: 'Priced Offers', cls: 'gold' },
            { num: '25', label: 'Buyer Profiles', cls: '' },
            { num: '10', label: 'Pipeline Stages', cls: '' },
            { num: '100', label: 'ICP Score Model', cls: 'blue' },
            { num: '$0', label: 'To Try Demo', cls: 'pink' },
            { num: '✓', label: 'Delivery Receipt', cls: 'gold' },
          ].map((s) => (
            <div key={s.label} className="stat-cell" style={{ textAlign: 'center' }}>
              <div className={`stat-num ${s.cls}`}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {tickerDouble.map((item, i) => (
            <div key={i} className="ticker-item">
              <span className="t-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── REVENUE OS FEATURE ── */}
      <section className="section" id="revenue-os">
        <div className="container">
          <div className="sec-label">Main Product</div>
          <h2 className="sec-title">Turn your business into a revenue system.</h2>
          <p className="sec-desc">
            One prompt. Full output: paid offers, buyer profiles, GTM signals, outreach copy,
            checkout path, and delivery receipt. No login required to try.
          </p>

          <div className="feature-hero">
            <div className="feature-hero-inner">
              <div>
                <div className="feature-label">Empire Revenue OS</div>
                <h3 className="feature-title">From zero to sellable<br />by Monday.</h3>
                <p className="feature-desc">
                  Enter your business, offer, and revenue goal. Empire Revenue OS generates
                  everything you need to close your first customer this week — buyer personas,
                  outreach scripts, GTM scoring, and a payment path.
                </p>
                <ul className="feature-list">
                  <li>3 priced offers with delivery scope</li>
                  <li>25 buyer profiles with ICP scoring</li>
                  <li>Cold DMs, emails, follow-ups, and close messages</li>
                  <li>GTM intelligence — buyer tiers and why-now signals</li>
                  <li>Stripe checkout or manual payment fallback</li>
                  <li>Delivery receipt as proof of work</li>
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="/try-revenue-os" className="btn-gold">Try it free →</a>
                  <a href="/revenue-receipt" className="btn-ghost">Generate $299 Receipt</a>
                </div>
              </div>

              <div className="feature-demo-box">
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>
                  Live System Output
                </div>
                {[
                  { label: 'Offer Ladder', val: '3 tiers built', ok: true },
                  { label: 'Buyer Profiles', val: '25 generated', ok: true },
                  { label: 'GTM Score', val: '92 / Tier 1', ok: true },
                  { label: 'Cold DMs', val: '5 ready to send', ok: true },
                  { label: 'Payment Path', val: 'Stripe + Manual', ok: true },
                  { label: 'Delivery Receipt', val: 'Generated', ok: true },
                ].map((row) => (
                  <div key={row.label} className="demo-line">
                    <span className="ok">✓</span>
                    <span>{row.label}</span>
                    <span className="val">{row.val}</span>
                  </div>
                ))}
                <a href="/try-revenue-os" className="demo-cta">Run Revenue OS on your business →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="section" id="ecosystem">
        <div className="container">
          <div className="sec-label">The Full Platform</div>
          <h2 className="sec-title">One ecosystem. Four domains.</h2>
          <p className="sec-desc">
            Empire 1 is not just a revenue tool. It's a full AI platform built for founders
            who operate across business, gaming, music, and culture.
          </p>

          <div className="eco-grid">
            <div className="eco-card c-gold">
              <span className="eco-icon">⚡</span>
              <span className="eco-badge gold">Revenue · Live</span>
              <h3>Revenue OS</h3>
              <p>AI-generated revenue systems: offers, buyer profiles, GTM scoring, outreach copy, checkout, and delivery receipts. The full motion from zero to paid customer.</p>
              <div className="eco-tags">
                <span className="eco-tag">Offer Ladder</span>
                <span className="eco-tag">GTM Intelligence</span>
                <span className="eco-tag">Lead Pipeline</span>
                <span className="eco-tag">Stripe Checkout</span>
              </div>
              <a href="/try-revenue-os" className="eco-card-link gold">Try Free →</a>
            </div>

            <div className="eco-card c-blue">
              <span className="eco-icon">🎮</span>
              <span className="eco-badge blue">Gaming · Studio</span>
              <h3>Game Studio</h3>
              <p>Full AI game development pipeline — vision engine, logic generator, audio forge, compliance layer, and one-click build deployment. Slot machines to open-world.</p>
              <div className="eco-tags">
                <span className="eco-tag">Vision Engine</span>
                <span className="eco-tag">Logic Engine</span>
                <span className="eco-tag">Audio Forge</span>
                <span className="eco-tag">Compliance</span>
              </div>
              <a href="/sla113" className="eco-card-link blue">Open Studio →</a>
            </div>

            <div className="eco-card c-pink">
              <span className="eco-icon">🎵</span>
              <span className="eco-badge pink">Music · Production</span>
              <h3>Sonance Pro</h3>
              <p>Stem-deck music production, AI audio generation, multi-track composition, and SL Universal pulse stream. Creator IP ownership built in from day one.</p>
              <div className="eco-tags">
                <span className="eco-tag">Stem Deck</span>
                <span className="eco-tag">Audio Forge</span>
                <span className="eco-tag">SL Universal</span>
                <span className="eco-tag">IP Ownership</span>
              </div>
              <a href="/admin/stem-deck" className="eco-card-link pink">Open Studio →</a>
            </div>

            <div className="eco-card c-gold">
              <span className="eco-icon">🌆</span>
              <span className="eco-badge green">Culture · Digital Art</span>
              <h3>Southern Lyfestyle</h3>
              <p>Custom digital worlds for car clubs, barbershops, families, and communities. Every build is personal — arcade games, tribute art, neighborhood circuits.</p>
              <div className="eco-tags">
                <span className="eco-tag">Custom Arcades</span>
                <span className="eco-tag">Tribute Builds</span>
                <span className="eco-tag">Car Clubs</span>
                <span className="eco-tag">Community</span>
              </div>
              <a href="https://southernlifestyle.org" className="eco-card-link gold">See Builds →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE PIPELINE ── */}
      <section className="pipeline-section" id="pipeline">
        <div className="container">
          <div className="sec-label">Live Pipeline</div>
          <h2 className="sec-title">What's moving right now.</h2>
          <p className="sec-desc">
            Real leads, real products, real pipeline — across Revenue OS, Southern Lyfestyle builds, and the Game Studio.
          </p>

          <div className="pipeline-grid">

            {/* What's selling */}
            <div className="pipeline-card accent">
              <div className="live-badge"><span className="l-dot" />Live</div>
              <h4>What's Selling</h4>
              {(() => {
                const products = Object.entries(PRODUCT_LABELS).map(([id, meta]) => ({
                  id, ...meta,
                  count: crmLeads.filter(l => l.lane === id).length,
                })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

                const maxCount = Math.max(1, ...products.map(p => p.count));

                if (!crmLoaded) {
                  return <p style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>Loading pipeline…</p>;
                }
                if (products.length === 0) {
                  // Show placeholder when no live data yet
                  return (
                    <div>
                      {[
                        { label: 'Revenue Receipt', color: '#D4AF37', pct: 90 },
                        { label: 'Revenue Sprint',  color: '#FF8C00', pct: 60 },
                        { label: 'Southern Build',  color: '#C41E3A', pct: 45 },
                        { label: 'Game Studio',     color: '#00BFFF', pct: 30 },
                      ].map(p => (
                        <div key={p.label} className="product-bar">
                          <span className="p-label">{p.label}</span>
                          <div className="p-track"><div className="p-fill" style={{ width: `${p.pct}%`, background: p.color }} /></div>
                          <span className="p-count" style={{ color: p.color }}>—</span>
                        </div>
                      ))}
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
                        Waiting for first leads · Try the demo to get started
                      </p>
                    </div>
                  );
                }
                return products.map(p => (
                  <div key={p.id} className="product-bar">
                    <span className="p-label">{p.label}</span>
                    <div className="p-track"><div className="p-fill" style={{ width: `${(p.count / maxCount) * 100}%`, background: p.color }} /></div>
                    <span className="p-count">{p.count}</span>
                  </div>
                ));
              })()}

              {/* Pipeline value summary */}
              <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                {[
                  { label: 'Pipeline Value', val: crmLeads.filter(l => ['qualified','proposal','negotiation'].includes(l.pipeline_stage)).reduce((s: number, l: any) => s + (l.value || 0), 0), prefix: '$', color: 'var(--gold)' },
                  { label: 'Active Revenue', val: crmLeads.filter(l => ['active','onboarding'].includes(l.pipeline_stage)).reduce((s: number, l: any) => s + (l.value || 0), 0), prefix: '$', color: '#22c55e' },
                  { label: 'Total Leads', val: crmLeads.length, prefix: '', color: '#fff' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: s.color }}>
                      {s.prefix}{s.val > 0 ? s.val.toLocaleString() : '—'}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="pipeline-card">
              <h4>Recent Activity</h4>
              <div className="activity-feed">
                {(() => {
                  // Use real leads if available, otherwise show templates
                  const recentLeads = crmLeads.slice(0, 8);
                  const items = recentLeads.length > 0
                    ? recentLeads.map((l: any) => {
                        const prod = PRODUCT_LABELS[l.lane || ''] || { label: 'New lead', color: '#555' };
                        const stageLabels: Record<string,string> = { lead: 'just entered', qualified: 'qualified', proposal: 'in proposal', active: 'closed ✓', negotiation: 'in negotiation' };
                        return {
                          color: prod.color,
                          text: `${prod.label} — ${stageLabels[l.pipeline_stage] || l.pipeline_stage}`,
                          time: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        };
                      })
                    : ACTIVITY_TEMPLATES.map(t => ({
                        color: PRODUCT_LABELS[t.product]?.color || '#555',
                        text: t.text,
                        time: 'recently',
                      }));

                  return items.map((item, i) => (
                    <div key={i} className="activity-item">
                      <span className="a-dot" style={{ background: item.color }} />
                      <div>
                        <div className="a-text">{item.text}</div>
                        <div className="a-time">{item.time}</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 8 }}>
                <a href="/try-revenue-os" style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  padding: '10px 20px', background: 'linear-gradient(135deg,var(--gold-bright),var(--gold))',
                  color: '#000', borderRadius: 4, fontWeight: 700, flex: 1, textAlign: 'center',
                }}>Join the pipeline →</a>
                <a href="/revenue-receipt" style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  padding: '10px 20px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,.1)', color: 'var(--text-dim)',
                  borderRadius: 4, textAlign: 'center',
                }}>$299 Receipt</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="container">
          <div className="sec-label">How it works</div>
          <h2 className="sec-title">Input → System → Revenue.</h2>
          <p className="sec-desc">No onboarding call. No setup. Enter your business and get a complete revenue system in minutes.</p>
          <div className="how-grid">
            <div className="how-cell">
              <h3>Enter your business</h3>
              <p>Fill in your offer, target customer, and revenue goal. Or click "Use Demo Payload" to see the full system in action immediately — no account needed.</p>
            </div>
            <div className="how-cell">
              <h3>Revenue OS generates</h3>
              <p>The system outputs your full revenue motion: offer ladder, 25 buyer profiles, GTM scoring, outreach copy, a payment path, and a delivery receipt.</p>
            </div>
            <div className="how-cell">
              <h3>Copy, send, collect</h3>
              <p>Copy cold DMs and emails directly. Buy the full Receipt for $299 or book a Sprint for $999. Stripe checkout or manual payment — your call.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="proof-strip">
            <div className="proof-cell">
              <div className="proof-num gold">$0</div>
              <div className="proof-desc">to try the full demo</div>
            </div>
            <div className="proof-cell">
              <div className="proof-num">3 min</div>
              <div className="proof-desc">from input to full output</div>
            </div>
            <div className="proof-cell">
              <div className="proof-num gold">$299</div>
              <div className="proof-desc">Revenue Receipt — full system</div>
            </div>
            <div className="proof-cell">
              <div className="proof-num">245+</div>
              <div className="proof-desc">AI engines in the stack</div>
            </div>
            <div className="proof-cell">
              <div className="proof-num gold">4</div>
              <div className="proof-desc">domains — revenue, gaming, music, culture</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="sec-label">Start here</div>
          <h2 className="sec-title">Try first. Scale when it pays for itself.</h2>
          <p className="sec-desc">The demo is free. The $299 Receipt is designed to help you close one customer. If it works, it pays for itself.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 48 }}>
            {[
              {
                name: 'Free Demo', price: 'Free', accent: 'var(--text-dim)',
                desc: 'Try the full Revenue OS flow. Use your own business or the demo payload.',
                items: ['Full output — offers, buyers, GTM', 'Cold DMs + email copy', '72-hour action plan', 'No account required'],
                cta: 'Try Free Now', href: '/try-revenue-os', ghost: false,
              },
              {
                name: 'Revenue Receipt', price: '$299', accent: 'var(--gold)', pop: true,
                desc: 'One complete revenue system. Designed to help you close your first customer.',
                items: ['Everything in Free Demo', 'Full GTM layer scoring', 'Campaign sequence', 'Checkout + delivery receipt'],
                cta: 'Generate Receipt', href: '/revenue-receipt', ghost: false,
              },
              {
                name: 'Revenue Sprint', price: '$999', accent: 'var(--text-dim)',
                desc: 'Done-with-you sprint. Refine your offer, GTM, pipeline, and delivery.',
                items: ['Everything in Receipt', 'Custom offer refinement', 'GTM sequence setup', 'Follow-up session'],
                cta: 'Book Sprint', href: 'mailto:founder@empire1.cloud', ghost: true,
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: 'var(--card)', border: `1px solid ${plan.pop ? 'var(--border-gold)' : 'var(--border)'}`,
                borderRadius: 12, padding: 32, position: 'relative',
                boxShadow: plan.pop ? '0 0 48px rgba(212,175,55,.06)' : 'none',
              }}>
                {plan.pop && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, padding: '4px 14px',
                    background: 'linear-gradient(135deg,var(--gold-bright),var(--gold))',
                    color: '#000', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>Most popular</div>
                )}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: plan.accent, textTransform: 'uppercase', marginBottom: 12 }}>{plan.name}</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 12 }}>{plan.price}</div>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 20 }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.items.map((item) => (
                    <li key={item} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 10 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <a href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '13px 20px',
                  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                  borderRadius: 5, cursor: 'pointer', transition: 'all .2s',
                  background: plan.ghost ? 'transparent' : plan.pop ? 'linear-gradient(135deg,var(--gold-bright),var(--gold))' : 'rgba(255,255,255,.06)',
                  color: plan.ghost ? 'var(--text-dim)' : plan.pop ? '#000' : '#fff',
                  border: plan.ghost ? '1px solid var(--border)' : 'none', fontWeight: 700,
                }}>{plan.cta}</a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1, marginTop: 20 }}>
            If the $299 Receipt helps you close one $500 customer — it pays for itself.
          </p>
        </div>
      </section>

      {/* ── LEAD CAPTURE ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 0 80px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg,rgba(212,175,55,.06),rgba(255,20,147,.04))',
            border: '1px solid rgba(212,175,55,.2)', borderRadius: 12, padding: '40px 48px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--gold),var(--pink),transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>Stay in the loop</p>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Get notified when we ship new tools.</h3>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>Tell us what you're interested in and we'll reach out when it's ready.</p>
              </div>
              {lcStatus === 'done' ? (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--gold)', padding: '14px 24px', border: '1px solid rgba(212,175,55,.3)', borderRadius: 5 }}>
                  ✓ Got it — we'll be in touch.
                </div>
              ) : (
                <form onSubmit={submitLead} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase' }}>I'm interested in</label>
                    <select value={lcProduct} onChange={e => setLcProduct(e.target.value)} style={{
                      background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.1)', color: '#fff',
                      padding: '11px 14px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 11,
                      letterSpacing: 1, outline: 'none', cursor: 'pointer',
                    }}>
                      <option value="revenue_receipt">Revenue Receipt — $299</option>
                      <option value="revenue_sprint">Revenue Sprint — $999</option>
                      <option value="southern_build">Southern Lyfestyle Build</option>
                      <option value="game_studio">Game Studio Build</option>
                      <option value="sonance_music">Sonance / Music Production</option>
                      <option value="revenue_enterprise">Enterprise Implementation</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Your email</label>
                    <input
                      type="email" required value={lcEmail} onChange={e => setLcEmail(e.target.value)}
                      placeholder="you@company.com"
                      style={{ background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', padding: '11px 14px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 12, outline: 'none', minWidth: 220 }}
                    />
                  </div>
                  <button type="submit" disabled={lcStatus === 'sending'} style={{
                    padding: '12px 24px', background: 'linear-gradient(135deg,var(--gold-bright),var(--gold))',
                    color: '#000', border: 'none', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 11,
                    letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', opacity: lcStatus === 'sending' ? 0.6 : 1,
                  }}>
                    {lcStatus === 'sending' ? 'Saving…' : 'Notify Me →'}
                  </button>
                  {lcStatus === 'err' && <p style={{ fontSize: 11, color: 'var(--pink)', width: '100%' }}>Couldn't save — try again.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta">
        <span className="cta-badge">Ready to build</span>
        <h2 className="cta-title">
          Your revenue system<br />
          <span style={{ background: 'linear-gradient(135deg,#FFD700,#D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            starts Monday.
          </span>
        </h2>
        <p className="cta-sub">Enter your business, pick your channel, get your full system. No login. No setup. Just results.</p>
        <div className="cta-btns">
          <a href="/try-revenue-os" className="btn-gold">Try Empire Revenue OS →</a>
          <a href="/revenue-receipt" className="btn-ghost">Generate a Receipt</a>
        </div>
        <p className="cta-note">Free demo · No account · $299 to go full</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="e1-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <NavMark />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
                EMPIRE <span style={{ color: 'var(--pink)' }}>1</span>
              </span>
              <p>AI ecosystem for founders, operators, and builders. Revenue OS, game studio, music production, and cultural intelligence — in one platform.</p>
            </div>
            <div className="footer-col">
              <h5>Products</h5>
              <a href="/try-revenue-os">Revenue OS Demo</a>
              <a href="/revenue-receipt">Revenue Receipt</a>
              <a href="/revenue-os">OS Cockpit</a>
              <a href="/dashboard">Dashboard</a>
            </div>
            <div className="footer-col">
              <h5>Platform</h5>
              <a href="/sla113">Game Studio</a>
              <a href="/admin/stem-deck">Sonance Pro</a>
              <a href="https://southernlifestyle.org">Southern Lyfestyle</a>
            </div>
            <div className="footer-col">
              <h5>Contact</h5>
              <a href="mailto:founder@empire1.cloud">founder@empire1.cloud</a>
              <a href="mailto:founder@empire1.cloud">Book Revenue Sprint</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Empire 1 · All rights reserved</p>
            <div className="footer-status">
              <span className="dot" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
