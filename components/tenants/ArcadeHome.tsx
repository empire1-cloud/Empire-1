'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * SOVEREIGN_ARCADE // ARCADE_BODY_v2
 * High-performance PixiJS + GSAP + Sovereign Slam Engine
 * Target: arcade.southernlifestyle.org (Personal Sweepstakes)
 */
export default function ArcadeHome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameState, setGameState] = useState<'LOADING' | 'LOBBY' | 'GAME'>('LOADING');

  // --- SOVEREIGN SLAM BRAIN (LOGIC) ---
  const SYMBOLS = [
    { id: 'crown', char: '👑', weight: 4, pays: {3: 100, 4: 500, 5: 5000}, isJackpot: true },
    { id: 'wild', char: '⭐', weight: 6, pays: {3: 50, 4: 200, 5: 1000}, isWild: true },
    { id: 'scatter', char: '🎉', weight: 8, isScatter: true },
    { id: 'seven', char: '7️⃣', weight: 10, pays: {3: 30, 4: 100, 5: 500} },
    { id: 'bar', char: '🍀', weight: 15, pays: {3: 20, 4: 50, 5: 200} },
    { id: 'bell', char: '🔔', weight: 18, pays: {3: 15, 4: 40, 5: 150} },
    { id: 'cherry', char: '🍒', weight: 25, pays: {3: 10, 4: 25, 5: 75} },
    { id: 'grape', char: '🍇', weight: 30, pays: {3: 5, 4: 15, 5: 50} },
  ];

  const getWeightedSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of SYMBOLS) {
      rand -= sym.weight;
      if (rand <= 0) return sym;
    }
    return SYMBOLS[0];
  };

  useEffect(() => {
    // 1. Dynamic Script Loading
    const loadScripts = async () => {
      if (window.PIXI && window.gsap) { initEngine(); return; }
      
      const pixiScript = document.createElement('script');
      pixiScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js';
      document.head.appendChild(pixiScript);

      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      document.head.appendChild(gsapScript);

      await Promise.all([
        new Promise((res) => pixiScript.onload = res),
        new Promise((res) => gsapScript.onload = res)
      ]);

      initEngine();
    };

    const initEngine = () => {
      if (!containerRef.current || !window.PIXI || !window.gsap) return;
      const PIXI = window.PIXI;
      const gsap = window.gsap;

      // Clean up previous app if exists
      containerRef.current.innerHTML = '';

      const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x050505,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });
      containerRef.current.appendChild(app.view);

      const stage = new PIXI.Container();
      app.stage.addChild(stage);

      // --- ASSET PIPELINE ---
      const loader = PIXI.Assets;
      loader.add('logo', '/brand/southern-logo.png');
      loader.add('titleBg', '/assets/titleScreen.jpg'); // Best match for titlescene
      
      // Generate textures for symbols (Placeholder for Vertex AI)
      const symbolTextures: Record<string, any> = {};
      
      const startLoading = async () => {
        const assets = await loader.load(['logo', 'titleBg'], (p: number) => {
          setLoadingProgress(Math.floor(p * 100));
        });
        
        // Generate Text Textures for symbols since we don't have the PNGs yet
        SYMBOLS.forEach(sym => {
          const text = new PIXI.Text(sym.char, { fontSize: 60 });
          symbolTextures[sym.id] = text; // Just storing text obj for now, ideal is texture
        });

        runLoaderSequence(assets);
      };

      const runLoaderSequence = (assets: any) => {
        // "S" Emblem Logic
        const emblem = new PIXI.Sprite(assets.logo);
        emblem.anchor.set(0.5);
        emblem.x = app.screen.width / 2;
        emblem.y = app.screen.height / 2;
        emblem.scale.set(0.2);
        emblem.alpha = 0;
        stage.addChild(emblem);

        // "Golden Hour" Glow
        const bloom = new PIXI.BlurFilter(8);
        emblem.filters = [bloom];

        gsap.to(emblem, { alpha: 1, duration: 1.5, ease: "power2.out" });
        gsap.to(emblem.scale, { x: 0.22, y: 0.22, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

        // Simulated Metallic Sweep
        const sweep = new PIXI.Graphics();
        sweep.beginFill(0xFFD700, 0.3);
        sweep.drawRect(0, 0, 50, 500);
        sweep.endFill();
        sweep.rotation = 0.5;
        sweep.x = -200;
        sweep.y = -200;
        // stage.addChild(sweep); // Mask logic needed, skipping for simple prototype

        // Transition to Game
        setTimeout(() => {
          gsap.to(emblem, { 
            alpha: 0, 
            scale: 0.5, 
            duration: 0.8, 
            ease: "back.in(1.7)",
            onComplete: () => initGame(assets)
          });
        }, 3000);
      };

      const initGame = (assets: any) => {
        setGameState('GAME');
        stage.removeChildren();

        // Background (Parallax Layer 1)
        const bg = new PIXI.Sprite(assets.titleBg);
        bg.anchor.set(0.5);
        bg.x = app.screen.width / 2;
        bg.y = app.screen.height / 2;
        bg.scale.set(Math.max(app.screen.width / bg.width, app.screen.height / bg.height));
        bg.alpha = 0.4;
        stage.addChild(bg);

        // Slot Machine Container
        const machine = new PIXI.Container();
        machine.x = app.screen.width / 2 - 300;
        machine.y = app.screen.height / 2 - 200;
        stage.addChild(machine);

        // Draw Reels
        const reels: any[] = [];
        const reelWidth = 120;
        const reelHeight = 400;
        
        for (let i = 0; i < 5; i++) {
          const reel = new PIXI.Container();
          reel.x = i * (reelWidth + 10);
          machine.addChild(reel);
          
          // Reel Background
          const reelBg = new PIXI.Graphics();
          reelBg.beginFill(0x000000, 0.8);
          reelBg.drawRect(0, 0, reelWidth, reelHeight);
          reelBg.endFill();
          reel.addChild(reelBg);

          // Symbols
          const strip: any[] = [];
          for (let j = 0; j < 5; j++) { // 5 symbols per reel logic
            const symData = getWeightedSymbol();
            const symbol = new PIXI.Text(symData.char, { 
              fontFamily: 'Space Grotesk', 
              fontSize: 60, 
              align: 'center',
              fill: 0xFFFFFF
            });
            symbol.anchor.set(0.5);
            symbol.x = reelWidth / 2;
            symbol.y = j * 90 + 45;
            reel.addChild(symbol);
            strip.push(symbol);
          }
          reels.push({ container: reel, symbols: strip });
        }

        // Spin Logic (Hydraulic Bounce)
        const spinBtn = new PIXI.Graphics();
        spinBtn.beginFill(0xFFD700);
        spinBtn.drawCircle(0, 0, 50);
        spinBtn.endFill();
        spinBtn.x = app.screen.width / 2;
        spinBtn.y = app.screen.height - 100;
        spinBtn.interactive = true;
        spinBtn.cursor = 'pointer';
        stage.addChild(spinBtn);

        const btnText = new PIXI.Text("SLAM", { 
          fontFamily: 'Syne', 
          fontSize: 24, 
          fontWeight: '800', 
          fill: 0x000000,
          letterSpacing: 2
        });
        btnText.anchor.set(0.5);
        spinBtn.addChild(btnText);

        spinBtn.on('pointerdown', () => {
          gsap.to(spinBtn.scale, { x: 0.9, y: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
          
          reels.forEach((reel, i) => {
            // GSAP Hydraulic Spin
            gsap.to(reel.container, {
              y: reel.container.y + 50, // Pull down (Hydraulic load)
              duration: 0.2,
              ease: "back.in(1.7)",
              onComplete: () => {
                // Spin Blur
                // ... (Logic for switching textures would go here)
                
                gsap.to(reel.container, {
                  y: machine.y, // Snap back
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: "elastic.out(1, 0.5)", // The Juice
                  onComplete: () => {
                    // Update Symbols
                    reel.symbols.forEach((s: any) => s.text = getWeightedSymbol().char);
                  }
                });
              }
            });
          });
        });
      };

      startLoading();

      window.addEventListener('resize', () => app.renderer.resize(window.innerWidth, window.innerHeight));
    };

    loadScripts();
  }, []);

  return (
    <div className="bg-[#050505] w-full h-screen overflow-hidden flex flex-col items-center justify-center relative selection:bg-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-20">
        <div className="space-y-1">
          <div className="text-[10px] text-white font-black tracking-[0.4em] uppercase">SOUTHERN // ARCADE_SOVEREIGN</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest">Engine: <span className="text-[#D4AF37]">PIXI_V7 + GSAP</span></div>
        </div>
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; background: #050505; color: #fff; overflow: hidden; }
        canvas { display: block; position: absolute; top: 0; left: 0; }
      `}</style>
    </div>
  );
}

declare global {
  interface Window {
    PIXI: any;
    gsap: any;
  }
}
