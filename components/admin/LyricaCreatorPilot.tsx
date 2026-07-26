'use client';

import { useState } from 'react';

const INTAKE_URL = 'https://forms.weavely.ai/editor/db59e61e-ee7a-4f01-842a-3a215679ddb0?publish=true&utm_source=mcp&utm_medium=chatgpt-app';

const METRICS = [
  ['Qualified replies', '20', 'Creators who respond with a real fit signal'],
  ['Pilot applications', '10', 'Completed creator intake forms'],
  ['Pilot starts', '5', 'Creators who bring an owned song or beat'],
  ['Proof chains completed', '3', 'Creation through identity, signing, ledger, and payout evidence'],
  ['Paid conversions', '2', 'Creators who continue after the pilot'],
];

const SEQUENCE = [
  {
    day: 'Day 0',
    channel: 'DM / Email',
    subject: 'Bring one song. Keep the proof.',
    copy: `I’m inviting a small group of independent artists and producers into the Lyrica 3 Founding Creator Pilot. Bring one original song or beat. We’ll test the complete ownership trail—creation, DNA identity, Soulprint, VICS signing, ledger, and payout evidence. This is not a promise that AI “changes music.” It is a test of whether the proof follows the creator.`,
  },
  {
    day: 'Day 2',
    channel: 'Follow-up',
    subject: 'The part most AI music tools skip',
    copy: `Most tools stop at generation. The question we are testing is what happens after the file exists: who made it, who owns it, what changed, and who gets paid. The pilot is for creators willing to test that trail with music they control.`,
  },
  {
    day: 'Day 5',
    channel: 'Proof post',
    subject: 'One song. Six proof layers.',
    copy: `We are documenting the workflow from creation through DNA identity, Soulprint, VICS signing, ledger, and payout evidence. No borrowed traction claims. No invisible rights transfer. The creator sees the chain and tells us where it breaks.`,
  },
  {
    day: 'Day 8',
    channel: 'Last call',
    subject: 'Founding creator pilot closes soon',
    copy: `We are keeping the first group small so every creator gets a real proof review. Apply with one song or beat you own and tell us what Lyrica 3 would have to prove for you to keep using it.`,
  },
];

const ASSETS = [
  ['Primary hook', 'AI can generate a song. That was never the hardest part. The hard part is proving who owns what happens next.'],
  ['Campaign headline', 'Bring One Song. Keep the Proof.'],
  ['Proof headline', 'One Song. Six Proof Layers. No Lost Ownership.'],
  ['Offer', 'A small founding-creator pilot using one creator-owned song or beat.'],
  ['CTA', 'Apply to test the ownership trail.'],
];

const PILOT_GATES = [
  'Creator confirms they own or control the submitted music.',
  'No public claim is made without a dated artifact, receipt, or clearly labeled founder interpretation.',
  'The pilot measures completed proof chains, not generated-song count.',
  'Creator feedback is recorded before product claims are rewritten.',
  'No payout claim is published until the real payout path produces evidence.',
  'The 70/30 creator split and $1.25 remix payout are only used where the governing product terms and live implementation support them.',
];

export default function LyricaCreatorPilot() {
  const [copied, setCopied] = useState('');

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  const fullSequence = SEQUENCE.map(item => `${item.day} — ${item.channel}\n${item.subject}\n${item.copy}`).join('\n\n');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="rounded-3xl border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-300/10 via-zinc-950 to-black p-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-fuchsia-200">Lyrica 3 Founding Creator Pilot</p>
          <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight sm:text-5xl">Bring one song. Keep the proof.</h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-zinc-300 sm:text-base">
            Recruit independent artists and producers who already make music but distrust AI because ownership, attribution, and payouts disappear inside the tool.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={INTAKE_URL} target="_blank" rel="noreferrer" className="rounded-xl bg-fuchsia-300 px-4 py-2.5 text-sm font-black text-black">Open creator intake</a>
            <button onClick={() => copy(fullSequence, 'Outreach sequence copied')} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white">Copy outreach sequence</button>
          </div>
          {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
        </header>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-6">
            <Panel title="The sharp customer">
              <p className="text-sm leading-7 text-zinc-300">An independent artist, producer, or songwriter with at least one original track or beat who wants creative speed but refuses to surrender ownership clarity, attribution, or payout visibility.</p>
              <div className="mt-4 rounded-xl border border-white/10 bg-black p-4 text-sm leading-6 text-zinc-400">
                <span className="font-bold text-white">Struggling moment:</span> they finish or upload music and cannot clearly answer who owns the output, how lineage is tracked, or how future remix money reaches them.
              </div>
            </Panel>

            <Panel title="Offer and assets">
              <div className="space-y-3">
                {ASSETS.map(([label, value]) => (
                  <button key={label} onClick={() => copy(value, `${label} copied`)} className="w-full rounded-xl border border-white/10 bg-black p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Pilot success gates">
              <div className="space-y-2">
                {METRICS.map(([metric, target, meaning]) => (
                  <div key={metric} className="grid gap-2 rounded-xl border border-white/10 bg-black p-4 sm:grid-cols-[1fr_70px_1.5fr]">
                    <span className="text-sm font-bold text-white">{metric}</span>
                    <span className="text-lg font-black text-fuchsia-200">{target}</span>
                    <span className="text-sm leading-6 text-zinc-500">{meaning}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="space-y-6">
            <Panel title="Outreach sequence" action={<button onClick={() => copy(fullSequence, 'Sequence copied')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300">Copy all</button>}>
              <div className="space-y-3">
                {SEQUENCE.map(item => (
                  <div key={item.day} className="rounded-xl border border-white/10 bg-black p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">{item.day} · {item.channel}</p>
                      <button onClick={() => copy(`${item.subject}\n\n${item.copy}`, `${item.day} copied`)} className="text-xs font-semibold text-zinc-500 hover:text-white">Copy</button>
                    </div>
                    <h3 className="mt-2 font-bold text-white">{item.subject}</h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">{item.copy}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Proof-first operating rules">
              <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                {PILOT_GATES.map(item => <li key={item} className="rounded-xl border border-white/10 bg-black p-3">• {item}</li>)}
              </ul>
            </Panel>

            <Panel title="Weekly readout">
              <div className="grid gap-3 sm:grid-cols-2">
                {['Messages sent', 'Qualified replies', 'Applications', 'Pilot starts', 'Proof chains completed', 'Paid conversions', 'Top objection', 'Broken workflow step'].map(item => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">Track</p>
                    <p className="mt-1 text-sm font-bold text-white">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
