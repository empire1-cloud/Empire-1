'use client';

import { useMemo, useState } from 'react';

type Pattern = {
  id: string;
  name: string;
  promise: string;
  formula: string;
  evidence: string;
};

const PATTERNS: Pattern[] = [
  {
    id: 'future-shock',
    name: 'Future Shock',
    promise: 'Show what changes next and who gets left behind.',
    formula: '[Old role] is changing. Here is what replaces it.',
    evidence: 'Use a dated change, shipped workflow, or measurable behavior shift.',
  },
  {
    id: 'real-bottleneck',
    name: 'Real Bottleneck',
    promise: 'Challenge the obvious explanation and expose the actual constraint.',
    formula: 'AI can do [task]. That was never the bottleneck.',
    evidence: 'Name the decision, coordination, trust, or distribution constraint that remains.',
  },
  {
    id: 'reality-check',
    name: 'Reality Check',
    promise: 'Report what survived repeated use instead of what looked good in a demo.',
    formula: '[Time period] in: what survived contact with reality.',
    evidence: 'Use multiple projects, repeated runs, retention, defects, or operator notes.',
  },
  {
    id: 'teardown',
    name: 'Teardown',
    promise: 'Explain why a familiar system fails and what should replace it.',
    formula: 'Why [system] is broken: we optimized the wrong thing.',
    evidence: 'Show the mechanism, failure mode, and one concrete alternative.',
  },
  {
    id: 'missing-layer',
    name: 'Missing Layer',
    promise: 'Start with a respected framework and reveal what it leaves out.',
    formula: '[Framework] gets these parts right. It still misses the layer that decides success.',
    evidence: 'Separate sourced framework claims from Empire-1 interpretation.',
  },
  {
    id: 'actual-workflow',
    name: 'Actual Workflow',
    promise: 'Replace vague advice with the exact way the work gets done.',
    formula: 'How I actually use [system] to ship [outcome].',
    evidence: 'Show steps, inputs, approvals, artifacts, and final output.',
  },
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

const FIVE_DAY_SERIES = [
  {
    day: 1,
    title: 'Thinking Before Tools',
    job: 'Name the problem, why it matters, and the operating framework.',
    asset: 'One framework card plus a founder explanation.',
  },
  {
    day: 2,
    title: 'The System',
    job: 'Show the workflow, handoffs, guardrails, and proof standard.',
    asset: 'Process map, checklist, and one real receipt.',
  },
  {
    day: 3,
    title: 'The Build',
    job: 'Turn the system into a visible demo, teardown, or before-and-after.',
    asset: 'Short video, carousel, or screen walkthrough.',
  },
  {
    day: 4,
    title: 'The Agent or Engine',
    job: 'Reveal how the operator, model, engine, or automation performs the work.',
    asset: 'Role map with approved providers or local models only.',
  },
  {
    day: 5,
    title: 'The Outcome',
    job: 'Connect the proof to revenue, ownership, community impact, or customer value.',
    asset: 'Offer, call to action, downloadable blueprint, or pilot invitation.',
  },
];

const SIFU_PATTERN_RULES = [
  'Use a day-by-day challenge so each post creates anticipation for the next.',
  'Name the framework so the audience can remember and repeat it.',
  'Assign tools by role, but keep Empire-1 provider-neutral and independent of Google/Gemini APIs.',
  'Demonstrate reverse engineering as a method, not copying someone else’s protected content.',
  'Turn each lesson into an owned asset: checklist, template, prompt card, receipt, or workflow map.',
  'Use proof-backed social numbers only; never borrow another creator’s follower or revenue claims.',
];

function buildHooks(pattern: Pattern, product: string, subject: string, proof: string, outcome: string) {
  const safeSubject = subject.trim() || 'the current workflow';
  const safeProof = proof.trim() || 'tests, receipts, and live output';
  const safeOutcome = outcome.trim() || 'a result the audience can verify';

  const hooks: Record<string, string[]> = {
    'future-shock': [
      `${safeSubject} is changing. ${product} shows what replaces it.`,
      `The old way of building ${safeSubject} is ending. Here is the operating layer that comes next.`,
      `In 2026, shipping ${safeSubject} is not the hard part. Proving it is.`,
    ],
    'real-bottleneck': [
      `AI can produce ${safeSubject}. That was never the bottleneck.`,
      `The bottleneck is not generation. It is ${safeProof}.`,
      `${product} does not need more output. It needs a proof trail that ends in ${safeOutcome}.`,
    ],
    'reality-check': [
      `${product}, months in: what survived contact with reality.`,
      `We stopped counting demos. We counted what kept working across real runs.`,
      `What looked impressive once versus what stayed reliable after repeated use.`,
    ],
    teardown: [
      `Why ${safeSubject} keeps breaking: the system rewards output instead of evidence.`,
      `The polished demo is not the product. The operational chain is.`,
      `We tore down ${safeSubject} and found the missing layer: ${safeProof}.`,
    ],
    'missing-layer': [
      `Most AI frameworks explain tools. They miss ownership, approval, and receipts.`,
      `${product} adds the layer the standard playbook leaves out.`,
      `The framework gets generation right. It still misses what turns output into ${safeOutcome}.`,
    ],
    'actual-workflow': [
      `How ${product} actually turns ${safeSubject} into ${safeOutcome}.`,
      `No magic prompt. Here is the real workflow from input to receipt.`,
      `The exact steps, approvals, and artifacts behind one finished ${product} result.`,
    ],
  };

  return hooks[pattern.id] || hooks['actual-workflow'];
}

export default function ProgrammingDevelopmentRadar() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [subject, setSubject] = useState('AI-assisted product development');
  const [proof, setProof] = useState('approval states, tests, receipts, and deployed output');
  const [outcome, setOutcome] = useState('trusted execution');
  const [copied, setCopied] = useState('');

  const pattern = PATTERNS.find(item => item.id === patternId) || PATTERNS[0];
  const hooks = useMemo(() => buildHooks(pattern, product, subject, proof, outcome), [pattern, product, subject, proof, outcome]);

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  const seriesText = FIVE_DAY_SERIES.map(item => `Day ${item.day}: ${item.title}\n${item.job}\nAsset: ${item.asset}`).join('\n\n');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-zinc-950 to-black p-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">Programming & Development Radar</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">Turn developer trends into Empire-1 authority content.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
            This library converts recurring programming headlines and challenge-funnel tactics into original, proof-backed content without copying posts or tying Empire-1 to Google/Gemini APIs.
          </p>
        </header>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Headline modes</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {PATTERNS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPatternId(item.id)}
                    className={`rounded-xl border p-3 text-left transition ${patternId === item.id ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-black hover:border-white/25'}`}
                  >
                    <span className="block text-sm font-bold text-white">{item.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">{item.promise}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Product universe
                  <select value={product} onChange={event => setProduct(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-cyan-300/60">
                    {PRODUCTS.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Topic or workflow
                  <input value={subject} onChange={event => setSubject(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-cyan-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Proof available
                  <textarea value={proof} onChange={event => setProof(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-cyan-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Outcome
                  <input value={outcome} onChange={event => setOutcome(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-cyan-300/60" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Pattern logic</h2>
              <p className="mt-3 text-lg font-bold text-cyan-100">{pattern.formula}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">Proof rule: {pattern.evidence}</p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Generated hooks</h2>
                <button onClick={() => copy('Hooks copied', hooks.join('\n'))} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy all</button>
              </div>
              <div className="mt-4 space-y-3">
                {hooks.map((hook, index) => (
                  <button key={hook} onClick={() => copy(`Hook ${index + 1} copied`, hook)} className="w-full rounded-xl border border-white/10 bg-black p-4 text-left text-base font-semibold leading-6 text-zinc-200 hover:border-cyan-300/40">
                    <span className="mr-2 text-xs font-black text-cyan-300">0{index + 1}</span>{hook}
                  </button>
                ))}
              </div>
              {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Challenge Funnel</p>
                  <h2 className="mt-1 text-xl font-black">Empire-1 Five-Day Series</h2>
                </div>
                <button onClick={() => copy('Five-day series copied', seriesText)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy series</button>
              </div>
              <div className="mt-5 space-y-3">
                {FIVE_DAY_SERIES.map(item => (
                  <div key={item.day} className="grid gap-3 rounded-xl border border-white/10 bg-black p-4 sm:grid-cols-[52px_1fr]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-black">{item.day}</div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{item.job}</p>
                      <p className="mt-2 text-xs font-semibold text-amber-200">Asset: {item.asset}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Provider-neutral growth rules</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                {SIFU_PATTERN_RULES.map(rule => <li key={rule} className="rounded-xl border border-white/10 bg-black p-3">• {rule}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
