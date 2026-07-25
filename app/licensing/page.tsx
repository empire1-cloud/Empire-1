import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Licensing — Empire-1',
  description: 'License the Hybrid Intelligence Core, individual engines, or the full SLA113 factory platform.',
};

const CSS = String.raw`
:root{
  --bg:#050505; --surface:#0a0a0d; --line:rgba(245,245,247,0.09); --line-strong:rgba(245,245,247,0.16);
  --text:#f2f2f4; --muted:#8c8c95; --gold:#e8b923; --pink:#e6007a; --blue:#007aff;
}
*{box-sizing:border-box;} html{scroll-behavior:smooth;}
body{margin:0;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
.mono{font-family:'JetBrains Mono',monospace;}

.eyebrow{
  font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
  color:var(--gold);display:flex;align-items:center;gap:10px;
}
.eyebrow::before{content:'';width:14px;height:1px;background:var(--gold);display:inline-block;}

.wrap{max-width:960px;margin:0 auto;padding:0 28px;position:relative;}

header{position:sticky;top:0;z-index:20;background:rgba(5,5,5,0.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.header-inner{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;max-width:960px;margin:0 auto;}
.mark{display:flex;align-items:center;gap:12px;}
.mark img{width:34px;height:34px;object-fit:contain;border-radius:4px;}
.wordmark{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:18px;letter-spacing:0.08em;text-transform:uppercase;}
.wordmark span{color:var(--pink);}
nav{display:flex;gap:26px;}
nav a{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);transition:color .2s;}
nav a:hover{color:var(--text);}
@media(max-width:700px){nav{display:none;}}

.hero{padding:120px 28px 60px;}
.hero h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(36px,6vw,64px);line-height:0.98;margin:20px 0 20px;}
.hero p{font-size:17px;line-height:1.65;color:#c7c7cd;max-width:600px;margin:0 0 20px;}

.section{padding:80px 28px;border-top:1px solid var(--line);}
.section h2{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:clamp(28px,4vw,42px);line-height:1.05;margin:14px 0 0;max-width:680px;}
.section p{color:#c7c7cd;line-height:1.7;font-size:16px;max-width:620px;margin:20px 0 0;}

.ledger{border-top:1px solid var(--line-strong);}
.ledger-row{display:grid;grid-template-columns:120px 1fr 140px;gap:24px;padding:30px 0;border-bottom:1px solid var(--line);align-items:start;}
@media(max-width:700px){.ledger-row{grid-template-columns:1fr;gap:10px;}.ledger-price{text-align:left!important;}}
.ledger-tier{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);padding-top:3px;}
.ledger-tier.pink{color:var(--pink);}
.ledger-tier.blue{color:var(--blue);}
.ledger-tier.muted{color:var(--muted);}
.ledger-body h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:22px;margin:0 0 8px;}
.ledger-body p{color:#b4b4bb;font-size:14.5px;line-height:1.6;margin:0 0 12px;max-width:460px;}
.ledger-includes{color:#8c8c95;font-size:12.5px;font-family:'JetBrains Mono',monospace;line-height:1.9;}
.ledger-price{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:30px;text-align:right;padding-top:2px;}
.ledger-note{margin-top:24px;color:var(--muted);font-size:13.5px;font-style:italic;}

.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:40px;}
.btn{font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:0.05em;text-transform:uppercase;padding:15px 26px;border-radius:2px;display:inline-flex;align-items:center;gap:8px;transition:transform .18s ease,box-shadow .18s ease;}
.btn-primary{background:var(--gold);color:#0a0a0a;font-weight:600;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,185,35,0.25);}
.btn-ghost{border:1px solid var(--line-strong);color:var(--text);}
.btn-ghost:hover{border-color:var(--pink);color:var(--pink);}

footer{padding:60px 28px 40px;border-top:1px solid var(--line);}
.footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.copy{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:24px;}

::selection{background:var(--pink);color:#fff;}
a:focus-visible,button:focus-visible{outline:2px solid var(--blue);outline-offset:3px;}
`;

