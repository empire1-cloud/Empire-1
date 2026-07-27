import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';
import ServicesIntakeForm from './ServicesIntakeForm';

export const metadata: Metadata = {
  title: 'Project Intake — Empire-1 Applied AI Services',
  description: 'Describe the workflow, outcome, systems, risk, budget, and timeline for an Empire-1 Applied AI Services engagement.',
};

export default function ServicesIntakePage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .intake-hero{padding-bottom:50px;}
        .intake-hero h1{max-width:780px;}
        .intake-hero p{max-width:720px;}
        .intake-shell{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:34px;align-items:start;}
        @media(max-width:820px){.intake-shell{grid-template-columns:1fr;}}
        .intake-form{background:var(--surface);border:1px solid var(--line-strong);padding:30px;}
        .intake-form label{display:block;margin-bottom:24px;}
        .intake-form label>span{display:block;font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:#c7c7cd;margin-bottom:9px;}
        .form-grid{display:grid;gap:18px;}
        .form-grid.two{grid-template-columns:1fr 1fr;}
        @media(max-width:620px){.form-grid.two{grid-template-columns:1fr;gap:0;}}
        .intake-form input,.intake-form textarea,.intake-form select,.prepared-panel textarea{width:100%;border:1px solid var(--line-strong);background:#070709;color:var(--text);padding:13px 14px;font:inherit;border-radius:2px;}
        .intake-form input:focus,.intake-form textarea:focus,.intake-form select:focus,.prepared-panel textarea:focus{outline:2px solid var(--blue);outline-offset:2px;border-color:transparent;}
        .intake-form textarea,.prepared-panel textarea{resize:vertical;line-height:1.55;}
        .intake-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;}
        .intake-actions button{border:0;cursor:pointer;}
        .form-note{font-size:12px!important;color:var(--muted)!important;margin:18px 0 0!important;}
        .intake-aside{position:sticky;top:100px;border-top:2px solid var(--gold);padding-top:20px;}
        @media(max-width:820px){.intake-aside{position:static;}}
        .intake-aside h2{font-size:26px;margin:0 0 12px;}
        .intake-aside p{font-size:13.5px;line-height:1.65;color:#b4b4bb;}
        .intake-aside ul{list-style:none;padding:0;margin:24px 0 0;}
        .intake-aside li{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#c7c7cd;padding:11px 0;border-bottom:1px solid var(--line);}
        .intake-aside li::before{content:'✓';color:#3ddc84;margin-right:8px;}
        .prepared-panel{background:var(--surface);border:1px solid var(--line-strong);padding:30px;margin-top:24px;}
        .prepared-panel h2{margin:12px 0;}
        .prepared-panel p{color:#b4b4bb;line-height:1.65;}
        .prepared-panel strong{color:var(--text);}
        .prepared-panel textarea{margin:12px 0 18px;font-family:'JetBrains Mono',monospace;font-size:12px;}
        .prepared-panel button{background:transparent;cursor:pointer;}
      ` }} />

      <section className="hero wrap intake-hero">
        <div className="eyebrow">PROJECT INTAKE</div>
        <h1>Show us the workflow that needs to change.</h1>
        <p>This intake is designed to expose the business problem, the required outcome, the systems involved, and the boundaries we cannot violate. Clear inputs produce a smaller, safer, more valuable first build.</p>
      </section>

      <section className="section">
        <div className="wrap intake-shell">
          <div>
            <ServicesIntakeForm />
          </div>
          <aside className="intake-aside">
            <h2>What happens next</h2>
            <p>We review the request and identify the smallest credible engagement. The response should clarify fit, recommended starting offer, scope assumptions, and next action.</p>
            <ul>
              <li>No silent data submission</li>
              <li>No automatic commitment</li>
              <li>No certification promises</li>
              <li>No unnecessary platform rebuild</li>
              <li>Universe boundaries preserved</li>
            </ul>
          </aside>
        </div>
      </section>
    </PublicPageShell>
  );
}
