import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';
import WorkflowLeakScan from './WorkflowLeakScan';

export const metadata: Metadata = {
  title: 'Free AI Workflow Leak Snapshot — Empire-1',
  description: 'Identify where a business workflow is losing time, leads, revenue, or control and receive an immediate preliminary automation snapshot.',
};

export default function WorkflowLeakScanPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .scan-hero{padding-bottom:54px;}
        .scan-hero h1{max-width:780px;}
        .scan-hero p{max-width:730px;}
        .scan-proof{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px;}
        .scan-proof span{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;border:1px solid var(--line-strong);padding:9px 12px;color:#b4b4bb;background:var(--surface);}
        .scan-shell{max-width:860px;margin:0 auto;}
        .scan-form{background:var(--surface);border:1px solid var(--line-strong);padding:32px;}
        .scan-form label{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
        .scan-form label>span{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#c7c7cd;}
        .scan-grid{display:grid;gap:18px;}
        .scan-grid.two{grid-template-columns:repeat(2,1fr);}
        @media(max-width:700px){.scan-grid.two{grid-template-columns:1fr;}.scan-form{padding:22px;}}
        .scan-form input,.scan-form select,.scan-form textarea{width:100%;border:1px solid var(--line-strong);background:#050506;color:var(--text);padding:13px 14px;font:inherit;border-radius:2px;}
        .scan-form textarea{resize:vertical;line-height:1.55;}
        .scan-form input:focus,.scan-form select:focus,.scan-form textarea:focus{outline:2px solid var(--blue);outline-offset:2px;border-color:transparent;}
        .scan-form input::placeholder,.scan-form textarea::placeholder{color:#66666f;}
        .privacy-note{border-left:2px solid var(--blue);background:rgba(0,122,255,.07);padding:16px 18px;color:#b4b4bb;font-size:13px;line-height:1.6;margin:8px 0 24px;}
        .privacy-note strong{color:var(--text);}
        .scan-submit{border:0;cursor:pointer;}
        .snapshot{margin-top:28px;background:var(--surface);border:1px solid var(--line-strong);padding:32px;scroll-margin-top:100px;}
        .snapshot-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:28px;}
        .snapshot-head h2{font-family:'Barlow Condensed',sans-serif;font-size:clamp(28px,4vw,42px);margin:12px 0 0;}
        .snapshot-badge{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;border:1px solid var(--gold);color:var(--gold);padding:8px 10px;white-space:nowrap;}
        @media(max-width:620px){.snapshot-head{flex-direction:column;}.snapshot{padding:22px;}}
        .snapshot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);}
        @media(max-width:700px){.snapshot-grid{grid-template-columns:1fr;}}
        .snapshot-grid article{background:#08080a;padding:22px;}
        .snapshot-grid article span{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}
        .snapshot-grid article p{font-size:13.5px;line-height:1.65;color:#c7c7cd;margin:0;}
        .snapshot-grid article.recommended{background:linear-gradient(135deg,rgba(232,185,35,.12),rgba(230,0,122,.05));}
        .snapshot-warning{margin-top:20px;border-left:2px solid var(--pink);padding:14px 16px;color:#a9a9b2;font-size:12.5px;line-height:1.6;}
        .snapshot button{border:0;cursor:pointer;}
        .snapshot .btn-ghost{background:transparent;border:1px solid var(--line-strong);}
        .scan-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:34px;}
        @media(max-width:700px){.scan-steps{grid-template-columns:1fr;}}
        .scan-step{border-top:2px solid var(--gold);padding-top:16px;}
        .scan-step strong{font-family:'Barlow Condensed',sans-serif;font-size:20px;display:block;margin-bottom:8px;}
        .scan-step p{font-size:13px;margin:0;color:#b4b4bb;line-height:1.6;}
      ` }} />

      <section className="hero wrap scan-hero">
        <div className="eyebrow">FREE AI WORKFLOW LEAK SNAPSHOT</div>
        <h1>Show us where work is leaking. See the first credible fix.</h1>
        <p>Answer a few practical questions about one broken workflow. You will receive an immediate preliminary snapshot showing the likely leak, first automation opportunity, human-control boundary, and evidence the finished system should leave.</p>
        <div className="scan-proof">
          <span>No account</span>
          <span>No hidden submission</span>
          <span>Immediate result</span>
          <span>One workflow only</span>
        </div>
      </section>

      <section className="section">
        <div className="wrap scan-shell">
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>One problem. One result. No generic AI pitch.</h2>
          <div className="scan-steps">
            <div className="scan-step"><strong>1. Describe the leak</strong><p>Tell us where work slows down, gets missed, or loses accountability.</p></div>
            <div className="scan-step"><strong>2. Generate the snapshot</strong><p>The page maps your answers to a practical first move and control boundary.</p></div>
            <div className="scan-step"><strong>3. Choose the next step</strong><p>Keep the result, or send it to Empire-1 for a human review and scoped recommendation.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap scan-shell">
          <div className="eyebrow">RUN THE SCAN</div>
          <h2>Where is your business losing time, leads, money, or control?</h2>
          <p>Use operational details—not confidential customer records, passwords, credentials, protected health information, or other sensitive personal data.</p>
          <div style={{ marginTop: 30 }}>
            <WorkflowLeakScan />
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
