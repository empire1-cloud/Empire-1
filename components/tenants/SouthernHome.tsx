'use client';

import React, { useEffect } from 'react';

/*
  SouthernHome — southernlifestyle.org
  Public Southern front adapted from the provided reference HTML.
*/

const CSS = `
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
    margin: 0; padding: 0;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--obsidian); }
  ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

  .mono { font-family: 'JetBrains Mono', monospace; }

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

  .glass-panel {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
  }

  @keyframes cinematic-pan {
    0%   { transform: scale(1) translate(0, 0); }
    50%  { transform: scale(1.10) translate(-1%, 1%); }
    100% { transform: scale(1) translate(0, 0); }
  }
  .animate-cinematic { animation: cinematic-pan 40s ease-in-out infinite; }

  .art-card { transition: border-color 0.4s ease, transform 0.4s ease; }
  .art-card:hover { border-color: rgba(212, 175, 55, 0.3); transform: translateY(-5px); }

  .btn-solid {
    background: #111; border: 1px solid #333; color: #fff;
    text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s ease;
  }
  .btn-solid:hover:not(:disabled) { background: #222; border-color: var(--gold); color: var(--gold); }
  .btn-solid:disabled { opacity: 0.5; cursor: not-allowed; }

  .input-dark {
    background: rgba(0, 0, 0, 0.8); border: 1px solid #222;
    color: #fff; transition: all 0.3s ease;
  }
  .input-dark:focus { border-color: var(--gold); outline: none; }

  .text-gold { color: var(--gold); }
  .border-gold { border-color: var(--gold); }

  /* Gallery card CSS art backgrounds — used when real images are absent */
  .bg-arcade  { background: linear-gradient(135deg,#1a0505 0%,#3d0f0f 40%,#8B1A1A 70%,#c9a84c 100%); }
  .bg-cruise  { background: linear-gradient(135deg,#050a1a 0%,#0d1f3c 40%,#1a3a6b 70%,#c9a84c 90%); }
  .bg-tribute { background: linear-gradient(135deg,#050505 0%,#1a0a0a 30%,#2d1a1a 60%,#6b3030 100%); }
  .bg-barber  { background: linear-gradient(135deg,#0d0d0a 0%,#1a1a0a 30%,#2d2d10 60%,#c9a84c 100%); }

  #story-modal {
    background: rgba(5, 5, 5, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 1000;
  }
  .typewriter-cursor::after {
    content: '|';
    animation: blink 1s step-start infinite;
    color: var(--gold);
  }
  @keyframes blink { 50% { opacity: 0; } }

  .southern-gallery-grid,
  .southern-vision-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }

  .southern-stagger {
    margin-top: 6rem;
  }

  @media (max-width: 760px) {
    .southern-gallery-grid,
    .southern-vision-grid {
      grid-template-columns: 1fr;
    }
    .southern-stagger {
      margin-top: 0;
    }
    .southern-field-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

const HTML = `
  <!-- MUSEUM STORY MODAL -->
  <div id="story-modal" class="fixed inset-0 hidden flex items-center justify-center transition-opacity duration-500 opacity-0 z-[1000]">
    <div class="absolute top-8 right-8 z-50">
      <button id="close-modal-btn" class="text-zinc-500 hover:text-white transition-colors mono text-sm uppercase tracking-widest bg-black/50 px-4 py-2 border border-[#333] rounded-full">Close [X]</button>
    </div>

    <div class="w-full h-full flex flex-col md:flex-row transform scale-95 transition-transform duration-500" id="story-modal-content">
      <div class="w-full md:w-3/5 h-1/2 md:h-full bg-black relative flex items-center justify-center p-4 md:p-12">
        <img id="modal-image" src="" class="max-w-full max-h-full object-contain shadow-2xl border border-[#222]" alt="">
      </div>

      <div class="w-full md:w-2/5 h-1/2 md:h-full p-8 md:p-16 flex flex-col justify-center overflow-y-auto border-l border-[#111]">
        <div class="mono text-gold uppercase tracking-widest text-xs font-bold mb-8 border-b border-[#222] pb-4">
          Canon File Extracted
        </div>
        <h3 id="story-title" class="text-4xl md:text-5xl font-light text-white mb-8"></h3>
        <div id="story-text" class="text-zinc-300 font-light text-lg md:text-xl leading-relaxed"></div>
      </div>
    </div>
  </div>

  <!-- NAV -->
  <nav class="w-full glass-panel" style="position:fixed;top:0;z-index:50;border-top:none;border-left:none;border-right:none;">
    <div style="max-width:80rem;margin:0 auto;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;">
      <div class="mono text-xs uppercase tracking-widest" style="color:#d4d4d8;">Southern Lyfestyle</div>
      <a href="#request" class="mono text-xs uppercase tracking-widest transition-colors" style="color:#71717a;font-size:10px;letter-spacing:0.1em;">Request A Build</a>
    </div>
  </nav>

  <!-- HERO -->
  <section style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8rem 1.5rem 4rem;position:relative;">
    <img id="hero-logo" src="/southern-logo.jpg" onerror="this.src='/brand/southern-logo.png'" alt="Southern Lyfestyle Crest"
      style="width:8rem;border-radius:9999px;margin-bottom:2rem;box-shadow:0 0 40px rgba(0,0,0,0.8);border:1px solid #27272a;position:relative;z-index:20;">
    <div class="mono text-xs uppercase" style="letter-spacing:0.4em;color:#71717a;margin-bottom:0.5rem;position:relative;z-index:20;">El Monte, California</div>
    <h1 class="chrome-script" style="margin-bottom:1rem;position:relative;z-index:20;">Southern Lyfestyle</h1>
    <div class="mono font-bold uppercase" style="color:#d4d4d8;letter-spacing:0.3em;font-size:0.875rem;margin-bottom:3rem;position:relative;z-index:20;text-shadow:0 1px 4px rgba(0,0,0,0.9);">
      Stilo&apos;s Active &amp; Attractive.
    </div>

    <!-- Hero glass panel -->
    <div class="glass-panel rounded-xl" style="max-width:56rem;width:100%;text-align:center;border-color:#222;position:relative;overflow:hidden;padding:2rem 3rem;">
      <!-- Cinematic BG -->
      <div style="position:absolute;inset:0;z-index:0;overflow:hidden;">
        <img src="/sgv_lowrider_street_scene.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" alt="Street Scene" class="animate-cinematic" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3;">
        <div class="animate-cinematic" style="display:none;position:absolute;inset:0;background:linear-gradient(135deg,#0d1a0d 0%,#1a2e10 40%,#2d4a1a 60%,#1a1a0a 100%);opacity:0.5;"></div>
      </div>
      <div style="position:absolute;inset:0;background:linear-gradient(to top,#050505,rgba(5,5,5,0.8),transparent);z-index:0;"></div>
      <div style="position:relative;z-index:10;">
        <h2 class="mono font-bold uppercase text-gold" style="letter-spacing:0.1em;font-size:0.75rem;margin-bottom:1.5rem;">Rooted &amp; Cultured</h2>
        <div style="color:#e4e4e7;font-weight:300;font-size:1.125rem;line-height:1.75;display:flex;flex-direction:column;gap:1rem;">
          <p>Southern Lyfestyle was built for us — anyone who respects the honest hustle, the culture, the struggle, and the beauty we still protect.</p>
          <p>The world&apos;s ugly now, so we give our loved ones something beautiful back — in our community, in our culture, in a digital world that still feels like home. Every build is personal. Every detail matters. We translate your real-life stories into custom digital art and playable arcades.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- NARRATIVES -->
  <section style="max-width:72rem;margin:0 auto;padding:5rem 1.5rem;display:flex;flex-direction:column;gap:4rem;">

    <div class="glass-panel rounded-xl" style="padding:2rem 3rem;border-left:2px solid #333;">
      <h2 class="chrome-heading" style="margin-bottom:0.5rem;">For Couples &amp; Day-Ones</h2>
      <div class="mono text-gold uppercase font-bold" style="font-size:0.75rem;letter-spacing:0.1em;margin-bottom:1.5rem;">Your shared history, built digital.</div>
      <p style="color:#a1a1aa;font-weight:300;line-height:1.75;font-size:1.125rem;">
        Whatever your vibe is—romantic, family, cultural, community, playful, or personal—we build a one-of-a-kind digital world that matches it. We take your history, your inside jokes, and your shared milestones and turn them into a digital legacy. Imagine pulling up a custom game that only you two understand—every level a memory, every character a shared laugh.
      </p>
    </div>

    <div class="glass-panel rounded-xl" style="padding:2rem 3rem;border-right:2px solid #333;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
      <h2 class="chrome-heading" style="margin-bottom:0.5rem;">For Kids Fighting Battles</h2>
      <div class="mono text-gold uppercase font-bold" style="font-size:0.75rem;letter-spacing:0.1em;margin-bottom:1.5rem;">Brave hearts. Stories that deserve worlds.</div>
      <p style="color:#a1a1aa;font-weight:300;line-height:1.75;font-size:1.125rem;text-align:right;max-width:56rem;">
        Some kids carry challenges that make everyday moments harder—birthdays in a hospital room, holidays in a gown, long nights where you&apos;re just trying to keep their mind off everything. Or maybe their asthma keeps them from running around with the others. A custom digital world can brighten their day. It doesn&apos;t fix everything. But it can make them feel seen. Sometimes that&apos;s everything.
      </p>
    </div>

    <div class="glass-panel rounded-xl" style="padding:2rem 3rem;border-left:2px solid #333;">
      <h2 class="chrome-heading" style="margin-bottom:0.5rem;">The Barbershops</h2>
      <div class="mono text-gold uppercase font-bold" style="font-size:0.75rem;letter-spacing:0.1em;margin-bottom:1.5rem;">Your rhythm, your hustle, your neighborhood.</div>
      <p style="color:#a1a1aa;font-weight:300;line-height:1.75;font-size:1.125rem;">
        Every barbershop has its own rhythm—the laughs, the debates, the music, the regulars, the kids spinning in the chair, the OGs holding court. Imagine turning that vibe into a custom arcade game for the shop. Your colors. Your logo. Your crew. Picture a kid waiting for their cut, playing a game on the shop TV that features your style. That&apos;s pride. That&apos;s culture.
      </p>
    </div>

    <div class="glass-panel rounded-xl" style="padding:2rem 3rem;border-right:2px solid #333;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
      <h2 class="chrome-heading" style="margin-bottom:0.5rem;">The Car Clubs</h2>
      <div class="mono text-gold uppercase font-bold" style="font-size:0.75rem;letter-spacing:0.1em;margin-bottom:1.5rem;">3-wheelin&apos; on a cool night with the familia.</div>
      <p style="color:#a1a1aa;font-weight:300;line-height:1.75;font-size:1.125rem;text-align:right;max-width:56rem;">
        That whole vibe deserves its own digital tribute. Imagine pulling up to the meet, and your little one is on the dash TV playing a custom game that features your actual car club, your colors, and your rides. The whole crew would trip out. If your club has a history, we can build the digital version of it.
      </p>
    </div>

  </section>

  <!-- GALLERY -->
  <section style="max-width:90rem;margin:0 auto;padding:6rem 1.5rem;">
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:4rem;padding-bottom:1rem;border-bottom:1px solid #222;">
      <div style="font-size:1.5rem;color:#fff;font-weight:300;text-transform:uppercase;letter-spacing:0.1em;">Our Work Exhibition</div>
    </div>

    <div class="southern-gallery-grid">

      <!-- Card 1 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="1">
        <div style="position:relative;height:450px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/impala_bounce_slot_game_art.jpg" onerror="this.src='https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'" alt="Arcade Game" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-arcade" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Arcade &amp; Slots</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Custom Arcade Games</h3>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Custom Arcade Games" data-img="/impala_bounce_slot_game_art.jpg" style="font-size:10px;opacity:0;transition:opacity 0.3s;">View Piece</button>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="art-card glass-panel rounded-xl southern-stagger" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="2">
        <div style="position:relative;height:450px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/modern_lowrider_cruise_night_scene.jpg" onerror="this.src='https://images.unsplash.com/photo-1493225457224-eda0e6fd6563?auto=format&fit=crop&q=80&w=800'" alt="Car Clubs" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-cruise" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Car Clubs</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">The Night Cruise</h3>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="The Night Cruise" data-img="/modern_lowrider_cruise_night_scene.jpg" style="font-size:10px;opacity:0;transition:opacity 0.3s;">View Piece</button>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="3">
        <div style="position:relative;height:450px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/cdcprison-love.jpg" onerror="this.src='https://images.unsplash.com/photo-1505784045224-1247b2b29cf3?auto=format&fit=crop&q=80&w=800'" alt="Tribute Builds" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-tribute" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Paño Arte</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Tribute Builds</h3>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Tribute Builds" data-img="/cdcprison-love.jpg" style="font-size:10px;opacity:0;transition:opacity 0.3s;">View Piece</button>
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="art-card glass-panel rounded-xl southern-stagger" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="4">
        <div style="position:relative;height:450px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/klingerman_karts_neighborhood_race.jpg" onerror="this.src='https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=800'" alt="Neighborhoods" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-barber" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Community</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Neighborhood Circuits</h3>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Neighborhood Circuits" data-img="/klingerman_karts_neighborhood_race.jpg" style="font-size:10px;opacity:0;transition:opacity 0.3s;">View Piece</button>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- GALLERY: hover show story-btn -->
  <style>
    [data-card]:hover .story-btn { opacity: 1 !important; }
    [data-card]:hover .gallery-img { transform: scale(1.05); }
  </style>

  <!-- REQUEST / VISION BOARD GENERATOR -->
  <section id="request" style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem;display:flex;flex-wrap:wrap;gap:3rem;">

    <div class="glass-panel rounded-xl" style="padding:2rem;flex:0 0 320px;border:1px solid #222;height:fit-content;">
      <h4 class="mono text-white uppercase tracking-widest" style="font-size:0.75rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #333;">Build Pricing</h4>
      <ul style="display:flex;flex-direction:column;gap:1.5rem;font-size:0.875rem;text-transform:uppercase;color:#a1a1aa;margin:0;">
        <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Personal</span><span style="color:#fff;">$250</span></li>
        <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Community</span><span style="color:#fff;">$500</span></li>
        <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;color:var(--gold);"><span>Full World</span><span>$750</span></li>
        <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Premium</span><span style="color:#fff;">$1,000</span></li>
      </ul>
    </div>

    <div class="glass-panel rounded-xl" style="flex:1 1 0%;min-width:320px;padding:1px;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:#050505;border-radius:0.75rem;padding:2rem 3rem;position:relative;height:100%;">
        <div style="margin-bottom:2.5rem;">
          <h2 style="font-size:1.5rem;font-weight:300;color:#fff;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">Request a Build</h2>
          <p style="font-size:0.875rem;color:#71717a;">Pick your category and tell us your story. We&apos;ll generate a custom concept pitch and AI sketch for you.</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:1.5rem;position:relative;z-index:10;">
          <div>
            <label class="mono" style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.5rem;">Category</label>
            <select id="userLane" class="input-dark" style="width:100%;padding:1rem;font-size:0.875rem;border-radius:0.25rem;outline:none;appearance:none;">
              <option value="" disabled selected>Select a Category...</option>
              <option value="Car Club">Car Club (Plaques &amp; Rides)</option>
              <option value="Barbershop">Barbershop (Shop Arcades)</option>
              <option value="Couple">Couples (Shared History)</option>
              <option value="Family">Family (Roots &amp; Legacy)</option>
              <option value="Kids">Kids (Hospital Warriors)</option>
              <option value="Tribute">Tribute (Memorials &amp; Paño)</option>
            </select>
          </div>

          <div>
            <label class="mono" style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.5rem;">Your Story</label>
            <textarea id="userStory" rows="5" class="input-dark" style="width:100%;padding:1rem;font-size:0.875rem;border-radius:0.25rem;outline:none;resize:none;" placeholder="Tell us the history, the memories, or what you want to see built..."></textarea>
          </div>

          <button id="draftBtn" class="btn-solid rounded" style="width:100%;padding:1.25rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:0.75rem;">
            Generate Vision Board
          </button>
        </div>

        <div id="draftResult" style="margin-top:3rem;display:none;border-top:1px solid #222;padding-top:2.5rem;">
          <div class="mono text-gold" style="font-size:10px;margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:0.1em;display:flex;align-items:center;gap:0.75rem;">
            <div id="gen-loader" class="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            <span id="gen-status">Analyzing story...</span>
          </div>

          <div class="southern-vision-grid">
            <div style="background:#000;border:1px solid #222;border-radius:0.25rem;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:250px;">
              <img id="concept-img" src="" alt="Generated Southern Lyfestyle concept" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s;">
            </div>
            <div id="output-text-area" style="color:#d4d4d8;font-weight:300;line-height:1.75;font-size:0.875rem;"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="margin-top:3rem;padding:3rem;text-align:center;border-top:1px solid #111;">
    <div class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#52525b;">
      Southern Lyfestyle // El Monte, CA // &copy; 2026
    </div>
  </footer>
