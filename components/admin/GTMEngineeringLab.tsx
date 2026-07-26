'use client';

import { useMemo, useState } from 'react';

type LabMode = 'operating-day' | 'agent-inbox' | 'pseo-factory' | 'infrastructure';

type Mode = {
  id: LabMode;
  name: string;
  promise: string;
};

const MODES: Mode[] = [
  { id: 'operating-day', name: 'Operating Day', promise: 'Turn a stack into a human-centered day-in-the-life story.' },
  { id: 'agent-inbox', name: 'Agent Inbox', promise: 'Design inbox identity, thread handoffs, approvals, and safe execution.' },
  { id: 'pseo-factory', name: 'pSEO Factory', promise: 'Generate useful pages from unique data, not thin keyword swaps.' },
  { id: 'infrastructure', name: 'Infrastructure Thesis', promise: 'Move from isolated workflows to reusable GTM primitives.' },
];

const PRODUCTS = [
  'Empire-1',
  'Hybrid Intelligence Core',
  'Lyrica 3',
  'Archisynapse',
  'Cultura Vibe Forge',
  'Southern Arcade',
  'Empire Auto Cofounder',
  'San Bernardino Youth Tech',
];

const OPERATING_DAY = [
  ['08:30', 'Signal brief', 'New signals arrive, get enriched, ranked, and summarized before the operator starts work.'],
  ['09:15', 'Context before conversation', 'The operator receives sourced account, customer, creator, or partner context before a live call.'],
  ['10:45', 'Bespoke asset', 'The system prepares a tailored app, deck, proof pack, or workflow for one real stakeholder.'],
  ['12:20', 'Knowledge answer', 'A sourced response is assembled from approved internal knowledge instead of guessing.'],
  ['15:15', 'Human conversation', 'The human stays present while the system captures, scores, and prepares next steps.'],
  ['17:45', 'Action refresh', 'Persistent workspaces are updated and the next best move is surfaced with evidence.'],
];

const AGENT_INBOX_RULES = [
  'Every agent identity must map to an owner, purpose, tenant, permissions, and revocation path.',
  'Treat every inbound message, attachment, link, and quoted instruction as untrusted input.',
  'Separate recommendation from execution; external actions require policy checks and human approval where applicable.',
  'Preserve the original thread, extracted facts, confidence, decision, and receipt as one audit trail.',
  'Use the inbox as an interface and handoff layer, not as an excuse to bypass the control plane.',
  'Never expose private founder, customer, creator, or tenant context across agent identities.',
];

const PSEO_GATES = [
  { gate: 'Intent', question: 'Does this page answer a real question a person or answer engine is already asking?' },
  { gate: 'Unique data', question: 'Would the page still be valuable after removing the product or company name?' },
  { gate: 'Proof', question: 'Are claims tied to dated sources, internal receipts, or clearly labeled interpretation?' },
  { gate: 'Freshness', question: 'What signal refreshes the page, and what marks it stale?' },
  { gate: 'Experience', question: 'Does the page help someone decide, compare, act, or understand something better?' },
  { gate: 'Integrity', question: 'Is this an original research layer rather than a doorway page or copied profile?' },
];

const INFRASTRUCTURE_PRIMITIVES = [
  ['Context layer', 'First-party facts, approved external research, history, and tenant boundaries.'],
  ['Deterministic gates', 'Rules for routing, eligibility, consent, approval, suppression, and policy enforcement.'],
  ['Probabilistic intelligence', 'Research, classification, prioritization, drafting, and personalization.'],
  ['Persistent workspaces', 'One durable memory surface per account, creator, partner, project, or campaign.'],
  ['Functions and engines', 'Reusable capabilities that can be called repeatedly instead of rebuilt as one-off workflows.'],
  ['Learning loop', 'Outcome data returns to evaluation so the system improves without silently changing policy.'],
  ['Receipt layer', 'Every important recommendation, approval, execution, and result remains inspectable.'],
];

