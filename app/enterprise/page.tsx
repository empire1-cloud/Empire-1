import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise — Empire-1',
  description: 'Deploy Empire-1 intelligence, orchestration, and governed workflows inside your organization.',
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

.cap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);margin-top:40px;border:1px solid var(--line-strong);}
@media(max-width:760px){.cap-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.cap-grid{grid-template-columns:1fr;}}
.cap-card{background:var(--surface);padding:26px 22px;}
.cap-card-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);letter-spacing:0.06em;margin-bottom:14px;}
.cap-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:19px;margin:0 0 10px;}
.cap-card p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}

.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:40px;}
.btn{font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:0.05em;text-transform:uppercase;padding:15px 26px;border-radius:2px;display:inline-flex;align-items:center;gap:8px;transition:transform .18s ease,box-shadow .18s ease;}
.btn-primary{background:var(--gold);color:#0a0a0a;font-weight:600;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,185,35,0.25);}
.btn-ghost{border:1px solid var(--line-strong);color:var(--text);}
.btn-ghost:hover{border-color:var(--pink);color:var(--pink);}

.contact-panel{background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;padding:32px;margin-top:40px;}
.contact-panel h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:22px;margin:0 0 12px;}
.contact-panel p{color:#b4b4bb;font-size:14.5px;line-height:1.6;margin:0 0 20px;}
.contact-email{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--gold);letter-spacing:0.04em;}

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
  <div class="eyebrow">ENTERPRISE</div>
  <h1>Deploy Empire-1 inside your organization.</h1>
  <p>Private deployment, API access, engine and pipeline licensing, governance and policy controls, white-label capability, custom integrations, and usage evidence — all verified in the repository.</p>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">CAPABILITIES</div>
    <h2>What enterprise deployment includes.</h2>
    <div class="cap-grid">
      <div class="cap-card">
        <div class="cap-card-num">01</div>
        <h3>Private Deployment</h3>
        <p>Run the Hybrid Intelligence Core on your own infrastructure. No data leaves your environment. Full sovereignty over your intelligence layer.</p>
      </div>
      <div class="cap-card">
        <div class="cap-card-num">02</div>
        <h3>API Access</h3>
        <p>Direct API access to the routing engine, canon enforcement, and all specialized engines. Integrate into your existing stack.</p>
      </div>
      <div class="cap-card">
        <div class="cap-card-num">03</div>
        <h3>Engine Licensing</h3>
        <p>License individual engines or the full engine set. Strategy, analysis, pricing, pipeline, persona — pick what you need.</p>
      </div>
      <div class="cap-card">
        <div class="cap-card-num">04</div>
        <h3>Governance Controls</h3>
        <p>Policy enforcement, access controls, audit trails. Run the Core with the governance your organization requires.</p>
      </div>
      <div class="cap-card">
        <div class="cap-card-num">05</div>
        <h3>White-Label</h3>
        <p>Fully white-labeled. Zero Empire-1 branding. Your product, your customers, your name — with our intelligence underneath.</p>
      </div>
      <div class="cap-card">
        <div class="cap-card-num">06</div>
        <h3>Custom Integrations</h3>
        <p>Connect the Core to your existing tools, workflows, and data sources. Custom pipeline configuration for your specific domain.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">SEPARATION</div>
    <h2>Clear pathways for every use case.</h2>
    <p>Enterprise deployment is distinct from product access, HIC licensing, and factory licensing. Each pathway is designed for a specific level of commitment and control.</p>

    <div class="contact-panel">
      <h3>Product Access</h3>
      <p>Try Revenue OS for free, purchase a Revenue Receipt ($299), or book a Revenue Sprint ($999). No enterprise agreement required.</p>
    </div>
    <div class="contact-panel">
      <h3>HIC Licensing</h3>
      <p>License the routing engine, canon enforcement, and drift monitoring for your own product. White-labeled, no Empire-1 branding.</p>
    </div>
    <div class="contact-panel">
      <h3>Factory Licensing (SLA113)</h3>
      <p>License the full operator platform — console, 18+ engines, and self-service white-label instance minting.</p>
    </div>
    <div class="contact-panel">
      <h3>Enterprise Deployment</h3>
      <p>Private infrastructure, governance controls, custom integrations, and dedicated support. Contact us to discuss your requirements.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">CONTACT</div>
    <h2>Request Enterprise Access</h2>
    <p>Tell us about your organization, your use case, and what you need from the intelligence layer. We'll respond with a deployment plan and pricing.</p>
    <div class="contact-panel">
      <h3>Contact Empire-1</h3>
      <p>Enterprise pricing is custom — based on deployment scope, engine selection, and integration requirements. No published rate card. No hidden fees.</p>
      <div class="contact-email">enterprise@empire1.cloud</div>
    </div>
    <div class="cta-row">
      <a href="mailto:enterprise@empire1.cloud" class="btn btn-primary">Request Enterprise Access →</a>
      <a href="/licensing" class="btn btn-ghost">View Licensing →</a>
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

export default function EnterprisePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
