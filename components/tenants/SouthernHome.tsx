'use client';

import React, { useEffect } from 'react';

/*
  Southern Lyfestyle — southernlifestyle.org
  Redesigned around the new logo:
    Ornate gold S · Red roses · Ring text · El Monte · SGV · Since Day One
  
  Colors from logo:
    Gold       #D4AF37 / #c9a84c / #FFD700
    Crimson    #8B1A1A / #C41E3A / #DC143C
    Green      #1a4a10 / #2d6b1f
    Warm dark  #0a0805  (dark with amber undertone)
    Amber      #FF8C00 / #cc5500
*/

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0805;color:#d4c9b8;line-height:1.65;overflow-x:hidden}
a{color:inherit;text-decoration:none}

:root{
  --gold:#D4AF37;
  --gold-bright:#FFD700;
  --gold-dim:#6b5010;
  --crimson:#C41E3A;
  --crimson-deep:#8B1A1A;
  --crimson-light:#e8294a;
  --green:#2d6b1f;
  --green-light:#4a9e35;
  --amber:#cc5500;
  --amber-light:#FF8C00;
  --bg:#0a0805;
  --bg2:#110e08;
  --panel:rgba(15,12,7,.85);
  --border:rgba(212,175,55,.15);
  --border-strong:rgba(212,175,55,.35);
  --text:#c8bba8;
  --text-dim:#6b5f4a;
  --mono:'JetBrains Mono',monospace;
  --serif:'Playfair Display',Georgia,serif;
}

::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--gold-dim);border-radius:5px}

/* ── WARM TEXTURE BG ── */
.warm-bg{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 120% 60% at 50% 0%,rgba(204,85,0,.06),transparent 60%),
    radial-gradient(ellipse 80% 80% at 80% 100%,rgba(196,30,58,.04),transparent 50%),
    radial-gradient(ellipse 60% 60% at 10% 60%,rgba(212,175,55,.03),transparent 50%);
}

/* ── NAV ── */
nav.sl-nav{
  position:fixed;top:0;left:0;right:0;z-index:200;height:64px;
  display:flex;align-items:center;padding:0 40px;
  background:rgba(10,8,5,.88);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
}
.nav-inner{width:100%;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
.nav-mark{display:flex;align-items:center;gap:12px;cursor:pointer}
.nav-mark svg{width:38px;height:38px}
.nav-brand-text{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--gold);font-style:italic}
.nav-sub{font-family:var(--mono);font-size:8px;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase;margin-left:2px}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:var(--gold)}
.nav-cta{
  font-family:var(--mono);font-size:10px;letter-spacing:2px;
  padding:9px 20px;text-transform:uppercase;
  border:1px solid var(--gold);color:var(--gold);
  border-radius:3px;transition:all .2s;
}
.nav-cta:hover{background:var(--gold);color:#000}

/* ── HERO ── */
.hero{
  position:relative;z-index:1;min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:100px 24px 80px;text-align:center;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 700px 700px at 50% 40%,rgba(204,85,0,.1),transparent 65%),
    radial-gradient(ellipse 500px 300px at 50% 80%,rgba(196,30,58,.06),transparent 60%);
}

/* ── LOGO ── */
.logo-wrap{position:relative;margin-bottom:44px;display:inline-block}
.logo-glow{
  position:absolute;inset:-30px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(212,175,55,.16) 0%,rgba(204,85,0,.08) 40%,transparent 70%);
}
@keyframes logo-breathe{
  0%,100%{filter:drop-shadow(0 0 20px rgba(212,175,55,.35)) drop-shadow(0 0 40px rgba(204,85,0,.2))}
  50%{filter:drop-shadow(0 0 32px rgba(212,175,55,.55)) drop-shadow(0 0 60px rgba(204,85,0,.3))}
}
@keyframes rose-sway{
  0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}
}
.logo-svg{width:240px;height:240px;animation:logo-breathe 4s ease-in-out infinite}
@media(min-width:768px){.logo-svg{width:300px;height:300px}}

