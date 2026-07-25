import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hybrid Intelligence Core — Empire-1',
  description: 'The self-governing intelligence architecture behind every Empire-1 universe.',
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

.core-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line-strong);margin-top:40px;border:1px solid var(--line-strong);}
@media(max-width:760px){.core-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.core-grid{grid-template-columns:1fr;}}
.core-card{background:var(--surface);padding:26px 22px;}
.core-card-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);letter-spacing:0.06em;margin-bottom:14px;}
.core-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:19px;margin:0 0 10px;}
.core-card p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}

.engine-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);margin-top:40px;border:1px solid var(--line-strong);}
@media(max-width:760px){.engine-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.engine-grid{grid-template-columns:1fr;}}
.engine-card{background:var(--surface);padding:22px 20px;}
.engine-card h4{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;margin:0 0 8px;}
.engine-card p{font-size:12.5px;line-height:1.55;color:#b4b4bb;margin:0;}
.engine-tag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}

.cockpit-panel{background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;overflow:hidden;margin-top:40px;}
.cockpit-head{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--muted);padding:14px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:9px;}
.cockpit-dot{width:7px;height:7px;border-radius:50%;background:#3ddc84;box-shadow:0 0 8px #3ddc84;display:inline-block;}
.cockpit-body{padding:22px 22px 8px;}
.cockpit-line{font-family:'JetBrains Mono',monospace;font-size:13px;color:#c7c7cd;padding:9px 0;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line);}
.cockpit-line:last-of-type{border-bottom:none;}
.cockpit-line .ok{color:#3ddc84;}
.cockpit-line .cockpit-val{margin-left:auto;color:var(--gold);}
.cockpit-line.muted{color:var(--muted);font-style:italic;justify-content:center;border-bottom:none;padding-top:14px;}

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
  <div class="eyebrow">HYBRID INTELLIGENCE CORE</div>
  <h1>The intelligence behind every universe.</h1>
  <p>The HIC routes every task to whichever model is actually built for it — reasoning and code to one, long-context analysis to another, fast simple work to a third. Nothing gets forced through a single model. What comes out reads as one voice, one system, one standard.</p>
  <div class="cta-row">
    <a href="/try-revenue-os" class="btn btn-primary">Try Revenue OS →</a>
    <a href="/enterprise" class="btn btn-ghost">Enterprise Access</a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">THE FOUR PILLARS</div>
    <h2>What the Core actually does.</h2>
    <div class="core-grid">
      <div class="core-card">
        <div class="core-card-num">01</div>
        <h3>Routing Engine</h3>
        <p>Every task gets analyzed and sent to the model that's strongest at it — not whichever one is cheapest or loudest that quarter.</p>
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
        <p>Tracks every model against its own baseline — tone, quality, compliance, error rate — and flags decay before anyone notices.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">SPECIALIZED ENGINES</div>
    <h2>Built for specific work, not generic prompts.</h2>
    <p>Each engine is purpose-built for a domain. Strategy, analysis, pricing, personas, creative direction — routed to the engine that actually knows the domain.</p>
    <div class="engine-grid">
      <div class="engine-card">
        <div class="engine-tag">Strategy</div>
        <h4>Strategy Engine</h4>
        <p>High-level actionable strategies — not vague recommendations, but specific plays with timelines and resource allocation.</p>
      </div>
      <div class="engine-card">
        <div class="engine-tag">Analysis</div>
        <h4>Analysis Engine</h4>
        <p>Deep SWOT and structured analysis. Competitive dynamics, market positioning, opportunity mapping.</p>
      </div>
      <div class="engine-card">
        <div class="engine-tag">Pricing</div>
        <h4>Pricing Engine</h4>
        <p>Revenue-optimized pricing structures and tiers. Not guesswork — grounded in market data and willingness-to-pay signals.</p>
      </div>
      <div class="engine-card">
        <div class="engine-tag">Pipeline</div>
        <h4>Money Pipeline Engine</h4>
        <p>Transform ideas into monetizable systems. From concept to revenue architecture in one pass.</p>
      </div>
      <div class="engine-card">
        <div class="engine-tag">Persona</div>
        <h4>Persona Engine</h4>
        <p>User and customer persona generation. Behavioral patterns, decision triggers, segment-specific messaging.</p>
      </div>
      <div class="engine-card">
        <div class="engine-tag">Evaluation</div>
        <h4>Evaluator Engine</h4>
        <p>Score and evaluate against criteria. Idea scoring, concept validation, competitive benchmarking.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">PIPELINE</div>
    <h2>Orchestrate multiple engines in one pass.</h2>
    <p>The Pipeline Composer chains engines together — strategy feeds pricing, pricing feeds persona, persona feeds the full plan. One request, multiple engines, one coherent output.</p>

    <div class="cockpit-panel">
      <div class="cockpit-head">
        <span class="cockpit-dot"></span> hic://core/pipeline · live
      </div>
      <div class="cockpit-body">
        <div class="cockpit-line"><span class="ok">✓</span> Task analyzed, routed to best-fit model <span class="cockpit-val">claude-sonnet-4.5</span></div>
        <div class="cockpit-line"><span class="ok">✓</span> Canon Enforcer — filler and AI-tells stripped <span class="cockpit-val">compliant</span></div>
        <div class="cockpit-line"><span class="ok">✓</span> Format Normalizer — output standardized <span class="cockpit-val">markdown</span></div>
        <div class="cockpit-line"><span class="ok">✓</span> Drift Monitor — checked against baseline <span class="cockpit-val">normal</span></div>
        <div class="cockpit-line muted">— one voice out, regardless of which model answered —</div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">ACCESS</div>
    <h2>Use the Core directly, or through a universe.</h2>
    <p>The HIC is available as a standalone intelligence layer, or as the engine underneath Revenue OS, SLA113, and every other Empire-1 universe. Same core, different surfaces.</p>
    <div class="cta-row">
      <a href="/revenue-os" class="btn btn-primary">Revenue OS →</a>
      <a href="/enterprise" class="btn btn-ghost">Enterprise Deployment →</a>
      <a href="/licensing" class="btn btn-ghost">License the Engine →</a>
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

export default function HicPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
