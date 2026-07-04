'use client';

import React, { useEffect } from 'react';

/*
  SouthernHome — southernlifestyle.org
  Visual design matches the reference HTML exactly:
    - Obsidian #050505 background
    - Liquid Chrome Script (Alex Brush + gradient)
    - Glassmorphism panels
    - Gold #D4AF37 accents
    - Cinematic pan animation
    - Story modal (Gemini API)
    - Draft generator (Gemini API)
    - CRM lead capture on form submit
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
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

  .mono { font-family: 'JetBrains Mono', monospace; }

  .chrome-script {
    font-family: 'Alex Brush', cursive;
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
    font-family: 'Alex Brush', cursive;
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
  .btn-solid:hover { background: #222; border-color: var(--gold); color: var(--gold); }

  .input-dark {
    background: rgba(0, 0, 0, 0.8); border: 1px solid #222;
    color: #fff; transition: all 0.3s ease;
  }
  .input-dark:focus { border-color: var(--gold); outline: none; }

  .text-gold { color: var(--gold); }

  /* Gallery card CSS art backgrounds — used when real images are absent */
  .bg-arcade  { background: linear-gradient(135deg,#1a0505 0%,#3d0f0f 40%,#8B1A1A 70%,#c9a84c 100%); }
  .bg-cruise  { background: linear-gradient(135deg,#050a1a 0%,#0d1f3c 40%,#1a3a6b 70%,#c9a84c 90%); }
  .bg-tribute { background: linear-gradient(135deg,#050505 0%,#1a0a0a 30%,#2d1a1a 60%,#6b3030 100%); }
  .bg-barber  { background: linear-gradient(135deg,#0d0d0a 0%,#1a1a0a 30%,#2d2d10 60%,#c9a84c 100%); }

  #story-modal { background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); z-index: 1000; }
`;

const HTML = `
  <!-- STORY MODAL -->
  <div id="story-modal" class="fixed inset-0 hidden items-center justify-center px-6 transition-opacity duration-300 opacity-0" style="z-index:1000;display:none;">
    <div class="glass-panel p-8 md:p-12 rounded-lg max-w-2xl w-full shadow-2xl relative overflow-hidden transform scale-95 transition-transform duration-300" id="story-modal-content" style="border:1px solid #333;">
      <div class="flex justify-between items-start mb-6 pb-4" style="border-bottom:1px solid #222;">
        <div class="mono text-xs font-bold uppercase tracking-widest" style="color:#71717a;">The Story</div>
        <button id="close-modal-btn" class="mono text-xs uppercase tracking-widest transition-colors" style="color:#71717a;">Close [X]</button>
      </div>
      <h3 id="story-title" class="text-3xl font-light text-white mb-4"></h3>
      <div id="story-text" class="font-light text-lg leading-relaxed" style="color:#d4d4d8;min-height:100px;display:flex;align-items:center;"></div>
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
    <img id="hero-logo" src="/southern-logo.png" onerror="this.style.display='none'" alt="Southern Lyfestyle Crest"
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
        <div class="animate-cinematic" style="position:absolute;inset:0;background:linear-gradient(135deg,#0d1a0d 0%,#1a2e10 40%,#2d4a1a 60%,#1a1a0a 100%);opacity:0.5;"></div>
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
      <div style="font-size:1.5rem;color:#fff;font-weight:300;text-transform:uppercase;letter-spacing:0.1em;">Our Work</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">

      <!-- Card 1 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="1">
        <div style="position:relative;height:400px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/impala_bounce_slot_game_art.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" alt="Arcade Game" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-arcade" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Arcade &amp; Slots</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Custom Arcade Games</h3>
              <p style="font-size:0.875rem;color:#d4d4d8;font-weight:300;">Fully playable software branded to your exact style.</p>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Custom Arcade Games" style="font-size:10px;opacity:0;transition:opacity 0.3s;">Read Story</button>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="2">
        <div style="position:relative;height:400px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/modern_lowrider_cruise_night_scene.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" alt="Car Clubs" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-cruise" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Car Clubs</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">The Night Cruise</h3>
              <p style="font-size:0.875rem;color:#d4d4d8;font-weight:300;">Your exact familia colors and rides on a digital blvd.</p>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="The Night Cruise" style="font-size:10px;opacity:0;transition:opacity 0.3s;">Read Story</button>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="3">
        <div style="position:relative;height:400px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/cdcprison-love.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" alt="Tribute Builds" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-tribute" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Paño Arte</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Tribute Builds</h3>
              <p style="font-size:0.875rem;color:#d4d4d8;font-weight:300;">Your history translated into interactive art. Respectful and permanent.</p>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Tribute Builds" style="font-size:10px;opacity:0;transition:opacity 0.3s;">Read Story</button>
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="art-card glass-panel rounded-xl" style="padding:1rem;overflow:hidden;border:1px solid #222;position:relative;" data-card="4">
        <div style="position:relative;height:400px;width:100%;border-radius:0.5rem;overflow:hidden;">
          <img src="/klingerman_karts_neighborhood_race.jpg" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" alt="Neighborhoods" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s;filter:brightness(0.75);" class="gallery-img">
          <div class="bg-barber" style="display:none;position:absolute;inset:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.4),transparent);"></div>
          <div style="position:absolute;bottom:0;left:0;padding:1.5rem;width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div class="mono" style="font-size:10px;color:#a1a1aa;margin-bottom:0.5rem;letter-spacing:0.1em;text-transform:uppercase;">Community</div>
              <h3 style="font-size:1.875rem;font-weight:300;color:#fff;margin-bottom:0.5rem;">Neighborhood Circuits</h3>
              <p style="font-size:0.875rem;color:#d4d4d8;font-weight:300;">Digitizing the pulse of the community with safe, fun energy.</p>
            </div>
            <button class="story-btn btn-solid px-4 py-2 rounded" data-title="Neighborhood Circuits" style="font-size:10px;opacity:0;transition:opacity 0.3s;">Read Story</button>
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

  <!-- REQUEST / PRICING -->
  <section id="request" style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem;display:flex;flex-direction:column;gap:3rem;">
    <div style="display:flex;flex-direction:column;gap:3rem;">
      <div style="display:flex;gap:3rem;flex-wrap:wrap;">

        <!-- Pricing ledger -->
        <div class="glass-panel rounded-xl" style="padding:2rem;flex:0 0 auto;width:320px;border:1px solid #222;height:fit-content;">
          <h4 class="mono text-white uppercase tracking-widest" style="font-size:0.75rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #333;">Build Pricing</h4>
          <ul style="display:flex;flex-direction:column;gap:1.5rem;font-size:0.875rem;text-transform:uppercase;color:#a1a1aa;margin-bottom:2.5rem;">
            <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Personal</span><span style="color:#fff;">$250</span></li>
            <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Community</span><span style="color:#fff;">$500</span></li>
            <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;color:var(--gold);"><span>Full World</span><span>$750</span></li>
            <li style="display:flex;justify-content:space-between;padding-bottom:0.5rem;border-bottom:1px solid #222;"><span>Premium</span><span style="color:#fff;">$1,000</span></li>
          </ul>
          <h4 class="mono text-white uppercase tracking-widest" style="font-size:0.75rem;margin-bottom:1.5rem;padding-top:1rem;border-top:1px solid #333;">Add-ons</h4>
          <div style="display:flex;flex-direction:column;gap:1rem;font-size:0.75rem;color:#71717a;text-transform:uppercase;">
            <div style="display:flex;justify-content:space-between;"><span>Extra Character</span><span>$50</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Extra Art</span><span>$100</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Intro Video</span><span>$150</span></div>
          </div>
        </div>

        <!-- Request form -->
        <div class="glass-panel rounded-xl" style="flex:1;min-width:0;padding:1px;border:1px solid rgba(255,255,255,0.08);">
          <div style="background:#050505;border-radius:0.75rem;padding:2rem 3rem;position:relative;height:100%;">
            <div style="margin-bottom:2.5rem;">
              <h2 style="font-size:1.5rem;font-weight:300;color:#fff;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">Request a Build</h2>
              <p style="font-size:0.875rem;color:#71717a;">Pick your category. Tell us your story. We&apos;ll draft a free concept for you.</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.5rem;position:relative;z-index:10;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div>
                  <label class="mono" style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.5rem;">Your Name</label>
                  <input id="sl-name" class="input-dark" style="width:100%;padding:1rem;font-size:0.875rem;border-radius:0.25rem;outline:none;" placeholder="First name or handle">
                </div>
                <div>
                  <label class="mono" style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.5rem;">Email (optional)</label>
                  <input id="sl-email" type="email" class="input-dark" style="width:100%;padding:1rem;font-size:0.875rem;border-radius:0.25rem;outline:none;" placeholder="so we can reach you">
                </div>
              </div>
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
                Generate Draft Concept
              </button>
            </div>

            <div id="draftResult" style="margin-top:2rem;display:none;border-top:1px solid #222;padding-top:2rem;">
              <div class="mono" style="font-size:10px;color:#71717a;margin-bottom:1rem;text-transform:uppercase;">Draft Response</div>
              <div id="output-text-area" style="padding:1.5rem;background:#0a0a0a;border:1px solid #222;color:#d4d4d8;font-weight:300;line-height:1.75;font-size:0.875rem;border-radius:0.25rem;"></div>
            </div>
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
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
      : '';

    // ── STORY MODAL ──────────────────────────────────────────────
    const modal        = document.getElementById('story-modal');
    const modalContent = document.getElementById('story-modal-content');
    const storyTitle   = document.getElementById('story-title');
    const storyText    = document.getElementById('story-text');
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
      setTimeout(() => { if (modal) modal.style.display = 'none'; }, 300);
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
        if (storyTitle) storyTitle.innerText = title;
        if (storyText) storyText.innerHTML = "<span style='color:#71717a;font-size:0.875rem;'>Writing story...</span>";
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

    // ── DRAFT GENERATOR + CRM ─────────────────────────────────────
    const draftBtn    = document.getElementById('draftBtn') as HTMLButtonElement | null;
    const draftResult = document.getElementById('draftResult');
    const outputArea  = document.getElementById('output-text-area');

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
      const nameEl  = document.getElementById('sl-name')  as HTMLInputElement | null;
      const emailEl = document.getElementById('sl-email') as HTMLInputElement | null;

      const lane  = laneEl?.value || '';
      const story = storyEl?.value?.trim() || '';

      if (!lane || !story) {
        if (outputArea) outputArea.innerHTML = "<span style='color:#ef4444;'>Please select a category and tell us your story.</span>";
        if (draftResult) draftResult.style.display = 'block';
        return;
      }

      if (draftBtn) { draftBtn.disabled = true; draftBtn.innerText = 'Drafting Concept... ⏳'; }
      if (draftResult) draftResult.style.display = 'block';
      if (outputArea)  outputArea.innerHTML = "<span style='color:#71717a;'>Thinking...</span>";

      // Save to CRM in background
      try {
        const leadName  = nameEl?.value?.trim() || lane;
        const leadEmail = emailEl?.value?.trim() || undefined;
        const crmRes = await fetch('/api/crm/leads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: leadName, email: leadEmail, source: 'southern_request', notes: `Category: ${lane}\n\n${story}` }),
        });
        if (crmRes.ok) {
          const d = await crmRes.json();
          if (d.success) {
            await fetch(`/api/crm/leads/${d.lead.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lane: 'southern_build', pipeline_stage: 'lead' }),
            });
          }
        }
      } catch { /* silent */ }

      // Generate draft
      if (!geminiEndpoint) {
        if (outputArea) outputArea.innerHTML = draftFallbacks[lane] || 'Tell us more and we\'ll draft a concept for you.';
      } else {
        const prompt = `You are a creative director for Southern Lyfestyle (representing SGV, El Monte, Chicano culture, family, respect).
Category: ${lane}
Client Story: ${story}

Write a 2-paragraph concept pitch for a custom digital art piece or game based on their story.
Tone: Warm, respectful, authentic, down-to-earth. Do NOT use terms like "SLA113", "Canon", "Terminal", "Engine", or "ArtTech".
Format using simple HTML (<br>, <strong>). Do not use markdown.`;

        try {
          const res  = await fetch(geminiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || draftFallbacks[lane] || 'Failed to generate concept.';
          if (outputArea) outputArea.innerHTML = text.replace(/```html/g, '').replace(/```/g, '');
        } catch {
          if (outputArea) outputArea.innerHTML = draftFallbacks[lane] || "<span style='color:#ef4444;'>Network error. Please try again.</span>";
        }
      }

      if (draftBtn) { draftBtn.disabled = false; draftBtn.innerText = 'Generate Draft Concept'; }
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