/* ── HERO TEXT ── */
@keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.hero-eyebrow{
  font-family:var(--mono);font-size:10px;letter-spacing:5px;color:var(--gold);
  text-transform:uppercase;margin-bottom:16px;
  animation:fade-up .7s ease both;animation-delay:.1s;opacity:0;
}
.hero-title{
  font-family:var(--serif);font-size:clamp(42px,8vw,90px);
  font-weight:900;font-style:italic;color:var(--gold);
  line-height:1.0;margin-bottom:8px;letter-spacing:-.01em;
  text-shadow:0 4px 30px rgba(212,175,55,.25);
  animation:fade-up .7s ease both;animation-delay:.2s;opacity:0;
}
.hero-sub-title{
  font-family:var(--mono);font-size:clamp(9px,2vw,11px);letter-spacing:5px;
  color:var(--text-dim);text-transform:uppercase;margin-bottom:20px;
  animation:fade-up .7s ease both;animation-delay:.3s;opacity:0;
}
.hero-tag{
  font-family:var(--mono);font-size:11px;letter-spacing:3px;
  color:var(--crimson-light);text-transform:uppercase;
  margin-bottom:32px;display:flex;align-items:center;justify-content:center;gap:12px;
  animation:fade-up .7s ease both;animation-delay:.4s;opacity:0;
}
.hero-tag::before,.hero-tag::after{content:'';width:32px;height:1px;background:var(--crimson)}
.hero-desc{
  font-size:clamp(15px,2vw,18px);color:var(--text);line-height:1.75;
  max-width:560px;margin:0 auto 36px;
  animation:fade-up .7s ease both;animation-delay:.5s;opacity:0;
}
.hero-ctas{
  display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  animation:fade-up .7s ease both;animation-delay:.6s;opacity:0;
}
.btn-gold{
  font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;
  padding:14px 34px;border-radius:3px;cursor:pointer;transition:all .25s;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold));color:#000;font-weight:700;
  border:none;display:inline-block;
}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(212,175,55,.25)}
.btn-ghost{
  font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;
  padding:13px 34px;border-radius:3px;cursor:pointer;transition:all .25s;
  background:transparent;color:var(--text);border:1px solid var(--border);display:inline-block;
}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}

/* ── DIVIDER ── */
.rose-divider{
  display:flex;align-items:center;justify-content:center;gap:16px;
  padding:40px 0;
}
.rose-divider .line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--border-strong),transparent);max-width:240px}
.rose-divider .icon{color:var(--crimson);font-size:20px}

/* ── SECTIONS ── */
.section{position:relative;z-index:1;padding:80px 0}
.container{max-width:1100px;margin:0 auto;padding:0 28px}
.sec-label{
  font-family:var(--mono);font-size:9px;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:10px;
}
.sec-label::before{content:'';width:18px;height:1px;background:var(--gold)}
.sec-title{
  font-family:var(--serif);font-size:clamp(26px,4vw,44px);font-weight:700;font-style:italic;
  color:#fff;line-height:1.15;margin-bottom:12px;
}
.sec-desc{font-size:15px;color:var(--text);line-height:1.75;max-width:560px}

