import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecosystem — Empire-1',
  description: 'The product universes built on the Hybrid Intelligence Core.',
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
.display{font-family:'Barlow Condensed',sans-serif;}

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

.eco-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);margin-top:40px;}
@media(max-width:760px){.eco-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.eco-grid{grid-template-columns:1fr;}}
.eco-card{background:var(--surface);padding:28px 24px;transition:background .2s;}
.eco-card:hover{background:rgba(232,185,35,0.04);}
.eco-tag{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
.eco-tag.gold{color:var(--gold);}
.eco-tag.pink{color:var(--pink);}
.eco-tag.blue{color:var(--blue);}
.eco-tag.green{color:#3ddc84;}
.eco-tag.muted{color:var(--muted);}
.eco-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;margin:0 0 10px;}
.eco-card p{font-size:13.5px;line-height:1.6;color:#b4b4bb;margin:0 0 16px;}
.eco-status{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;display:flex;align-items:center;gap:8px;}
.eco-status .dot{width:6px;height:6px;border-radius:50%;}
.dot-live{background:#3ddc84;box-shadow:0 0 8px #3ddc84;}
.dot-active{background:var(--gold);box-shadow:0 0 8px var(--gold);}
.dot-dev{background:var(--muted);}

.section{padding:80px 28px;border-top:1px solid var(--line);}
.section h2{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:clamp(28px,4vw,42px);line-height:1.05;margin:14px 0 0;max-width:680px;}
.section p{color:#c7c7cd;line-height:1.7;font-size:16px;max-width:620px;margin:20px 0 0;}

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
  <div class="eyebrow">ECOSYSTEM</div>
  <h1>Every universe runs on the same core.</h1>
  <p>Empire-1 is not one product — it's a system of independent universes, each built on the Hybrid Intelligence Core. Every universe carries its own identity, its own provenance, and its own obligation to survive on revenue, not permission.</p>
</section>

<section class="section">
  <div class="wrap">
    <div class="eco-grid">
      <div class="eco-card">
        <div class="eco-tag blue">Intelligence Layer</div>
        <h3>Hybrid Intelligence Core</h3>
        <p>The routing engine, canon enforcement, format normalization, and drift monitoring that powers every universe. Multi-model orchestration behind one voice.</p>
        <div class="eco-status"><span class="dot dot-live"></span> Live</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag gold">Factory</div>
        <h3>SLA113</h3>
        <p>The sovereign control plane and factory that produces white-label operating systems, platforms, and branded business instances. 18+ specialized engines.</p>
        <div class="eco-status"><span class="dot dot-live"></span> Live</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag green">Revenue Engine</div>
        <h3>Revenue OS</h3>
        <p>Turn your business into a revenue system. AI-powered pipeline orchestration — from lead generation to deal closure, with real receipts and evidence.</p>
        <div class="eco-status"><span class="dot dot-live"></span> Live</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag pink">Music Ecosystem</div>
        <h3>Lyrica 3</h3>
        <p>Creator-owned music intelligence — provenance, rights, and cultural context carried with every piece of work from creation forward.</p>
        <div class="eco-status"><span class="dot dot-active"></span> Active</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag gold">Trust Layer</div>
        <h3>Archisynapse</h3>
        <p>The trust, ledger, fraud, royalty, and payment infrastructure. Settlement and verification for every transaction across the empire.</p>
        <div class="eco-status"><span class="dot dot-active"></span> Active</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag blue">Public Proof</div>
        <h3>Southern Lyfestyle</h3>
        <p>An independent experience business powered by SLA113. Real revenue, real customers, real proof that the factory works.</p>
        <div class="eco-status"><span class="dot dot-live"></span> Live</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag pink">Gaming</div>
        <h3>Southern Arcade</h3>
        <p>Arcade OS built on SLA113 — entertainment as a revenue-generating universe with its own identity and provenance chain.</p>
        <div class="eco-status"><span class="dot dot-active"></span> Active</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag muted">Platform</div>
        <h3>Sonance Pro</h3>
        <p>Professional audio intelligence — sound design, mastering, and production tools built on the Empire-1 core.</p>
        <div class="eco-status"><span class="dot dot-dev"></span> In Development</div>
      </div>
      <div class="eco-card">
        <div class="eco-tag muted">Narrative</div>
        <h3>Empire Narrative</h3>
        <p>Story intelligence — character consistency, world-building, and narrative coherence across creative projects.</p>
        <div class="eco-status"><span class="dot dot-dev"></span> In Development</div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow">THE LAW</div>
    <h2>If it doesn't generate revenue, it doesn't stay.</h2>
    <p>Every universe under Empire-1 answers to the same law: pull your own weight or get cut. No universe survives on story alone. No universe survives on founder sentiment. What survives here has already proven it can generate real revenue on its own terms.</p>
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

export default function EcosystemPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
