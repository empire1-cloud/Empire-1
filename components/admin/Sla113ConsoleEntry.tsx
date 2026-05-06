'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Full SLA113 standalone admin console — lazy loaded to avoid SSR issues
const SLA113Page = dynamic(() => import('./SLA113Page'), { ssr: false });

const BOOT_LINES = [
  'SLA113 // SECURITY CORE ONLINE',
  'SOVEREIGN VAULT HANDSHAKE',
  'LOADING FOUNDRY MATRIX',
  'SYNCING EMPIRE 1 LEDGER',
  'OPERATOR SURFACE READY',
];

export default function Sla113ConsoleEntry() {
  const [stage, setStage] = useState<'boot' | 'console'>('boot');
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (stage !== 'boot') return;

    const lineTimer = setInterval(() => {
      setLineIndex((current) => Math.min(current + 1, BOOT_LINES.length - 1));
    }, 450);

    const bootTimer = setTimeout(() => {
      setStage('console');
    }, 2600);

    return () => {
      clearInterval(lineTimer);
      clearTimeout(bootTimer);
    };
  }, [stage]);

  if (stage === 'console') {
    return <SLA113Page />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
      {/* Title Section */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-400 mb-4">SLA113</p>
        <h1 className="text-4xl font-bold text-white mb-2">Sovereign Operator OS</h1>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Security Core Initializing</p>
      </div>

      {/* Boot Sequence */}
      <div className="w-full max-w-2xl border border-zinc-800 bg-black/80 rounded-xl p-6 shadow-2xl">
        <div className="space-y-2 font-mono text-[12px]">
          {BOOT_LINES.map((line, idx) => (
            <div
              key={line}
              className={idx <= lineIndex ? 'text-cyan-300' : 'text-zinc-700'}
            >
              {idx <= lineIndex ? '> ' : '  '}
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-full max-w-2xl h-1 bg-zinc-900 rounded overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${((lineIndex + 1) / BOOT_LINES.length) * 100}%` }}
        />
      </div>

      {/* Enter Button - shows after first line appears */}
      {lineIndex >= 1 && (
        <button
          onClick={() => setStage('console')}
          className="mt-8 rounded-lg border border-cyan-600/40 bg-cyan-900/10 py-3 px-8 text-xs uppercase tracking-[0.25em] text-cyan-300 hover:bg-cyan-900/20 transition-colors"
        >
          Enter Console
        </button>
      )}
    </div>
  );
}
