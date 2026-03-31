'use client';

import React, { useState } from 'react';

type RenderMode = 'cloud' | 'local';

interface FoundryUplinkToggleProps {
  onModeChange?: (mode: RenderMode) => void;
  defaultMode?: RenderMode;
}

export default function FoundryUplinkToggle({ 
  onModeChange, 
  defaultMode = 'cloud' 
}: FoundryUplinkToggleProps) {
  const [mode, setMode] = useState<RenderMode>(defaultMode);
  const [queuing, setQueuing] = useState(false);

  const handleToggle = (newMode: RenderMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const handleQueue = async () => {
    setQueuing(true);
    try {
      const res = await fetch('/api/sla113/queue-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_type: '1', mode })
      });
      const data = await res.json();
      console.log('Queued:', data);
    } catch (err) {
      console.error('Queue failed:', err);
    } finally {
      setQueuing(false);
    }
  };

  return (
    <div className="foundry-uplink-toggle">
      <div className="mode-selector">
        <button
          className={`mode-btn cloud ${mode === 'cloud' ? 'active' : ''}`}
          onClick={() => handleToggle('cloud')}
        >
          <span className="icon">☁</span>
          <span className="label">FAST (CLOUD GPU)</span>
          <span className="desc">Together.ai渲染</span>
        </button>
        
        <button
          className={`mode-btn local ${mode === 'local' ? 'active' : ''}`}
          onClick={() => handleToggle('local')}
        >
          <span className="icon">⚡</span>
          <span className="label">NIGHT-SHIFT (LOCAL CPU)</span>
          <span className="desc">EPYC-Milan免费渲染</span>
        </button>
      </div>

      <div className="uplink-status">
        <div className="mode-indicator">
          <span className="dot"></span>
          <span>MODE: {mode.toUpperCase()}</span>
        </div>
        <button 
          className="queue-btn" 
          onClick={handleQueue}
          disabled={queuing}
        >
          {queuing ? 'QUEUING...' : 'DISPATCH BUILD'}
        </button>
      </div>
    </div>
  );
}
