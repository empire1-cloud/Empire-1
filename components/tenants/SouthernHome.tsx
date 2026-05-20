'use client';

import React, { useEffect } from 'react';

const LANDING_STYLES = `
        :root {
            --obsidian: #050505;
            --gold: #D4AF37;
            --chrome: #E2E2E2;
            --glass-bg: rgba(10, 10, 10, 0.85);
            --glass-border: rgba(255, 255, 255, 0.08);
        }

        body, html {
            background-color: var(--obsidian);
            color: var(--chrome);
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            scroll-behavior: smooth;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--obsidian); }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

        .mono { font-family: 'JetBrains Mono', monospace; }

        /* Liquid Chrome Script */
        .chrome-script {
            font-family: 'Chicano', 'Alex Brush', cursive;
            font-size: 5.5rem;
            line-height: 1.1;
            background: linear-gradient(180deg, #ffffff 0%, #a0a0a0 40%, #555555 50%, #d0d0d0 55%, #ffffff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.9));
            transform: rotate(-2deg);
            display: inline-block;
            padding: 10px 20px;
        }
        
        /* Secondary Chrome Script for Headings */
        .chrome-heading {
            font-family: 'Chicano', 'Alex Brush', cursive;
            font-size: 3.5rem;
            line-height: 1.2;
            background: linear-gradient(180deg, #ffffff 0%, #a0a0a0 40%, #555555 50%, #d0d0d0 55%, #ffffff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.8);
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.9));
        }

        @media (min-width: 768px) {
            .chrome-script { font-size: 9rem; -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.8); }
            .chrome-heading { font-size: 5rem; }
        }

        /* Clean Glassmorphism - No Neon */
        .glass-panel {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        }

        /* Cinematic Image Pan Engine */
        @keyframes cinematic-pan {
            0% { transform: scale(1) translate(0, 0); }
            50% { transform: scale(1.10) translate(-1%, 1%); }
            100% { transform: scale(1) translate(0, 0); }
        }
        .animate-cinematic {
            animation: cinematic-pan 40s ease-in-out infinite;
        }

        /* Subtle Hover on Cards */
        .art-card {
            transition: border-color 0.4s ease, transform 0.4s ease;
        }
        .art-card:hover {
            border-color: rgba(212, 175, 55, 0.3); /* Subtle Gold */
            transform: translateY(-5px);
        }

        .btn-solid {
            background: #111;
            border: 1px solid #333;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            transition: all 0.3s ease;
        }
        .btn-solid:hover {
            background: #222;
            border-color: var(--gold);
            color: var(--gold);
        }

        .input-dark {
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #222;
            color: #fff;
            transition: all 0.3s ease;
        }
        .input-dark:focus {
            border-color: var(--gold);
            outline: none;
        }
        
        /* Modal Overlay */
        #story-modal {
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 1000;
        }
    `;

