'use client';

import React, { useState, useEffect } from 'react';
import { AZTEC_GAMES } from '@/lib/aztec_registry';
import { SLOT_GAMES } from '@/lib/slot_registry';
import AztecFishGame from '@/components/games/AztecFishGame';
import GShieldWOF from '@/components/games/GShieldWOF';
import CustomSlotGame from '@/components/games/CustomSlotGame';

/**
 * SOVEREIGN_ARCADE // GOD_TIER_LOBBY
 * Built to surpass Juwa and FireKirin
 * Target: arcade.southernlifestyle.org
 */
export default function ArcadeHome() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameType, setGameType] = useState<'FISH' | 'SLOT' | 'WOF' | null>(null);
  const [jackpot, setJackpot] = useState(128450.75);

  // Simulate Live Jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.random() * 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const selectedFish = AZTEC_GAMES.find(g => g.id === activeGame);
  const selectedSlot = SLOT_GAMES.find(g => g.id === activeGame);

  return (
    <div className="bg-[#050505] w-full min-h-screen overflow-x-hidden flex flex-col font-mono text-white selection:bg-[#D4AF37] selection:text-black">
      
      {/* 1. SOVEREIGN HUD (PREMIUM) */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center font-black text-black">S</div>
            <div className="hidden md:block">
                <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-white">SLA113 // SOVEREIGN_SYSTEM</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Operator Console v.4.2</div>
            </div>
        </div>

        {/* LIVE JACKPOT (SURPASSING JUWA) */}
        <div className="flex flex-col items-center">
            <div className="text-[8px] text-[#D4AF37] uppercase tracking-[0.4em] mb-1">GLOBAL SOVEREIGN JACKPOT</div>
            <div className="text-3xl font-black italic tracking-tighter text-white tabular-nums">
                ${jackpot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>

        <div className="flex items-center space-x-6">
            <div className="text-right">
                <div className="text-[8px] text-zinc-500 uppercase">Balance</div>
                <div className="text-sm font-bold text-[#D4AF37]">$2,450.00</div>
            </div>
            {activeGame && (
                <button 
                  onClick={() => { setActiveGame(null); setGameType(null); }}
                  className="bg-white/5 border border-white/10 px-6 py-2 text-[10px] text-zinc-400 hover:bg-white hover:text-black transition-all uppercase tracking-widest font-bold rounded-full"
                >
                    EXIT TO LOBBY
                </button>
            )}
        </div>
      </div>

      <div className="p-8 pb-32">
        {/* 2. MAIN CONTENT AREA */}
        {!activeGame ? (
            <div className="space-y-24">
                
                {/* A. FEATURED: G-SHIELD VAULT */}
                <section className="relative group cursor-pointer" onClick={() => { setActiveGame('gshield_wof'); setGameType('WOF'); }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-red-600 rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-12 flex items-center overflow-hidden">
                        <div className="flex-1 z-10">
                             <div className="flex items-center space-x-3 mb-6">
                                <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[10px] text-[#D4AF37] font-bold rounded-full">HIGH VOLATILITY</div>
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Featured Engine</div>
                             </div>
                             <h2 className="text-7xl font-black italic tracking-tighter mb-4">G-SHIELD<br/>WHEEL</h2>
                             <p className="text-zinc-400 max-w-sm text-sm leading-relaxed mb-8">Exclusive high-limit rewards. The ultimate Sovereign test of loyalty and luck.</p>
                             <div className="flex items-center space-x-6">
                                <button className="bg-[#D4AF37] text-black px-10 py-4 text-xs font-black tracking-widest uppercase hover:scale-105 transition-transform">SPIN NOW</button>
                                <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Max Win: 50,000X</div>
                             </div>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-zinc-950 to-transparent flex items-center justify-center">
                             <div className="w-80 h-80 rounded-full border-[20px] border-zinc-900 shadow-[0_0_100px_rgba(212,175,55,0.1)] flex items-center justify-center">
                                <div className="text-8xl font-black text-zinc-800">WOF</div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* B. AZTEC MYTH ARCADE (14 BOSSES) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl font-black tracking-tighter italic">AZTEC MYTH CYCLE</h2>
                            <div className="h-px w-32 bg-zinc-800" />
                            <span className="text-zinc-600 text-[10px] uppercase font-bold">14 Boss Hunt Engines</span>
                        </div>
                        <button className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest transition-colors font-bold">View All Gods →</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {AZTEC_GAMES.map((game) => (
                            <div 
                              key={game.id}
                              onClick={() => { setActiveGame(game.id); setGameType('FISH'); }}
                              className="aspect-[3/4] bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-[#D4AF37] transition-all group cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 font-black text-6xl pointer-events-none group-hover:opacity-10 transition-opacity">
                                    {game.god[0]}
                                </div>
                                <div className="z-10">
                                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">{game.element}</div>
                                    <h3 className="font-bold text-sm tracking-tight group-hover:text-[#D4AF37] transition-colors">{game.name.toUpperCase()}</h3>
                                </div>
                                <div className="z-10 space-y-3">
                                    <div className="text-[9px] text-zinc-600 italic leading-tight">Boss: {game.god}</div>
                                    <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#D4AF37] transition-all duration-500 w-0 group-hover:w-full" />
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] text-zinc-400">
                                        <span>{game.config.bossHp} HP</span>
                                        <span className="font-bold">{game.config.multiplier}X</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* C. CUSTOM SOVEREIGN SLOTS (10 GAMES) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl font-black tracking-tighter italic">SOVEREIGN SLOTS</h2>
                            <div className="h-px w-32 bg-zinc-800" />
                            <span className="text-zinc-600 text-[10px] uppercase font-bold">10 High-Limit Engines</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {SLOT_GAMES.map((slot) => (
                            <div 
                              key={slot.id}
                              onClick={() => { setActiveGame(slot.id); setGameType('SLOT'); }}
                              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 space-y-6 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    {slot.symbols[0]}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg group-hover:text-[#D4AF37] transition-colors">{slot.name}</h3>
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">{slot.theme}</div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
                                    <div className="text-[10px] text-zinc-500">RTP: {(slot.rtp * 100).toFixed(1)}%</div>
                                    <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-bold rounded">LIVE</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        ) : (
            <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
                {gameType === 'FISH' && selectedFish && (
                    <AztecFishGame 
                      gameId={activeGame} 
                      godName={selectedFish.god} 
                      themeColor={selectedFish.color} 
                    />
                )}
                {gameType === 'SLOT' && selectedSlot && (
                    <CustomSlotGame 
                      gameId={activeGame} 
                      symbols={selectedSlot.symbols} 
                      themeColor={selectedSlot.color} 
                    />
                )}
                {gameType === 'WOF' && (
                    <div className="flex-1 flex items-center justify-center">
                        <GShieldWOF />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* FOOTER STATS (THE JUWA KILLER) */}
      <div className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-zinc-900 p-4 flex justify-between items-center text-[8px] text-zinc-600 uppercase tracking-[0.2em] px-12 z-50">
          <div className="flex space-x-12">
              <div>System Uptime: 99.98%</div>
              <div>Connected Players: 12,450</div>
              <div>Avg Payout: 96.4%</div>
          </div>
          <div className="text-[#D4AF37] font-bold">ARCADE.SOUTHERNLIFESTYLE.ORG // THE GOLD STANDARD</div>
      </div>

    </div>
  );
}
