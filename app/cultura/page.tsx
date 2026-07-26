import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Cultura Vibe Forge — Empire-1',
  description: 'Cultura Vibe Forge is the finished cultural intelligence product inside Empire-1.',
};

const MODULES = [
  { num: '01', name: 'Authenticity Engine', desc: 'Keeps cultural output grounded in the people, place, history, and lived context it represents.' },
  { num: '02', name: 'Dialect Integrity', desc: 'Protects voice, phrasing, rhythm, regional language, and community-specific expression from flattening.' },
  { num: '03', name: 'Heritage Logic', desc: 'Carries provenance, cultural references, lineage, and meaning through the creative and operating process.' },
  { num: '04', name: 'Vibe Forge', desc: 'Turns cultural direction into usable creative systems, brand language, content logic, and execution-ready outputs.' },
];

const PIPELINE = [
  ['Context Intake', 'Place, people, history, audience, purpose'],
  ['Cultural Analysis', 'Signals, risks, references, dialect, lineage'],
  ['Integrity Pass', 'Authenticity, respect, consistency, provenance'],
  ['Forge Output', 'Creative direction, language system, execution pack'],
];

export default function CulturaPage() {
  return (
    <PublicPageShell>
      <style>{`
        .cultura-hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center}.cultura-console{background:linear-gradient(155deg,rgba(23,10,20,.96),rgba(8,8,13,.96));border:1px solid rgba(230,0,122,.28);border-radius:16px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.45)}.cultura-console-head{padding:14px 18px;border-bottom:1px solid var(--line);font:10px 'JetBrains Mono',monospace;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}.cultura-console-body{padding:18px}.cultura-line{display:grid;grid-template-columns:1fr auto;gap:20px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.07);font:12px 'JetBrains Mono',monospace}.cultura-line:last-child{border-bottom:0}.cultura-line span{color:#c6c6ce}.cultura-line b{color:#41e18b;font-weight:600}.module-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);margin-top:38px}.module-card{background:var(--surface);padding:28px}.module-card small{font:10px 'JetBrains Mono',monospace;color:var(--pink)}.module-card h3{font-family:'Barlow Condensed',sans-serif;font-size:25px;margin:14px 0 9px}.module-card p{color:#b4b4bb;line-height:1.65;font-size:14px}.pipeline{margin-top:34px;border:1px solid var(--line-strong);border-radius:14px;overflow:hidden}.pipeline-row{display:grid;grid-template-columns:180px 1fr;gap:22px;padding:20px 22px;border-bottom:1px solid var(--line)}.pipeline-row:last-child{border-bottom:0}.pipeline-row strong{font-family:'Barlow Condensed',sans-serif;font-size:20px}.pipeline-row span{color:#b4b4bb;line-height:1.55}.finished-badge{display:inline-flex;align-items:center;gap:8px;margin-top:18px;padding:9px 12px;border:1px solid rgba(65,225,139,.35);border-radius:999px;font:10px 'JetBrains Mono',monospace;color:#41e18b;text-transform:uppercase;letter-spacing:.08em}.finished-badge i{width:7px;height:7px;border-radius:50%;background:#41e18b;box-shadow:0 0 9px #41e18b}@media(max-width:760px){.cultura-hero-grid{grid-template-columns:1fr}.module-grid{grid-template-columns:1fr}.pipeline-row{grid-template-columns:1fr;gap:7px}}
      `}</style>

      <section className="hero wrap">
        <div className="cultura-hero-grid">
          <div>
            <div className="eyebrow">CULTURA VIBE FORGE</div>
            <h1>Cultural intelligence without cultural flattening.</h1>
            <p>Cultura is the finished Empire-1 product for authenticity, dialect integrity, heritage logic, and culturally grounded creative execution.</p>
            <div className="finished-badge"><i />Finished product</div>
            <div className="cta-row">
              <a href="mailto:founder@empire1.cloud?subject=Cultura%20Vibe%20Forge" className="btn btn-primary">Request Cultura Access →</a>
              <a href="/ecosystem" className="btn btn-ghost">Return to Ecosystem →</a>
            </div>
          </div>
          <div className="cultura-console">
            <div className="cultura-console-head">cultura://integrity-pipeline</div>
            <div className="cultura-console-body">
              <div className="cultura-line"><span>Authenticity Engine</span><b>READY</b></div>
              <div className="cultura-line"><span>Dialect Integrity</span><b>READY</b></div>
              <div className="cultura-line"><span>Heritage Logic</span><b>READY</b></div>
              <div className="cultura-line"><span>Vibe Forge</span><b>READY</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">FINISHED MODULES</div>
          <h2>The cultural operating layer.</h2>
          <div className="module-grid">
            {MODULES.map((module) => (
              <div className="module-card" key={module.num}>
                <small>{module.num}</small>
                <h3>{module.name}</h3>
                <p>{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">EXECUTION PIPELINE</div>
          <h2>From cultural context to usable output.</h2>
          <div className="pipeline">
            {PIPELINE.map(([name, desc]) => <div className="pipeline-row" key={name}><strong>{name}</strong><span>{desc}</span></div>)}
          </div>
          <div className="cta-row">
            <a href="/licensing" className="btn btn-primary">View Empire-1 Licensing →</a>
            <a href="mailto:founder@empire1.cloud?subject=Cultura%20Partnership" className="btn btn-ghost">Discuss a Cultura Deployment →</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