const LANDING_HTML = `

    <!-- STORY MODAL -->
    <div id="story-modal" class="fixed inset-0 hidden flex items-center justify-center px-6 transition-opacity duration-300 opacity-0 z-[1000]">
        <div class="glass-panel p-8 md:p-12 rounded-lg max-w-2xl w-full border-[#333] shadow-2xl relative overflow-hidden transform scale-95 transition-transform duration-300" id="story-modal-content">
            <div class="flex justify-between items-start mb-6 border-b border-[#222] pb-4">
                <div class="mono text-zinc-400 uppercase tracking-widest text-xs font-bold">
                    The Story
                </div>
                <button id="close-modal-btn" class="text-zinc-500 hover:text-white transition-colors mono text-xs uppercase tracking-widest">Close [X]</button>
            </div>
            <h3 id="story-title" class="text-3xl font-light text-white mb-4"></h3>
            <div id="story-text" class="text-zinc-300 font-light text-lg leading-relaxed min-h-[100px] flex items-center">
                <!-- Story injected here -->
            </div>
        </div>
    </div>

    <!-- TOP NAV -->
    <nav class="w-full fixed top-0 z-50 glass-panel border-t-0 border-l-0 border-r-0">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div class="mono text-xs tracking-widest text-zinc-300 uppercase">
                Southern Lyfestyle
            </div>
            <a href="#request" class="mono text-[10px] tracking-widest text-zinc-500 hover:text-gold transition-colors uppercase">Request A Build</a>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-32 pb-16 relative">
        <img src="southern-logo.jpg" onerror="this.style.display='none'" alt="Southern Lyfestyle Crest" class="w-32 md:w-48 rounded-full mb-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-zinc-800 relative z-20">
        
        <div class="mono text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2 relative z-20">El Monte, California</div>
        
        <h1 class="chrome-script mb-4 relative z-20">Southern Lyfestyle</h1>
        
        <div class="mono text-zinc-300 uppercase tracking-[0.3em] font-bold text-sm md:text-base mb-12 drop-shadow-md relative z-20">
            Stilo’s Active & Attractive.
        </div>
        
        <!-- HERO ART PANEL -->
        <div class="glass-panel p-8 md:p-12 rounded-xl max-w-4xl text-center border-[#222] relative overflow-hidden group">
            
            <!-- Cinematic Background -->
            <div class="absolute inset-0 z-0 overflow-hidden">
                <img src="sgv_lowrider_street_scene.jpg" onerror="this.style.display='none'" alt="Lowrider Street Scene" class="w-full h-full object-cover opacity-30 animate-cinematic transition-all duration-1000 group-hover:opacity-40">
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-0"></div>
            
            <!-- Panel Content -->
            <div class="relative z-10">
                <h2 class="mono text-gold uppercase tracking-widest text-xs mb-6 font-bold">Rooted & Cultured</h2>
                <div class="text-zinc-200 font-light text-lg md:text-xl leading-relaxed space-y-4">
                    <p>
                        Southern Lyfestyle was built for us — anyone who respects the honest hustle, the culture, the struggle, and the beauty we still protect.
                    </p>
                    <p>
                        The world’s ugly now, so we give our loved ones something beautiful back — in our community, in our culture, in a digital world that still feels like home. Every build is personal. Every detail matters. We translate your real-life stories into custom digital art and playable arcades.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- NARRATIVES (THE WHY) -->
    <section class="max-w-6xl mx-auto px-6 py-20 space-y-16">
        
        <!-- Couples -->
        <div class="glass-panel p-8 md:p-12 rounded-xl border-l-2 border-l-[#333]">
            <h2 class="chrome-heading mb-2">For Couples & Day-Ones</h2>
            <div class="mono text-xs text-gold uppercase tracking-widest mb-6">Your shared history, built digital.</div>
            <p class="text-zinc-400 font-light leading-relaxed text-lg">
                Whatever your vibe is—romantic, family, cultural, community, playful, or personal—we build a one-of-a-kind digital world that matches it. We take your history, your inside jokes, and your shared milestones and turn them into a digital legacy. Imagine pulling up a custom game that only you two understand—every level a memory, every character a shared laugh.
            </p>
        </div>

        <!-- Kids -->
        <div class="glass-panel p-8 md:p-12 rounded-xl border-r-2 border-r-[#333] text-right flex flex-col items-end">
            <h2 class="chrome-heading mb-2">For Kids Fighting Battles</h2>
            <div class="mono text-xs text-gold uppercase tracking-widest mb-6">Brave hearts. Stories that deserve worlds.</div>
            <p class="text-zinc-400 font-light leading-relaxed text-lg text-right max-w-4xl">
                Some kids carry challenges that make everyday moments harder—birthdays in a hospital room, holidays in a gown, long nights where you’re just trying to keep their mind off everything. Or maybe their asthma keeps them from running around with the others. A custom digital world can brighten their day. It doesn’t fix everything. But it can make them feel seen. Sometimes that’s everything.
            </p>
        </div>

        <!-- Barbershops -->
        <div class="glass-panel p-8 md:p-12 rounded-xl border-l-2 border-l-[#333]">
            <h2 class="chrome-heading mb-2">The Barbershops</h2>
            <div class="mono text-xs text-gold uppercase tracking-widest mb-6">Your rhythm, your hustle, your neighborhood.</div>
            <p class="text-zinc-400 font-light leading-relaxed text-lg">
                Every barbershop has its own rhythm—the laughs, the debates, the music, the regulars, the kids spinning in the chair, the OGs holding court. Imagine turning that vibe into a custom arcade game for the shop. Your colors. Your logo. Your crew. Picture a kid waiting for their cut, playing a game on the shop TV that features your style. That’s pride. That’s culture.
            </p>
        </div>

        <!-- Car Clubs -->
        <div class="glass-panel p-8 md:p-12 rounded-xl border-r-2 border-r-[#333] text-right flex flex-col items-end">
            <h2 class="chrome-heading mb-2">The Car Clubs</h2>
            <div class="mono text-xs text-gold uppercase tracking-widest mb-6">3-wheelin’ on a cool night with the familia.</div>
            <p class="text-zinc-400 font-light leading-relaxed text-lg text-right max-w-4xl">
                That whole vibe deserves its own digital tribute. Imagine pulling up to the meet, and your little one is on the dash TV playing a custom game that features your actual car club, your colors, and your rides. The whole crew would trip out. If your club has a history, we can build the digital version of it.
            </p>
        </div>

    </section>

    <!-- THE GALLERY -->
    <section class="max-w-7xl mx-auto px-6 py-24">
        <div class="flex items-center gap-4 mb-16 border-b border-[#222] pb-4">
            <div class="text-2xl text-white font-light uppercase tracking-widest">Our Work</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            <!-- Piece 1 -->
            <div class="art-card glass-panel rounded-xl p-4 overflow-hidden group border border-[#222]">
                <div class="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                    <img src="impala_bounce_slot_game_art.jpg" onerror="this.style.display='none'" alt="Arcade Game" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                        <div>
                            <div class="mono text-[10px] text-zinc-400 mb-2 tracking-widest uppercase">Arcade & Slots</div>
                            <h3 class="text-3xl font-light text-white mb-2">Custom Arcade Games</h3>
                            <p class="text-sm text-zinc-300 font-light">Fully playable software branded to your exact style.</p>
                        </div>
                        <button class="story-btn btn-solid px-4 py-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-title="Custom Arcade Games">Read Story</button>
                    </div>
                </div>
            </div>

            <!-- Piece 2 -->
            <div class="art-card glass-panel rounded-xl p-4 overflow-hidden group border border-[#222]">
                <div class="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                    <img src="modern_lowrider_cruise_night_scene.jpg" onerror="this.style.display='none'" alt="Car Clubs" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                        <div>
                            <div class="mono text-[10px] text-zinc-400 mb-2 tracking-widest uppercase">Car Clubs</div>
                            <h3 class="text-3xl font-light text-white mb-2">The Night Cruise</h3>
                            <p class="text-sm text-zinc-300 font-light">Your exact familia colors and rides on a digital blvd.</p>
                        </div>
                        <button class="story-btn btn-solid px-4 py-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-title="The Night Cruise">Read Story</button>
                    </div>
                </div>
            </div>

            <!-- Piece 3 -->
            <div class="art-card glass-panel rounded-xl p-4 overflow-hidden group border border-[#222]">
                <div class="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                    <img src="cdcprison-love.jpg" onerror="this.style.display='none'" alt="Tribute Builds" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                        <div>
                            <div class="mono text-[10px] text-zinc-400 mb-2 tracking-widest uppercase">Paño Arte</div>
                            <h3 class="text-3xl font-light text-white mb-2">Tribute Builds</h3>
                            <p class="text-sm text-zinc-300 font-light">Your history translated into interactive art. Respectful and permanent.</p>
                        </div>
                        <button class="story-btn btn-solid px-4 py-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-title="Tribute Builds">Read Story</button>
                    </div>
                </div>
            </div>

            <!-- Piece 4 -->
            <div class="art-card glass-panel rounded-xl p-4 overflow-hidden group border border-[#222]">
                <div class="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                    <img src="klingerman_karts_neighborhood_race.jpg" onerror="this.style.display='none'" alt="Neighborhoods" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                        <div>
                            <div class="mono text-[10px] text-zinc-400 mb-2 tracking-widest uppercase">Community</div>
                            <h3 class="text-3xl font-light text-white mb-2">Neighborhood Circuits</h3>
                            <p class="text-sm text-zinc-300 font-light">Digitizing the pulse of the community with safe, fun energy.</p>
                        </div>
                        <button class="story-btn btn-solid px-4 py-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-title="Neighborhood Circuits">Read Story</button>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- REQUEST / PRICING FORM -->
    <section id="request" class="max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row gap-12">
        
        <!-- Pricing Ledger -->
        <div class="w-full lg:w-1/3 glass-panel p-8 rounded-xl h-fit border border-[#222]">
            <h4 class="mono text-xs text-white uppercase tracking-widest mb-8 border-b border-[#333] pb-4">Build Pricing</h4>
            <ul class="space-y-6 text-sm uppercase text-zinc-400 mb-10">
                <li class="flex justify-between border-b border-[#222] pb-2">
                    <span>Personal</span><span class="text-white">$250</span>
                </li>
                <li class="flex justify-between border-b border-[#222] pb-2">
                    <span>Community</span><span class="text-white">$500</span>
                </li>
                <li class="flex justify-between border-b border-[#222] pb-2 text-gold">
                    <span>Full World</span><span>$750</span>
                </li>
                <li class="flex justify-between border-b border-[#222] pb-2">
                    <span>Premium</span><span class="text-white">$1,000</span>
                </li>
            </ul>

            <h4 class="mono text-xs text-white uppercase tracking-widest mb-6 border-b border-[#333] pb-4">Add-ons</h4>
            <div class="grid grid-cols-1 gap-4 text-xs text-zinc-500 uppercase">
                <div class="flex justify-between"><span>Extra Character</span><span>$50</span></div>
                <div class="flex justify-between"><span>Extra Art</span><span>$100</span></div>
                <div class="flex justify-between"><span>Intro Video</span><span>$150</span></div>
            </div>
        </div>

        <!-- Request Form -->
        <div class="w-full lg:w-2/3 glass-panel p-1 rounded-xl">
            <div class="bg-[#050505] rounded-lg p-8 md:p-12 relative h-full">
                
                <div class="mb-10">
                    <h2 class="text-2xl md:text-3xl font-light text-white uppercase tracking-widest mb-2">Request a Build</h2>
                    <p class="text-sm text-zinc-500">Pick your category. Tell us your story. We’ll draft a free concept for you.</p>
                </div>

                <div class="space-y-6 relative z-10">
                    <div>
                        <label class="mono text-[10px] text-zinc-400 uppercase tracking-widest mb-2 block">Category</label>
                        <select id="userLane" class="w-full p-4 input-dark text-sm rounded outline-none appearance-none">
                            <option value="" disabled selected>Select a Category...</option>
                            <option value="Car Club">Car Club (Plaques & Rides)</option>
                            <option value="Barbershop">Barbershop (Shop Arcades)</option>
                            <option value="Couple">Couples (Shared History)</option>
                            <option value="Family">Family (Roots & Legacy)</option>
                            <option value="Kids">Kids (Hospital Warriors)</option>
                            <option value="Tribute">Tribute (Memorials & Paño)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="mono text-[10px] text-zinc-400 uppercase tracking-widest mb-2 block">Your Story</label>
                        <textarea id="userStory" rows="5" placeholder="Tell us the history, the memories, or what you want to see built..." class="w-full p-4 input-dark text-sm rounded outline-none resize-none"></textarea>
                    </div>
                    
                    <button id="draftBtn" class="w-full p-5 btn-solid rounded text-white font-bold tracking-widest uppercase text-xs mt-4">
                        Generate Draft Concept
                    </button>
                </div>

                <!-- AI Output -->
                <div id="draftResult" class="mt-8 hidden border-t border-[#222] pt-8">
                    <div class="mono text-[10px] text-zinc-500 mb-4 uppercase">Draft Response</div>
                    <div class="p-6 bg-[#0a0a0a] border border-[#222] text-zinc-300 font-light leading-relaxed text-sm rounded" id="output-text-area"></div>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="mt-12 py-12 text-center border-t border-[#111]">
        <div class="mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            Southern Lyfestyle // El Monte, CA // © 2026
        </div>
    </footer>

    <!-- LOGIC -->
    
`;

export default function SouthernHome() {
  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Alex+Brush&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </>
  );
}