`;

/* ── SVG LOGO — Southern Lyfestyle medallion ── */
const SouthernLogo = ({ size = 240 }: { size?: number }) => (
  <svg
    viewBox="0 0 300 300"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="logo-svg"
  >
    <defs>
      <radialGradient id="sl-bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#2a1505" />
        <stop offset="100%" stopColor="#0a0805" />
      </radialGradient>
      <linearGradient id="sl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
      <linearGradient id="sl-gold2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="40%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#7a5a0a" />
      </linearGradient>
      <linearGradient id="sl-rose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4060" />
        <stop offset="100%" stopColor="#8B1A1A" />
      </linearGradient>
      <linearGradient id="sl-amber" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#cc5500" stopOpacity="0" />
      </linearGradient>
      <filter id="sl-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="sl-rose-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <path id="top-arc" d="M 40,150 A 110,110 0 0,1 260,150" />
      <path id="bot-arc" d="M 55,170 A 110,110 0 0,0 245,170" />
    </defs>

    {/* Glow burst behind */}
    <circle cx="150" cy="150" r="95" fill="url(#sl-amber)" />

    {/* Main medallion disc */}
    <circle cx="150" cy="150" r="130" fill="url(#sl-bg)" />

    {/* Outer decorative ring */}
    <circle cx="150" cy="150" r="130" stroke="url(#sl-gold)" strokeWidth="10" fill="none" />
    <circle cx="150" cy="150" r="122" stroke="rgba(212,175,55,.2)" strokeWidth="1" fill="none" />
    <circle cx="150" cy="150" r="118" stroke="rgba(212,175,55,.12)" strokeWidth="1" fill="none" />

    {/* Greek-key tick marks around ring */}
    {Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 10 - 90) * (Math.PI / 180);
      const r1 = 118; const r2 = 123;
      return (
        <line
          key={i}
          x1={150 + r1 * Math.cos(angle)} y1={150 + r1 * Math.sin(angle)}
          x2={150 + r2 * Math.cos(angle)} y2={150 + r2 * Math.sin(angle)}
          stroke="rgba(212,175,55,.5)" strokeWidth={i % 3 === 0 ? 2 : 1}
        />
      );
    })}

    {/* Circular text — top: SOUTHERN LYFESTYLE */}
    <text fontFamily="'Inter', sans-serif" fontSize="11" fontWeight="700" letterSpacing="3" fill="url(#sl-gold)" textAnchor="middle">
      <textPath href="#top-arc" startOffset="50%">SOUTHERN  LYFESTYLE</textPath>
    </text>

    {/* Circular text — bottom: EL MONTE · SGV · SINCE DAY ONE */}
    <text fontFamily="'Inter', sans-serif" fontSize="9" fontWeight="600" letterSpacing="2.5" fill="rgba(212,175,55,.7)" textAnchor="middle">
      <textPath href="#bot-arc" startOffset="50%">EL MONTE  ·  SGV  ·  SINCE DAY ONE</textPath>
    </text>

    {/* Ornate S — filigree body */}
    <g transform="translate(150,152)" filter="url(#sl-glow)">
      {/* S outer path */}
      <path
        d="M 18,-44 C 42,-44 52,-28 52,-14 C 52,2 40,14 18,20 C -8,28 -22,36 -22,54 C -22,70 -10,82 18,82 C 38,82 50,74 50,62"
        stroke="url(#sl-gold2)" strokeWidth="14" fill="none" strokeLinecap="round"
      />
      <path
        d="M 18,-44 C 42,-44 52,-28 52,-14 C 52,2 40,14 18,20 C -8,28 -22,36 -22,54 C -22,70 -10,82 18,82 C 38,82 50,74 50,62"
        stroke="url(#sl-gold2)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6"
      />
      {/* Filigree swirls */}
      <path d="M 30,-30 C 44,-20 46,-8 36,0" stroke="rgba(255,215,0,.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M -8,38 C -20,46 -20,56 -8,60" stroke="rgba(255,215,0,.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="-14" r="4" fill="var(--gold)" opacity="0.7" />
      <circle cx="-22" cy="54" r="4" fill="var(--gold)" opacity="0.7" />
    </g>

    {/* Rose 1 — left center */}
    <g transform="translate(82,158)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="14" fill="url(#sl-rose)" opacity="0.9" />
      <circle cx="0" cy="0" r="9" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="5" fill="#FF4060" opacity="0.6" />
      <path d="M -12,-6 C -8,-14 8,-14 12,-6" stroke="#2d6b1f" strokeWidth="2" fill="none" />
      <path d="M -6,10 L -6,26 C -6,28 -4,28 -2,26" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>

    {/* Rose 2 — right high */}
    <g transform="translate(214,118)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="16" fill="url(#sl-rose)" opacity="0.85" />
      <circle cx="0" cy="0" r="10" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="5" fill="#FF4060" opacity="0.6" />
      <path d="M -8,10 L -4,24 C -2,28 2,26 2,22" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>

    {/* Rose 3 — bottom center */}
    <g transform="translate(148,212)" filter="url(#sl-rose-glow)">
      <circle cx="0" cy="0" r="12" fill="url(#sl-rose)" opacity="0.9" />
      <circle cx="0" cy="0" r="7" fill="#DC143C" opacity="0.8" />
      <circle cx="0" cy="0" r="3.5" fill="#FF4060" opacity="0.6" />
    </g>

    {/* Vine tendrils */}
    <path d="M 96,162 C 120,140 140,130 148,100" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 198,122 C 185,142 172,158 162,180" stroke="#2d6b1f" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 152,212 C 148,195 145,178 148,160" stroke="#2d6b1f" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />

    {/* Gold sparkles */}
    {[
      [105, 95], [195, 85], [228, 175], [78, 185], [165, 76], [120, 230],
    ].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        <line x1="-4" y1="0" x2="4" y2="0" stroke="var(--gold)" strokeWidth="1" opacity="0.7" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--gold)" strokeWidth="1" opacity="0.7" />
        <circle cx="0" cy="0" r="1.5" fill="var(--gold-bright)" opacity="0.9" />
      </g>
    ))}

    {/* Small daisy flowers */}
    {[[88,112],[210,200]].map(([cx,cy],i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        {[0,45,90,135,180,225,270,315].map((a, j) => (
          <ellipse key={j} cx={5*Math.cos(a*Math.PI/180)} cy={5*Math.sin(a*Math.PI/180)} rx="3" ry="1.5" fill="white" opacity="0.7" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="3" fill="var(--gold)" opacity="0.9" />
      </g>
    ))}
  </svg>
);

/* ── MINI NAV MARK ── */
const NavMark = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="17" stroke="url(#nm-sl-gold)" strokeWidth="1.5" />
    <g transform="translate(20,22)">
      <path d="M 6,-12 C 12,-12 14,-7 14,-4 C 14,0 10,3 5,5 C -2,7 -6,9 -6,14 C -6,18 -2,21 6,21 C 10,21 13,19 13,17"
        stroke="#D4AF37" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
    <defs>
      <linearGradient id="nm-sl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#8B6914" stopOpacity="0.5" />
      </linearGradient>
    </defs>
  </svg>
);

export default function SouthernHome() {
  useEffect(() => {
    // Load fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Inter:wght@200;300;400;600&family=JetBrains+Mono:wght@300;500;700&display=swap';
    document.head.appendChild(link);

    // Gemini endpoint (key from env — set NEXT_PUBLIC_GEMINI_API_KEY)
    const apiKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEMINI_API_KEY) || '';
    const geminiEndpoint = apiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`
      : '';
    const imageEndpoint = apiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`
      : '';

    // ── STORY MODAL ──────────────────────────────────────────────
    const modal        = document.getElementById('story-modal');
    const modalContent = document.getElementById('story-modal-content');
    const storyTitle   = document.getElementById('story-title');
    const storyText    = document.getElementById('story-text');
    const modalImage   = document.getElementById('modal-image') as HTMLImageElement | null;
    const closeBtn     = document.getElementById('close-modal-btn');

    function openModal() {
      if (!modal) return;
      modal.style.display = 'flex';
      requestAnimationFrame(() => {
        modal.classList.add('opacity-100');
        modalContent?.classList.add('scale-100');
      });
    }
    function closeModal() {
      if (!modal) return;
      modal.classList.remove('opacity-100');
      modalContent?.classList.remove('scale-100');
      setTimeout(() => { if (modal) modal.style.display = 'none'; }, 500);
    }

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    const storyFallbacks: Record<string, string> = {
      'Custom Arcade Games': 'We build fully playable arcade games branded to your world — your colors, your logo, your crew. The kind of thing that makes everyone in the shop stop and say that\'s us.',
      'The Night Cruise': 'Your car club, your colors, your rides — digitized into a custom cruise-night experience. Pull up to the meet and your little one is already playing it on the dash TV.',
      'Tribute Builds': 'Respectful, permanent digital tributes — paño-style art, memorial worlds, interactive celebrations of lives fully lived. Your loved one\'s story, preserved forever.',
      'Neighborhood Circuits': 'Your neighborhood, your community pulse — digitized with safe, fun energy. The kind of game the whole block wants to play.',
    };

    document.querySelectorAll<HTMLElement>('.story-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const title = (e.currentTarget as HTMLElement).getAttribute('data-title') || '';
        const imgSrc = (e.currentTarget as HTMLElement).getAttribute('data-img') || '';
        if (storyTitle) storyTitle.innerText = title;
        if (storyText) storyText.innerHTML = "<span class='typewriter-cursor' style='color:#71717a;'>Retrieving history</span>";
        if (modalImage) {
          modalImage.src = imgSrc;
          modalImage.alt = title;
          modalImage.onerror = () => { modalImage.src = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200'; };
        }
        openModal();

        if (!geminiEndpoint) {
          if (storyText) storyText.innerHTML = storyFallbacks[title] || 'A piece built with heart, for the culture.';
          return;
        }

        const prompt = `Write a heartfelt, 3-sentence description for a piece of custom Southern Lyfestyle digital art called "${title}". Tone: Grounded, respectful, family, culture, SGV/El Monte roots. No sci-fi or tech jargon.`;
        try {
          const res  = await fetch(geminiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
          const data = await res.json();
          if (storyText) storyText.innerHTML = data.candidates?.[0]?.content?.parts?.[0]?.text || storyFallbacks[title] || '';
        } catch {
          if (storyText) storyText.innerHTML = storyFallbacks[title] || 'Unable to load story.';
        }
      });
    });

    // ── DRAFT GENERATOR ───────────────────────────────────────────
    const draftBtn    = document.getElementById('draftBtn') as HTMLButtonElement | null;
    const draftResult = document.getElementById('draftResult');
    const outputArea  = document.getElementById('output-text-area');
    const imgEl       = document.getElementById('concept-img') as HTMLImageElement | null;
    const statusEl    = document.getElementById('gen-status');
    const loaderEl    = document.getElementById('gen-loader');

    const draftFallbacks: Record<string, string> = {
      'Car Club': '<strong>Your Club, Your Digital Legacy.</strong><br><br>We\'d build a custom lowrider arcade tribute to your car club — your colors, your rides, your logo on every screen. Think classic cruise-night vibes, with your actual cars as the playable characters.<br><br>The kind of thing that makes the whole crew stop and say "that\'s us."',
      'Barbershop': '<strong>Your Shop, Your World.</strong><br><br>We\'ll build a shop arcade game themed to your exact barbershop — your name, your logo, your crew\'s style. Picture a kid waiting for their cut, playing a game on the shop TV that\'s built around your world.<br><br>That\'s pride in digital form.',
      'Couple': '<strong>Your Story, Built to Play.</strong><br><br>We\'d turn your story into a custom digital world — your first date spot, your inside jokes, your shared history as levels in a game only you two truly understand.<br><br>A permanent record of your love, built to play forever.',
      'Family': '<strong>Your Roots, Preserved.</strong><br><br>We build a custom family world — your roots, your people, your history. Whether it\'s a neighborhood map, a family arcade, or a tribute to the ancestors, we translate your real legacy into something you can share with the next generation.',
      'Kids': '<strong>Their World, Their Rules.</strong><br><br>We\'d build a custom game world designed around your little one — their favorite colors, their heroes, their world. A place they can visit on the hardest days and feel like the main character.<br><br>Because they are.',
      'Tribute': '<strong>Their Memory, Honored.</strong><br><br>We build respectful, permanent digital tributes — paño-style art, memorial worlds, interactive celebrations of lives fully lived. Your loved one\'s story, preserved in a form that the whole family can carry forward.',
    };

    draftBtn?.addEventListener('click', async () => {
      const laneEl = document.getElementById('userLane') as HTMLSelectElement | null;
      const storyEl = document.getElementById('userStory') as HTMLTextAreaElement | null;
      const lane  = laneEl?.value || '';
      const story = storyEl?.value?.trim() || '';

      if (!lane || !story) {
        window.alert('Please select a category and tell us your story.');
        return;
      }

      if (draftBtn) { draftBtn.disabled = true; draftBtn.innerText = 'Drafting Concept... ⏳'; }
      if (draftResult) draftResult.style.display = 'block';
      if (imgEl) {
        imgEl.style.opacity = '0';
        imgEl.removeAttribute('src');
      }
      if (loaderEl) loaderEl.classList.remove('hidden');
      if (statusEl) statusEl.innerText = 'Writing concept pitch...';
      if (outputArea)  outputArea.innerHTML = "<span style='color:#71717a;'>Thinking...</span>";

      if (!geminiEndpoint) {
        if (outputArea) outputArea.innerHTML = draftFallbacks[lane] || 'Tell us more and we\'ll draft a concept for you.';
        if (imgEl) {
          imgEl.src = '/modern_lowrider_cruise_night_scene.jpg';
          imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'; };
          imgEl.onload = () => { imgEl.style.opacity = '1'; };
        }
        if (statusEl) statusEl.innerText = 'Vision Board Complete';
        if (loaderEl) loaderEl.classList.add('hidden');
      } else {
        const prompt = `You are a creative director for Southern Lyfestyle (representing SGV, El Monte, Chicano culture, family, respect).