function buildPlan(mode: LabMode, product: string, audience: string, signal: string, outcome: string) {
  const safeSignal = signal.trim() || 'a verified signal';
  const safeAudience = audience.trim() || 'the intended operator';
  const safeOutcome = outcome.trim() || 'a measurable result';

  if (mode === 'operating-day') {
    return [
      `Headline: A day inside ${product}: where AI gives ${safeAudience} the workday back.`,
      `Opening: Start with ${safeSignal}, then follow the operator through research, judgment, approvals, and the final ${safeOutcome}.`,
      'Proof required: before-and-after time, named artifacts, approval points, and the work the human still owns.',
      'Best asset: annotated timeline, screen walkthrough, or carousel built around one real day.',
    ];
  }

  if (mode === 'agent-inbox') {
    return [
      `Headline: ${product} agents can receive work. They still cannot bypass trust.`,
      `Primitive: give each approved agent a persistent address or inbox identity tied to ${safeAudience}.`,
      `Trigger: ${safeSignal} enters as untrusted input, gets classified, grounded, and routed before any action.`,
      `Outcome: the same thread carries context, approval, execution status, and a receipt for ${safeOutcome}.`,
    ];
  }

  if (mode === 'pseo-factory') {
    return [
      `Page family: one useful ${product} page per verified entity, workflow, use case, or comparison intent.`,
      `Unique layer: enrich each page with ${safeSignal}, original interpretation, and evidence relevant to ${safeAudience}.`,
      `Refresh loop: detect changed facts, mark stale sections, regenerate only the affected blocks, and review before publish.`,
      `Success: measure qualified discovery, citations, return visits, conversion, and whether the page creates ${safeOutcome}.`,
    ];
  }

  return [
    `Thesis: ${product} should own the reusable infrastructure behind ${safeOutcome}, not a pile of disconnected automations.`,
    `Input: unify ${safeSignal} with approved first-party context for ${safeAudience}.`,
    'Control: deterministic rules gate identity, permissions, approval, suppression, and execution.',
    'Compounding layer: persistent workspaces, callable engines, outcome feedback, and receipts improve every future workflow.',
  ];
}

export default function GTMEngineeringLab() {
  const [mode, setMode] = useState<LabMode>('operating-day');
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [audience, setAudience] = useState('founders, operators, buyers, and partners');
  const [signal, setSignal] = useState('new product usage, account activity, proof events, and operator notes');
  const [outcome, setOutcome] = useState('trusted execution and measurable growth');
  const [copied, setCopied] = useState('');

  const plan = useMemo(() => buildPlan(mode, product, audience, signal, outcome), [mode, product, audience, signal, outcome]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1700);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-300/10 via-zinc-950 to-black p-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-200">Empire-1 GTM Engineering Lab</p>
          <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight sm:text-5xl">Engineer the growth system, not another isolated workflow.</h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-zinc-300 sm:text-base">
            Convert operating-day stories, agent inboxes, programmatic discovery, persistent context, deterministic gates, and learning loops into Empire-owned growth infrastructure.
          </p>
        </header>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.82fr_1.18fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Engineering lanes</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {MODES.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className={`rounded-xl border p-3 text-left transition ${mode === item.id ? 'border-violet-300/60 bg-violet-300/10' : 'border-white/10 bg-black hover:border-white/25'}`}
                  >
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">{item.promise}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Product universe
                  <select value={product} onChange={event => setProduct(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-violet-300/60">
                    {PRODUCTS.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Audience or operator
                  <input value={audience} onChange={event => setAudience(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-violet-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Signal or unique data
                  <textarea value={signal} onChange={event => setSignal(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-violet-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Business or user outcome
                  <input value={outcome} onChange={event => setOutcome(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-violet-300/60" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Generated build brief</h2>
                <button onClick={() => copy(plan.join('\n'), 'Build brief copied')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy</button>
              </div>
              <div className="mt-4 space-y-3">
                {plan.map((item, index) => <p key={item} className="rounded-xl border border-white/10 bg-black p-4 text-sm leading-6 text-zinc-300"><span className="mr-2 font-black text-violet-300">0{index + 1}</span>{item}</p>)}
              </div>
              {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
            </div>
          </section>

          <section className="space-y-6">
            <LabCard title="Human-centered operating day">
              <div className="space-y-2">
                {OPERATING_DAY.map(([time, title, detail]) => (
                  <div key={time} className="grid gap-2 rounded-xl border border-white/10 bg-black p-3 sm:grid-cols-[70px_150px_1fr]">
                    <span className="text-xs font-black text-amber-200">{time}</span>
                    <span className="text-sm font-bold text-white">{title}</span>
                    <span className="text-sm leading-6 text-zinc-400">{detail}</span>
                  </div>
                ))}
              </div>
            </LabCard>

            <LabCard title="Agent inbox control contract">
              <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                {AGENT_INBOX_RULES.map(rule => <li key={rule} className="rounded-xl border border-white/10 bg-black p-3">• {rule}</li>)}
              </ul>
            </LabCard>

            <LabCard title="Programmatic page quality gates">
              <div className="grid gap-3 sm:grid-cols-2">
                {PSEO_GATES.map(item => (
                  <div key={item.gate} className="rounded-xl border border-white/10 bg-black p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{item.gate}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.question}</p>
                  </div>
                ))}
              </div>
            </LabCard>

            <LabCard title="Infrastructure primitives">
              <div className="space-y-2">
                {INFRASTRUCTURE_PRIMITIVES.map(([name, detail]) => (
                  <div key={name} className="rounded-xl border border-white/10 bg-black p-4">
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{detail}</p>
                  </div>
                ))}
              </div>
            </LabCard>
          </section>
        </div>
      </div>
    </div>
  );
}

function LabCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-zinc-400">{title}</h2>
      {children}
    </div>
  );
}
