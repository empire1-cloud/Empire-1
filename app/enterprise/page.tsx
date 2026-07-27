import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Enterprise — Empire-1',
  description: 'Deploy Empire-1 intelligence, orchestration, and governed workflows inside your organization.',
};

const CAPABILITIES = [
  { num: '01', name: 'Private Deployment', desc: 'Run the Hybrid Intelligence Core on your own infrastructure. No data leaves your environment. Full sovereignty over your intelligence layer.' },
  { num: '02', name: 'API Access', desc: 'Direct API access to the routing engine, canon enforcement, and specialized engines. Integrate into your existing stack.' },
  { num: '03', name: 'Engine Licensing', desc: 'License individual engines or the full application-configured engine set. Strategy, analysis, pricing, pipeline, persona — pick what you need.' },
  { num: '04', name: 'Governance Controls', desc: 'Policy enforcement, access controls, audit trails. Run the Core with the governance your organization requires.' },
  { num: '05', name: 'White-Label', desc: 'Fully white-labeled. Zero Empire-1 branding. Your product, your customers, your name — with our intelligence underneath.' },
  { num: '06', name: 'Custom Integrations', desc: 'Connect the Core to your existing tools, workflows, and data sources. Custom pipeline configuration for your specific domain.' },
];

const PATHWAYS = [
  { name: 'Applied AI Services', desc: 'Start with an AI Operations Audit, Automation Sprint, or Governance Readiness engagement. Designed for businesses that need a working outcome before a platform commitment.' },
  { name: 'Product Access', desc: 'Try Revenue OS for free, purchase a Revenue Receipt ($299), or book a Revenue Sprint ($999). No enterprise agreement required.' },
  { name: 'HIC Licensing', desc: 'License the routing engine, canon enforcement, and drift monitoring for your own product. White-labeled, no Empire-1 branding.' },
  { name: 'Factory Licensing (SLA113)', desc: 'License the full operator platform — console, a specialized engine and white-label platform stack, and self-service white-label instance minting.' },
  { name: 'Enterprise Deployment', desc: 'Private infrastructure, governance controls, custom integrations, and dedicated support. Contact us to discuss your requirements.' },
];

export default function EnterprisePage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .cap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);margin-top:40px;border:1px solid var(--line-strong);}
        @media(max-width:760px){.cap-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:480px){.cap-grid{grid-template-columns:1fr;}}
        .cap-card{background:var(--surface);padding:26px 22px;}
        .cap-card-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);letter-spacing:0.06em;margin-bottom:14px;}
        .cap-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:19px;margin:0 0 10px;}
        .cap-card p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}

        .contact-panel{background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;padding:32px;margin-top:20px;}
        .contact-panel h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:22px;margin:0 0 12px;}
        .contact-panel p{color:#b4b4bb;font-size:14.5px;line-height:1.6;margin:0 0 20px;}
        .contact-email{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--gold);letter-spacing:0.04em;}
      ` }} />

      <section className="hero wrap">
        <div className="eyebrow">ENTERPRISE</div>
        <h1>Deploy Empire-1 inside your organization.</h1>
        <p>Private deployment, API access, engine and pipeline licensing, governance and policy controls, white-label capability, custom integrations, and usage evidence — offered through a custom enterprise pathway.</p>
        <div className="cta-row">
          <a href="/services" className="btn btn-primary">Explore Applied AI Services →</a>
          <a href="#enterprise-contact" className="btn btn-ghost">Request Enterprise Access</a>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">CAPABILITIES</div>
          <h2>What enterprise deployment can include.</h2>
          <div className="cap-grid">
            {CAPABILITIES.map((cap) => (
              <div className="cap-card" key={cap.num}>
                <div className="cap-card-num">{cap.num}</div>
                <h3>{cap.name}</h3>
                <p>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">SEPARATION</div>
          <h2>Clear pathways for every use case.</h2>
          <p>Applied services, enterprise deployment, product access, HIC licensing, and factory licensing remain distinct. Each pathway is designed for a specific level of commitment and control.</p>
          {PATHWAYS.map((p) => (
            <div className="contact-panel" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              {p.name === 'Applied AI Services' && <a href="/services" className="contact-email">View services and published ranges →</a>}
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="enterprise-contact">
        <div className="wrap">
          <div className="eyebrow">CONTACT</div>
          <h2>Request Enterprise Access</h2>
          <p>Tell us about your organization, your use case, and what you need from the intelligence layer. We&apos;ll respond with a deployment plan and pricing.</p>
          <div className="contact-panel">
            <h3>Contact Empire-1</h3>
            <p>Enterprise pricing is custom — based on deployment scope, engine selection, and integration requirements. No published rate card. No hidden fees.</p>
            <div className="contact-email">enterprise@empire1.cloud</div>
          </div>
          <div className="cta-row">
            <a href="mailto:enterprise@empire1.cloud" className="btn btn-primary">Request Enterprise Access →</a>
            <a href="/services/intake" className="btn btn-ghost">Start a Smaller Service Project</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
