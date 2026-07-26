import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Licensing & Pricing — Empire-1',
  description: 'Public starting ranges for licensing the Empire-1 Hybrid Intelligence Core or the full SLA113 factory platform.',
};

const HIC_CAPABILITIES = [
  {
    name: 'Routing Engine',
    desc: 'Task classification, best-fit model selection, and provider-agnostic routing.',
  },
  {
    name: 'Canon Enforcer',
    desc: 'Filler removal, character consistency, and tone normalization across providers.',
  },
  {
    name: 'Format Normalizer',
    desc: 'Consistent code, markdown, JSON, and structured outputs regardless of the model used.',
  },
  {
    name: 'Drift Monitor',
    desc: 'Baseline tracking, anomaly detection, and deployment-specific alert thresholds.',
  },
];

const HIC_PLANS = [
  {
    tier: 'Founding Partner',
    tierColor: 'var(--blue)',
    name: 'Early Production HIC',
    price: '$0–$500/mo',
    secondary: '$500–$1,500 setup',
    desc: 'For the first production partners willing to share implementation feedback and support a real case study.',
    includes: [
      'Routing, canon enforcement, format normalization, and drift monitoring',
      'Deployment-scoped engine and pipeline access',
      'Direct founder support during the founding-partner period',
      'Defined usage and implementation scope',
    ],
  },
  {
    tier: 'Standard',
    tierColor: 'var(--gold)',
    name: 'Standard HIC License',
    price: '$1,500–$5,000/mo',
    secondary: 'or $15K–$50K/yr',
    desc: 'For a small or mid-sized team with a defined request volume and an existing product that needs the intelligence layer underneath it.',
    includes: [
      'Complete four-pillar HIC layer',
      'Agreed engine and Pipeline Composer access',
      'Standard service terms and usage allowance',
      'Fully white-labeled integration',
    ],
  },
  {
    tier: 'Enterprise',
    tierColor: 'var(--pink)',
    name: 'Enterprise HIC License',
    price: '$5,000–$20,000+/mo',
    secondary: 'or $50K–$250K+/yr',
    desc: 'For higher-volume deployments that need custom routing policies, integration support, and negotiated service terms.',
    includes: [
      'Custom routing, canon, and policy configuration',
      'Higher-volume or dedicated deployment scope',
      'Integration assistance and dedicated service terms',
      'Negotiated roadmap and support access',
    ],
  },
];

const SLA113_PLANS = [
  {
    tier: 'Factory Founding Partner',
    tierColor: 'var(--blue)',
    name: 'First Branded Factory Deployment',
    price: '$1,000–$2,500/mo',
    secondary: '$2K–$5K setup',
    desc: 'For the first full-platform partner launching a real branded instance and contributing production feedback and a case study.',
    includes: [
      'Full operator console and Empire-1 HIC',
      'Standard specialized-engine and white-label platform stack',
      'One branded deployment',
      'Direct founder implementation support',
    ],
  },
  {
    tier: 'Factory Standard',
    tierColor: 'var(--gold)',
    name: 'SLA113 Platform License',
    price: '$5,000–$15,000/mo',
    secondary: 'or $50K–$150K/yr',
    desc: 'For an operator running one branded platform with the standard factory stack and a defined deployment scope.',
    includes: [
      'Everything in the HIC license',
      'Full operator console and dashboards',
      'Standard engine and white-label platform stack',
      'Self-service branded instance minting',
      'Pipeline orchestration and standard service terms',
    ],
  },
  {
    tier: 'Factory Enterprise',
    tierColor: 'var(--pink)',
    name: 'Multi-Instance SLA113',
    price: '$20,000+/mo',
    secondary: 'or $200K+/yr',
    desc: 'For multi-instance operators that need dedicated infrastructure, custom engine configuration, and priority support.',
    includes: [
      'Multiple branded instances',
      'Dedicated infrastructure and deployment architecture',
      'Custom engine and policy configuration',
      'Priority support and negotiated roadmap access',
      'Deployment-specific service terms',
    ],
  },
];

