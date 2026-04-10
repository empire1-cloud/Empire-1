'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * SOUTHERN LYFESTYLE // CANON_FRONT_PAGE
 * Strictly follows the user-provided HTML blueprint.
 */
export default function SouthernHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lane, setLane] = useState("");
  const [story, setStory] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // SCRIPT 1: PARTICLE CANVAS ENGINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: any[] = [];
    const mouse: any = { x: null, y: null, radius: 150 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.x; mouse.y = e.y; };
    const handleMouseOut = () => { mouse.x = undefined; mouse.y = undefined; };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      x: number; y: number; dx: number; dy: number; size: number;
      baseX: number; baseY: number; density: number;
      constructor(x: number, y: number, dx: number, dy: number, size: number) {
        this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size;
        this.baseX = x; this.baseY = y;
        this.density = (Math.random() * 30) + 1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.fill();
      }
      update() {
        if (!canvas) return;
        if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

        let dx = (mouse.x || 0) - this.x;
        let dy = (mouse.y || 0) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let dirX = (dx / distance) * force * this.density;
          let dirY = (dy / distance) * force * this.density;
          this.x -= dirX;
          this.y -= dirY;
        } else {
          if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 50;
          if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 50;
        }

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }
    }

    function initParticles() {
      if (!canvas) return;
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 12000;
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let dx = (Math.random() * 1) - 0.5;
        let dy = (Math.random() * 1) - 0.5;
        particlesArray.push(new Particle(x, y, dx, dy, size));
      }
    }

    function connectParticles() {
      if (!ctx || !canvas) return;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
          if (distance < (canvas.width / 15) * (canvas.height / 15)) {
            let opacity = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(0, 200, 255, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
    }

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const handleTranslate = async () => {
    if (!lane || !story) return;
    setIsExecuting(true);
    setResult(null);
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBvWiHFNhdicOrYhq3xsmJ0LBqylNWnSR0";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const prompt = `You are the Southern Lyfestyle cultural design engine, representing SGV x IELA culture. Target Lane: ${lane}. Seed Data: ${story}. Generate a "Digital Blueprint" in HTML.`;
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "ERR: SYNTHESIS_FAILED.";
      setResult(text.replace(/```html/g, '').replace(/```/g, ''));
    } catch (error) { setResult("ERR: NETWORK_FAULT."); } finally { setIsExecuting(false); }
  };

  return (
    <div className="bg-[#030303] text-[#E2E2E2] min-h-screen relative overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;700&display=swap');
        :root { --obsidian: #030303; --dodger-blue: #00C8FF; --chrome: #E2E2E2; --glass-bg: rgba(10, 10, 10, 0.7); --glass-border: rgba(0, 200, 255, 0.15); }
        .chrome-script { font-family: 'Alex Brush', cursive; font-size: 5.5rem; line-height: 1.1; background: linear-gradient(180deg, #ffffff 0%, #a0a0a0 40%, #555555 50%, #d0d0d0 55%, #ffffff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8); filter: drop-shadow(0 10px 20px rgba(0,0,0,0.9)); transform: rotate(-2deg); display: inline-block; padding: 10px 20px; }
        .chrome-heading { font-family: 'Alex Brush', cursive; font-size: 3.5rem; line-height: 1.2; background: linear-gradient(180deg, #ffffff 0%, #a0a0a0 40%, #555555 50%, #d0d0d0 55%, #ffffff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.8); filter: drop-shadow(0 5px 10px rgba(0,0,0,0.9)); }
        @media (min-width: 768px) { .chrome-script { font-size: 9rem; } .chrome-heading { font-size: 5rem; } }
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9); }
        @keyframes cinematic-pan { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .animate-cinematic { animation: cinematic-pan 30s ease-in-out infinite; }
        .btn-premium { background: linear-gradient(90deg, rgba(0, 200, 255, 0.1), rgba(0, 200, 255, 0.05)); border: 1px solid rgba(0, 200, 255, 0.3); text-transform: uppercase; letter-spacing: 0.2em; }
        .input-dark { background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; }
      `}} />

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-auto" />

      <div className="relative z-10 pointer-events-none">
        <nav className="w-full fixed top-0 z-50 glass-panel border-t-0 border-l-0 border-r-0 pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="font-mono text-[10px] tracking-widest text-cyan-400 uppercase flex items-center gap-3 text-white">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              Southern // Culture_Portal
            </div>
            <a href="#portal" className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-white uppercase">Initialize_Terminal</a>
          </div>
        </nav>

        <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-32 pb-16 pointer-events-auto">
          <img src="/assets/southern-logo.jpg" alt="Southern Lyfestyle Crest" className="w-32 md:w-48 rounded-full mb-8 shadow-2xl border border-cyan-500/20" />
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2">Southern Culture Portal</div>
          <h1 className="chrome-script mb-4">Southern Lyfestyle</h1>
          <div className="font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold text-sm md:text-base mb-10 drop-shadow-md">Stilo’s Active & Attractive.</div>
          <div className="glass-panel p-8 md:p-12 rounded-2xl max-w-4xl text-center shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="font-mono text-cyan-400 uppercase tracking-widest text-xs mb-6 font-bold">Identity Becomes Universe</h2>
              <div className="text-zinc-200 font-light text-lg md:text-xl leading-relaxed space-y-4">
                <p>Southern Lyfestyle was built for us — anyone who respects the honest hustle, the culture, the struggle, and the beauty we still protect.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="portal" className="max-w-6xl mx-auto px-6 py-24 pointer-events-auto flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/3 glass-panel p-8 rounded-2xl h-fit border border-zinc-800 bg-black/50">
            <h4 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-2">Sovereign_Build_Ledger</h4>
            <ul className="space-y-6 font-mono text-xs uppercase text-zinc-500 mb-10">
              <li className="flex justify-between border-b border-zinc-900 pb-2"><span>Personal</span><span className="text-white">$250</span></li>
              <li className="flex justify-between border-b border-zinc-900 pb-2 text-cyan-400 font-bold"><span>Worldbuilder</span><span>$750</span></li>
            </ul>
          </div>
          <div className="w-full lg:w-2/3 glass-panel p-1 rounded-2xl">
            <div className="bg-black/80 rounded-xl p-8 md:p-12 border border-zinc-900 h-full">
              <h2 className="font-mono text-2xl md:text-3xl font-light text-white uppercase tracking-widest mb-2">Culture Portal</h2>
              <p className="font-mono text-xs text-cyan-500 tracking-widest mb-10">Terminal Active // SOUTHERN_PORTAL</p>
              <div className="space-y-6 relative z-10">
                <select value={lane} onChange={(e) => setLane(e.target.value)} className="w-full p-4 input-dark mono text-sm rounded-lg appearance-none">
                  <option value="">Select Directory...</option>
                  <option value="Car Club">Car Club (Chrome/Plaques)</option>
                  <option value="Couple">Couple (Loyalty/Day-Ones)</option>
                </select>
                <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} placeholder="Enter memory..." className="w-full p-4 input-dark mono text-sm rounded-lg resize-none"></textarea>
                <button onClick={handleTranslate} disabled={isExecuting} className="w-full p-5 btn-premium rounded-lg text-cyan-400 font-bold font-mono text-xs uppercase tracking-[0.2em]">
                  {isExecuting ? "EXECUTING_ROUTINE... ⏳" : "Draft_Digital_Plaque"}
                </button>
                {result && <div dangerouslySetInnerHTML={{ __html: result }} className="mt-8 border-t border-zinc-800 pt-8 p-6 bg-black/60 rounded-lg text-zinc-300 font-light text-sm" />}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-20 py-12 text-center border-t border-zinc-900/50 pointer-events-auto glass-panel border-b-0 border-l-0 border-r-0 rounded-t-3xl font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
          Identity Is Loyalty // Southern Lyfestyle // © 2026
        </footer>
      </div>
    </div>
  );
}
