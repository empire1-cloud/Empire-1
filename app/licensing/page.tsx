import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Licensing — Empire-1',
  description: 'License the Hybrid Intelligence Core, individual engines, or the full SLA113 factory platform.',
};

const HIC_ENGINES = [
  { tier: 'Routing Engine', tierColor: 'var(--blue)', name: 'Multi-Model Routing', desc: 'Task classification and model selection. Every request goes to the model that\'s strongest at it.', includes: ['Task analysis and classification', 'Best-fit model selection', 'Provider-agnostic routing'] },
  { tier: 'Canon Enforcer', tierColor: 'var(--gold)', name: 'Output Normalization', desc: 'Strip AI-tells, filler, and character breaks. Three different providers sound like one disciplined system.', includes: ['Filler removal', 'Character consistency', 'Tone normalization'] },
  { tier: 'Drift Monitor', tierColor: 'var(--pink)', name: 'Behavioral Tracking', desc: 'Track every model against its own baseline. Tone, quality, compliance, error rate — flag decay before anyone notices.', includes: ['Baseline tracking', 'Anomaly detection', 'Alert thresholds'] },
  { tier: 'Full HIC License', tierColor: 'var(--text)', name: 'Complete Intelligence Layer', desc: 'Everything above, plus format normalization, all specialized engines, and pipeline composition.', includes: ['All four pillars', '18+ specialized engines', 'Pipeline Composer', 'Fully white-labeled'] },
];

const SLA113 = [
  { tier: 'Full Factory', name: 'SLA113 Platform License', desc: 'Everything in the HIC license, plus the full operator console, specialized engine set, and self-service branded instance minting.', includes: ['Everything in HIC license', 'Full operator console', '18+ specialized engines', 'Self-service white-label instance minting', 'Pipeline orchestration', 'Revenue and analytics dashboards'] },
];

export default function LicensingPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .ledger{border-top:1px solid var(--line-strong);}
        .ledger-row{display:grid;grid-template-columns:120px 1fr 140px;gap:24px;padding:30px 0;border-bottom:1px solid var(--line);align-items:start;}
        @media(max-width:700px){.ledger-row{grid-template-columns:1fr;gap:10px;}.ledger-price{text-align:left!important;}}
        .ledger-tier{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);padding-top:3px;}
        .ledger-body h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:22px;margin:0 0 8px;}
        .ledger-body p{color:#b4b4bb;font-size:14.5px;line-height:1.6;margin:0 0 12px;max-width:460px;}
        .ledger-includes{color:#8c8c95;font-size:12.5px;font-family:'JetBrains Mono',monospace;line-height:1.9;}
        .ledger-price{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:30px;text-align:right;padding-top:2px;}
        .ledger-note{margin-top:24px;color:var(--muted);font-size:13.5px;font-style:italic;}
        .factory-tier{background:linear-gradient(90deg,var(--gold),var(--pink),var(--blue));-webkit-background-clip:text;background-clip:text;color:transparent;}
      ` }} />

      <section className="hero wrap">
        <div className="eyebrow">LICENSING</div>
        <h1>License the intelligence, not just the software.</h1>
        <p>The Hybrid Intelligence Core is available as a standalone engine license, or as part of the full SLA113 factory platform. Every license includes routing, canon enforcement, and drift monitoring.</p>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">HIC ENGINE LICENSE</div>
          <h2>For builders who already have a product.</h2>
          <p>Drop the intelligence layer underneath your existing stack. Routing, canon enforcement, format normalization, drift monitoring. Fully white-labeled, zero Empire-1 branding.</p>
          <div className="ledger">
            {HIC_ENGINES.map((eng) => (
              <div className="ledger-row" key={eng.tier}>
                <div className="ledger-tier" style={{ color: eng.tierColor }}>{eng.tier}</div>
                <div className="ledger-body">
                  <h3>{eng.name}</h3>
                  <p>{eng.desc}</p>
                  <div className="ledger-includes">
                    {eng.includes.map((item) => (
                      <span key={item}>— {item}<br /></span>
                    ))}
                  </div>
                </div>
                <div className="ledger-price" style={{ fontSize: 20 }}>Custom</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">SLA113 FACTORY LICENSE</div>
          <h2>The whole operator platform.</h2>
          <p>Not just the engine — the full console, 18+ specialized engines, Empire-1 HIC underneath it, and self-service white-label instance minting. Built to demonstrate factory output.</p>
          <div className="ledger">
            {SLA113.map((item) => (
              <div className="ledger-row" key={item.tier}>
                <div className="ledger-tier factory-tier">{item.tier}</div>
                <div className="ledger-body">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <div className="ledger-includes">
                    {item.includes.map((inc) => (
                      <span key={inc}>— {inc}<br /></span>
                    ))}
                  </div>
                </div>
                <div className="ledger-price" style={{ fontSize: 20 }}>Custom</div>
              </div>
            ))}
          </div>
          <div className="ledger-note">Factory licensing includes deployment support, integration assistance, and ongoing access to engine updates. Contact us for pricing based on your deployment scope.</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">NEXT STEPS</div>
          <h2>Choose your license path.</h2>
          <p>Start with the free demo, purchase a Receipt for proof of work, or contact us for enterprise and factory licensing.</p>
          <div className="cta-row">
            <a href="/try-revenue-os" className="btn btn-primary">Try Free Demo →</a>
            <a href="/revenue-os" className="btn btn-ghost">Revenue OS →</a>
            <a href="/enterprise" className="btn btn-ghost">Enterprise →</a>
            <a href="mailto:licensing@empire1.cloud" className="btn btn-ghost">Contact Licensing →</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
