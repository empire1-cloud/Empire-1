'use client';

import { useState } from 'react';

import { getSla113AdminHeaders } from '@/lib/sla113Auth';

type AITab = 'gpt' | 'claude' | 'images' | 'music' | 'voice' | 'voice-design' | 'effects';

const VOICE_PRESETS = [
  { id: 'default', label: 'Default' },
  { id: 'empire', label: 'Empire One' },
  { id: 'southern', label: 'Southern' },
  { id: 'southern_female', label: 'Southern Female' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'sla113', label: 'SLA113' },
  { id: 'narrator', label: 'Narrator' },
];

const FX_PRESETS = [
  { id: 'southern_radio', label: 'Southern G-Funk Radio', desc: 'Lowrider radio: reverb + low-pass + compression' },
  { id: 'arcade_hype', label: 'Arcade Hype', desc: 'Big arena: pitch up + delay + chorus' },
  { id: 'empire_corporate', label: 'Empire Corporate', desc: 'Clean professional: compression + gain' },
  { id: 'sla113_operator', label: 'SLA113 Operator', desc: 'Command-line: high-pass + metallic reverb' },
  { id: 'narrator_cinematic', label: 'Cinematic Narrator', desc: 'Rich depth: reverb + compression' },
  { id: 'robotic', label: 'Robotic', desc: 'Metallic synth: chorus + reverb' },
  { id: 'echo_chamber', label: 'Echo Chamber', desc: 'Heavy delay + reverb' },
  { id: 'deep_voice', label: 'Deep Voice', desc: 'Pitch down + compression' },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AIStudioPanel() {
  const [activeTab, setActiveTab] = useState<AITab>('gpt');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [voicePreset, setVoicePreset] = useState('southern');
  const [styleInstruction, setStyleInstruction] = useState('');
  const [applyFx, setApplyFx] = useState(false);
  const [fxPreset, setFxPreset] = useState('southern_radio');

  const [voiceDescription, setVoiceDescription] = useState('');
  const [sampleText, setSampleText] = useState('Hello, this is a voice design preview from Empire Universe.');

  const [fxInputPath, setFxInputPath] = useState('');
  const [selectedFxPreset, setSelectedFxPreset] = useState('southern_radio');

  const tabs: { id: AITab; label: string }[] = [
    { id: 'gpt', label: 'GPT Generator' },
    { id: 'claude', label: 'Claude Build' },
    { id: 'images', label: 'Image Gen' },
    { id: 'music', label: 'Music/SFX' },
    { id: 'voice', label: 'Voice' },
    { id: 'voice-design', label: 'Voice Design' },
    { id: 'effects', label: 'Effects' },
  ];

  async function handleGenerate() {
    if (activeTab === 'voice-design') {
      if (!voiceDescription.trim()) return;
    } else if (activeTab === 'effects') {
      if (!fxInputPath.trim()) return;
    } else {
      if (!prompt.trim()) return;
    }

    setGenerating(true);
    setResult(null);

    try {
      let endpoint = '';
      let body = '';

      if (activeTab === 'gpt') {
        endpoint = '/api/admin/universe/llm';
        body = JSON.stringify({ prompt, model: 'gpt-4o', max_tokens: 2000 });
      } else if (activeTab === 'claude') {
        endpoint = '/api/admin/universe/llm';
        body = JSON.stringify({ prompt, model: 'claude-sonnet-4.5', max_tokens: 2000 });
      } else if (activeTab === 'images') {
        endpoint = '/api/vision/generate';
        body = JSON.stringify({ prompt });
      } else if (activeTab === 'music') {
        endpoint = '/api/song/song/generate';
        body = JSON.stringify({ prompt, duration: 30, preset: 'cinematic' });
      } else if (activeTab === 'voice') {
        endpoint = `${BACKEND_URL}/api/voxcpm/generate`;
        body = JSON.stringify({
          text: prompt,
          voice_id: voicePreset,
          ...(styleInstruction.trim() ? { style_instruction: styleInstruction } : {}),
        });
      } else if (activeTab === 'voice-design') {
        endpoint = `${BACKEND_URL}/api/voxcpm/design`;
        body = JSON.stringify({
          description: voiceDescription,
          sample_text: sampleText,
        });
      } else if (activeTab === 'effects') {
        endpoint = `${BACKEND_URL}/api/audio-fx/apply-preset`;
        body = JSON.stringify({
          input_path: fxInputPath,
          preset: selectedFxPreset,
        });
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { ...getSla113AdminHeaders() },
        body
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      if (activeTab === 'voice' && applyFx && data.path) {
        const fxRes = await fetch(`${BACKEND_URL}/api/audio-fx/apply-preset`, {
          method: 'POST',
          headers: { ...getSla113AdminHeaders() },
          body: JSON.stringify({ input_path: data.path, preset: fxPreset }),
        });
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          data.fx_applied = fxData;
        }
      }

      setResult(data);
    } catch (err) {
      console.error('Generation error:', err);
      setResult({ error: err instanceof Error ? err.message : 'Failed to generate' });
    } finally {
      setGenerating(false);
    }
  }

  async function loadVoxcpmStatus() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/voxcpm/status`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI Studio</h1>
        <p className="text-sm text-gray-500 mt-1">Generate content using GPT, Claude, DALL-E, VoxCPM2, and Pedalboard FX</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* GPT / Claude / Images / Music tabs */}
          {(activeTab === 'gpt' || activeTab === 'claude' || activeTab === 'images' || activeTab === 'music') && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === 'gpt' && 'GPT Prompt'}
                {activeTab === 'claude' && 'Claude Prompt'}
                {activeTab === 'images' && 'Image Description'}
                {activeTab === 'music' && 'Music Description'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder={activeTab === 'gpt' ? 'Generate game logic for a fish shooting arcade machine...' :
                            activeTab === 'claude' ? 'Design a narrative arc for a Southern-style slot game...' :
                            activeTab === 'images' ? 'A neon-lit arcade floor with fish swimming in bioluminescent ocean...' :
                            'Energetic arcade music with synthesizers and drums...'}
              />
            </>
          )}

          {/* Voice tab */}
          {activeTab === 'voice' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Text</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder="Welcome to Southern Arcade, where fortune awaits..."
              />

              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Voice Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {VOICE_PRESETS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoicePreset(v.id)}
                    className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                      voicePreset === v.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                Style Instruction <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={styleInstruction}
                onChange={(e) => setStyleInstruction(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder="e.g. cheerful tone, slightly faster pace"
              />

              <div className="mt-4 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyFx}
                    onChange={(e) => setApplyFx(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">Apply Effects</span>
                </label>
                {applyFx && (
                  <select
                    value={fxPreset}
                    onChange={(e) => setFxPreset(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-gray-900 focus:border-gray-900"
                  >
                    {FX_PRESETS.map((fx) => (
                      <option key={fx.id} value={fx.id}>{fx.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </>
          )}

          {/* Voice Design tab */}
          {activeTab === 'voice-design' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Description</label>
              <textarea
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder="A young Chicana woman with a warm, melodic voice and gentle Southern California inflection..."
              />

              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Sample Text</label>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder="Hello, this is a voice design preview..."
              />

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Southern Male', desc: 'Warm Chicano male, smooth barrio cadence' },
                  { label: 'Southern Female', desc: 'Young Chicana woman, melodic and warm' },
                  { label: 'Arcade Announcer', desc: 'High energy male, arcade hype style' },
                  { label: 'Corporate Narrator', desc: 'Professional, authoritative, polished' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setVoiceDescription(preset.desc)}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100"
                  >
                    <p className="text-xs font-medium text-gray-900">{preset.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Effects tab */}
          {activeTab === 'effects' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audio File Path</label>
              <input
                value={fxInputPath}
                onChange={(e) => setFxInputPath(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-gray-900 focus:border-gray-900"
                placeholder="/var/sla/audio/voxcpm/abc123.wav"
              />
              <p className="text-[11px] text-gray-400 mt-1">Paste the path from a Voice generation result</p>

              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Effect Preset</label>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {FX_PRESETS.map((fx) => (
                  <button
                    key={fx.id}
                    onClick={() => setSelectedFxPreset(fx.id)}
                    className={`w-full p-3 rounded-lg text-left border transition-colors ${
                      selectedFxPreset === fx.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-sm font-medium ${selectedFxPreset === fx.id ? 'text-white' : 'text-gray-900'}`}>
                      {fx.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${selectedFxPreset === fx.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {fx.desc}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Processing...' :
              activeTab === 'voice' ? 'Generate Voice' :
              activeTab === 'voice-design' ? 'Design Voice' :
              activeTab === 'effects' ? 'Apply Effects' :
              'Generate'}
          </button>

          {(activeTab === 'voice' || activeTab === 'voice-design') && (
            <button
              onClick={loadVoxcpmStatus}
              className="mt-2 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Check VoxCPM2 Status
            </button>
          )}
        </div>

        {/* Output Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
          {generating ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : result ? (
            <div className="max-h-[500px] overflow-auto">
              {result.error ? (
                <p className="text-red-600 text-sm">{result.error}</p>
              ) : (
                <>
                  {/* Status badges */}
                  {result.success && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Success
                      </span>
                      {result.provider && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {result.provider}
                        </span>
                      )}
                      {result.voice_id && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {result.voice_id}
                        </span>
                      )}
                      {result.preset && (
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                          {result.preset}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Audio path display */}
                  {result.path && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Audio Output</p>
                      <p className="text-sm font-mono text-gray-800 break-all">{result.path}</p>
                      {result.sample_rate && (
                        <p className="text-xs text-gray-500 mt-1">{result.sample_rate}Hz • {result.characters} chars</p>
                      )}
                    </div>
                  )}

                  {/* FX result */}
                  {result.fx_applied && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-[11px] text-purple-600 uppercase tracking-wider mb-1">Effects Applied</p>
                      <p className="text-sm font-mono text-purple-800 break-all">{result.fx_applied.output_path}</p>
                      <p className="text-xs text-purple-600 mt-1">Preset: {result.fx_applied.preset}</p>
                    </div>
                  )}

                  {/* Voice Design result */}
                  {result.voice_id && result.type === 'designed' && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-[11px] text-blue-600 uppercase tracking-wider mb-1">New Voice Created</p>
                      <p className="text-sm font-medium text-blue-800">{result.voice_id}</p>
                      <p className="text-xs text-blue-600 mt-1">{result.description}</p>
                    </div>
                  )}

                  {/* Capabilities list */}
                  {result.capabilities && (
                    <div className="mb-3">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.capabilities.map((cap: string) => (
                          <span key={cap} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            {cap.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Raw JSON</summary>
                    <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md overflow-auto max-h-48">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Generated content will appear here
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          {activeTab === 'gpt' && (
            <>
              <button onClick={() => setPrompt('Generate payout table for a fish shooting game with 5 bet levels')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Payout Table</p>
                <p className="text-xs text-gray-500">Generate fish game paytable</p>
              </button>
              <button onClick={() => setPrompt('Generate bonus round logic for a 5-reel slot machine with free spins')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Bonus Logic</p>
                <p className="text-xs text-gray-500">Slot bonus generator</p>
              </button>
              <button onClick={() => setPrompt('Generate 10 unique character backstories for an arcade game')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Characters</p>
                <p className="text-xs text-gray-500">Game character ideas</p>
              </button>
              <button onClick={() => setPrompt('Generate game title and tagline for a Southern-style arcade game')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Naming</p>
                <p className="text-xs text-gray-500">Title & tagline</p>
              </button>
            </>
          )}
          {activeTab === 'images' && (
            <>
              <button onClick={() => setPrompt('A vibrant fish shooting arcade game screen with colorful tropical fish, neon lights, and score display')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Fish Game</p>
                <p className="text-xs text-gray-500">Arcade fish screen</p>
              </button>
              <button onClick={() => setPrompt('Slot machine with golden coins, cherries, and lucky sevens in a casino setting with warm lighting')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Slot Machine</p>
                <p className="text-xs text-gray-500">Classic slots asset</p>
              </button>
              <button onClick={() => setPrompt('Neon Tokyo street background with rain, perfect for arcade game backdrop')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Background</p>
                <p className="text-xs text-gray-500">Game background</p>
              </button>
              <button onClick={() => setPrompt('Cartoon treasure chest overflowing with gold coins and gems, arcade game asset style')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Bonus Round</p>
                <p className="text-xs text-gray-500">Bonus visual</p>
              </button>
            </>
          )}
          {activeTab === 'voice' && (
            <>
              <button onClick={() => { setPrompt('Welcome to Southern Lyfestyle Arcade, where the hustle meets the game.'); setVoicePreset('southern'); }} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Southern Intro</p>
                <p className="text-xs text-gray-500">Arcade welcome line</p>
              </button>
              <button onClick={() => { setPrompt('You have unlocked the bonus round. Prepare for maximum payout.'); setVoicePreset('arcade'); }} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Bonus Round</p>
                <p className="text-xs text-gray-500">Arcade announcer</p>
              </button>
              <button onClick={() => { setPrompt('System status nominal. All engines operational. SLA113 standing by.'); setVoicePreset('sla113'); }} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">SLA113 Status</p>
                <p className="text-xs text-gray-500">Operator status report</p>
              </button>
              <button onClick={() => { setPrompt('Empire One delivers enterprise-grade infrastructure for the modern operator.'); setVoicePreset('empire'); }} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Empire Pitch</p>
                <p className="text-xs text-gray-500">Corporate narration</p>
              </button>
            </>
          )}
          {activeTab === 'effects' && (
            <>
              <button onClick={() => setSelectedFxPreset('southern_radio')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">G-Funk Radio</p>
                <p className="text-xs text-gray-500">Lowrider drop</p>
              </button>
              <button onClick={() => setSelectedFxPreset('arcade_hype')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Arcade Hype</p>
                <p className="text-xs text-gray-500">Arena energy</p>
              </button>
              <button onClick={() => setSelectedFxPreset('deep_voice')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Deep Voice</p>
                <p className="text-xs text-gray-500">Authority tone</p>
              </button>
              <button onClick={() => setSelectedFxPreset('robotic')} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100">
                <p className="text-sm font-medium text-gray-900">Robotic</p>
                <p className="text-xs text-gray-500">Metallic synth</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
