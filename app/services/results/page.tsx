import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Proof and Results — Empire-1 Applied AI Services',
  description: 'See how Empire-1 proves workflow delivery with operating paths, evidence, limitations, and human-control boundaries.',
};

const PROOF_CARDS = [
  {
    status: 'INTERNAL IMPLEMENTATION',
    title: 'Revenue workflow from offer to delivery receipt',
    outcome: 'A unified operating path can generate an offer, buyer profile, outreach package, lead record, payment path, delivery receipt, and pipeline summary.',
    proof: ['Public Revenue OS route', 'Revenue and delivery receipt endpoints', 'Lead-stage tracking', 'Manual payment fallback when Stripe is unavailable'],
    limits: 'Current MVP uses JSON persistence, does not send outreach automatically, and requires authentication and database hardening before multi-user production use.',
  },
  {
    status: 'INTERNAL IMPLEMENTATION',
    title: 'Buyer path from free diagnosis to paid engagement',
    outcome: 'A visitor can identify one operational leak, receive a preliminary result, inspect proof standards, and enter a scoped paid-services pathway.',
    proof: ['Free workflow leak scan', 'Published service ladder', 'Privacy-safe project intake', 'Enterprise escalation path'],
    limits: 'The free scan is deterministic screening—not a completed audit, guaranteed savings estimate, legal conclusion, or security assessment.',
  },
  {
    status: 'DELIVERY STANDARD',
    title: 'Human-controlled automation with evidence',
    outcome: 'Every client workflow is designed around a named trigger, accountable owner, human decision boundary, exception path, and completion evidence.',
    proof: ['Current-state and target-state maps', 'Approval and exception records', 'Test scenarios and results', 'Delivery receipt and known limitations'],
    limits: 'Empire-1 does not promise autonomous high-impact decisions, unlimited revisions, 24/7 managed security, or invisible execution behavior.',
  },
  {
    status: 'ARCHITECTURE PROOF',
    title: 'Separate products without flattening the business',
    outcome: 'The same operating discipline can support revenue, creator, cultural, payment, and tenant workflows while preserving product boundaries.',
    proof: ['Universe registry', 'Tenant routing', 'Separate licensing pathways', 'Control-plane and evidence patterns'],
    limits: 'Patterns may be reused, but private internal systems and product-universe IP are not exposed or transferred through a services engagement.',
  },
];

const DELIVERY_RECEIPT = [
  'Signed scope and measurable target outcome',
  'Current-state and target-state workflow maps',
  'Human approval and exception rules',
  'Test evidence for happy and failure paths',
  'Known limitations and unresolved items',
  'Operating handoff and delivery receipt',
];

const BEFORE_AFTER = [
  { before: 'Leads arrive in multiple places and rely on memory.', after: 'One intake path assigns an owner, response target, next action, and escalation.' },
  { before: 'Reports are rebuilt manually and definitions conflict.', after: 'One scorecard names the source, definition, owner, refresh rule, and decision.' },
  { before: 'AI output can act without clear accountability.', after: 'AI prepares work; an authorized person approves high-impact decisions and exceptions.' },
  { before: 'Completion is claimed in a message.', after: 'Delivery leaves test evidence, limitations, handoff instructions, and a receipt.' },
];

