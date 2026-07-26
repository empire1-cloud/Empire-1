'use client';

import { useState } from 'react';
import GTMPanel from '@/components/admin/GTMPanel';
import ViralContentEngine from '@/components/admin/ViralContentEngine';
import ProgrammingDevelopmentRadar from '@/components/admin/ProgrammingDevelopmentRadar';
import GTMEngineeringLab from '@/components/admin/GTMEngineeringLab';
import EmpireSkillForge from '@/components/admin/EmpireSkillForge';
import LyricaCreatorPilot from '@/components/admin/LyricaCreatorPilot';

type View = 'operations' | 'viral' | 'development' | 'engineering' | 'skills' | 'lyrica-pilot';

export default function GTMPage() {
  const [view, setView] = useState<View>('lyrica-pilot');

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/90 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Empire-1 GTM</p>
            <p className="text-xs text-zinc-500">Campaign execution, proof-backed content, growth-system engineering, governed skills, and measurable pilots</p>
          </div>
          <div className="flex flex-wrap rounded-xl border border-white/10 bg-zinc-950 p-1">
            <button onClick={() => setView('lyrica-pilot')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'lyrica-pilot' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Lyrica Pilot</button>
            <button onClick={() => setView('viral')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'viral' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Viral Engine</button>
            <button onClick={() => setView('development')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'development' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Dev Radar</button>
            <button onClick={() => setView('engineering')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'engineering' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>GTM Eng Lab</button>
            <button onClick={() => setView('skills')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'skills' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Skill Forge</button>
            <button onClick={() => setView('operations')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === 'operations' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>GTM Operations</button>
          </div>
        </div>
      </div>

      {view === 'lyrica-pilot' && <LyricaCreatorPilot />}
      {view === 'viral' && <ViralContentEngine />}
      {view === 'development' && <ProgrammingDevelopmentRadar />}
      {view === 'engineering' && <GTMEngineeringLab />}
      {view === 'skills' && <EmpireSkillForge />}
      {view === 'operations' && <div className="bg-gray-50 text-gray-900"><GTMPanel /></div>}
    </div>
  );
}
