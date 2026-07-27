import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Applied AI Services — Empire-1',
  description: 'AI operations audits, automation sprints, and governance readiness built around measurable business outcomes.',
};

const OFFERS = [
  {
    tag: 'START HERE',
    name: 'AI Operations Audit',
    price: '$750–$1,500',
    timeline: '5–7 business days',
    description: 'We map the work slowing your company down, identify the highest-value automation opportunities, and deliver a practical 30-day implementation plan.',
    includes: ['Workflow and tool review', 'Revenue-leak and follow-up analysis', 'AI and data-risk inventory', 'Prioritized 30-day roadmap'],
  },
  {
    tag: 'CORE BUILD',
    name: 'AI Automation Sprint',
    price: '$2,500–$7,500',
    timeline: '2–4 weeks',
    description: 'We design and implement one complete business outcome—from intake through execution, approval, reporting, and handoff.',
    includes: ['One production-focused workflow', 'Human approval and exception paths', 'Evidence and activity logging', 'Handoff, training, and launch checklist'],
  },
  {
    tag: 'PREMIUM',
    name: 'AI Governance Readiness',
    price: '$3,500–$12,000',
    timeline: '3–6 weeks',
    description: 'We help teams document and control how AI is used so leadership can adopt automation without losing accountability, evidence, or operational control.',
    includes: ['AI system and vendor inventory', 'Risk register and data-flow map', 'Human oversight requirements', 'Policy, incident, and evidence templates'],
  },
  {
    tag: 'ONGOING',
    name: 'Managed Improvement',
    price: '$1,000–$3,000/mo',
    timeline: 'Monthly',
    description: 'We monitor the workflows we built, improve weak points, add approved capabilities, and keep the operating evidence current.',
    includes: ['Monthly workflow review', 'Performance and failure analysis', 'Approved improvements', 'Operating summary and next actions'],
  },
];

const OUTCOMES = [
  { num: '01', title: 'Revenue operations', body: 'Lead intake, qualification, follow-up, pipeline visibility, proposals, and revenue receipts.' },
  { num: '02', title: 'Founder operations', body: 'Priorities, decision records, evidence, approvals, risks, and weekly operating visibility.' },
  { num: '03', title: 'Content systems', body: 'Capture one source idea and turn it into governed, channel-ready content without losing voice or provenance.' },
  { num: '04', title: 'Customer operations', body: 'Intake, routing, response support, escalation, handoff, and service-quality evidence.' },
  { num: '05', title: 'Creator and royalty workflows', body: 'Ownership records, authorization, usage events, royalty evidence, fraud checkpoints, and payout reporting.' },
  { num: '06', title: 'AI control and readiness', body: 'System inventory, vendor risk, access controls, human review points, incident plans, and audit-ready evidence.' },
];

const PROCESS = [
  { step: '01', title: 'Diagnose', body: 'We start with the business outcome, the current workflow, and the cost of leaving it broken.' },
  { step: '02', title: 'Design', body: 'We define the smallest complete system that can produce measurable value without creating uncontrolled risk.' },
  { step: '03', title: 'Build', body: 'We implement the workflow, approval gates, evidence trail, and operational handoff.' },
  { step: '04', title: 'Prove', body: 'We test the real path, document what happened, and leave you with a clear next-stage decision.' },
];

