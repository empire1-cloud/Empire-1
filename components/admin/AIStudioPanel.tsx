'use client';

import { useState } from 'react';

import { getSla113AdminHeaders } from '@/lib/sla113Auth';

type AITab = 'gpt' | 'claude' | 'images' | 'music' | 'voice';

export default function AIStudioPanel() {
  const [activeTab, setActiveTab] = useState<AITab>('gpt');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const tabs: { id: AITab; label: string }[] = [
    { id: 'gpt', label: 'GPT Generator' },
    { id: 'claude', label: 'Claude Build' },
    { id: 'images', label: 'Image Gen' },
    { id: 'music', label: 'Music/SFX' },
    { id: 'voice', label: 'Voice' },
  ];

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);

    try {
      let endpoint = '/api/vision/generate';
      let body = JSON.stringify({ prompt });

      if (activeTab === 'gpt') {
        endpoint = '/api/admin/universe/llm';
        body = JSON.stringify({ 
          prompt, 
          model: 'gpt-4o',
          max_tokens: 2000 
        });
      } else if (activeTab === 'claude') {
        endpoint = '/api/admin/universe/llm';
        body = JSON.stringify({ 
          prompt, 
          model: 'claude-sonnet-4.5',
          max_tokens: 2000 
        });
      } else if (activeTab === 'music') {
        endpoint = '/api/song/song/generate';
        body = JSON.stringify({ 
          prompt,
          duration: 30,
          preset: 'cinematic'
        });
      } else if (activeTab === 'voice') {
        endpoint = '/api/admin/universe/voice';
        body = JSON.stringify({
          text: prompt,
          voice: 'narrator'
        });
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...getSla113AdminHeaders(),
        },
        body
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Generation error:', err);
      setResult({ error: err instanceof Error ? err.message : 'Failed to generate' });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI Studio</h1>
        <p className="text-sm text-gray-500 mt-1">Generate content using GPT, Claude, DALL-E, and more</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {activeTab === 'gpt' && 'GPT Prompt'}
            {activeTab === 'claude' && 'Claude Prompt'}
            {activeTab === 'images' && 'Image Description'}
            {activeTab === 'music' && 'Music Description'}
            {activeTab === 'voice' && 'Voice Text'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
            placeholder={activeTab === 'gpt' ? 'Generate game logic for a fish shooting arcade machine...' :
                        activeTab === 'claude' ? 'Design a narrative arc for a Southern-style slot game...' :
                        activeTab === 'images' ? 'A neon-lit arcade floor with fish swimming in bioluminescent ocean...' :
                        activeTab === 'music' ? 'Energetic arcade music with synthesizers and drums...' :
                        'Welcome to Southern Arcade, where fortune awaits...'}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Output */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
          {generating ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : result ? (
            <div className="h-64 overflow-auto">
              {result.error ? (
                <p className="text-red-600 text-sm">{result.error}</p>
              ) : (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
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
        </div>
      </div>
    </div>
  );
}
