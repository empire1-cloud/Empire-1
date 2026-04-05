import { useEffect, useState, Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { Shield, Box, Zap, CheckCircle2, XCircle, Clock, Database, Gem, Activity } from 'lucide-react';
import { gsap } from 'gsap';

const BabylonScene = nextDynamic(() => import('@/components/BabylonScene'), { ssr: false });

/**
 * SLA113 // SOVEREIGN_FOUNDRY_STAGE
 * 
 * High-control production environment for asset auditing.
 */
export default function FoundryPage() {
    const [state, setState] = useState<any>(null);
    const [clock, setClock] = useState('--:--:--');
    const [isLoading, setIsLoading] = useState(true);

    const sync = async () => {
        try {
            const res = await fetch('/api/foundry/api/audit-state');
            if (!res.ok) throw new Error('Offline');
            const data = await res.json();
            setState(data);
            setClock(new Date().toLocaleTimeString('en-GB'));
            setIsLoading(false);
        } catch (e) {
            console.error("FOUNDRY_SYNC_ERROR:", e);
        }
    };

    const execute = async (action: 'approve' | 'reject') => {
        try {
            const endpoint = `/api/foundry/api/${action}`;
            const body = action === 'approve' ? { mode: 'production_finalize' } : { prompt: 'Render Refresh' };
            
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            
            await sync();
        } catch (e) {
            console.error(`FOUNDRY_${action.toUpperCase()}_ERROR:`, e);
        }
    };

    useEffect(() => {
        sync();
        const interval = setInterval(sync, 2000);

        // Initial entrance animation
        gsap.from(".asset-card", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out"
        });

        return () => clearInterval(interval);
    }, []);

    const triggerScreenShake = () => {
        gsap.to("main", {
            x: 5,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            onComplete: () => gsap.set("main", { x: 0 })
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
                <Shield className="w-12 h-12 text-[#c9a84c]" />
                <div className="text-[#c9a84c] font-mono text-[10px] tracking-[0.4em] uppercase">Initializing Foundry Stage...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#c9a84c] selection:text-black flex flex-col relative overflow-hidden">
            
            {/* Immersive 3D Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <Suspense fallback={null}>
                    <BabylonScene />
                </Suspense>
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
            </div>

            {/* Top Navigation HUD */}
            <nav className="relative z-50 h-16 px-12 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#c9a84c]" />
                        <span className="text-[12px] font-bold tracking-[0.4em] uppercase text-white">Sovereign Foundry</span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[9px] text-[#737373] tracking-widest uppercase font-mono">Stage: Production_Audit</span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-[#737373] font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        {clock}
                    </div>
                </div>
            </nav>

            {/* Main Asset Audit Stage */}
            <main className="relative z-10 flex-1 p-12 overflow-y-auto">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {[...(state?.module_a_assets || []), ...(state?.module_s_assets || [])].map((asset: any, i: number) => (
                        <div key={`${asset.id}-${i}`} className="asset-card group relative bg-black/40 backdrop-blur-md border border-white/5 hover:border-[#c9a84c]/30 transition-all duration-500 flex flex-col p-6 shadow-2xl">
                            {/* Visual Engine Port */}
                            <div className="w-full aspect-square bg-black/60 border border-white/5 group-hover:border-[#c9a84c]/20 transition-all relative mb-6 overflow-hidden">
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 group-hover:opacity-60 transition-opacity">
                                    <Box className="w-16 h-16 text-[#c9a84c] mb-4" />
                                    <span className="text-[9px] font-mono tracking-widest uppercase">{asset.type}_MANIFEST</span>
                                </div>
                                
                                {/* Pulse Effect for High-Value Assets */}
                                {asset.type === 'GOLD' && (
                                    <div className="absolute inset-0 border border-[#c9a84c]/20 animate-pulse"></div>
                                )}

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#c9a84c]/40"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#c9a84c]/40"></div>
                                
                                <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 border border-white/10 text-[8px] font-mono text-[#737373]">
                                    ID_{asset.id}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-light text-white text-[13px] tracking-tight truncate">{asset.file}</h3>
                                    <Zap className={`w-3 h-3 ${asset.type === 'GOLD' ? 'text-[#ffcc00]' : 'text-[#737373]'}`} />
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-[#555] text-[9px] font-mono uppercase tracking-[0.2em]">
                                        {asset.id.startsWith('A') ? 'MODULE_ALPHA' : 'MODULE_SIGMA'}
                                    </span>
                                    <span className={`text-[8px] font-bold tracking-widest uppercase ${asset.type === 'GOLD' ? 'text-[#ffcc00]' : 'text-[#737373]'}`}>
                                        {asset.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* High-Control Bottom HUD */}
            <footer className="relative z-50 h-24 bg-black/60 backdrop-blur-2xl border-t border-white/5 px-12 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex gap-16">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[9px] text-[#737373] uppercase tracking-[0.3em] font-bold">
                            <Database className="w-3 h-3" /> System_Load
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-light text-white leading-none tracking-tighter">{state?.total_units || '--'}</span>
                            <span className="text-[10px] text-[#444] font-mono">UNITS</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[9px] text-[#737373] uppercase tracking-[0.3em] font-bold">
                            <Shield className="w-3 h-3" /> Security_Hash
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-bold font-mono text-[#c9a84c] tracking-tighter">700_ENFORCED</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[9px] text-[#737373] uppercase tracking-[0.3em] font-bold">
                            <Gem className="w-3 h-3 text-[#ffcc00]" /> Vault_Credits
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-light text-[#ffcc00] leading-none tracking-tighter">{state?.gems?.toFixed(2) || '0.00'}</span>
                            <span className="text-[10px] text-[#886600] font-mono">GEMS</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            triggerScreenShake();
                            execute('reject');
                        }} 
                        className="group h-12 px-8 border border-white/10 bg-transparent text-[#737373] hover:text-white hover:border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 transition-all active:scale-95"
                    >
                        <XCircle className="w-4 h-4 text-red-900 group-hover:text-red-500 transition-colors" />
                        Flush Stage
                    </button>
                    <button 
                        onClick={() => {
                            gsap.to(".asset-card", {
                                scale: 1.05,
                                duration: 0.1,
                                yoyo: true,
                                repeat: 1,
                                ease: "power2.out"
                            });
                            execute('approve');
                        }} 
                        className="group h-12 px-10 bg-[#c9a84c] text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-[#d4b96a] transition-all border border-white/10 active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Render
                    </button>
                </div>
            </footer>
        </div>
    );
}