export default function ServicesPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .services-hero{padding-bottom:70px;}
        .services-hero h1{max-width:820px;}
        .services-hero p{max-width:720px;}
        .signal-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px;}
        .signal{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;border:1px solid var(--line-strong);padding:9px 12px;color:#b4b4bb;background:var(--surface);}
        .offer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:38px;}
        @media(max-width:760px){.offer-grid{grid-template-columns:1fr;}}
        .offer-card{position:relative;background:var(--surface);border:1px solid var(--line-strong);padding:28px;display:flex;flex-direction:column;min-height:390px;}
        .offer-tag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;color:var(--gold);margin-bottom:18px;}
        .offer-card h3{font-family:'Barlow Condensed',sans-serif;font-size:27px;margin:0 0 8px;}
        .offer-price{font-family:'Barlow Condensed',sans-serif;font-size:31px;font-weight:700;color:var(--text);}
        .offer-time{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--muted);margin:5px 0 20px;text-transform:uppercase;letter-spacing:.06em;}
        .offer-card p{color:#b4b4bb;line-height:1.65;font-size:14px;margin:0 0 20px;}
        .offer-list{list-style:none;padding:0;margin:0 0 26px;}
        .offer-list li{font-size:13px;color:#c7c7cd;padding:9px 0;border-bottom:1px solid var(--line);}
        .offer-list li::before{content:'✓';color:#3ddc84;margin-right:9px;}
        .offer-card .offer-link{margin-top:auto;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;}
        .outcome-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);margin-top:36px;}
        @media(max-width:760px){.outcome-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:500px){.outcome-grid{grid-template-columns:1fr;}}
        .outcome-card{background:var(--surface);padding:25px 22px;}
        .outcome-card .num{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);margin-bottom:12px;}
        .outcome-card h3{font-family:'Barlow Condensed',sans-serif;font-size:20px;margin:0 0 9px;}
        .outcome-card p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}
        .process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:34px;}
        @media(max-width:760px){.process-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:500px){.process-grid{grid-template-columns:1fr;}}
        .process-card{border-top:2px solid var(--gold);padding-top:18px;}
        .process-step{font-family:'JetBrains Mono',monospace;color:var(--muted);font-size:10px;letter-spacing:.1em;}
        .process-card h3{font-family:'Barlow Condensed',sans-serif;font-size:22px;margin:9px 0 8px;}
        .process-card p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}
        .truth-panel{border-left:2px solid var(--pink);background:linear-gradient(90deg,rgba(230,0,122,.08),transparent);padding:30px 32px;margin-top:30px;}
        .truth-panel h3{font-family:'Barlow Condensed',sans-serif;font-size:25px;margin:0 0 12px;}
        .truth-panel p{color:#c7c7cd;line-height:1.7;max-width:760px;margin:0 0 12px;}
        .truth-panel p:last-child{margin-bottom:0;}
        .launch-panel{background:var(--surface);border:1px solid var(--line-strong);padding:38px;margin-top:26px;}
        .launch-panel h2{margin-top:0;}
        .launch-panel p{max-width:690px;}
      ` }} />

      <section className="hero wrap services-hero">
        <div className="eyebrow">EMPIRE-1 APPLIED AI SERVICES</div>
        <h1>Automate the work. Keep control of the decisions.</h1>
        <p>We help startups, creators, and growing businesses turn scattered tools and manual processes into working AI operations—with clear approvals, evidence, and a measurable business outcome.</p>
        <div className="cta-row">
          <a href="/services/intake" className="btn btn-primary">Start a Project →</a>
          <a href="#offers" className="btn btn-ghost">See Services</a>
        </div>
        <div className="signal-row">
          <span className="signal">Outcome-first</span>
          <span className="signal">Human-controlled</span>
          <span className="signal">Evidence-backed</span>
          <span className="signal">Built for revenue</span>
        </div>
      </section>

      <section className="section" id="offers">
        <div className="wrap">
          <div className="eyebrow">SERVICE LADDER</div>
          <h2>Start with clarity. Build only what earns its place.</h2>
          <p>Every engagement begins with a defined problem, owner, outcome, and proof standard. Pricing varies with integrations, data sensitivity, and operational complexity.</p>
          <div className="offer-grid">
            {OFFERS.map((offer) => (
              <article className="offer-card" key={offer.name}>
                <div className="offer-tag">{offer.tag}</div>
                <h3>{offer.name}</h3>
                <div className="offer-price">{offer.price}</div>
                <div className="offer-time">{offer.timeline}</div>
                <p>{offer.description}</p>
                <ul className="offer-list">
                  {offer.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <a className="offer-link" href="/services/intake">Scope this service →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">WHAT WE BUILD</div>
          <h2>Complete operating outcomes—not disconnected AI tricks.</h2>
          <div className="outcome-grid">
            {OUTCOMES.map((outcome) => (
              <article className="outcome-card" key={outcome.num}>
                <div className="num">{outcome.num}</div>
                <h3>{outcome.title}</h3>
                <p>{outcome.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">DELIVERY METHOD</div>
          <h2>Diagnose. Design. Build. Prove.</h2>
          <div className="process-grid">
            {PROCESS.map((item) => (
              <article className="process-card" key={item.step}>
                <div className="process-step">STEP {item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">HONEST BOUNDARIES</div>
          <h2>We sell control—not false certainty.</h2>
          <div className="truth-panel">
            <h3>Readiness support is not certification.</h3>
            <p>Empire-1 can build governance controls, inventories, risk records, evidence workflows, and readiness documentation. We do not issue SOC reports, legal opinions, or regulatory certifications.</p>
            <p>We also do not sell 24/7 managed detection and response. Security work is limited to architecture, access, secrets hygiene, vendor risk, evidence, and incident-readiness unless a qualified security partner is formally included.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="launch-panel">
            <div className="eyebrow">BUILD THE FIRST WIN</div>
            <h2>Bring the workflow that is costing you time, money, or control.</h2>
            <p>Tell us what is broken, what outcome matters, and what systems are already involved. We will respond with the smallest credible engagement and a clear scope.</p>
            <div className="cta-row">
              <a href="/services/intake" className="btn btn-primary">Open Project Intake →</a>
              <a href="mailto:founder@empire1.cloud?subject=Empire-1%20Applied%20AI%20Services" className="btn btn-ghost">Email the Founder</a>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