Category: ${lane}
Client Story: ${story}

Write a 2-paragraph concept pitch for a custom digital art piece or game based on their story.
Tone: Warm, respectful, authentic, down-to-earth. Do NOT use tech jargon.
Format using simple HTML (<br>, <strong>). Do not use markdown blocks.`;

        try {
          const res  = await fetch(geminiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || draftFallbacks[lane] || 'Failed to generate concept.';
          if (outputArea) outputArea.innerHTML = text.replace(/```html/g, '').replace(/```/g, '');

          if (imageEndpoint && imgEl) {
            if (statusEl) statusEl.innerText = 'Sketching visual concept...';
            const imgPrompt = `A high-end, highly detailed concept art sketch for a ${lane} digital art piece. Theme: ${story}. Style: Beautiful Chicano art, SGV lowrider culture, dark obsidian background, gold and chrome accents, respectful, hyper-realistic masterpiece.`;
            const imgRes = await fetch(imageEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ instances: [{ prompt: imgPrompt }], parameters: { sampleCount: 1 } }),
            });
            const imgData = await imgRes.json();
            const b64 = imgData.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
              imgEl.src = `data:image/png;base64,${b64}`;
              imgEl.onload = () => { imgEl.style.opacity = '1'; };
            }
          }

          if (statusEl) statusEl.innerText = 'Vision Board Complete';
          if (loaderEl) loaderEl.classList.add('hidden');
        } catch {
          if (outputArea) outputArea.innerHTML = draftFallbacks[lane] || "<span style='color:#ef4444;'>Network error. Please try again.</span>";
          if (statusEl) statusEl.innerText = 'Network Error. Please try again.';
          if (loaderEl) loaderEl.classList.add('hidden');
        }
      }

      if (draftBtn) { draftBtn.disabled = false; draftBtn.innerText = 'Generate Vision Board'; }
    });

    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
