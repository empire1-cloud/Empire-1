'use client';

import { useEffect, useMemo, useState } from 'react';

type ViralChannel = 'linkedin' | 'carousel' | 'short_video' | 'newsletter';

type ViralPack = {
  id: string;
  pattern: string;
  product_universe: string;
  objective: string;
  audience: string;
  channels: ViralChannel[];
  headline: string;
  subheadline: string;
  verdict: string;
  survival_rate_percent?: number | null;
  content_assets: {
    linkedin_post: string;
    carousel: Array<{ slide: number; role: string; copy: string }>;
    short_video: Array<{ seconds: string; beat: string; copy: string }>;
    newsletter: {
      subject_lines: string[];
      opening: string;
      sections: string[];
    };
  };
  proof_checklist: string[];
  integrity_rules: string[];
  empire_examples: Array<{ universe: string; headline: string; proof: string }>;
  created_at: string;
  status: string;
};

type Preset = {
  product_universe: string;
  audited_subject: string;
  total_examined: string;
  survivors: string;
  proof_basis: string;
  audience: string;
  call_to_action: string;
};

const CHANNELS: Array<{ id: ViralChannel; label: string }> = [
  { id: 'linkedin', label: 'LinkedIn post' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'short_video', label: 'Short video' },
  { id: 'newsletter', label: 'Newsletter' },
];

const PRESETS: Preset[] = [
  {
    product_universe: 'Empire-1',
    audited_subject: 'AI engines',
    total_examined: '245+',
    survivors: 'Only the proof-backed engines',
    proof_basis: 'tests, receipts, release evidence, and live workflow output',
    audience: 'founders, operators, buyers, and investors',
    call_to_action: 'Open the evidence trail',
  },
  {
    product_universe: 'Lyrica 3',
    audited_subject: 'proof layers in one song workflow',
    total_examined: '6',
    survivors: '6',
    proof_basis: 'creation, DNA identity, Soulprint, VICS signing, ledger, and payout evidence',
    audience: 'independent artists, producers, and music partners',
    call_to_action: 'Follow the song from creation to payout',
  },
  {
    product_universe: 'Archisynapse',
    audited_subject: 'money movements in one payment and refund',
    total_examined: '6',
    survivors: '6',
    proof_basis: 'authorization, fees, ledger entries, refund reversal, receipts, and a balanced trial balance',
    audience: 'fintech operators, platforms, and enterprise buyers',
    call_to_action: 'Inspect the complete receipt chain',
  },
  {
    product_universe: 'Cultura Vibe Forge',
    audited_subject: 'cultural integrity checks',
    total_examined: '4',
    survivors: '4',
    proof_basis: 'heritage logic, dialect integrity, authenticity filters, and community context',
    audience: 'cultural creators, brands, and community partners',
    call_to_action: 'See what respectful cultural intelligence requires',
  },
  {
    product_universe: 'Empire Auto Cofounder',
    audited_subject: 'agent actions',
    total_examined: '5',
    survivors: 'Only approved evidence-backed actions',
    proof_basis: 'approval state, preflight, sealed manifest, execution receipt, and audit status',
    audience: 'founders, AI operators, and governance teams',
    call_to_action: 'Open the approval-to-receipt chain',
  },
  {
    product_universe: 'San Bernardino Youth Tech',
    audited_subject: 'young creators building with open tools',
    total_examined: '10',
    survivors: '10 creator-owned portfolios',
    proof_basis: 'completed projects, learned tools, public demos, and creator-owned work',
    audience: 'families, schools, sponsors, and local partners',
    call_to_action: 'Help us open the next creator cohort',
  },
];

const emptyPackHistory: ViralPack[] = [];

