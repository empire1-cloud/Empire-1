'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Stem {
  name: string;
  label: string;
  vol: number;
  muted: boolean;
  solo: boolean;
  color: string;
  colorBg: string;
  path?: string;
}

interface RoyaltyEntry {
  contributor_id: string;
  accumulated_usd: number;
  fraction: number;
}

const GROOVES = [
  { id: 'trap', label: 'Trap', bpm: 140 },
  { id: 'boom_bap', label: 'Boom Bap', bpm: 90 },
  { id: 'g_funk', label: 'G-Funk', bpm: 100 },
  { id: 'corrido', label: 'Corrido', bpm: 120 },
];

const PROFILES = [
  { id: 'art_laboe_oldie', label: 'Art Laboe Sunday Night' },
  { id: 'sgv_garage_party', label: 'SGV Backyard Session' },
  { id: 'corrido_tumbado', label: 'Corrido Tumbado' },
  { id: 'chicano_trap_soul', label: 'Chicano Trap-Soul' },
  { id: 'documentary_raw', label: 'Documentary Raw' },
];

const RENDER_TIERS = [
  { id: 'DRAFT', label: 'DRAFT', desc: '22kHz/16-bit', cost: '$0.0003' },
  { id: 'PREVIEW', label: 'PREVIEW', desc: '44kHz/16-bit', cost: '$0.0008' },
  { id: 'FINAL', label: 'FINAL', desc: '48kHz/24-bit', cost: '$0.0020' },
];

const INITIAL_STEMS: Stem[] = [
  { name: 'kick', label: 'KICK', vol: 90, muted: false, solo: false, color: 'text-red-500', colorBg: 'bg-red-500' },
  { name: 'snare', label: 'SNARE', vol: 85, muted: false, solo: false, color: 'text-amber-500', colorBg: 'bg-amber-500' },
  { name: 'hihat', label: 'HI-HAT', vol: 75, muted: false, solo: false, color: 'text-cyan-400', colorBg: 'bg-cyan-400' },
  { name: 'vocal', label: 'VOCAL', vol: 80, muted: false, solo: false, color: 'text-purple-500', colorBg: 'bg-purple-500' },
];

