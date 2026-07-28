'use client';

import { FormEvent, useMemo, useState } from 'react';

type ScanState = {
  name: string;
  company: string;
  email: string;
  website: string;
  industry: string;
  workflow: string;
  problem: string;
  volume: string;
  hoursLost: string;
  tools: string;
  humanDecision: string;
  outcome: string;
};

type Snapshot = {
  leak: string;
  impact: string;
  firstMove: string;
  humanControl: string;
  evidence: string;
  recommendation: string;
};

const EMPTY_SCAN: ScanState = {
  name: '',
  company: '',
  email: '',
  website: '',
  industry: '',
  workflow: '',
  problem: '',
  volume: '',
  hoursLost: '',
  tools: '',
  humanDecision: '',
  outcome: '',
};

const WORKFLOW_MAP: Record<string, { leak: string; move: string; evidence: string }> = {
  leads: {
    leak: 'Qualified opportunities may be disappearing between first contact, qualification, assignment, and follow-up.',
    move: 'Create one intake-to-follow-up path with ownership, response timing, escalation, and a visible lead status.',
    evidence: 'Lead source, response time, owner, next action, exceptions, and final disposition.',
  },
  operations: {
    leak: 'Recurring work may be moving through inboxes, memory, and manual handoffs without a dependable operating record.',
    move: 'Turn the highest-volume recurring task into a controlled workflow with a trigger, owner, approval point, and completion receipt.',
    evidence: 'Trigger, assignee, approval, exception reason, completion time, and delivered output.',
  },
  customer: {
    leak: 'Customer requests may be waiting too long, reaching the wrong person, or closing without a clear service-quality record.',
    move: 'Build a structured intake, routing, response-support, and escalation flow around one request type.',
    evidence: 'Request category, response time, assigned owner, escalation, resolution, and customer-facing outcome.',
  },
  content: {
    leak: 'Ideas and source material may be recreated repeatedly instead of moving through one governed capture-to-publish system.',
    move: 'Create one source-of-truth content workflow that repurposes an approved idea while preserving voice, review, and provenance.',
    evidence: 'Source asset, approvals, channel variants, final edits, publication status, and reuse history.',
  },
  reporting: {
    leak: 'Leadership may be making decisions from delayed, manually assembled, or conflicting reports.',
    move: 'Define one decision-ready scorecard with trusted inputs, ownership, update rules, and exception notes.',
    evidence: 'Source, metric definition, refresh time, owner, variance, decision, and follow-up action.',
  },
  payments: {
    leak: 'Revenue, payout, refund, or royalty events may lack a complete authorization and reconciliation trail.',
    move: 'Map one money movement from authorization through ledger evidence, exception handling, and final reconciliation.',
    evidence: 'Authorization, amount, parties, event IDs, ledger entries, exception state, and reconciliation result.',
  },
};

const HUMAN_CONTROL: Record<string, string> = {
  low: 'Keep a person able to pause, correct, and review exceptions even if routine steps are automated.',
  medium: 'Require human approval before external communication, account changes, commitments, or irreversible actions.',
  high: 'Do not automate the final decision. AI may prepare evidence or recommendations, but an authorized person must approve the action.',
};

function buildSnapshot(form: ScanState): Snapshot {
  const workflow = WORKFLOW_MAP[form.workflow] || WORKFLOW_MAP.operations;
  const complexity = form.tools.split(/[,\n]/).filter((tool) => tool.trim().length > 0).length;
  const highVolume = ['250+', '100-249'].includes(form.volume);
  const heavyLoss = ['20+', '10-19'].includes(form.hoursLost);
  const elevatedRisk = form.humanDecision === 'high' || form.workflow === 'payments';

  let impact = 'Moderate operating drag: this is likely worth standardizing before adding more tools.';
  if (highVolume && heavyLoss) {
    impact = 'High operating drag: the workflow appears frequent enough and expensive enough to justify immediate diagnosis.';
  } else if (highVolume || heavyLoss) {
    impact = 'Material operating drag: one controlled workflow could produce a measurable time or response improvement.';
  }

  let recommendation = 'AI Operations Audit — validate the current path, quantify the leak, and define the smallest credible implementation.';
  if (!elevatedRisk && complexity <= 2 && form.problem.length > 120 && form.outcome.length > 40) {
    recommendation = 'Likely Automation Sprint candidate — confirm access, ownership, exceptions, and acceptance tests before build.';
  }
  if (elevatedRisk) {
    recommendation = 'AI Operations Audit with governance controls — map authorization, human review, evidence, and failure handling before implementation.';
  }

  return {
    leak: workflow.leak,
    impact,
    firstMove: workflow.move,
    humanControl: HUMAN_CONTROL[form.humanDecision] || HUMAN_CONTROL.medium,
    evidence: workflow.evidence,
    recommendation,
  };
}