export default function LicensingPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .pricing-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:34px;max-width:900px;}
        .summary-card{border:1px solid var(--line-strong);background:var(--surface);padding:22px;border-radius:10px;}
        .summary-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
        .summary-price{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:700;line-height:1;color:var(--text);}
        .summary-note{font-size:12.5px;color:#9a9aa3;margin-top:8px;line-height:1.5;}
        .ledger{border-top:1px solid var(--line-strong);margin-top:34px;}
        .ledger-row{display:grid;grid-template-columns:150px minmax(0,1fr) 210px;gap:28px;padding:34px 0;border-bottom:1px solid var(--line);align-items:start;}
        .ledger-tier{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);padding-top:4px;}
        .ledger-body h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;margin:0 0 8px;}
        .ledger-body p{color:#b4b4bb;font-size:14.5px;line-height:1.65;margin:0 0 14px;max-width:590px;}
        .ledger-includes{color:#92929b;font-size:12.5px;font-family:'JetBrains Mono',monospace;line-height:1.9;}
        .ledger-price{text-align:right;padding-top:1px;}
        .price-main{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:29px;line-height:1.05;color:var(--text);}
        .price-sub{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.5;color:var(--gold);margin-top:8px;}
        .cap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:30px;}
        .cap-card{border:1px solid var(--line);background:var(--surface);padding:22px;border-radius:9px;}
        .cap-card h3{font-family:'Barlow Condensed',sans-serif;font-size:21px;margin:0 0 8px;}
        .cap-card p{font-size:13.5px;color:#a9a9b2;line-height:1.6;margin:0;}
        .pricing-note{margin-top:24px;padding:18px 20px;border-left:2px solid var(--gold);background:rgba(232,185,35,.04);color:#a7a7b0;font-size:13.5px;line-height:1.65;}
        .usage-box{margin-top:22px;border:1px solid var(--line);padding:20px;border-radius:9px;background:var(--surface);}
        .usage-box strong{color:var(--text);}
        @media(max-width:820px){
          .ledger-row{grid-template-columns:1fr;gap:12px;}
          .ledger-price{text-align:left;}
          .pricing-summary,.cap-grid{grid-template-columns:1fr;}
        }
      ` }} />

      <section className="hero wrap">
        <div className="eyebrow">LICENSING &amp; PRICING</div>
        <h1>License the core or the whole factory.</h1>
        <p>These are public starting ranges—not a contact wall. Final pricing depends on usage, integration, support, infrastructure, deployment scope, and signed terms.</p>
        <div className="pricing-summary">
          <div className="summary-card">
            <div className="summary-label">HIC founding partner</div>
            <div className="summary-price">$0–$500/mo</div>
            <div className="summary-note">Plus $500–$1,500 setup. Standard HIC begins at $1,500/month.</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">SLA113 founding partner</div>
            <div className="summary-price">$1,000–$2,500/mo</div>
            <div className="summary-note">Plus $2,000–$5,000 setup. Standard factory licensing begins at $5,000/month.</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">HIC ENGINE LICENSE</div>
          <h2>For builders who already have a product.</h2>
          <p>Drop the intelligence layer underneath your existing stack. HIC licensing covers routing, canon enforcement, format normalization, drift monitoring, and deployment-scoped engine and pipeline access.</p>
          <div className="ledger">
            {HIC_PLANS.map((plan) => (
              <div className="ledger-row" key={plan.tier}>
                <div className="ledger-tier" style={{ color: plan.tierColor }}>{plan.tier}</div>
                <div className="ledger-body">
                  <h3>{plan.name}</h3>
                  <p>{plan.desc}</p>
                  <div className="ledger-includes">
                    {plan.includes.map((item) => (
                      <span key={item}>— {item}<br /></span>
                    ))}
                  </div>
                </div>
                <div className="ledger-price">
                  <div className="price-main">{plan.price}</div>
                  <div className="price-sub">{plan.secondary}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="usage-box">
            <strong>Usage-based alternative:</strong> negotiated per-request pricing or a 15–30% markup over raw model API cost may be available for trusted Standard or Enterprise deployments with real production volume.
          </div>

          <div className="cap-grid">
            {HIC_CAPABILITIES.map((capability) => (
              <div className="cap-card" key={capability.name}>
                <h3>{capability.name}</h3>
                <p>{capability.desc}</p>
              </div>
            ))}
          </div>
          <div className="pricing-note">The current HIC application configuration defines 18 engines. Licensed engine availability, usage limits, and Pipeline Composer access are set by the signed deployment scope rather than automatically granting every configuration to every licensee.</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">SLA113 FACTORY LICENSE</div>
          <h2>The whole operator platform.</h2>
          <p>SLA113 adds the operator console, specialized engine and white-label platform stack, orchestration, dashboards, and branded instance minting on top of Empire-1 HIC.</p>
          <div className="ledger">
            {SLA113_PLANS.map((plan) => (
              <div className="ledger-row" key={plan.tier}>
                <div className="ledger-tier" style={{ color: plan.tierColor }}>{plan.tier}</div>
                <div className="ledger-body">
                  <h3>{plan.name}</h3>
                  <p>{plan.desc}</p>
                  <div className="ledger-includes">
                    {plan.includes.map((item) => (
                      <span key={item}>— {item}<br /></span>
                    ))}
                  </div>
                </div>
                <div className="ledger-price">
                  <div className="price-main">{plan.price}</div>
                  <div className="price-sub">{plan.secondary}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pricing-note">Factory pricing may include deployment support, integration assistance, and access to applicable engine updates based on the signed deployment scope. Public ranges are directional starting points for negotiation, not guarantees or financial projections.</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">NEXT STEPS</div>
          <h2>Choose your license path.</h2>
          <p>Start with the free Revenue OS proof path, or contact Empire-1 with your product, expected request volume, integration needs, and deployment scope.</p>
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
