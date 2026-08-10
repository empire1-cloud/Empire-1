import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Hybrid Intelligence Core — Empire-1',
  description: 'The self-governing intelligence architecture behind every Empire-1 universe.',
};

const PILLARS = [
  { num: '01', name: 'Routing Engine', desc: 'Every task gets analyzed and sent to the model that\'s strongest at it — not whichever one is cheapest or loudest that quarter.' },
  { num: '02', name: 'Canon Enforcer', desc: 'Strips the tells — the "Certainly!", the filler, the model breaking character — so three different providers sound like one disciplined system.' },
  { num: '03', name: 'Format Normalizer', desc: 'Code, markdown, JSON, lists — standardized on the way out, regardless of which model generated the raw response.' },
  { num: '04', name: 'Drift Monitor', desc: 'Tracks every model against its own baseline — tone, quality, compliance, error rate — and flags decay before anyone notices.' },
];

const ENGINES = [
  { tag: 'Strategy', name: 'Strategy Engine', desc: 'High-level actionable strategies — not vague recommendations, but specific plays with timelines and resource allocation.' },
  { tag: 'Analysis', name: 'Analysis Engine', desc: 'Deep SWOT and structured analysis. Competitive dynamics, market positioning, opportunity mapping.' },
  { tag: 'Pricing', name: 'Pricing Engine', desc: 'Revenue-optimized pricing structures and tiers. Not guesswork — grounded in market data and willingness-to-pay signals.' },
  { tag: 'Pipeline', name: 'Money Pipeline Engine', desc: 'Transform ideas into monetizable systems. From concept to revenue architecture in one pass.' },
  { tag: 'Persona', name: 'Persona Engine', desc: 'User and customer persona generation. Behavioral patterns, decision triggers, segment-specific messaging.' },
  { tag: 'Evaluation', name: 'Evaluator Engine', desc: 'Score and evaluate against criteria. Idea scoring, concept validation, competitive benchmarking.' },
];

const PIPELINE_LINES = [
  { text: 'Task analyzed, routed to best-fit model', val: 'claude-sonnet-4.5' },
  { text: 'Canon Enforcer — filler and AI-tells stripped', val: 'compliant' },
  { text: 'Format Normalizer — output standardized', val: 'markdown' },
  { text: 'Drift Monitor — checked against baseline', val: 'normal' },
];

export default function HicPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />

      <section className="hero wrap">
        <div className="eyebrow">HYBRID INTELLIGENCE CORE</div>
        <h1>The intelligence behind every universe.</h1>
        <p>The HIC routes every task to whichever model is actually built for it — reasoning and code to one, long-context analysis to another, fast simple work to a third. Nothing gets forced through a single model. What comes out reads as one voice, one system, one standard.</p>
        <div className="cta-row">
          <a href="/try-revenue-os" className="btn btn-primary">Try Revenue OS →</a>
          <a href="/enterprise" className="btn btn-ghost">Enterprise Access</a>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">THE FOUR PILLARS</div>
          <h2>What the Core actually does.</h2>
          <div className="core-grid">
            {PILLARS.map((p) => (
              <div className="core-card" key={p.num}>
                <div className="core-card-num">{p.num}</div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">SPECIALIZED ENGINES</div>
          <h2>Built for specific work, not generic prompts.</h2>
          <p>The current HIC application configuration defines 18 engines. Backend availability and execution capability are verified separately; the examples below show representative engine roles.</p>
          <div className="engine-grid">
            {ENGINES.map((e) => (
              <div className="engine-card" key={e.name}>
                <div className="engine-tag">{e.tag}</div>
                <h4>{e.name}</h4>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">PIPELINE</div>
          <h2>Orchestrate multiple engines in one pass.</h2>
          <p>The Pipeline Composer chains engines together — strategy feeds pricing, pricing feeds persona, persona feeds the full plan. One request, multiple engines, one coherent output.</p>

          <div className="cockpit-panel">
            <div className="cockpit-head">
              <span className="cockpit-dot" /> hic://core/pipeline · interface preview
            </div>
            <div className="cockpit-body">
              {PIPELINE_LINES.map((line) => (
                <div className="cockpit-line" key={line.text}>
                  <span className="ok">✓</span> {line.text} <span className="cockpit-val">{line.val}</span>
                </div>
              ))}
              <div className="cockpit-line muted">— one voice out, regardless of which model answered —</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">ACCESS</div>
          <h2>Access the Core through Empire-1.</h2>
          <p>HIC is the intelligence core inside Empire-1. Customers access it through Empire-1 products, licensed integrations, and SLA113 deployments—not through a separate HIC storefront.</p>
          <div className="cta-row">
            <a href="/licensing" className="btn btn-primary">View HIC Pricing →</a>
            <a href="/revenue-os" className="btn btn-ghost">Revenue OS →</a>
            <a href="/enterprise" className="btn btn-ghost">Deploy Through Empire-1 →</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