export default function WorkflowLeakScan() {
  const [form, setForm] = useState<ScanState>(EMPTY_SCAN);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [copied, setCopied] = useState(false);

  const snapshotText = useMemo(() => {
    if (!snapshot) return '';

    return [
      'Empire-1 — Preliminary AI Workflow Leak Snapshot',
      '',
      `Company: ${form.company}`,
      `Contact: ${form.name} (${form.email})`,
      `Website: ${form.website || 'Not provided'}`,
      `Industry: ${form.industry}`,
      `Workflow: ${form.workflow}`,
      `Monthly volume: ${form.volume}`,
      `Estimated time lost: ${form.hoursLost} hours/month`,
      `Current tools: ${form.tools || 'Not provided'}`,
      '',
      'Reported problem',
      form.problem,
      '',
      'Desired outcome',
      form.outcome,
      '',
      'Likely leak',
      snapshot.leak,
      '',
      'Potential impact',
      snapshot.impact,
      '',
      'First move',
      snapshot.firstMove,
      '',
      'Human-control boundary',
      snapshot.humanControl,
      '',
      'Evidence the workflow should leave',
      snapshot.evidence,
      '',
      'Recommended next engagement',
      snapshot.recommendation,
      '',
      'Important: This automated snapshot is a preliminary screening result based only on the answers provided. It is not a full audit, guarantee, legal opinion, security assessment, or compliance conclusion.',
    ].join('\n');
  }, [form, snapshot]);

  function updateField<K extends keyof ScanState>(field: K, value: ScanState[K]) {
    setSnapshot(null);
    setCopied(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSnapshot(buildSnapshot(form));
    setCopied(false);
    requestAnimationFrame(() => document.getElementById('scan-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function copySnapshot() {
    try {
      await navigator.clipboard.writeText(snapshotText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function emailSnapshot() {
    const subject = encodeURIComponent(`Workflow Leak Snapshot — ${form.company || form.name}`);
    const body = encodeURIComponent(snapshotText);
    window.location.href = `mailto:founder@empire1.cloud?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <form className="scan-form" onSubmit={submit}>
        <div className="scan-grid two">
          <label>
            <span>Your name *</span>
            <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Name" />
          </label>
          <label>
            <span>Business or organization *</span>
            <input required value={form.company} onChange={(event) => updateField('company', event.target.value)} placeholder="Company" />
          </label>
          <label>
            <span>Email *</span>
            <input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@company.com" />
          </label>
          <label>
            <span>Website</span>
            <input type="url" value={form.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://" />
          </label>
          <label>
            <span>Industry *</span>
            <select required value={form.industry} onChange={(event) => updateField('industry', event.target.value)}>
              <option value="">Select one</option>
              <option value="Construction, trucking, or logistics">Construction, trucking, or logistics</option>
              <option value="Professional or local services">Professional or local services</option>
              <option value="Agency or consultancy">Agency or consultancy</option>
              <option value="Creator, music, or media">Creator, music, or media</option>
              <option value="Startup or software">Startup or software</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            <span>Workflow with the biggest leak *</span>
            <select required value={form.workflow} onChange={(event) => updateField('workflow', event.target.value)}>
              <option value="">Select one</option>
              <option value="leads">Lead intake and follow-up</option>
              <option value="operations">Recurring operations and handoffs</option>
              <option value="customer">Customer requests and support</option>
              <option value="content">Content creation and publishing</option>
              <option value="reporting">Reporting and decisions</option>
              <option value="payments">Payments, payouts, royalties, or refunds</option>
            </select>
          </label>
        </div>

        <label>
          <span>What is broken, slow, or falling through the cracks? *</span>
          <textarea required minLength={40} rows={6} value={form.problem} onChange={(event) => updateField('problem', event.target.value)} placeholder="Describe what happens today, where it slows down, and what gets missed." />
        </label>

        <div className="scan-grid two">
          <label>
            <span>How many times does this happen monthly? *</span>
            <select required value={form.volume} onChange={(event) => updateField('volume', event.target.value)}>
              <option value="">Select one</option>
              <option value="1-24">1–24</option>
              <option value="25-99">25–99</option>
              <option value="100-249">100–249</option>
              <option value="250+">250+</option>
            </select>
          </label>
          <label>
            <span>Estimated hours lost monthly *</span>
            <select required value={form.hoursLost} onChange={(event) => updateField('hoursLost', event.target.value)}>
              <option value="">Select one</option>
              <option value="0-4">0–4</option>
              <option value="5-9">5–9</option>
              <option value="10-19">10–19</option>
              <option value="20+">20+</option>
            </select>
          </label>
        </div>

        <label>
          <span>Which tools, inboxes, spreadsheets, or systems are involved?</span>
          <textarea rows={3} value={form.tools} onChange={(event) => updateField('tools', event.target.value)} placeholder="Example: website form, Gmail, HubSpot, Google Sheets, QuickBooks" />
        </label>

        <div className="scan-grid two">
          <label>
            <span>How sensitive is the final decision? *</span>
            <select required value={form.humanDecision} onChange={(event) => updateField('humanDecision', event.target.value)}>
              <option value="">Select one</option>
              <option value="low">Low — routine internal work</option>
              <option value="medium">Medium — customer-facing or operational commitment</option>
              <option value="high">High — money, rights, access, safety, employment, or legal impact</option>
            </select>
          </label>
          <label>
            <span>What result should improve? *</span>
            <textarea required minLength={20} rows={4} value={form.outcome} onChange={(event) => updateField('outcome', event.target.value)} placeholder="Example: every qualified lead receives a response within 10 minutes and has a visible owner." />
          </label>
        </div>

        <div className="privacy-note">
          <strong>Your answers stay in your browser.</strong> Generating the snapshot does not submit or store this information. You choose whether to copy or email it afterward.
        </div>

        <button type="submit" className="btn btn-primary scan-submit">Generate My Free Snapshot →</button>
      </form>

      {snapshot && (
        <section className="snapshot" id="scan-result" aria-live="polite">
          <div className="snapshot-head">
            <div>
              <div className="eyebrow">PRELIMINARY RESULT</div>
              <h2>{form.company} Workflow Leak Snapshot</h2>
            </div>
            <span className="snapshot-badge">Free screening</span>
          </div>

          <div className="snapshot-grid">
            <article><span>Likely leak</span><p>{snapshot.leak}</p></article>
            <article><span>Potential impact</span><p>{snapshot.impact}</p></article>
            <article><span>First move</span><p>{snapshot.firstMove}</p></article>
            <article><span>Human control</span><p>{snapshot.humanControl}</p></article>
            <article><span>Evidence required</span><p>{snapshot.evidence}</p></article>
            <article className="recommended"><span>Recommended next engagement</span><p>{snapshot.recommendation}</p></article>
          </div>

          <div className="snapshot-warning">
            This result is generated from the information you entered. It is a starting hypothesis—not a completed audit, guaranteed savings estimate, legal opinion, security assessment, or compliance conclusion.
          </div>

          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={emailSnapshot}>Send Snapshot to Empire-1 →</button>
            <button type="button" className="btn btn-ghost" onClick={copySnapshot}>{copied ? 'Copied ✓' : 'Copy Snapshot'}</button>
            <a href="/services/results" className="btn btn-ghost">See How We Prove Work</a>
          </div>
        </section>
      )}
    </>
  );
}