export default function ServicesResultsPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .results-hero h1{max-width:820px;}
        .results-hero p{max-width:720px;}
        .proof-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:36px;}
        @media(max-width:760px){.proof-grid{grid-template-columns:1fr;}}
        .proof-card{background:var(--surface);border:1px solid var(--line-strong);padding:28px;display:flex;flex-direction:column;}
        .proof-status{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;color:var(--gold);margin-bottom:16px;}
        .proof-card h3{font-family:'Barlow Condensed',sans-serif;font-size:25px;margin:0 0 12px;}
        .proof-card>p{font-size:14px;line-height:1.65;color:#c7c7cd;margin:0 0 20px;}
        .proof-list{list-style:none;padding:0;margin:0 0 22px;}
        .proof-list li{padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px;color:#b4b4bb;}
        .proof-list li::before{content:'✓';color:#3ddc84;margin-right:9px;}
        .limit-box{margin-top:auto;border-left:2px solid var(--pink);padding:13px 14px;background:rgba(230,0,122,.05);font-size:11.5px;line-height:1.55;color:#9d9da7;}
        .comparison{margin-top:36px;border:1px solid var(--line-strong);}
        .comparison-row{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-strong);border-bottom:1px solid var(--line-strong);}
        .comparison-row:last-child{border-bottom:0;}
        @media(max-width:650px){.comparison-row{grid-template-columns:1fr;}}
        .comparison-cell{background:var(--surface);padding:22px;}
        .comparison-cell span{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
        .comparison-cell.after span{color:var(--gold);}
        .comparison-cell p{font-size:13px;line-height:1.6;color:#b4b4bb;margin:0;}
        .receipt-panel{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin-top:34px;}
        @media(max-width:760px){.receipt-panel{grid-template-columns:1fr;gap:24px;}}
        .receipt-list{list-style:none;padding:0;margin:0;border:1px solid var(--line-strong);}
        .receipt-list li{padding:15px 18px;border-bottom:1px solid var(--line);font-size:13px;color:#c7c7cd;}
        .receipt-list li:last-child{border-bottom:0;}
        .receipt-list li::before{content:'→';color:var(--gold);margin-right:10px;}
        .honesty-panel{background:linear-gradient(135deg,rgba(232,185,35,.08),rgba(0,122,255,.04));border:1px solid var(--line-strong);padding:30px;margin-top:30px;}
        .honesty-panel h3{font-family:'Barlow Condensed',sans-serif;font-size:25px;margin:0 0 12px;}
        .honesty-panel p{font-size:14px;color:#b4b4bb;line-height:1.7;margin:0;}
        .results-cta{background:var(--surface);border:1px solid var(--line-strong);padding:38px;}
      ` }} />

      <section className="hero wrap results-hero">
        <div className="eyebrow">PROOF BEFORE PROMISES</div>
        <h1>We show the operating path, the evidence, and the limits.</h1>
        <p>Empire-1 does not call a workflow finished because a demo looked good. A credible result identifies what changed, who controls the decision, how failure is handled, what evidence exists, and what remains unproven.</p>
        <div className="cta-row">
          <a href="/services/scan" className="btn btn-primary">Run the Free Workflow Scan →</a>
          <a href="/services" className="btn btn-ghost">View Paid Services</a>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">CURRENT PROOF LIBRARY</div>
          <h2>Internal implementations and delivery standards.</h2>
          <p>These are not presented as external client case studies. Each item is labeled by what it actually proves and includes the current limitations.</p>
          <div className="proof-grid">
            {PROOF_CARDS.map((card) => (
              <article className="proof-card" key={card.title}>
                <div className="proof-status">{card.status}</div>
                <h3>{card.title}</h3>
                <p>{card.outcome}</p>
                <ul className="proof-list">
                  {card.proof.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="limit-box"><strong>Known limit:</strong> {card.limits}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">WHAT CHANGES</div>
          <h2>From invisible handoffs to controlled operating paths.</h2>
          <div className="comparison">
            {BEFORE_AFTER.map((item) => (
              <div className="comparison-row" key={item.before}>
                <div className="comparison-cell"><span>Before</span><p>{item.before}</p></div>
                <div className="comparison-cell after"><span>After</span><p>{item.after}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">DELIVERY RECEIPT</div>
          <h2>A finished engagement should leave more than software.</h2>
          <div className="receipt-panel">
            <div>
              <p>Every paid engagement is expected to leave a reviewable package that the client can operate, question, and improve after handoff.</p>
              <div className="honesty-panel">
                <h3>External proof is earned—not invented.</h3>
                <p>No paid-client case study or testimonial is published here yet. The first external result will be added only after delivery, client approval, and a clear statement of what was actually achieved.</p>
              </div>
            </div>
            <ul className="receipt-list">
              {DELIVERY_RECEIPT.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="results-cta">
            <div className="eyebrow">START WITH THE LEAK</div>
            <h2>Bring one workflow that is costing time, leads, revenue, or control.</h2>
            <p>Run the free screening snapshot first. When the result is worth investigating, send it to Empire-1 for a human review and a smallest-credible-scope recommendation.</p>
            <div className="cta-row">
              <a href="/services/scan" className="btn btn-primary">Generate My Snapshot →</a>
              <a href="/services/intake" className="btn btn-ghost">Open Full Project Intake</a>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