export default function ViralContentEngine() {
  const [productUniverse, setProductUniverse] = useState(PRESETS[0].product_universe);
  const [auditedSubject, setAuditedSubject] = useState(PRESETS[0].audited_subject);
  const [totalExamined, setTotalExamined] = useState(PRESETS[0].total_examined);
  const [survivors, setSurvivors] = useState(PRESETS[0].survivors);
  const [proofBasis, setProofBasis] = useState(PRESETS[0].proof_basis);
  const [audience, setAudience] = useState(PRESETS[0].audience);
  const [objective, setObjective] = useState('Turn product proof into authority-building content');
  const [callToAction, setCallToAction] = useState(PRESETS[0].call_to_action);
  const [channels, setChannels] = useState<ViralChannel[]>(CHANNELS.map(channel => channel.id));
  const [pack, setPack] = useState<ViralPack | null>(null);
  const [history, setHistory] = useState<ViralPack[]>(emptyPackHistory);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const canGenerate = useMemo(
    () => Boolean(auditedSubject.trim() && totalExamined.trim() && survivors.trim() && proofBasis.trim()),
    [auditedSubject, totalExamined, survivors, proofBasis],
  );

  function applyPreset(preset: Preset) {
    setProductUniverse(preset.product_universe);
    setAuditedSubject(preset.audited_subject);
    setTotalExamined(preset.total_examined);
    setSurvivors(preset.survivors);
    setProofBasis(preset.proof_basis);
    setAudience(preset.audience);
    setCallToAction(preset.call_to_action);
    setPack(null);
    setError('');
  }

  function toggleChannel(channel: ViralChannel) {
    setChannels(current => current.includes(channel)
      ? current.filter(item => item !== channel)
      : [...current, channel]);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/gtm/viral-audit-packs');
      const data = await response.json();
      if (response.ok && data.success) setHistory(data.packs || []);
    } catch (loadError) {
      console.error('Viral pack history load error:', loadError);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function generatePack() {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    setCopied('');

    try {
      const response = await fetch('/api/gtm/viral-audit-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_universe: productUniverse,
          audited_subject: auditedSubject,
          total_examined: totalExamined,
          survivors,
          proof_basis: proofBasis,
          audience,
          objective,
          call_to_action: callToAction,
          channels,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'The engine could not generate this pack.');
      }
      setPack(data.pack);
      setHistory(current => [data.pack, ...current.filter(item => item.id !== data.pack.id)].slice(0, 30));
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'The viral engine failed to generate a pack.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  const fullPackText = pack ? [
    pack.headline,
    pack.subheadline,
    '',
    pack.content_assets.linkedin_post,
    '',
    'CAROUSEL',
    ...pack.content_assets.carousel.map(slide => `${slide.slide}. ${slide.copy}`),
    '',
    'SHORT VIDEO',
    ...pack.content_assets.short_video.map(beat => `${beat.seconds} — ${beat.beat}: ${beat.copy}`),
    '',
    'PROOF CHECKLIST',
    ...pack.proof_checklist.map(item => `- ${item}`),
  ].join('\n') : '';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-7 shadow-2xl">
          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Empire-1 Viral Content Engine</p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">Turn the proof trail into the story.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
              Audit-to-Verdict converts a real product test into a headline, verdict, LinkedIn post, carousel, short-video script, newsletter opening, and evidence checklist.
            </p>
            <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
              Huge universe → brutal filter → surprising result → specific proof
            </div>
          </div>
        </div>

        <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">Empire presets</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.product_universe}
                    onClick={() => applyPreset(preset)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm transition ${productUniverse === preset.product_universe ? 'border-amber-300/70 bg-amber-300/10 text-amber-100' : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25'}`}
                  >
                    <span className="block font-semibold">{preset.product_universe}</span>
                    <span className="mt-1 block text-xs text-zinc-500">Load proof pattern</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Product universe
                  <input value={productUniverse} onChange={event => setProductUniverse(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm text-zinc-300">
                    Total examined
                    <input value={totalExamined} onChange={event => setTotalExamined(event.target.value)} placeholder="1.6 million" className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                  </label>
                  <label className="grid gap-1.5 text-sm text-zinc-300">
                    Survivors / verdict result
                    <input value={survivors} onChange={event => setSurvivors(event.target.value)} placeholder="12" className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                  </label>
                </div>

                <label className="grid gap-1.5 text-sm text-zinc-300">
                  What was audited?
                  <input value={auditedSubject} onChange={event => setAuditedSubject(event.target.value)} placeholder="public datasets" className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <label className="grid gap-1.5 text-sm text-zinc-300">
                  What proof decided survival?
                  <textarea value={proofBasis} onChange={event => setProofBasis(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Audience
                  <input value={audience} onChange={event => setAudience(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Objective
                  <input value={objective} onChange={event => setObjective(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <label className="grid gap-1.5 text-sm text-zinc-300">
                  Call to action
                  <input value={callToAction} onChange={event => setCallToAction(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-amber-300/70" />
                </label>

                <div>
                  <p className="mb-2 text-sm text-zinc-300">Generate assets</p>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${channels.includes(channel.id) ? 'border-amber-300/60 bg-amber-300/10 text-amber-100' : 'border-white/10 text-zinc-500'}`}
                      >
                        {channel.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

                <button
                  onClick={generatePack}
                  disabled={!canGenerate || loading}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Building proof-backed content…' : 'Generate Audit-to-Verdict Pack'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">Recent packs</h2>
                <button onClick={loadHistory} className="text-xs font-semibold text-amber-200 hover:text-amber-100">Refresh</button>
              </div>
              <div className="mt-4 space-y-2">
                {historyLoading ? (
                  <p className="text-sm text-zinc-600">Loading history…</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-zinc-600">No packs yet.</p>
                ) : history.slice(0, 8).map(item => (
                  <button key={item.id} onClick={() => setPack(item)} className="w-full rounded-xl border border-white/10 bg-black p-3 text-left hover:border-white/25">
                    <span className="block text-xs font-semibold text-amber-200">{item.product_universe}</span>
                    <span className="mt-1 block text-sm text-zinc-300">{item.headline}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            {!pack ? (
              <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-950/70 p-8 text-center">
                <div className="max-w-md">
                  <div className="text-5xl">✦</div>
                  <h2 className="mt-5 text-2xl font-black">Evidence first. Virality second.</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">Load an Empire preset or enter a real audit. The engine will turn the verified result into a full content pack without flattening the product universes.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                  <div className="border-b border-white/10 bg-gradient-to-br from-amber-300/15 via-transparent to-transparent p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">{pack.product_universe}</span>
                      <button onClick={() => copyText('Full pack copied', fullPackText)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy full pack</button>
                    </div>
                    <h2 className="mt-6 text-3xl font-black leading-tight sm:text-5xl">{pack.headline}</h2>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300">{pack.subheadline}</p>
                    <p className="mt-5 border-l-2 border-amber-300 pl-4 text-sm font-semibold text-amber-100">{pack.verdict}</p>
                    {pack.survival_rate_percent !== null && pack.survival_rate_percent !== undefined && (
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">Calculated survival rate: {pack.survival_rate_percent}%</p>
                    )}
                    {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
                  </div>
                </div>

                {pack.channels.includes('linkedin') && (
                  <AssetCard title="LinkedIn authority post" onCopy={() => copyText('LinkedIn post copied', pack.content_assets.linkedin_post)}>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{pack.content_assets.linkedin_post}</p>
                  </AssetCard>
                )}

                {pack.channels.includes('carousel') && (
                  <AssetCard title="7-slide carousel" onCopy={() => copyText('Carousel copied', pack.content_assets.carousel.map(slide => `${slide.slide}. ${slide.copy}`).join('\n'))}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {pack.content_assets.carousel.map(slide => (
                        <div key={slide.slide} className="rounded-xl border border-white/10 bg-black p-4">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                            <span>Slide {slide.slide}</span><span>{slide.role}</span>
                          </div>
                          <p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">{slide.copy}</p>
                        </div>
                      ))}
                    </div>
                  </AssetCard>
                )}

                {pack.channels.includes('short_video') && (
                  <AssetCard title="40-second short-video script" onCopy={() => copyText('Video script copied', pack.content_assets.short_video.map(beat => `${beat.seconds} — ${beat.beat}: ${beat.copy}`).join('\n'))}>
                    <div className="space-y-2">
                      {pack.content_assets.short_video.map(beat => (
                        <div key={`${beat.seconds}-${beat.beat}`} className="grid gap-2 rounded-xl border border-white/10 bg-black p-3 sm:grid-cols-[80px_100px_1fr]">
                          <span className="text-xs font-bold text-amber-200">{beat.seconds}</span>
                          <span className="text-xs font-semibold text-zinc-500">{beat.beat}</span>
                          <span className="text-sm text-zinc-300">{beat.copy}</span>
                        </div>
                      ))}
                    </div>
                  </AssetCard>
                )}

                {pack.channels.includes('newsletter') && (
                  <AssetCard title="Newsletter opening" onCopy={() => copyText('Newsletter copy copied', [pack.content_assets.newsletter.subject_lines.join('\n'), '', pack.content_assets.newsletter.opening].join('\n'))}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">Subject options</p>
                    <div className="mt-3 space-y-2">
                      {pack.content_assets.newsletter.subject_lines.map(subject => <p key={subject} className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-zinc-200">{subject}</p>)}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-zinc-300">{pack.content_assets.newsletter.opening}</p>
                  </AssetCard>
                )}

                <AssetCard title="Proof-before-publish gate">
                  <div className="space-y-2">
                    {pack.proof_checklist.map(item => (
                      <label key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black p-3 text-sm text-zinc-300">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-black" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">Integrity rules</p>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-500">
                      {pack.integrity_rules.map(rule => <li key={rule}>• {rule}</li>)}
                    </ul>
                  </div>
                </AssetCard>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AssetCard({ title, children, onCopy }: { title: string; children: React.ReactNode; onCopy?: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-400">{title}</h3>
        {onCopy && <button onClick={onCopy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-white/25 hover:text-white">Copy</button>}
      </div>
      {children}
    </div>
  );
}
