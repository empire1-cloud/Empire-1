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
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-3xl border border-zinc-800 bg-black/80 rounded-xl p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-400 mb-2">SLA113</p>
          <h1 className="text-2xl font-semibold text-white">Initializing Operator Console</h1>
        </div>

        <div className="space-y-2 font-mono text-[12px] border border-zinc-900 bg-black p-4 rounded-lg">
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

        <div className="mt-6 h-1 bg-zinc-900 rounded overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${((lineIndex + 1) / BOOT_LINES.length) * 100}%` }}
          />
        </div>

        <button
          onClick={() => setStage('console')}
          className="mt-6 w-full rounded-lg border border-cyan-600/40 bg-cyan-900/10 py-3 text-xs uppercase tracking-[0.25em] text-cyan-300 hover:bg-cyan-900/20 transition-colors"
        >
          Enter Console
        </button>
      </div>
    </div>
  );
}
