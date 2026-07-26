'use client';

import { useState } from 'react';

const SOURCE_URL = 'https://www.linkedin.com/pulse/quantum-ip-rights-silent-force-redefining-global-vasiliu-feltes-z81ce/';

const CONTROL_POINTS = [
  {
    name: 'DNA Tagging',
    role: 'Creator identity, ownership, and lineage',
    proof: 'Track identity and lineage records without treating generation alone as ownership proof.',
  },
  {
    name: 'Soulprint',
    role: 'Asset-to-identity binding',
    proof: 'Connect the rights record to the actual creative asset or fingerprint.',
  },
  {
    name: 'VICS',
    role: 'Signed authorization and verification',
    proof: 'Preserve who authorized an action, what was signed, and which verification method was used.',
  },
  {
    name: 'Archisynapse',
    role: 'Economic evidence and royalty receipts',
    proof: 'Trace fees, payouts, reversals, ledger entries, and settlement evidence.',
  },
  {
    name: 'SLA113',
    role: 'Policy and tenant control',
    proof: 'Keep identity, permission, revocation, and execution policy separate from model output.',
  },
  {
    name: 'Hybrid Intelligence Core',
    role: 'Provider-independent orchestration',
    proof: 'Preserve replaceable providers behind Empire-owned routing, context, and approval logic.',
  },
  {
    name: 'Cultura Vibe Forge',
    role: 'Cultural integrity and heritage logic',
    proof: 'Keep cultural intelligence tied to its own authenticity rules and community context.',
  },
];

const HOOKS = [
  'The biggest AI moat may be invisible.',
  'Owning 245 features matters less than owning the control points nobody can safely bypass.',
  'The future belongs to companies that can prove who created it, who authorized it, and who got paid.',
  'AI sovereignty is preserving the freedom to change providers without losing identity, rights, data, or customers.',
  'Empire-1 is not trying to own every application. We are building the trusted architecture underneath them.',
];

const CLAIM_BOUNDARIES = [
  'Do not claim Empire-1, VICS, DNA Tagging, or Soulprint are quantum-safe until deployed cryptography proves it.',
  'Describe the LinkedIn article as an external strategic signal, not as Empire-1 product validation.',
  'Separate patent strategy, trade secrets, copyright, trademarks, standards work, and licensing decisions.',
  'Do not claim a patent moat before counsel reviews novelty, ownership, prior art, and filing strategy.',
  'Keep each Empire universe independent; this signal maps shared control points without flattening products.',
];

const ENGINE_BRIEF = [
  'SIGNAL: The Next AI Moat Is Sovereign IP Architecture',
  'CATEGORY: Emerging Technology',
  'LANE: IP Sovereignty',
  'AUTHORITY MODE: Founder Authority',
  '',
  'SOURCE:',
  SOURCE_URL,
  '',
  'SOURCE THESIS:',
  'Strategic power can concentrate in a small number of foundational intellectual-property control points, standards, licensing rights, and difficult-to-substitute interfaces.',
  '',
  'EMPIRE-1 TRANSLATION:',
  'Empire-1 owns or is building the trust, identity, orchestration, policy, cultural-integrity, and economic-proof layers that intelligent products need across providers and applications.',
  '',
  'CONTROL POINTS:',
  ...CONTROL_POINTS.map(item => `- ${item.name}: ${item.role}. Proof: ${item.proof}`),
  '',
  'CONTENT HOOKS:',
  ...HOOKS.map(item => `- ${item}`),
  '',
  'INVESTOR LINE:',
  'Empire-1 is building sovereign infrastructure for intelligent systems: an independent control layer that preserves identity, ownership, authorization, cultural integrity, and economic proof across models, applications, and providers.',
  '',
  'CLAIM BOUNDARIES:',
  ...CLAIM_BOUNDARIES.map(item => `- ${item}`),
].join('\n');

export default function IPSovereigntySignal() {
  const [copied, setCopied] = useState('');

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  return (
    <section className="border-b border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 pb-2 pt-8 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-400/10 via-zinc-950 to-black p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.16em]">
                <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1.5 text-violet-200">Emerging Technology</span>
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-amber-200">IP Sovereignty</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300">Founder Authority</span>
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-violet-200">New source-backed signal</p>
              <h2 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">The next AI moat is sovereign IP architecture.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                The source argues that a small number of foundational intellectual-property positions can shape access, standards, licensing, strategic dependencies, and market power. Empire-1 translates that lesson into the control points where identity, permission, proof, policy, cultura, and money meet.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
              <button
                onClick={() => copy('Engine brief copied', ENGINE_BRIEF)}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                Copy engine brief
              </button>
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-violet-300/50 hover:text-white"
              >
                Open source
              </a>
            </div>
          </div>

          <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Empire-1 control-point map</p>
                  <h3 className="mt-1 text-xl font-black">Seven layers competitors cannot safely bypass</h3>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200">7 mapped</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {CONTROL_POINTS.map(item => (
                  <div key={item.name} className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                    <p className="font-black text-white">{item.name}</p>
                    <p className="mt-1 text-sm font-semibold text-violet-200">{item.role}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{item.proof}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Viral hooks</h3>
                  <button
                    onClick={() => copy('Hooks copied', HOOKS.join('\n'))}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-white/25"
                  >
                    Copy all
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {HOOKS.map((hook, index) => (
                    <button
                      key={hook}
                      onClick={() => copy(`Hook ${index + 1} copied`, hook)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-left text-sm font-semibold leading-5 text-zinc-200 transition hover:border-violet-300/40"
                    >
                      <span className="mr-2 text-xs font-black text-violet-300">0{index + 1}</span>
                      {hook}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Investor translation</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-amber-50">
                  Empire-1 is building sovereign infrastructure for intelligent systems: an independent control layer that preserves identity, ownership, authorization, cultural integrity, and economic proof across models, applications, and providers.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">Claim boundaries</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {CLAIM_BOUNDARIES.map(item => (
                <p key={item} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs leading-5 text-zinc-400">{item}</p>
              ))}
            </div>
          </div>

          {copied && <p className="mt-4 text-xs font-black text-emerald-300">{copied}</p>}
        </div>
      </div>
    </section>
  );
}