export default function SonanceProStemDeck() {
  const [stems, setStems] = useState<Stem[]>(INITIAL_STEMS);
  const [mutationLevel, setMutationLevel] = useState(0);
  const [selectedGroove, setSelectedGroove] = useState('g_funk');
  const [selectedProfile, setSelectedProfile] = useState('art_laboe_oldie');
  const [renderTier, setRenderTier] = useState('FINAL');
  const [bars, setBars] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [royalties, setRoyalties] = useState<RoyaltyEntry[]>([]);
  const [totalRoyalty, setTotalRoyalty] = useState(0);
  const [trackId, setTrackId] = useState('');
  const [beatResult, setBeatResult] = useState<any>(null);
  const [sessionLog, setSessionLog] = useState<string[]>([]);
  const [ghostArtifact, setGhostArtifact] = useState<any>(null);
  const [synapsePayload, setSynapsePayload] = useState<any>(null);

  const log = useCallback((msg: string) => {
    setSessionLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  const updateStem = (index: number, updates: Partial<Stem>) => {
    setStems(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  async function generateBeat() {
    setIsGenerating(true);
    log(`Generating ${selectedGroove} beat, ${bars} bars...`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/lyrica/mma/generate`, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body: JSON.stringify({ groove: selectedGroove, bars, seed: Math.floor(Math.random() * 99999) }),
      });
      if (!res.ok) throw new Error('Beat generation failed');
      const data = await res.json();
      setBeatResult(data);
      setTrackId(data.beat_id || '');

      if (data.stems) {
        setStems(prev => prev.map(s => {
          if (s.name === 'kick' && data.stems.kick) return { ...s, path: data.stems.kick };
          if (s.name === 'snare' && data.stems.snare) return { ...s, path: data.stems.snare };
          if (s.name === 'hihat' && data.stems.hihat) return { ...s, path: data.stems.hihat };
          return s;
        }));
      }

      log(`Beat ready: ${data.duration_seconds}s @ ${data.tempo_bpm}bpm, ${data.humanization?.total_hits} humanized hits`);
    } catch (err) {
      log(`ERROR: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsGenerating(false);
    }
  }

  async function applyPDATexture() {
    if (!beatResult?.output_path) return;
    setIsProcessing(true);

    const profileRes = await fetch(`${BACKEND_URL}/api/lyrica/ccna/profile/${selectedProfile}`);
    const profile = await profileRes.json();
    const texture = profile.texture_chain?.[0]?.type || 'tape_saturation';

    log(`Applying PDA texture: ${texture} (${selectedProfile})`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/lyrica/pda/process`, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body: JSON.stringify({ input_path: beatResult.output_path, texture }),
      });
      const data = await res.json();
      log(`PDA applied: ${data.texture_name}`);
    } catch (err) {
      log(`PDA error: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function calculateRoyalties() {
    if (!trackId) return;
    log('Calculating micro-royalties (1M streams, US)...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/lyrica/royalty/calculate`, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body: JSON.stringify({
          track_id: trackId,
          streams: 1000000,
          territory: 'US',
          splits: { matriarch_wallet: 0.70, heir_wallet: 0.30 },
        }),
      });
      const data = await res.json();
      setTotalRoyalty(data.gross_royalty_usd || 0);
      setRoyalties(data.ledger_entries || []);
      log(`Royalty: $${data.gross_royalty_usd?.toLocaleString()} distributed across ${data.contributors} creators`);
    } catch (err) {
      log(`Royalty error: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  }

  async function tagDNA() {
    if (!beatResult?.output_path) return;
    log('Etching DNA provenance tag...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/lyrica/dna/tag`, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body: JSON.stringify({ file_path: beatResult.output_path, contributor_id: 'sla113-owner' }),
      });
      const data = await res.json();
      log(`DNA Tag: ${data.dna_tag} — permanently etched`);
    } catch (err) {
      log(`DNA error: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  }

  async function assembleSynapse() {
    if (!beatResult) return;
    log('Assembling Soulfire Synapse Payload...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/lyrica/synapse/assemble`, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body: JSON.stringify({
          track_title: `${selectedProfile}_${selectedGroove}_session`,
          genre: selectedGroove,
          mood: 'struggle',
          contributor_id: 'sla113-owner',
          mma_output: beatResult,
        }),
      });
      const data = await res.json();
      setSynapsePayload(data);
      log(`Synapse Payload locked: ${data.stem_count} stems, ${Object.keys(data.dna_tags || {}).length} DNA tags`);
    } catch (err) {
      log(`Synapse error: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 p-6 font-mono">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              SONANCE <span className="text-amber-500">PRO</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">STEM DECK</span>
            </h1>
            <p className="text-xs text-neutral-500 uppercase mt-1">S2 Disruption Engine // MSGO {renderTier} // Lyrica 3 Pro</p>
          </div>

          {/* Live Royalty Counter */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M12 6v6l4 2"/></svg>
              <span className="text-2xl font-bold">${totalRoyalty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase">Micro-Royalty Projection (1M streams)</span>
            {royalties.length > 0 && (
              <div className="flex gap-3 mt-1">
                {royalties.map((r, i) => (
                  <span key={i} className="text-[10px] text-neutral-400">
                    {r.contributor_id}: <span className="text-green-400">${r.accumulated_usd.toLocaleString()}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">

          {/* Left: Controls */}
          <div className="col-span-3 space-y-4">

            {/* Groove Selector */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-4">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3">Groove Template</h3>
              <div className="space-y-1.5">
                {GROOVES.map(g => (
                  <button key={g.id} onClick={() => setSelectedGroove(g.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      selectedGroove === g.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-neutral-400 hover:bg-neutral-800 border border-transparent'
                    }`}>
                    <span className="font-bold">{g.label}</span>
                    <span className="float-right text-neutral-500">{g.bpm} BPM</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cultural Profile */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-4">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3">CCNA Acoustic Profile</h3>
              <div className="space-y-1.5">
                {PROFILES.map(p => (
                  <button key={p.id} onClick={() => setSelectedProfile(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all ${
                      selectedProfile === p.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-neutral-400 hover:bg-neutral-800 border border-transparent'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Tier */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-4">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3">Render Tier (MSGO)</h3>
              <div className="flex gap-2">
                {RENDER_TIERS.map(t => (
                  <button key={t.id} onClick={() => setRenderTier(t.id)}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${
                      renderTier === t.id ? 'bg-amber-500 text-black font-bold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}>
                    <div className="text-[10px] font-bold">{t.label}</div>
                    <div className="text-[8px] opacity-70">{t.cost}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-4">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Bars</h3>
              <div className="flex gap-2">
                {[2, 4, 8, 16].map(b => (
                  <button key={b} onClick={() => setBars(b)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      bars === b ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                    }`}>{b}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Stem Mixer + S2 Slider */}
          <div className="col-span-6 space-y-4">

            {/* S2 Mutation Slider */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-amber-500/5 pointer-events-none" />
              <div className="flex justify-between items-end mb-3 relative z-10">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-amber-500">S2</span> LATENT MUTATION
                  </h2>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Groove Transplantation + Spectral Morph</p>
                </div>
                <span className="text-3xl font-black text-amber-500">{mutationLevel}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={mutationLevel}
                onChange={(e) => setMutationLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 relative z-10"
              />
              <div className="flex justify-between text-[9px] text-neutral-600 mt-1 relative z-10">
                <span>SOURCE</span><span>50/50</span><span>TARGET</span>
              </div>
            </div>

            {/* 4-Track Stem Mixer */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-4">Stem Mixer</h3>
              <div className="grid grid-cols-4 gap-3 h-64">
                {stems.map((stem, idx) => (
                  <div key={idx} className="bg-neutral-900 rounded-xl p-3 flex flex-col items-center border border-neutral-800 hover:border-neutral-600 transition-all">
                    <div className="text-[9px] text-center mb-2 text-neutral-400 font-bold">{stem.label}</div>

                    {/* Fader Track */}
                    <div className="flex-1 w-6 bg-black rounded-full relative overflow-hidden shadow-inner flex items-end mb-2">
                      <div className={`w-full ${stem.colorBg} transition-all duration-150 ease-out rounded-b-full`}
                        style={{ height: `${stem.muted ? 0 : stem.vol}%`, opacity: stem.muted ? 0.2 : 1 }} />
                    </div>

                    {/* Volume */}
                    <input type="range" min="0" max="100" value={stem.vol}
                      onChange={(e) => updateStem(idx, { vol: parseInt(e.target.value) })}
                      className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-neutral-400"
                      style={{ writingMode: 'horizontal-tb' }} />

                    <div className="text-[10px] font-bold text-white mt-1">{stem.vol}</div>

                    {/* Mute / Solo */}
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => updateStem(idx, { muted: !stem.muted })}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${stem.muted ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                        M
                      </button>
                      <button onClick={() => updateStem(idx, { solo: !stem.solo })}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${stem.solo ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
                        S
                      </button>
                    </div>

                    {/* Path indicator */}
                    {stem.path && (
                      <div className={`w-2 h-2 rounded-full ${stem.colorBg} mt-2 animate-pulse`} title={stem.path} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={generateBeat} disabled={isGenerating}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-sm py-3 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2">
                {isGenerating ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> GENERATING...</>
                ) : (
                  'GENERATE BEAT'
                )}
              </button>

              <button onClick={applyPDATexture} disabled={isProcessing || !beatResult}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {isProcessing ? 'PROCESSING...' : 'APPLY TEXTURE'}
              </button>

              <button onClick={() => { tagDNA(); calculateRoyalties(); }} disabled={!beatResult}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white font-bold text-sm py-3 rounded-xl transition-all">
                TAG DNA + ROYALTIES
              </button>

              <button onClick={assembleSynapse} disabled={!beatResult}
                className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 text-white font-bold text-sm py-3 rounded-xl transition-all border border-neutral-600">
                LOCK TO EMPIRE LEDGER
              </button>
            </div>
          </div>

          {/* Right: Session Log + Synapse Output */}
          <div className="col-span-3 space-y-4">

            {/* Beat Info */}
            {beatResult && (
              <div className="bg-[#0a0a0c] border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-[10px] text-amber-500 uppercase tracking-wider mb-2">Active Beat</h3>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-neutral-500">Groove</span><span className="text-white">{beatResult.groove}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Tempo</span><span className="text-white">{beatResult.tempo_bpm} BPM</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Duration</span><span className="text-white">{beatResult.duration_seconds}s</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Hits</span><span className="text-white">{beatResult.humanization?.total_hits}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Snare Delay</span><span className="text-amber-400">{beatResult.humanization?.snare_delay_mean_ms}ms</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Render</span><span className="text-amber-400">{renderTier}</span></div>
                </div>
              </div>
            )}

            {/* Synapse Payload Summary */}
            {synapsePayload && (
              <div className="bg-[#0a0a0c] border border-green-500/20 rounded-xl p-4">
                <h3 className="text-[10px] text-green-500 uppercase tracking-wider mb-2">Synapse Payload</h3>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-neutral-500">Stems</span><span className="text-white">{synapsePayload.stem_count}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">DNA Tags</span><span className="text-green-400">{Object.keys(synapsePayload.dna_tags || {}).length}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className="text-green-400">LOCKED</span></div>
                </div>
              </div>
            )}

            {/* Session Log */}
            <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-4">
              <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Session Log</h3>
              <div className="h-64 overflow-y-auto space-y-1 font-mono">
                {sessionLog.length === 0 && (
                  <p className="text-[10px] text-neutral-600">Awaiting commands...</p>
                )}
                {sessionLog.map((entry, i) => (
                  <p key={i} className={`text-[10px] ${
                    entry.includes('ERROR') ? 'text-red-400' :
                    entry.includes('DNA') ? 'text-green-400' :
                    entry.includes('Royalty') ? 'text-green-400' :
                    entry.includes('PDA') ? 'text-purple-400' :
                    entry.includes('Synapse') ? 'text-cyan-400' :
                    'text-neutral-400'
                  }`}>{entry}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-neutral-700 uppercase tracking-[0.3em]">
            SLA113 Control Plane → Empire-1 Pipeline → Lyrica 3 Execution Universe
          </p>
        </div>
      </div>
    </div>
  );
}