const HTML = String.raw`
<header>
  <div class="header-inner">
    <a href="/" class="mark">
      <img src="/empire1_logo.jpeg" alt="Empire-1">
      <div class="wordmark">EMPIRE <span>1</span></div>
    </a>
    <nav>
      <a href="/">Home</a>
      <a href="/revenue-os">Revenue OS</a>
      <a href="/ecosystem">Ecosystem</a>
      <a href="/hic">HIC</a>
      <a href="/enterprise">Enterprise</a>
      <a href="/licensing">Licensing</a>
    </nav>
  </div>
</header>

<section class="hero wrap">
  <div class="eyebrow">LICENSING</div>
  <h1>License the intelligence, not just the software.</h1>
  <p>The Hybrid Intelligence Core is available as a standalone engine license, or as part of the full SLA113 factory platform. Every license includes routing, canon enforcement, and drift monitoring.</p>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">HIC ENGINE LICENSE</div>
    <h2>For builders who already have a product.</h2>
    <p>Drop the intelligence layer underneath your existing stack. Routing, canon enforcement, format normalization, drift monitoring. Fully white-labeled, zero Empire-1 branding.</p>
    <div class="ledger">
      <div class="ledger-row">
        <div class="ledger-tier blue">Routing Engine</div>
        <div class="ledger-body">
          <h3>Multi-Model Routing</h3>
          <p>Task classification and model selection. Every request goes to the model that's strongest at it.</p>
          <div class="ledger-includes">— Task analysis and classification<br>— Best-fit model selection<br>— Provider-agnostic routing</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier">Canon Enforcer</div>
        <div class="ledger-body">
          <h3>Output Normalization</h3>
          <p>Strip AI-tells, filler, and character breaks. Three different providers sound like one disciplined system.</p>
          <div class="ledger-includes">— Filler removal<br>— Character consistency<br>— Tone normalization</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier pink">Drift Monitor</div>
        <div class="ledger-body">
          <h3>Behavioral Tracking</h3>
          <p>Track every model against its own baseline. Tone, quality, compliance, error rate — flag decay before anyone notices.</p>
          <div class="ledger-includes">— Baseline tracking<br>— Anomaly detection<br>— Alert thresholds</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
      <div class="ledger-row">
        <div class="ledger-tier" style="color:var(--text);">Full HIC License</div>
        <div class="ledger-body">
          <h3>Complete Intelligence Layer</h3>
          <p>Everything above, plus format normalization, all specialized engines, and pipeline composition.</p>
          <div class="ledger-includes">— All four pillars<br>— 18+ specialized engines<br>— Pipeline Composer<br>— Fully white-labeled</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">SLA113 FACTORY LICENSE</div>
    <h2>The whole operator platform.</h2>
    <p>Not just the engine — the full console, 18+ specialized engines, Empire-1 HIC underneath it, and self-service white-label instance minting. Southern Lyfestyle runs on exactly this today.</p>
    <div class="ledger">
      <div class="ledger-row">
        <div class="ledger-tier gradient" style="background:linear-gradient(90deg,var(--gold),var(--pink),var(--blue));-webkit-background-clip:text;background-clip:text;color:transparent;">Full Factory</div>
        <div class="ledger-body">
          <h3>SLA113 Platform License</h3>
          <p>Everything in the HIC license, plus the full operator console, specialized engine set, and self-service branded instance minting.</p>
          <div class="ledger-includes">— Everything in HIC license<br>— Full operator console<br>— 18+ specialized engines<br>— Self-service white-label instance minting<br>— Pipeline orchestration<br>— Revenue and analytics dashboards</div>
        </div>
        <div class="ledger-price" style="font-size:20px;">Custom</div>
      </div>
    </div>
    <div class="ledger-note">Factory licensing includes deployment support, integration assistance, and ongoing access to engine updates. Contact us for pricing based on your deployment scope.</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">NEXT STEPS</div>
    <h2>Choose your license path.</h2>
    <p>Start with the free demo, purchase a Receipt for proof of work, or contact us for enterprise and factory licensing.</p>
    <div class="cta-row">
      <a href="/try-revenue-os" class="btn btn-primary">Try Free Demo →</a>
      <a href="/revenue-os" class="btn btn-ghost">Revenue OS →</a>
      <a href="/enterprise" class="btn btn-ghost">Enterprise →</a>
      <a href="mailto:licensing@empire1.cloud" class="btn btn-ghost">Contact Licensing →</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap footer-inner">
    <a href="/" class="mark">
      <img src="/empire1_logo.jpeg" alt="Empire-1" style="width:26px;height:26px;object-fit:contain;border-radius:4px;">
      <div class="wordmark" style="font-size:15px;">EMPIRE <span>1</span></div>
    </a>
  </div>
  <div class="wrap copy">© 2026 EMPIRE 1 · founder@empire1.cloud</div>
</footer>
`;

export default function LicensingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