/* ── NARRATIVE PANELS ── */
.narrative-stack{display:flex;flex-direction:column;gap:3px;margin-top:48px}
.narr-panel{
  background:var(--bg2);border:1px solid var(--border);
  padding:44px 48px;position:relative;overflow:hidden;transition:border-color .3s;
}
.narr-panel:hover{border-color:var(--border-strong)}
.narr-panel::before{
  content:'';position:absolute;top:0;left:0;width:3px;bottom:0;
  background:linear-gradient(180deg,var(--crimson-deep),var(--gold),var(--crimson-deep));
  opacity:0;transition:opacity .3s;
}
.narr-panel:hover::before{opacity:1}
.narr-panel.right{text-align:right}
.narr-panel.right::before{left:auto;right:0}
.narr-sub{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:12px}
.narr-title{font-family:var(--serif);font-size:clamp(22px,4vw,38px);font-weight:700;font-style:italic;color:#fff;margin-bottom:16px}
.narr-text{font-size:15px;color:var(--text);line-height:1.8;max-width:680px}
.narr-panel.right .narr-text{margin-left:auto}

/* ── GALLERY ── */
.gallery-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:48px}
.gallery-card{
  position:relative;overflow:hidden;border-radius:8px;
  border:1px solid var(--border);aspect-ratio:4/3;cursor:pointer;
  transition:border-color .3s,transform .3s;
}
.gallery-card:hover{border-color:var(--border-strong);transform:translateY(-3px)}
.gallery-card .card-bg{
  position:absolute;inset:0;transition:transform .6s ease;
}
.gallery-card:hover .card-bg{transform:scale(1.05)}
.gallery-card .card-overlay{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(5,3,1,.92) 0%,rgba(5,3,1,.4) 50%,transparent 100%);
}
.gallery-card .card-body{
  position:absolute;bottom:0;left:0;right:0;padding:24px;
}
.gallery-card .card-cat{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:6px}
.gallery-card .card-title{font-family:var(--serif);font-size:clamp(18px,3vw,26px);font-weight:700;font-style:italic;color:#fff;margin-bottom:4px}
.gallery-card .card-sub{font-size:12px;color:rgba(255,255,255,.55)}

/* Gallery card background art — CSS compositions */
.bg-arcade{background:linear-gradient(135deg,#1a0505 0%,#3d0f0f 40%,#8B1A1A 70%,#c9a84c 100%)}
.bg-cruise{background:linear-gradient(135deg,#050a1a 0%,#0d1f3c 40%,#1a3a6b 70%,#c9a84c 90%,#FF8C00 100%)}
.bg-tribute{background:linear-gradient(135deg,#050505 0%,#1a0a0a 30%,#2d1a1a 60%,#6b3030 100%)}
.bg-barber{background:linear-gradient(135deg,#0d0d0a 0%,#1a1a0a 30%,#2d2d10 60%,#c9a84c 100%)}
.card-art{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:72px;opacity:.12}

/* ── PRICING ── */
.pricing-wrap{
  display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-top:48px;align-items:start;
}
.price-ledger{
  background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:28px;
}
.price-ledger h4{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.price-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(212,175,55,.08);font-size:13px;color:var(--text-dim)}
.price-row:last-child{border-bottom:none}
.price-row .price-val{font-family:var(--mono);font-weight:700;color:#fff}
.price-row.featured .price-val{color:var(--gold)}
.addons-title{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase;margin:20px 0 12px;padding-top:12px;border-top:1px solid var(--border)}

/* ── REQUEST FORM ── */
.request-box{
  background:var(--bg2);border:1px solid var(--border);border-radius:6px;
  padding:36px;position:relative;overflow:hidden;
}
.request-box::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold),var(--crimson),transparent);
}
.form-label{font-family:var(--mono);font-size:9px;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase;display:block;margin-bottom:8px}
.form-input,.form-select,.form-textarea{
  width:100%;padding:13px 16px;background:rgba(0,0,0,.5);
  border:1px solid rgba(212,175,55,.12);border-radius:3px;
  color:#fff;font-size:14px;font-family:'Inter',sans-serif;
  outline:none;transition:border-color .2s;
}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--gold)}
.form-textarea{resize:none;min-height:110px}
.form-select{appearance:none}
.form-group{margin-bottom:20px}
.btn-submit{
  width:100%;padding:15px;font-family:var(--mono);font-size:11px;letter-spacing:3px;
  text-transform:uppercase;font-weight:700;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold));
  color:#000;border:none;border-radius:3px;cursor:pointer;transition:all .2s;
}
.btn-submit:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(212,175,55,.2)}
.draft-result{
  margin-top:24px;display:none;border-top:1px solid var(--border);padding-top:24px;
}
.draft-result.visible{display:block}
.draft-output{
  padding:20px;background:rgba(0,0,0,.5);border:1px solid var(--border);
  border-radius:3px;font-size:13px;color:var(--text);line-height:1.8;white-space:pre-wrap;
}

/* ── FOOTER ── */
footer.sl-footer{
  position:relative;z-index:1;
  border-top:1px solid var(--border);padding:48px 0 28px;
}
.footer-inner{display:flex;flex-direction:column;align-items:center;gap:24px;text-align:center}
.footer-inner svg{width:56px;height:56px;opacity:.8}
.footer-brand{font-family:var(--serif);font-size:24px;font-style:italic;font-weight:700;color:var(--gold)}
.footer-tagline{font-family:var(--mono);font-size:9px;letter-spacing:4px;color:var(--text-dim);text-transform:uppercase}
.footer-links{display:flex;gap:24px;flex-wrap:wrap;justify-content:center}
.footer-links a{font-family:var(--mono);font-size:10px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;transition:color .2s}
.footer-links a:hover{color:var(--gold)}
.footer-copy{font-family:var(--mono);font-size:9px;letter-spacing:2px;color:rgba(107,95,74,.5);text-transform:uppercase}

/* ── RESPONSIVE ── */
@media(max-width:768px){
  .gallery-grid{grid-template-columns:1fr}
  .pricing-wrap{grid-template-columns:1fr}
  .nav-links{display:none}
  nav.sl-nav{padding:0 20px}
  .narr-panel{padding:28px 24px}
  .narr-panel.right{text-align:left}
  .narr-panel.right::before{left:0;right:auto}
  .narr-panel.right .narr-text{margin-left:0}
  .section{padding:56px 0}
}
@media(max-width:480px){
  .request-box{padding:24px 20px}
}
`;

/* ── SVG LOGO — Southern Lyfestyle medallion ── */
const SouthernLogo = ({ size = 240 }: { size?: number }) => (
  <svg
    viewBox="0 0 300 300"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="logo-svg"
  >
    <defs>
      <radialGradient id="sl-bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#2a1505" />
        <stop offset="100%" stopColor="#0a0805" />
      </radialGradient>
      <linearGradient id="sl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
      <linearGradient id="sl-gold2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="40%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#7a5a0a" />
      </linearGradient>
      <linearGradient id="sl-rose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4060" />
        <stop offset="100%" stopColor="#8B1A1A" />
      </linearGradient>
      <linearGradient id="sl-amber" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#cc5500" stopOpacity="0" />
      </linearGradient>
      <filter id="sl-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="sl-rose-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <path id="top-arc" d="M 40,150 A 110,110 0 0,1 260,150" />
      <path id="bot-arc" d="M 55,170 A 110,110 0 0,0 245,170" />
    </defs>

    {/* Glow burst behind */}
    <circle cx="150" cy="150" r="95" fill="url(#sl-amber)" />

    {/* Main medallion disc */}
    <circle cx="150" cy="150" r="130" fill="url(#sl-bg)" />

    {/* Outer decorative ring */}
    <circle cx="150" cy="150" r="130" stroke="url(#sl-gold)" strokeWidth="10" fill="none" />
    <circle cx="150" cy="150" r="122" stroke="rgba(212,175,55,.2)" strokeWidth="1" fill="none" />
    <circle cx="150" cy="150" r="118" stroke="rgba(212,175,55,.12)" strokeWidth="1" fill="none" />

    {/* Greek-key tick marks around ring */}
    {Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 10 - 90) * (Math.PI / 180);
      const r1 = 118; const r2 = 123;
      return (
        <line
          key={i}
          x1={150 + r1 * Math.cos(angle)} y1={150 + r1 * Math.sin(angle)}
          x2={150 + r2 * Math.cos(angle)} y2={150 + r2 * Math.sin(angle)}
          stroke="rgba(212,175,55,.5)" strokeWidth={i % 3 === 0 ? 2 : 1}
        />
      );
    })}

    {/* Circular text — top: SOUTHERN LYFESTYLE */}
    <text fontFamily="'Inter', sans-serif" fontSize="11" fontWeight="700" letterSpacing="3" fill="url(#sl-gold)" textAnchor="middle">
      <textPath href="#top-arc" startOffset="50%">SOUTHERN  LYFESTYLE</textPath>
    </text>

    {/* Circular text — bottom: EL MONTE · SGV · SINCE DAY ONE */}
    <text fontFamily="'Inter', sans-serif" fontSize="9" fontWeight="600" letterSpacing="2.5" fill="rgba(212,175,55,.7)" textAnchor="middle">
      <textPath href="#bot-arc" startOffset="50%">EL MONTE  ·  SGV  ·  SINCE DAY ONE</textPath>
    </text>

    {/* Ornate S — filigree body */}
    <g transform="translate(150,152)" filter="url(#sl-glow)">
      {/* S outer path */}
      <path
        d="M 18,-44 C 42,-44 52,-28 52,-14 C 52,2 40,14 18,20 C -8,28 -22,36 -22,54 C -22,70 -10,82 18,82 C 38,82 50,74 50,62"
        stroke="url(#sl-gold2)" strokeWidth="14" fill="none" strokeLinecap="round"
      />
      <path
        d="M 18,-44 C 42,-44 52,-28 52,-14 C 52,2 40,14 18,20 C -8,28 -22,36 -22,54 C -22,70 -10,82 18,82 C 38,82 50,74 50,62"
        stroke="url(#sl-gold2)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6"
      />
      {/* Filigree swirls */}
      <path d="M 30,-30 C 44,-20 46,-8 36,0" stroke="rgba(255,215,0,.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M -8,38 C -20,46 -20,56 -8,60" stroke="rgba(255,215,0,.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="-14" r="4" fill="var(--gold)" opacity="0.7" />
      <circle cx="-22" cy="54" r="4" fill="var(--gold)" opacity="0.7" />
    </g>

    {/* Rose 1 — left center */}
    <g transform="translate(82,158)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="14" fill="url(#sl-rose)" opacity="0.9" />
      <circle cx="0" cy="0" r="9" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="5" fill="#FF4060" opacity="0.6" />
      <path d="M -12,-6 C -8,-14 8,-14 12,-6" stroke="#2d6b1f" strokeWidth="2" fill="none" />
      <path d="M -6,10 L -6,26 C -6,28 -4,28 -2,26" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>

    {/* Rose 2 — right high */}
    <g transform="translate(214,118)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="16" fill="url(#sl-rose)" opacity="0.85" />
      <circle cx="0" cy="0" r="10" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="5" fill="#FF4060" opacity="0.6" />
      <path d="M -8,10 L -4,24 C -2,28 2,26 2,22" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>

    {/* Rose 3 — bottom center */}
    <g transform="translate(148,212)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="12" fill="url(#sl-rose)" opacity="0.9" />
      <circle cx="0" cy="0" r="7" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="3.5" fill="#FF4060" opacity="0.6" />
    </g>

    {/* Vine tendrils */}
    <path d="M 96,162 C 120,140 140,130 148,100" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 198,122 C 185,142 172,158 162,180" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 152,212 C 148,195 145,178 148,160" stroke="#2d6b1f" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />

    {/* Gold sparkles */}
    {[
      [105, 95], [195, 85], [228, 175], [78, 185], [165, 76], [120, 230],
    ].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        <line x1="-4" y1="0" x2="4" y2="0" stroke="var(--gold)" strokeWidth="1" opacity="0.7" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--gold)" strokeWidth="1" opacity="0.7" />
        <circle cx="0" cy="0" r="1.5" fill="var(--gold-bright)" opacity="0.9" />
      </g>
    ))}

    {/* Small daisy flowers */}
    {[[88,112],[210,200]].map(([cx,cy],i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        {[0,45,90,135,180,225,270,315].map((a, j) => (
          <ellipse key={j} cx={5*Math.cos(a*Math.PI/180)} cy={5*Math.sin(a*Math.PI/180)} rx="3" ry="1.5" fill="white" opacity="0.7" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="3" fill="var(--gold)" opacity="0.9" />
      </g>
    ))}
  </svg>
);

/* ── MINI NAV MARK ── */
const NavMark = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="17" stroke="url(#nm-sl-gold)" strokeWidth="1.5" />
    <g transform="translate(20,22)">
      <path d="M 6,-12 C 12,-12 14,-7 14,-4 C 14,0 10,3 5,5 C -2,7 -6,9 -6,14 C -6,18 -2,21 6,21 C 10,21 13,19 13,17"
        stroke="#D4AF37" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
    <defs>
      <linearGradient id="nm-sl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#8B6914" stopOpacity="0.5" />
      </linearGradient>
    </defs>
  </svg>
);

export default function SouthernHome() {
  useEffect(() => {
    const draftBtn = document.getElementById('sl-draft-btn');
    const draftResult = document.getElementById('sl-draft-result');
    const outputArea = document.getElementById('sl-output-area');
    if (!draftBtn || !draftResult || !outputArea) return;

    const handler = async () => {
      const lane = (document.getElementById('sl-lane') as HTMLSelectElement)?.value;
      const story = (document.getElementById('sl-story') as HTMLTextAreaElement)?.value;
      const nameEl = document.getElementById('sl-name') as HTMLInputElement | null;
      const emailEl = document.getElementById('sl-email') as HTMLInputElement | null;
      if (!lane || !story.trim()) return;

      draftBtn.textContent = 'Drafting your concept...';
      (draftBtn as HTMLButtonElement).disabled = true;

      // Save lead to CRM in background
      try {
        const leadName = nameEl?.value?.trim() || lane;
        const leadEmail = emailEl?.value?.trim() || undefined;
        const res = await fetch('/api/crm/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadName,
            email: leadEmail,
            source: 'southern_request',
            notes: `Category: ${lane}\n\n${story}`,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            await fetch(`/api/crm/leads/${d.lead.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lane: 'southern_build', pipeline_stage: 'lead' }),
            });
          }
        }
      } catch { /* silent — don't block the draft */ }

      const concepts: Record<string, string> = {
        'Car Club': `We'd build a custom lowrider arcade tribute to your car club — your colors, your rides, your logo on every screen. Think classic cruise-night vibes, with your actual cars as the playable characters. The kind of thing that makes the whole crew stop and say "that's us."`,
        'Barbershop': `We'll build a shop arcade game themed to your exact barbershop — your name, your logo, your crew's style. Picture a kid waiting for their cut, playing a game on the shop TV that's built around your world. That's pride in digital form.`,
        'Couple': `We'd turn your story into a custom digital world — your first date spot, your inside jokes, your shared history as levels in a game only you two truly understand. A permanent record of your love, built to play forever.`,
        'Family': `We build a custom family world — your roots, your people, your history. Whether it's a neighborhood map, a family arcade, or a tribute to the ancestors, we translate your real legacy into something you can share with the next generation.`,
        'Kids': `We'd build a custom game world designed around your little one — their favorite colors, their heroes, their world. A place they can visit on the hardest days and feel like the main character. Because they are.`,
        'Tribute': `We build respectful, permanent digital tributes — paño-style art, memorial worlds, interactive celebrations of lives fully lived. Your loved one's story, preserved in a form that the whole family can carry forward.`,
      };

      await new Promise(r => setTimeout(r, 900));
      outputArea.textContent = concepts[lane] || 'Tell us more about your story and we\'ll draft a custom concept for your build.';
      draftResult.classList.add('visible');
      draftBtn.textContent = 'Generate Draft Concept';
      (draftBtn as HTMLButtonElement).disabled = false;
    };

    draftBtn.addEventListener('click', handler);
    return () => draftBtn.removeEventListener('click', handler);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="warm-bg" />

      {/* ── NAV ── */}
      <nav className="sl-nav">
        <div className="nav-inner">
          <a href="/" className="nav-mark">
            <NavMark />
            <div>
              <div className="nav-brand-text">Southern Lyfestyle</div>
              <div className="nav-sub">El Monte · SGV</div>
            </div>
          </a>
          <div className="nav-links">
            <a href="#builds">Builds</a>
            <a href="#for-who">For Who</a>
            <a href="#pricing">Pricing</a>
            <a href="#request" className="nav-cta">Request a Build</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="logo-wrap">
          <div className="logo-glow" />
          {/* Try the real PNG first */}
          <img
            src="/southern-logo.png"
            alt="Southern Lyfestyle"
            className="logo-svg"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const svgEl = target.nextElementSibling as HTMLElement;
              if (svgEl) svgEl.style.display = 'block';
            }}
          />
          <span style={{ display: 'none' }}>
            <SouthernLogo size={280} />
          </span>
        </div>

        <p className="hero-eyebrow">El Monte · San Gabriel Valley · Est. Day One</p>
        <h1 className="hero-title">Southern Lyfestyle</h1>
        <p className="hero-sub-title">Stilo's Active &amp; Attractive</p>
        <p className="hero-tag">Custom Digital Builds for Our People</p>
        <p className="hero-desc">
          We turn your real stories — car clubs, barbershops, families, kids — into custom
          digital worlds and playable arcade games. Built for the culture. Built to last.
        </p>
        <div className="hero-ctas">
          <a href="#request" className="btn-gold">Request a Build →</a>
          <a href="#for-who" className="btn-ghost">See Who We Build For</a>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="section" id="for-who">
        <div className="container">
          <div className="sec-label">Who We Build For</div>
          <h2 className="sec-title">Built for us. Rooted and cultured.</h2>
          <p className="sec-desc">
            Southern Lyfestyle was built for anyone who respects the honest hustle, the culture, the struggle,
            and the beauty we still protect. Every build is personal. Every detail matters.
          </p>

          <div className="narrative-stack">
            <div className="narr-panel">
              <div className="narr-sub">Couples &amp; Day-Ones</div>
              <h3 className="narr-title">Your shared history, built digital.</h3>
              <p className="narr-text">
                Whatever your vibe is — romantic, family, cultural, community, playful, or personal —
                we build a one-of-a-kind digital world that matches it. We take your history, your inside jokes,
                and your shared milestones and turn them into a digital legacy. Imagine pulling up a custom game
                that only you two understand — every level a memory, every character a shared laugh.
              </p>
            </div>

            <div className="narr-panel right">
              <div className="narr-sub">Kids Fighting Battles</div>
              <h3 className="narr-title">Brave hearts. Stories that deserve worlds.</h3>
              <p className="narr-text">
                Some kids carry challenges that make everyday moments harder — birthdays in a hospital room,
                holidays in a gown, long nights where you're just trying to keep their mind off everything.
                A custom digital world can brighten their day. It doesn't fix everything.
                But it can make them feel seen. Sometimes that's everything.
              </p>
            </div>

            <div className="narr-panel">
              <div className="narr-sub">The Barbershops</div>
              <h3 className="narr-title">Your rhythm, your hustle, your neighborhood.</h3>
              <p className="narr-text">
                Every barbershop has its own rhythm — the laughs, the debates, the music, the regulars,
                the kids spinning in the chair, the OGs holding court. Imagine turning that vibe into a
                custom arcade game for the shop. Your colors. Your logo. Your crew. Picture a kid waiting
                for their cut, playing a game on the shop TV that features your style. That's pride. That's culture.
              </p>
            </div>

            <div className="narr-panel right">
              <div className="narr-sub">The Car Clubs</div>
              <h3 className="narr-title">3-wheelin' on a cool night with the familia.</h3>
              <p className="narr-text">
                That whole vibe deserves its own digital tribute. Imagine pulling up to the meet,
                and your little one is on the dash TV playing a custom game that features your actual car club,
                your colors, and your rides. The whole crew would trip out.
                If your club has a history, we can build the digital version of it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="section" id="builds">
        <div className="container">
          <div className="rose-divider">
            <div className="line" />
            <span className="icon">🌹</span>
            <div className="line" />
          </div>
          <div className="sec-label">Our Work</div>
          <h2 className="sec-title">What we build.</h2>

          <div className="gallery-grid">
            <div className="gallery-card">
              <div className="card-bg bg-arcade">
                <div className="card-art">🕹️</div>
              </div>
              <div className="card-overlay" />
              <div className="card-body">
                <div className="card-cat">Arcade &amp; Slots</div>
                <div className="card-title">Custom Arcade Games</div>
                <div className="card-sub">Fully playable software branded to your exact style.</div>
              </div>
            </div>

            <div className="gallery-card">
              <div className="card-bg bg-cruise">
                <div className="card-art">🚗</div>
              </div>
              <div className="card-overlay" />
              <div className="card-body">
                <div className="card-cat">Car Clubs</div>
                <div className="card-title">The Night Cruise</div>
                <div className="card-sub">Your exact familia colors and rides on a digital blvd.</div>
              </div>
            </div>

            <div className="gallery-card">
              <div className="card-bg bg-tribute">
                <div className="card-art">🕯️</div>
              </div>
              <div className="card-overlay" />
              <div className="card-body">
                <div className="card-cat">Paño Arte</div>
                <div className="card-title">Tribute Builds</div>
                <div className="card-sub">Your history translated into interactive art. Respectful and permanent.</div>
              </div>
            </div>

            <div className="gallery-card">
              <div className="card-bg bg-barber">
                <div className="card-art">💈</div>
              </div>
              <div className="card-overlay" />
              <div className="card-body">
                <div className="card-cat">Community</div>
                <div className="card-title">Barbershop Arcades</div>
                <div className="card-sub">Digitizing the pulse of the community with safe, fun energy.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING + REQUEST ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="rose-divider">
            <div className="line" />
            <span className="icon">🌹</span>
            <div className="line" />
          </div>
          <div className="sec-label">Pricing &amp; Request</div>
          <h2 className="sec-title" id="request">Request a Build.</h2>
          <p className="sec-desc" style={{ marginBottom: 0 }}>
            Pick your category. Tell us your story. We'll draft a free concept for you.
          </p>

          <div className="pricing-wrap">
            {/* Ledger */}
            <div className="price-ledger">
              <h4>Build Pricing</h4>
              {[
                { name: 'Personal', price: '$250' },
                { name: 'Community', price: '$500' },
                { name: 'Full World', price: '$750', featured: true },
                { name: 'Premium', price: '$1,000' },
              ].map((p) => (
                <div key={p.name} className={`price-row${p.featured ? ' featured' : ''}`}>
                  <span>{p.name}</span>
                  <span className="price-val">{p.price}</span>
                </div>
              ))}
              <div className="addons-title">Add-ons</div>
              {[
                { name: 'Extra Character', price: '$50' },
                { name: 'Extra Art', price: '$100' },
                { name: 'Intro Video', price: '$150' },
              ].map((a) => (
                <div key={a.name} className="price-row">
                  <span>{a.name}</span>
                  <span className="price-val">{a.price}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="request-box">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="sl-name">Your Name</label>
                  <input id="sl-name" className="form-input" placeholder="First name or handle" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="sl-email">Email (optional)</label>
                  <input id="sl-email" type="email" className="form-input" placeholder="so we can reach you" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sl-lane">Category</label>
                <select id="sl-lane" className="form-select">
                  <option value="" disabled>Select a Category…</option>
                  <option value="Car Club">Car Club (Plaques &amp; Rides)</option>
                  <option value="Barbershop">Barbershop (Shop Arcades)</option>
                  <option value="Couple">Couples (Shared History)</option>
                  <option value="Family">Family (Roots &amp; Legacy)</option>
                  <option value="Kids">Kids (Hospital Warriors)</option>
                  <option value="Tribute">Tribute (Memorials &amp; Paño)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sl-story">Your Story</label>
                <textarea
                  id="sl-story"
                  className="form-textarea"
                  placeholder="Tell us the history, the memories, or what you want to see built…"
                />
              </div>
              <button id="sl-draft-btn" className="btn-submit">Generate Draft Concept</button>

              <div id="sl-draft-result" className="draft-result">
                <div className="form-label" style={{ marginBottom: 10 }}>Your Draft Concept</div>
                <div id="sl-output-area" className="draft-output" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="sl-footer">
        <div className="container">
          <div className="footer-inner">
            <SouthernLogo size={56} />
            <div className="footer-brand">Southern Lyfestyle</div>
            <div className="footer-tagline">El Monte · SGV · Since Day One</div>
            <div className="footer-links">
              <a href="#for-who">For Who</a>
              <a href="#builds">Our Work</a>
              <a href="#request">Request a Build</a>
              <a href="mailto:founder@empire1.cloud">Contact</a>
            </div>
            <div className="footer-copy">© 2026 Southern Lyfestyle · All rights reserved</div>
          </div>
        </div>
      </footer>
    </>
  );
}
