'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Terminal, Send, X, Cpu, Music, Gamepad2, Shield, BarChart3,
  Layers, Zap, DollarSign, Globe, Lock, ChevronRight, Radio, Mic2
} from 'lucide-react';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const HAS_GEMINI = Boolean(GOOGLE_API_KEY);

/**
 * EMPIRE ONE // Public Landing
 * empire1.cloud — operator + creator + investor audience
 * SLA-113 hierarchy: U4 product surface, governed by U0 (SLA113 control plane)
 */
const EmpireHome = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'system',
      text: 'EMPIRE ONE // OPERATOR UPLINK\n> What are you trying to build or launch?\n> Ask about pricing, capabilities, or getting started.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const fallbackReply = (msg: string) =>
    `[EMPIRE ONE // OFFLINE]\nReceived: "${msg}"\n\nEmpire One powers AI music platforms, white-label game OS, and enterprise SaaS — as real products under one brand.\n\nCapabilities: 50+ pipeline engines, Lyrica 3 Pro (music/voice), Sonance Pro studio, SL Universal radio, Southern Arcade, SLA113 operator console, DNA royalty tagging, biometric vocal synthesis.\n\nTo talk to a human: reach out via the form below or email your operator for a pilot slot.\n\nFor live AI responses, set NEXT_PUBLIC_GOOGLE_API_KEY.`;

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    if (!HAS_GEMINI) {
      await new Promise((r) => setTimeout(r, 350));
      setChatMessages((prev) => [...prev, { role: 'system', text: fallbackReply(userMsg) }]);
      setIsChatLoading(false);
      return;
    }

    try {
      const history = [...chatMessages, { role: 'user', text: userMsg }];
      const formattedHistory = history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedHistory,
            systemInstruction: {
              parts: [{
                text: `You are the Empire One platform assistant at empire1.cloud. Empire One is an AI-powered operating system that lets operators, agencies, creators, and enterprises launch products powered by: 50+ pipeline engines (strategy, voice, analytics, music, vision, pricing, ops), Lyrica 3 Pro (Sonance Pro studio + SL Universal radio + Lyria 3 generative — one music business), Southern Arcade (white-label game OS), SLA113 operator console, DNA-tagged micro-royalties, and biometric vocal synthesis. SLA-113 is the parent control plane. Empire One is the enterprise SaaS product surface. Be direct, knowledgeable, and helpful. Don't be robotic — be sharp. Help them figure out if and how Empire One fits their business.`,
              }],
            },
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatMessages((prev) => [...prev, { role: 'system', text: text || 'ERR_NO_RESPONSE' }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'system', text: 'ERR_TRANSMISSION_FAILED — try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Particle canvas
  useEffect(() => {
    const canvas = document.getElementById('empire-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width: number, height: number;
    const resize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    window.addEventListener('resize', resize);
    resize();
    class P {
      x = Math.random() * width; y = Math.random() * height;
      vx = (Math.random() - 0.5) * 1.2; vy = (Math.random() - 0.5) * 1.2;
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,255,0.7)'; ctx.fill();
      }
    }
    const pts = Array.from({ length: 35 }, () => new P());
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0,229,255,0.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      pts.forEach((p, i) => {
        p.update(); p.draw();
        pts.slice(i + 1).forEach((q) => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.15 - d / 800})`; ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] text-[#e0e0e0] font-sans overflow-x-hidden selection:bg-[#00e5ff] selection:text-black">

      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.018] z-[9999]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Top telemetry strip */}
      <div className="fixed top-0 w-full bg-black border-b border-[#00e5ff]/20 z-[100] py-1 overflow-hidden">
        <div className="inline-block animate-[scrollTicker_35s_linear_infinite] whitespace-nowrap font-sans text-[9px] text-[#0ea5e9] uppercase tracking-widest">
          [SYS: EMPIRE ONE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [ENGINES: 20 ACTIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [LYRICA 3 PRO // SOULFIRE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [DNA ROYALTY TAGGING: LIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [SOUTHERN ARCADE: ONLINE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [SLA113 CONTROL PLANE: ACTIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [CREATOR EQUITY: 70/30 SPLIT] <span className="mx-5 text-[#0f172a]/20">|</span>
          [SYS: EMPIRE ONE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [ENGINES: 20 ACTIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [LYRICA 3 PRO // SOULFIRE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [DNA ROYALTY TAGGING: LIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [SOUTHERN ARCADE: ONLINE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [SLA113 CONTROL PLANE: ACTIVE] <span className="mx-5 text-[#0f172a]/20">|</span>
          [CREATOR EQUITY: 70/30 SPLIT]
        </div>
      </div>

      <div className="pt-10">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-200/80">
          <div>
            <span className="font-sans text-[10px] text-[#0ea5e9] tracking-widest">EMPIRE ONE</span>
            <p className="font-sans text-[8px] text-[#0f172a]/30 tracking-widest">GOVERNED BY SLA-113</p>
          </div>
          <div className="hidden md:flex items-center gap-6 font-sans text-[10px] text-[#0f172a]/50 uppercase tracking-widest">
            <a href="#what-we-build" className="hover:text-[#0ea5e9] transition-colors">What We Build</a>
            <a href="#products" className="hover:text-[#0ea5e9] transition-colors">Products</a>
            <a href="#how-it-works" className="hover:text-[#0ea5e9] transition-colors">How It Works</a>
            <a href="#plans" className="hover:text-[#0ea5e9] transition-colors">Plans</a>
          </div>
          <Link
            href="/admin/login"
            className="border border-[#00e5ff]/40 px-4 py-2 font-sans text-[9px] text-[#0ea5e9] uppercase tracking-widest hover:bg-[#00e5ff]/10 transition-colors"
          >
            Operator Login →
          </Link>
        </nav>

        {/* ── HERO ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh] border-b border-slate-200/80">

          {/* Left — copy */}
          <div className="flex flex-col justify-center px-6 md:px-12 py-16 border-r border-slate-200/80">
            <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-6">
              Empire One // U4 — Enterprise SaaS
            </p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#0f172a] leading-[0.92] mb-8">
              THE PLATFORM<br />
              YOUR BUSINESS<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#ffffff80]">
                RUNS ON.
              </span>
            </h1>
            <p className="font-sans text-sm text-[#0f172a]/60 leading-relaxed max-w-lg border-l-2 border-[#00e5ff]/40 pl-5 mb-10">
              20 AI engines. AI music production. White-label game OS. Creator-owned royalties.
              Enterprise SaaS infrastructure. One stack — your brand, your revenue.
            </p>

            {/* Traction signals */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                { value: '20', label: 'AI Engines' },
                { value: '70/30', label: 'Creator Split' },
                { value: '3', label: 'Product Surfaces' },
                { value: '$2M', label: 'Seed Round' },
              ].map((s) => (
                <div key={s.label} className="border border-slate-200 px-4 py-3 bg-white">
                  <p className="font-sans text-lg font-black text-[#0ea5e9]">{s.value}</p>
                  <p className="font-sans text-[9px] text-[#0f172a]/40 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex-1 bg-[#00e5ff] text-black font-sans font-black text-[11px] uppercase tracking-[3px] py-4 hover:bg-white transition-colors"
              >
                Talk to Us →
              </button>
              <a
                href="#what-we-build"
                className="flex-1 border border-[#00e5ff]/30 text-[#0ea5e9] font-sans text-[11px] uppercase tracking-[3px] py-4 text-center hover:bg-[#00e5ff]/10 transition-colors"
              >
                See What We Build
              </a>
            </div>
          </div>

          {/* Right — canvas */}
          <div className="relative bg-black min-h-[40vh] lg:min-h-0">
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00e5ff] animate-pulse rounded-full" />
              <span className="font-sans text-[9px] text-[#0ea5e9] uppercase tracking-widest">Live Network</span>
            </div>
            <canvas id="empire-canvas" className="w-full h-full" />
          </div>
        </section>

        {/* ── WHAT WE BUILD ── */}
        <section id="what-we-build" className="px-6 md:px-12 py-20 border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">What We Build</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-14">
            Three product lines.<br />One revenue engine.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white">
            {[
              {
                icon: Music,
                tag: 'U1 // LYRICA3',
                title: 'AI Music Platform',
                sub: 'Lyrica 3 Pro — Sonance Pro + SL Universal',
                body: 'Creator-owned AI music production. Soulfire engine translates emotion into audio — vocal fry, late-pocket drums, bruised subtext. DNA-tagged stems. 70/30 royalty split. Every remix earns the original creator.',
                url: 'https://lyrica3.com',
                cta: 'lyrica3.com',
                color: 'from-[#00e5ff]/10',
              },
              {
                icon: Gamepad2,
                tag: 'U3 // SOUTHERN',
                title: 'White-Label Game OS',
                sub: 'Southern Lyfestyle Arcade',
                body: 'Full white-label game operating system. Multi-tenant arcade frameworks, tournament logic, branded reward systems, cultural overlays. Ship a game platform under your own brand without building infrastructure.',
                url: 'https://southernlifestyle.org',
                cta: 'southernlifestyle.org',
                color: 'from-[#a855f7]/10',
              },
              {
                icon: Cpu,
                tag: 'U4 // EMPIRE ONE',
                title: 'Enterprise SaaS',
                sub: '50+ pipeline engines + operator console',
                body: 'Strategy, analysis, pipeline, voice, vision, pricing, persona, blueprint engines — exposed through a unified API. Multi-tenant auth, billing, real-time analytics, and the SLA113 operator console for full control.',
                url: null,
                cta: 'Request access',
                color: 'from-[#f59e0b]/10',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.tag} className={`bg-black p-8 md:p-10 flex flex-col gap-6 hover:bg-white/[0.02] transition-colors`}>
                  <div className="flex items-start justify-between">
                    <Icon size={20} className="text-[#0ea5e9]" />
                    <span className="font-sans text-[8px] text-[#0f172a]/30 uppercase tracking-widest">{card.tag}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-[#0f172a] tracking-tight mb-1">{card.title}</h3>
                    <p className="font-sans text-[10px] text-[#0ea5e9]/70">{card.sub}</p>
                  </div>
                  <p className="font-sans text-[11px] text-[#0f172a]/55 leading-relaxed flex-grow">{card.body}</p>
                  {card.url ? (
                    <a href={card.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-[10px] text-[#0ea5e9] hover:text-[#0f172a] transition-colors">
                      {card.cta} <ChevronRight size={12} />
                    </a>
                  ) : (
                    <button onClick={() => setIsChatOpen(true)}
                      className="inline-flex items-center gap-2 font-sans text-[10px] text-[#0ea5e9] hover:text-[#0f172a] transition-colors text-left">
                      {card.cta} <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ENGINE GRID ── */}
        <section id="products" className="px-6 md:px-12 py-20 border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">Product Engine Suite</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-4">
            50+ pipeline engines.<br />Built for products.
          </h2>
          <p className="font-sans text-sm text-[#0f172a]/50 max-w-xl mb-14">
            Every engine is production-grade. Every output is tracked. Every dollar earned by a creator is recorded on the ledger.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-white">
            {[
              {
                icon: Cpu,
                label: 'Intelligence',
                engines: ['Strategy Engine', 'Blueprint Engine', 'Analysis Engine', 'Evaluator Engine', 'Routing Engine'],
              },
              {
                icon: Music,
                label: 'Music & Voice',
                engines: ['Soulfire Engine', 'PFA (Vocal Biometrics)', 'MMA (Late-Pocket)', 'S2 Disruption', 'Ghostwriter Engine'],
              },
              {
                icon: DollarSign,
                label: 'Revenue',
                engines: ['Money Pipeline Engine', 'Pricing Engine', 'Plan Builder', 'Micro-Royalty Ledger', 'DNA Tagger'],
              },
              {
                icon: Layers,
                label: 'Platform',
                engines: ['Persona Engine', 'Art Direction Engine', 'Canon Enforcer', 'Drift Monitor', 'Omni Agent (Pipeline #20)'],
              },
            ].map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label} className="bg-black p-8 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon size={16} className="text-[#0ea5e9]" />
                    <span className="font-sans text-[10px] text-[#0f172a] uppercase tracking-widest">{group.label}</span>
                  </div>
                  <ul className="space-y-3">
                    {group.engines.map((e) => (
                      <li key={e} className="flex items-center gap-2 font-sans text-[11px] text-[#0f172a]/50">
                        <span className="text-[#0ea5e9] text-xs">›</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CREATOR EQUITY ── */}
        <section className="px-6 md:px-12 py-20 border-b border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">Creator Equity</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-6">
              Creators keep<br />
              <span className="text-[#0ea5e9]">what they build.</span>
            </h2>
            <p className="font-sans text-sm text-[#0f172a]/55 leading-relaxed max-w-md">
              100% IP ownership. 70/30 revenue split — creator keeps 70. Every stem, every remix, every derivative tracked by DNA tagging. Micro-royalties distributed automatically. No label. No middleman.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white">
            {[
              { icon: Lock, label: '100% IP Ownership', desc: 'Blockchain-verified DNA tag on every file' },
              { icon: DollarSign, label: '70/30 Split', desc: 'Creator keeps 70% of all revenue' },
              { icon: Radio, label: 'Flip It', desc: 'Every fan remix earns the original producer' },
              { icon: Zap, label: 'Instant Distribution', desc: 'Micro-royalties auto-distributed on stream' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-black p-6 hover:bg-white/[0.02] transition-colors">
                  <Icon size={16} className="text-[#0ea5e9] mb-4" />
                  <p className="font-sans text-[11px] text-[#0f172a] font-bold mb-1">{item.label}</p>
                  <p className="font-sans text-[10px] text-[#0f172a]/40 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>


        {/* ── CULTURA VIBE // LIVE ON THE STACK ── */}
        <section className="px-6 md:px-12 py-20 border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">Live on the Stack</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-4">
            Platform in<br />
            <span className="text-[#0ea5e9]">production.</span>
          </h2>
          <p className="font-sans text-sm text-[#0f172a]/50 max-w-xl mb-14">
            Cultura Vibe is built on Empire One — a real product, live users, real Stripe billing. This is what Empire One ships to market.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white">
            {/* Left — product info */}
            <div className="bg-black p-8 md:p-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[9px] text-[#0f172a]/30 uppercase tracking-widest">U2 // CULTURA VIBE</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                  <span className="font-sans text-[8px] text-[#0ea5e9] uppercase tracking-widest">Live</span>
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase text-[#0f172a] tracking-tight mb-1">Cultura Vibe</h3>
                <p className="font-sans text-[10px] text-[#0ea5e9]/70">Cyber-Chicano · AI Vibe-Code Forge</p>
              </div>
              <p className="font-sans text-[11px] text-[#0f172a]/55 leading-relaxed">
                Type your vision. Pick a category. Hit <span className="text-[#0f172a] font-bold">Forge Con Ganas</span>. The Cultural Engine injects Soulfire Guardrails — 48kHz audio, Emotional Math, Creator Equity DNA — before shipping production-ready boilerplate. Built entirely on the Empire One stack.
              </p>

              {/* Stripe billing proof */}
              <div className="border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={12} className="text-[#0ea5e9]" />
                  <span className="font-sans text-[9px] text-[#0ea5e9] uppercase tracking-widest">Stripe Billing // 3 Tiers // Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Aprendiz', price: 'Free', sub: '5 forges/hr · 20/day', locked: false },
                    { name: 'Maestro Elite', price: '$40/mo', sub: '10 forges + $10 overage', locked: true },
                    { name: 'Maestro Master', price: '$149/mo', sub: '50 forges + $7 overage', locked: true },
                  ].map((tier) => (
                    <div
                      key={tier.name}
                      className={`p-3 border ${tier.locked ? 'border-[#00e5ff]/30 bg-[#00e5ff]/[0.03]' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-[8px] text-[#0f172a]/40 uppercase tracking-widest">{tier.name}</span>
                        {tier.locked && <Lock size={8} className="text-[#0ea5e9]/60" />}
                      </div>
                      <p className="font-sans text-sm font-black text-[#0ea5e9]">{tier.price}</p>
                      <p className="font-sans text-[8px] text-[#0f172a]/30 mt-1 leading-relaxed">{tier.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="https://aicatalyst.empire1.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-sans text-[10px] text-[#0ea5e9] border border-[#00e5ff]/30 px-5 py-3 hover:bg-[#00e5ff]/10 transition-colors w-fit"
              >
                aicatalyst.empire1.cloud <ChevronRight size={12} />
              </a>
            </div>

            {/* Right — terminal mockup */}
            <div className="bg-black p-8 md:p-10 flex flex-col justify-center">
              <div className="relative bg-[#050505] border border-slate-200 rounded-sm p-6 font-sans text-[11px] shadow-2xl">
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#c8102e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-50" />
                  <span className="ml-3 text-[9px] uppercase tracking-[0.3em] text-[#0f172a]/30">el-terminal // cultura vibe</span>
                </div>
                <div className="space-y-2 text-[#0f172a]/50">
                  <div className="text-[#0f172a]/70">&gt; arquitecto init --soulfire --category=music</div>
                  <div>[planning-agent] <span className="text-[#0f172a]/60">Setting the foundation...</span></div>
                  <div>[cultural-filter] <span className="text-[#c8102e]">Injecting Soulfire Guardrails</span></div>
                  <div>[frontend-agent] <span className="text-[#0f172a]/60">Connecting the wires...</span></div>
                  <div>[billing-agent] <span className="text-[#0ea5e9]">Stripe checkout: configured</span></div>
                  <div>[equity-agent] <span className="text-[#0f172a]/60">DNA tag: 70/30 split locked</span></div>
                  <div className="pt-2 text-[#0ea5e9] flex items-center gap-1">
                    [forge] <span className="font-bold">Artifact ready. Con Ganas.</span>
                    <span className="inline-block w-1.5 h-3.5 bg-[#00e5ff] animate-pulse ml-1" />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-px bg-white">
                {[
                  { v: '48kHz', l: 'Audio Standard' },
                  { v: '70/30', l: 'Creator Split' },
                  { v: '3 Tiers', l: 'Stripe Billing' },
                  { v: 'Live', l: 'Production Status' },
                ].map((s) => (
                  <div key={s.l} className="bg-black px-4 py-3">
                    <p className="font-sans text-sm font-black text-[#0ea5e9]">{s.v}</p>
                    <p className="font-sans text-[8px] text-[#0f172a]/30 uppercase tracking-widest">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="px-6 md:px-12 py-20 border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-14">
            From conversation<br />to live platform.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white">
            {[
              {
                step: '01',
                title: 'Tell us what you\'re building',
                body: 'Music platform? Game OS? Enterprise SaaS? White-label product? We map your requirements to the right surface and engine configuration.',
              },
              {
                step: '02',
                title: 'We configure your product line',
                body: 'We configure routing, auth, billing, AI engines, and domain mapping for your exact use case. SLA113 governs operations behind the scenes.',
              },
              {
                step: '03',
                title: 'You launch under your brand',
                body: 'Your domain. Your name. Your revenue. The infrastructure is Empire One\'s. The product is yours.',
              },
            ].map((row) => (
              <div key={row.step} className="bg-black p-8 md:p-10 hover:bg-white/[0.02] transition-colors">
                <p className="font-sans text-5xl font-black text-[#0f172a]/5 mb-6">{row.step}</p>
                <h3 className="text-lg font-black uppercase text-[#0f172a] tracking-tight mb-4">{row.title}</h3>
                <p className="font-sans text-[11px] text-[#0f172a]/50 leading-relaxed">{row.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLANS ── */}
        <section id="plans" className="px-6 md:px-12 py-20 border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">Plans</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-14">
            Pick your surface.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white">
            {[
              {
                node: 'ALPHA',
                target: 'Solo operator',
                price: '$499',
                period: '/mo',
                desc: 'One product surface, standard engine access, managed deployment.',
                features: [
                  'One tenant / domain',
                  '5 AI engines',
                  'Standard deployment',
                  'Lyrica 3 or Arcade (choose one)',
                  'Email support',
                ],
                active: false,
              },
              {
                node: 'OMEGA',
                target: 'Agency / scale',
                price: '$1,499',
                period: '/mo',
                desc: 'Multi-tenant, white-label core, full API access. The workhorse.',
                features: [
                  'Multi-tenant / multiple domains',
                  '50+ pipeline engines',
                  'White-label routing + RBAC',
                  'Lyrica 3 + Arcade + SaaS',
                  'SLA113 operator console',
                  'Priority support',
                ],
                active: true,
              },
              {
                node: 'SOVEREIGN',
                target: 'Enterprise',
                price: '$4,999',
                period: '/mo',
                desc: 'Unlimited builds, dedicated engineering, SLA uptime guarantees.',
                features: [
                  'Unlimited tenants + domains',
                  'All 20 engines + custom engines',
                  'Dedicated infra + GPU allocation',
                  'Full platform + all surfaces',
                  'Dedicated engineering',
                  '99.99% SLA uptime',
                ],
                active: false,
              },
            ].map((plan) => (
              <div
                key={plan.node}
                className={`bg-black p-8 md:p-10 flex flex-col relative ${plan.active ? 'ring-1 ring-[#00e5ff]/40' : ''}`}
              >
                {plan.active && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent" />
                )}
                {plan.active && (
                  <span className="absolute top-4 right-4 font-sans text-[8px] text-[#0ea5e9] border border-[#00e5ff]/30 px-2 py-1 uppercase tracking-widest">
                    Most Popular
                  </span>
                )}
                <p className="font-sans text-[9px] text-[#0f172a]/30 uppercase tracking-widest mb-2">Node: {plan.node}</p>
                <p className="font-sans text-[10px] text-[#0ea5e9] mb-6">{plan.target}</p>
                <div className="mb-2">
                  <span className="text-4xl font-black text-[#0f172a]">{plan.price}</span>
                  <span className="font-sans text-[11px] text-[#0f172a]/40">{plan.period}</span>
                </div>
                <p className="font-sans text-[11px] text-[#0f172a]/40 mb-8 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-3 flex-grow mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 font-sans text-[11px] text-[#0f172a]/60">
                      <span className="text-[#0ea5e9] mt-[1px]">+</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className={`w-full py-3 font-sans text-[10px] uppercase tracking-[2px] border transition-colors ${
                    plan.active
                      ? 'bg-[#00e5ff] border-[#00e5ff] text-black hover:bg-white hover:border-white'
                      : 'border-white/20 text-[#0f172a] hover:border-[#00e5ff] hover:text-[#0ea5e9]'
                  }`}
                >
                  Get Started →
                </button>
              </div>
            ))}
          </div>
          <div className="mt-px bg-black border-t border-slate-200/80 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="font-sans text-[11px] text-[#0f172a]/40">
              Custom scope available — $2,500–$6,500+ for bespoke builds. Tell us your workload.
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="font-sans text-[10px] text-[#0ea5e9] border border-[#00e5ff]/30 px-5 py-2 hover:bg-[#00e5ff]/10 transition-colors"
            >
              Inquire Custom Build →
            </button>
          </div>
        </section>

        {/* ── INVESTOR / TRACTION ── */}
        <section className="px-6 md:px-12 py-20 border-b border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-4">Traction</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-[#0f172a] tracking-tight mb-6">
              Building the<br />
              <span className="text-[#0ea5e9]">Creator-Owned<br />AI Music category.</span>
            </h2>
            <p className="font-sans text-sm text-[#0f172a]/55 leading-relaxed max-w-md mb-8">
              Lyrica 3 Pro is the first AI music platform where creators own their IP and earn passive income on every derivative work. We're raising a $2M seed round to reach $5M ARR and 100k MAU in Year 1.
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="font-sans text-[11px] text-[#0ea5e9] border border-[#00e5ff]/30 px-6 py-3 hover:bg-[#00e5ff]/10 transition-colors uppercase tracking-widest"
            >
              Talk to the team →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white">
            {[
              { value: '$5M', label: 'Year 1 Revenue Target' },
              { value: '100k', label: 'Year 1 MAU Target' },
              { value: '$75M', label: 'Year 3 Revenue Projection' },
              { value: '$2M', label: 'Seed Round' },
            ].map((s) => (
              <div key={s.label} className="bg-black p-8 hover:bg-white/[0.02] transition-colors">
                <p className="text-4xl font-black text-[#0ea5e9] mb-2">{s.value}</p>
                <p className="font-sans text-[10px] text-[#0f172a]/40 uppercase tracking-widest leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section className="px-6 md:px-12 py-24 text-center border-b border-slate-200/80">
          <p className="font-sans text-[10px] text-[#0ea5e9] uppercase tracking-[0.2em] mb-6">Ready?</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-[#0f172a] tracking-tight mb-8">
            Let's build<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#ffffff60]">
              your platform.
            </span>
          </h2>
          <p className="font-sans text-sm text-[#0f172a]/50 max-w-lg mx-auto mb-10">
            Operator, creator, enterprise, or investor — if you're serious about launching revenue products, let's talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-[#00e5ff] text-black font-sans font-black text-[11px] uppercase tracking-[3px] px-10 py-4 hover:bg-white transition-colors"
            >
              Start the conversation →
            </button>
            <Link
              href="/admin/login"
              className="border border-white/20 text-[#0f172a] font-sans text-[11px] uppercase tracking-[3px] px-10 py-4 hover:border-[#00e5ff] hover:text-[#0ea5e9] transition-colors text-center"
            >
              Operator Login →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-6 md:px-12 py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <p className="font-sans text-[10px] text-[#0f172a]/30 uppercase tracking-widest">Empire One</p>
            <p className="font-sans text-[9px] text-[#0f172a]/20 mt-1">Governed by SLA-113 · All rights reserved</p>
          </div>
          <div className="flex flex-wrap gap-6 font-sans text-[9px] text-[#0f172a]/30 uppercase tracking-widest">
            <a href="https://lyrica3.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0ea5e9] transition-colors">Lyrica 3 Pro</a>
            <a href="https://southernlifestyle.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#0ea5e9] transition-colors">Southern Arcade</a>
            <Link href="/admin/login" className="hover:text-[#0ea5e9] transition-colors">Operator Console</Link>
          </div>
        </footer>

      </div>

      {/* ── COM LINK CHAT ── */}
      <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-300 ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="w-[340px] md:w-[420px] h-[500px] bg-[#02040a] border border-[#00e5ff]/30 shadow-[0_0_40px_rgba(0,229,255,0.08)] flex flex-col">
          <div className="h-10 bg-[#00e5ff]/10 border-b border-[#00e5ff]/20 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-pulse" />
              <span className="font-sans text-[9px] text-[#0ea5e9] uppercase tracking-widest">Empire One // Uplink</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-[#0ea5e9]/40 hover:text-[#0ea5e9] transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-black/60 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] p-3 font-sans text-[10px] border ${
                  msg.role === 'user'
                    ? 'bg-white border-white/15 text-[#0f172a]'
                    : 'bg-[#00e5ff]/5 border-[#00e5ff]/25 text-[#0ea5e9]'
                }`}>
                  <span className="block text-[7px] opacity-40 mb-1.5 uppercase tracking-widest">
                    {msg.role === 'user' ? 'You' : 'Empire One'}
                  </span>
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-3 border bg-[#00e5ff]/5 border-[#00e5ff]/25 font-sans text-[10px] text-[#0ea5e9] animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-[#00e5ff]/20 bg-black">
            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="What are you building?"
                className="flex-grow bg-black border border-slate-200 px-3 py-2 font-sans text-[10px] text-[#0f172a] placeholder:text-[#0f172a]/20 focus:outline-none focus:border-[#00e5ff]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="w-10 h-9 bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-[#0ea5e9] flex items-center justify-center hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating chat toggle */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-black border border-[#00e5ff]/40 text-[#0ea5e9] px-4 py-3 flex items-center gap-2 hover:bg-[#00e5ff]/10 transition-all duration-300 ${isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Terminal size={14} />
        <span className="font-sans text-[9px] uppercase tracking-[2px]">Talk to us</span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00e5ff; }
        @keyframes scrollTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      ` }} />
    </div>
  );
};

export default EmpireHome;
