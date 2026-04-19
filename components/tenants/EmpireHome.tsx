'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Network, Terminal, Send, Code, Maximize, X, Cpu, Music, Mic2, Gamepad2, Shield, BarChart3, Sparkles } from 'lucide-react';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const HAS_GEMINI = Boolean(GOOGLE_API_KEY);

/**
 * EMPIRE ONE // OS_FACTORY_HUD + Product Launch Blueprint
 * Main landing experience for empire1.cloud
 */
const EmpireHome = () => {
  const [protocolInput, setProtocolInput] = useState("");
  const [protocolOutput, setProtocolOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // OS Build Compiler State
  const [rawInfra, setRawInfra] = useState("");
  const [compiledManifest, setCompiledManifest] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  // Logistics Desk Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "system", text: "SYS.COMM.LINK // SECURE_SOCKET_ESTABLISHED\n> WAITING FOR OPERATOR DIRECTIVE..." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [allocateBanner, setAllocateBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!HAS_GEMINI) {
      console.warn("SYS.NOTICE // NEXT_PUBLIC_GOOGLE_API_KEY not set — AI terminals use offline mode");
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const fallbackProtocol = (input: string) =>
    `DEPLOYMENT_MATRIX // OFFLINE_MODE\n\n` +
    `INPUT: "${input.slice(0, 200)}${input.length > 200 ? '...' : ''}"\n\n` +
    `RECOMMENDED_NODE: OMEGA (AGENCY_SCALE)\n` +
    `• HYBRID_AI_STACK: 19 engines (strategy, pipelines, analytics, voice, vision)\n` +
    `• LYRICA_3: Voice synthesis, humanized beats, DNA-tagged stems\n` +
    `• MULTI_TENANT: White-label routing + RBAC\n` +
    `• RENDER_TIERS: DRAFT / PREVIEW / FINAL (cost-transparent GPU)\n\n` +
    `> SET NEXT_PUBLIC_GOOGLE_API_KEY FOR LIVE GEMINI ARCHITECT.\n` +
    `> COM_LINK STILL OPERATIONAL FOR OFFLINE Q&A.`;

  const fallbackManifest = (raw: string) =>
    JSON.stringify({
      sys_target: "empire_one_platform",
      compute_nodes_req: 3,
      active_scripts: ["hybrid_api", "lyrica_agents", "admin_console"],
      deploy_env: "multi_tenant_cloud_run",
      est_cycle_time: "48h pilot",
      input_digest: raw.slice(0, 120),
      offline_mode: !HAS_GEMINI,
    }, null, 2);

  const fallbackChatReply = (userMessage: string) =>
    `[EMPIRE_ONE // OFFLINE_ENGINE]\n` +
    `Received: "${userMessage}"\n\n` +
    `Empire One ships: white-label OS, 19 AI engines, Lyrica 3 (music/voice), SLA113 admin, Southern Arcade.\n` +
    `For live AI responses, configure NEXT_PUBLIC_GOOGLE_API_KEY in Cloud Run.\n` +
    `Or email your operator for a pilot slot.`;

  // 1. Gemini API: Infrastructure Architect
  const generateProtocol = async () => {
    if (!protocolInput.trim()) return;
    
    setIsGenerating(true);
    setProtocolOutput("> SYS.INIT // ARCHITECT_MODULE...\n> ANALYZING INFRASTRUCTURE VECTORS...\n> COMPILING DEPLOYMENT MATRIX...");

    if (!HAS_GEMINI) {
      await new Promise((r) => setTimeout(r, 400));
      setProtocolOutput(fallbackProtocol(protocolInput));
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the EMPIRE 1 OS Factory Intelligence. A user is describing an infrastructure requirement: "${protocolInput}". 
              Provide a professional, industrial-grade deployment pipeline in a structured list format. 
              Map their needs to one of our tiers (NODE: ALPHA, NODE: OMEGA, or NODE: SOVEREIGN).
              Use terminology like "OS Templates," "Automation Builder," "Multi-Tenant Environment," and "White-Label Nodes." 
              Keep the tone elite, robotic, and highly technical.`
            }]
          }],
          systemInstruction: {
            parts: [{ text: "You are the EMPIRE 1 DevOps Architect. Your responses must be structured, professional, and formatted for a raw command terminal. Use ALL CAPS for headers. Speak in terms of compute, nodes, OS builds, and IaaS." }]
          }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      setProtocolOutput("");
      let currentText = "";
      const fullText = text || "ERR_SYS_LINK_SEVERED";
      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i];
        setProtocolOutput(currentText);
        await new Promise(r => setTimeout(r, 5)); // Fast typewriter
      }
    } catch (error) {
      setProtocolOutput("ERR_TIMEOUT // HANDSHAKE_FAILED. RETRY.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Gemini API: OS Build Compiler
  const runCompilation = async () => {
    if (!rawInfra.trim()) return;
    
    setIsCompiling(true);
    setCompiledManifest("> FACTORY_ENGAGED...\n> PROVISIONING_ENV...\n> GENERATING_JSON_MANIFEST...");

    if (!HAS_GEMINI) {
      await new Promise((r) => setTimeout(r, 400));
      setCompiledManifest(fallbackManifest(rawInfra));
      setIsCompiling(false);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert this raw user requirement into a strict JSON infrastructure manifest: "${rawInfra}". 
              Output ONLY a clean JSON object containing: { "sys_target": "", "compute_nodes_req": 0, "active_scripts": [], "deploy_env": "", "est_cycle_time": "" }. Do not include markdown formatting ticks like \`\`\`json.`
            }]
          }],
          systemInstruction: {
            parts: [{ text: "You are the EMPIRE 1 Build Compiler. Convert text into strict, actionable JSON." }]
          }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      try {
        const parsed = JSON.parse(text);
        setCompiledManifest(JSON.stringify(parsed, null, 2));
      } catch (e) {
        setCompiledManifest(text || "ERR_PARSE_FAILED.");
      }
    } catch (error) {
      setCompiledManifest(`{\n  "SYS_STATUS": "FAILED",\n  "ERR_CODE": "0x89F2"\n}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // 3. Gemini API: Chat Terminal
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: `> ${userMessage}` }]);
    setIsChatLoading(true);

    if (!HAS_GEMINI) {
      await new Promise((r) => setTimeout(r, 350));
      setChatMessages(prev => [...prev, { role: "system", text: fallbackChatReply(userMessage) }]);
      setIsChatLoading(false);
      return;
    }

    try {
      const formattedHistory = chatMessages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }));

      formattedHistory.push({ role: "user", parts: [{ text: userMessage }] });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedHistory,
          systemInstruction: {
            parts: [{ text: "You are the EMPIRE 1 Platform Engineer AI. Assist enterprise clients with OS Factory infrastructure. Tone: Elite, DevOps-focused, highly robotic, industrial. Use brackets [ ] for emphasis. Never break character." }]
          }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatMessages(prev => [...prev, { role: "system", text: text || "ERR_NO_RESPONSE" }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "system", text: "ERR_TRANSMISSION_FAILED" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Canvas Network Effect
  useEffect(() => {
    const canvas = document.getElementById('hud-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width: number, height: number;
    let particles: Particle[] = [];

    const resize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number; y: number; vx: number; vy: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if(this.x < 0 || this.x > width) this.vx *= -1;
        if(this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.fill();
      }
    }

    for(let i=0; i<40; i++) particles.push(new Particle());

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;
      for(let x=0; x<width; x+=50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for(let y=0; y<height; y+=50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

      for(let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for(let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 - dist/500})`;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const onAllocateNode = (nodeId: string, priceLabel: string) => {
    setAllocateBanner(`NODE ${nodeId} SELECTED — ${priceLabel}. Next: checkout or operator call.`);
    setIsChatOpen(true);
    setChatMessages((prev) => [
      ...prev,
      {
        role: "system",
        text:
          `ALLOCATION_QUEUE // ${nodeId}\n` +
          `> Reply with: TEAM_SIZE, REGIONS, COMPLIANCE (HIPAA/SOC2), and TARGET_GO_LIVE_DATE.\n` +
          `> Or visit /admin after login for SLA113 operator console.`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-[#e0e0e0] font-sans selection:bg-[#00e5ff] selection:text-black relative overflow-x-hidden">
      
      {/* ========================================
        GLOBAL HUD ELEMENTS 
        ========================================
      */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[9999]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="fixed top-0 left-0 w-full h-[15vh] bg-gradient-to-b from-[#00e5ff]/5 to-transparent pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-[#00e5ff]/5 to-transparent pointer-events-none z-0"></div>
      
      {/* Scanning Radar Line */}
      <div className="fixed w-full h-32 bg-gradient-to-b from-transparent via-[#00e5ff]/5 to-transparent opacity-30 pointer-events-none z-50 animate-[scanline_8s_linear_infinite]"></div>

      {/* Top Telemetry Strip */}
      <div className="fixed top-0 w-full bg-[#000] border-b border-[#00e5ff]/20 z-[100] py-1 flex font-mono text-[9px] text-[#00e5ff] uppercase tracking-widest overflow-hidden">
        <div className="inline-block animate-[scrollTicker_30s_linear_infinite] whitespace-nowrap">
            [SYS.UPTIME: 99.999%] <span className="mx-6 text-white/20">|</span> 
            [OS_BUILDS: 142] <span className="mx-6 text-white/20">|</span> 
            [ACTIVE_NODES: 1,024] <span className="mx-6 text-white/20">|</span> 
            [GLOBAL_LATENCY: 12MS] <span className="mx-6 text-white/20">|</span> 
            [SEC_LEVEL: MAXIMUM] <span className="mx-6 text-white/20">|</span> 
            [SYS.UPTIME: 99.999%] <span className="mx-6 text-white/20">|</span> 
            [OS_BUILDS: 142] <span className="mx-6 text-white/20">|</span> 
            [ACTIVE_NODES: 1,024] <span className="mx-6 text-white/20">|</span> 
            [GLOBAL_LATENCY: 12MS] <span className="mx-6 text-white/20">|</span> 
            [SEC_LEVEL: MAXIMUM]
        </div>
      </div>

      {/* Main Container - Asymmetrical HUD Layout */}
      <div className="pt-16 px-4 md:px-8 pb-32 max-w-[1600px] mx-auto relative z-10">
        
        {/* Top Header Grid */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-3 border border-[#00e5ff]/20 bg-black/40 p-4 relative tech-border">
            <span className="block text-[10px] font-mono text-[#00e5ff] mb-1">ID // EMPIRE_ONE</span>
            <h1 className="text-xl font-black tracking-widest text-white uppercase">OS + AI + AUDIO</h1>
            <p className="text-[9px] font-mono text-white/40 mt-2 leading-relaxed">White-label platform · Hybrid intelligence · Lyrica 3 · Arcade</p>
          </div>
          <div className="hidden lg:flex lg:col-span-7 border border-[#00e5ff]/20 bg-black/40 p-3 flex-wrap gap-x-4 gap-y-2 items-center tech-border font-mono text-[9px] text-white/50 tracking-widest">
            <a href="#stack" className="hover:text-[#00e5ff] transition-colors">[ PRODUCT_STACK ]</a>
            <a href="#blueprint" className="hover:text-[#00e5ff] transition-colors">[ LAUNCH_BLUEPRINT ]</a>
            <a href="#resources" className="hover:text-[#00e5ff] transition-colors">[ RESOURCES ]</a>
            <a href="#compiler" className="hover:text-[#00e5ff] transition-colors">[ COMPILER ]</a>
            <a href="#architect" className="hover:text-[#00e5ff] transition-colors">[ ARCHITECT ]</a>
            <a href="#matrix" className="hover:text-[#00e5ff] transition-colors">[ PLANS ]</a>
          </div>
          <Link href="/admin/login" className="lg:col-span-2 border border-[#00e5ff]/20 bg-[#00e5ff]/10 p-4 flex items-center justify-center tech-border hover:bg-[#00e5ff]/20 transition-colors">
            <span className="text-[10px] font-mono text-[#00e5ff] font-bold tracking-widest uppercase">
              &gt; OPERATOR_LOGIN
            </span>
          </Link>
        </header>

        {!HAS_GEMINI && (
          <div className="mb-4 border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-mono text-[10px] text-amber-200/90">
            SYS.NOTICE // AI terminals in offline mode (set NEXT_PUBLIC_GOOGLE_API_KEY for live Gemini). Compiler &amp; Architect still return structured Empire output.
          </div>
        )}

        {allocateBanner && (
          <div className="mb-4 border border-[#00e5ff]/40 bg-[#00e5ff]/10 px-4 py-3 font-mono text-[10px] text-[#00e5ff]">
            {allocateBanner}
          </div>
        )}

        {/* Hero Section - HUD Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 min-h-[50vh]">
          {/* Left Readout */}
          <div className="lg:col-span-5 flex flex-col justify-end border border-[#00e5ff]/20 bg-black/60 p-8 tech-border relative overflow-hidden">
            <div className="absolute top-4 left-4 text-[9px] font-mono text-[#00e5ff]/40">SEC: 01 // PRODUCT_OVERVIEW</div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none mb-4">
              THE OS THAT<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-white/50">SHIPS AI.</span>
            </h2>
            <p className="font-mono text-xs text-white/70 leading-relaxed mb-6 max-w-lg border-l-2 border-[#00e5ff]/50 pl-4">
              Empire One is a multi-tenant white-label platform: <strong className="text-white">19 hybrid AI engines</strong>, team &amp; billing, real-time analytics, <strong className="text-white">Lyrica 3</strong> for voice &amp; music production, <strong className="text-white">SLA113</strong> operator console, and <strong className="text-white">Southern Lyfestyle Arcade</strong> for public gaming experiences — not just &quot;infrastructure copy,&quot; the full stack.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { href: '#stack', label: '[ PRODUCT_STACK ]' },
                { href: '#blueprint', label: '[ LAUNCH_BLUEPRINT ]' },
                { href: '#resources', label: '[ RESOURCES ]' },
                { href: '#matrix', label: '[ PLANS ]' },
              ].map((q) => (
                <a
                  key={q.href}
                  href={q.href}
                  className="px-3 py-1.5 border border-white/15 text-[9px] font-mono text-white/60 hover:border-[#00e5ff]/50 hover:text-[#00e5ff] transition-colors uppercase tracking-wider"
                >
                  {q.label}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#matrix" className="flex-1 bg-[#00e5ff] text-black font-mono font-bold text-[10px] uppercase tracking-[3px] py-4 text-center hover:bg-white transition-colors">
                [ VIEW_PLANS ]
              </a>
              <button type="button" onClick={() => setIsChatOpen(true)} className="flex-1 border border-[#00e5ff]/30 text-[#00e5ff] font-mono font-bold text-[10px] uppercase tracking-[3px] py-4 text-center hover:bg-[#00e5ff]/10 transition-colors">
                [ COM_LINK ]
              </button>
            </div>
          </div>

          {/* Right Canvas Terminal */}
          <div className="lg:col-span-7 border border-[#00e5ff]/20 bg-black p-1 tech-border relative h-[50vh] lg:h-auto">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
               <div className="w-2 h-2 bg-[#00e5ff] animate-pulse"></div>
               <span className="text-[9px] font-mono text-[#00e5ff]">LIVE_NETWORK_TOPOLOGY</span>
             </div>
             <div className="absolute bottom-4 right-4 z-10 text-[9px] font-mono text-white/30 text-right">
               COORD: {Math.random().toFixed(4)}<br/>
               STATUS: OPTIMAL
             </div>
             {/* Reticles */}
             <Maximize size={16} className="absolute top-4 right-4 text-[#00e5ff]/30 z-10" />
             <Maximize size={16} className="absolute bottom-4 left-4 text-[#00e5ff]/30 z-10" />
             
             <div className="w-full h-full relative overflow-hidden bg-[#010204]">
                <canvas id="hud-canvas" className="w-full h-full opacity-80"></canvas>
             </div>
          </div>
        </section>

        {/* Product stack — what Empire actually ships */}
        <section id="stack" className="mb-4 border border-[#00e5ff]/20 bg-black/40 p-1 tech-border">
          <div className="bg-[#00e5ff]/5 border-b border-[#00e5ff]/20 p-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Sparkles size={14} className="text-[#00e5ff]" />
              PRODUCT_STACK
            </h2>
            <span className="text-[9px] font-mono text-white/45">HYBRID_OS · LYRICA · ARCADE · ADMIN</span>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              {
                icon: Cpu,
                code: 'ENG-19',
                title: 'HYBRID_INTELLIGENCE',
                body: 'Nineteen production engines: strategy, pipelines, analytics, vision, and voice — exposed through a unified API surface for tenants.',
              },
              {
                icon: Music,
                code: 'LYR-3',
                title: 'LYRICA_3_PRO',
                body: 'Ghostwriter, MMA pocket humanization, PFA/PDA texture, DNA tagging, S2 disruption, render tiers (DRAFT / PREVIEW / FINAL), royalty ledger.',
              },
              {
                icon: Mic2,
                code: 'VOX',
                title: 'VOICE_SYNTHESIS',
                body: 'VoxCPM-class voice design and cloning paths, plus psychoacoustic FX chains for broadcast-grade stems.',
              },
              {
                icon: Gamepad2,
                code: 'ARC',
                title: 'SOUTHERN_ARCADE',
                body: 'Public gaming layer: tournaments, rewards, and branded experiences — same platform identity, different surface.',
              },
              {
                icon: Shield,
                code: 'SLA113',
                title: 'OPERATOR_CONSOLE',
                body: 'Multi-tenant admin: AI Studio, Stem Deck cockpit, billing hooks, and governance for agency-scale rollouts.',
              },
              {
                icon: BarChart3,
                code: 'ANA',
                title: 'REALTIME_ANALYTICS',
                body: 'Usage, cost, and quality signals across engines and render tiers so finance and product stay aligned.',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.code}
                  className="border border-white/10 bg-black/50 p-5 tech-border hover:border-[#00e5ff]/35 hover:bg-[#00e5ff]/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="text-[10px] font-mono text-[#00e5ff]">{card.code}</span>
                    <Icon size={18} className="text-[#00e5ff]/80 shrink-0" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">{card.title}</h3>
                  <p className="font-mono text-[10px] text-white/55 leading-relaxed">{card.body}</p>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#00e5ff]/20 px-4 py-4 md:px-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-black/60">
            <p className="font-mono text-[10px] text-white/50 max-w-2xl">
              &gt; Operators: open <Link href="/admin/login" className="text-[#00e5ff] hover:underline">/admin/login</Link>
              , then <Link href="/admin/stem-deck" className="text-[#00e5ff] hover:underline">Stem Deck</Link> for Lyrica cockpit.
            </p>
            <a
              href="#compiler"
              className="inline-flex justify-center border border-[#00e5ff]/40 text-[#00e5ff] px-4 py-2 font-mono text-[9px] tracking-widest uppercase hover:bg-[#00e5ff]/10 transition-colors"
            >
              [ TRY_COMPILER ]
            </a>
          </div>
        </section>

        {/* Launch blueprint — same structure as AI Product Launch, Empire-native */}
        <section id="blueprint" className="mb-4 border border-[#00e5ff]/20 bg-black/40 p-1 tech-border">
          <div className="bg-[#00e5ff]/5 border-b border-[#00e5ff]/20 p-4">
            <h2 className="text-sm font-black text-white tracking-widest uppercase">LAUNCH_BLUEPRINT</h2>
            <p className="font-mono text-[10px] text-white/45 mt-2 max-w-3xl">
              Seven-stage map from first conversation to revenue-bearing deployment — mirrors product-launch playbooks, wired to Empire modules.
            </p>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { step: '01', title: 'MARKET_VALIDATION', detail: 'Define ICP, compliance, and which engines (voice vs analytics vs arcade) ship in v1.' },
              { step: '02', title: 'PRODUCT_POSITIONING', detail: 'White-label story: tenant domains, SLA113 roles, and public vs operator surfaces.' },
              { step: '03', title: 'REVENUE_MODELS', detail: 'Subscriptions, usage-based GPU render, arcade credits, affiliate-style referral hooks.' },
              { step: '04', title: 'LAUNCH_EXECUTION', detail: 'Cloud Run / hybrid API, Mongo + Redis, environment matrix, smoke tests on critical paths.' },
              { step: '05', title: 'MARKETING_AND_SALES', detail: 'Landing narratives, Stem Deck demos, case studies, and partner onboarding scripts.' },
              { step: '06', title: 'FINANCIAL_PROJECTIONS', detail: 'Tie DRAFT/PREVIEW/FINAL tiers and stream assumptions to ledger math for stakeholder decks.' },
              { step: '07', title: 'RISK_MITIGATION', detail: 'Key custody, Atlas IP allowlists, API rate limits, and offline fallbacks when LLM keys are absent.' },
            ].map((row) => (
              <div key={row.step} className="flex gap-4 border border-white/10 bg-[#010204] p-4 tech-border">
                <span className="font-mono text-[10px] text-[#00e5ff] w-8 shrink-0">{row.step}</span>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-1">{row.title}</h3>
                  <p className="font-mono text-[10px] text-white/50 leading-relaxed">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources — deep links into this page + admin */}
        <section id="resources" className="mb-4 border border-[#00e5ff]/20 bg-black/40 p-1 tech-border">
          <div className="bg-[#00e5ff]/5 border-b border-[#00e5ff]/20 p-4">
            <h2 className="text-sm font-black text-white tracking-widest uppercase">RESOURCES</h2>
            <p className="font-mono text-[10px] text-white/45 mt-2">Templates and terminals on this domain — no external signup wall.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#00e5ff]/20">
            {[
              {
                title: 'CASE_STUDIES',
                body: 'Narrative slots for tenant wins — drop in metrics when cleared for public.',
                action: { href: '#matrix', label: '[ VIEW_PLANS ]' },
              },
              {
                title: 'DOWNLOADABLE_TEMPLATES',
                body: 'Compiler emits JSON manifests; copy into your runbooks or CI variables.',
                action: { href: '#compiler', label: '[ OPEN_COMPILER ]' },
              },
              {
                title: 'AI_PROMPT_LIBRARY',
                body: 'Architect terminal accepts goals and bottlenecks; reuse outputs in proposals.',
                action: { href: '#architect', label: '[ OPEN_ARCHITECT ]' },
              },
              {
                title: 'AFFILIATE_AND_REWARDS',
                body: 'Referral economics: bonus credits for invitees, recurring share for partners — configure per tenant.',
                action: { href: '#matrix', label: '[ TRACK_TYPES ]' },
              },
            ].map((r) => (
              <div key={r.title} className="p-6 flex flex-col gap-4 hover:bg-white/[0.02] transition-colors">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">{r.title}</h3>
                <p className="font-mono text-[10px] text-white/50 leading-relaxed flex-grow">{r.body}</p>
                <a
                  href={r.action.href}
                  className="inline-flex justify-center border border-white/20 text-[9px] font-mono text-[#00e5ff] py-2 tracking-widest uppercase hover:border-[#00e5ff]/60 hover:bg-[#00e5ff]/10 transition-colors"
                >
                  {r.action.label}
                </a>
              </div>
            ))}
          </div>
          <div className="border-t border-[#00e5ff]/20 p-4 md:p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-black/60">
            <span className="font-mono text-[10px] text-white/50">
              PLATFORM_MONETIZATION · ADMIN_AND_OPS · ANALYTICS_DASHBOARD · AI_CONTENT_ENGINE
            </span>
            <Link
              href="/admin/login"
              className="inline-flex justify-center border border-[#00e5ff]/40 text-[#00e5ff] px-4 py-2 font-mono text-[9px] tracking-widest uppercase hover:bg-[#00e5ff]/10 transition-colors text-center"
            >
              [ ADMIN_CONSOLE ]
            </Link>
          </div>
        </section>

        {/* Live Compiler & Architect Split */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* OS Build Compiler */}
          <div id="compiler" className="border border-[#00e5ff]/20 bg-black p-1 tech-border flex flex-col">
            <div className="bg-[#00e5ff]/10 border-b border-[#00e5ff]/20 p-3 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase tracking-widest flex items-center gap-2">
                <Code size={12}/> COMPILER_TERMINAL
              </span>
              <span className="text-[9px] font-mono text-white/40">v2.1.0</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <textarea 
                value={rawInfra}
                onChange={(e) => setRawInfra(e.target.value)}
                className="w-full bg-transparent border border-white/10 p-4 font-mono text-[11px] text-[#00e5ff]/80 focus:outline-none focus:border-[#00e5ff]/50 transition-all resize-none mb-4 min-h-[120px] placeholder:text-[#00e5ff]/20"
                placeholder="> INPUT RAW INFRA REQUIREMENTS..."
              />
              <button 
                onClick={runCompilation}
                disabled={isCompiling}
                className="w-full py-3 border border-[#00e5ff]/40 text-[#00e5ff] font-mono text-[10px] tracking-widest uppercase hover:bg-[#00e5ff] hover:text-black transition-all mb-4"
              >
                {isCompiling ? "[ EXECUTING... ]" : "[ GENERATE_MANIFEST ]"}
              </button>
              <div className="flex-grow bg-[#010204] border border-[#00e5ff]/20 p-4 overflow-auto min-h-[150px] relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-30"></div>
                <pre className="font-mono text-[10px] text-[#00e5ff] leading-relaxed whitespace-pre-wrap">
                  {compiledManifest || "> WAITING FOR COMPILE DIRECTIVE..."}
                </pre>
              </div>
            </div>
          </div>

          {/* Infrastructure Architect */}
          <div id="architect" className="border border-[#00e5ff]/20 bg-black p-1 tech-border flex flex-col">
            <div className="bg-[#00e5ff]/10 border-b border-[#00e5ff]/20 p-3 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase tracking-widest flex items-center gap-2">
                <Network size={12}/> ARCHITECT_AI
              </span>
              <span className="text-[9px] font-mono text-white/40">ONLINE</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
               <textarea 
                value={protocolInput}
                onChange={(e) => setProtocolInput(e.target.value)}
                className="w-full bg-transparent border border-white/10 p-4 font-mono text-[11px] text-white focus:outline-none focus:border-[#00e5ff]/50 transition-all resize-none mb-4 min-h-[120px] placeholder:text-white/20"
                placeholder="> INPUT OPERATIONAL GOAL OR BOTTLENECK..."
              />
              <button 
                onClick={generateProtocol}
                disabled={isGenerating}
                className="w-full py-3 bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] font-mono text-[10px] tracking-widest uppercase hover:bg-[#00e5ff] hover:text-black transition-all mb-4"
              >
                {isGenerating ? "[ QUERYING_CORE... ]" : "[ REQUEST_PROTOCOL ]"}
              </button>
              <div className="flex-grow bg-[#010204] border border-[#00e5ff]/20 p-4 overflow-auto min-h-[150px] relative">
                <pre className="font-mono text-[10px] text-white/80 leading-relaxed whitespace-pre-wrap">
                  {protocolOutput || "> STANDING BY..."}
                  {isGenerating && <span className="terminal-cursor"></span>}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Allocation Matrix (Pricing) */}
        <section id="matrix" className="border border-[#00e5ff]/20 bg-black/40 p-1 tech-border mb-4">
          <div className="bg-[#00e5ff]/5 border-b border-[#00e5ff]/20 p-4">
            <h2 className="text-sm font-black text-white tracking-widest uppercase">RESOURCE_ALLOCATION_MATRIX</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#00e5ff]/20">
            {[
              { id: "ALPHA", target: "SOLO_OP", price: "0x01F3 // $499", features: ["OS_TEMPLATES", "AUTO_BUILDER", "STD_DEPLOYMENT"] },
              { id: "OMEGA", target: "AGENCY_SCALE", price: "0x05DB // $1,499", active: true, features: ["MULTI_TENANT_OS", "WHITE_LABEL_CORE", "FULL_API_ACCESS"] },
              { id: "SOVEREIGN", target: "ENTERPRISE", price: "0x1387 // $4,999", features: ["UNLIMITED_BUILDS", "DEDICATED_ENG", "SLA_UPTIME"] }
            ].map((node, i) => (
              <div key={i} className={`p-8 relative ${node.active ? 'bg-[#00e5ff]/5 shadow-[inset_0_0_50px_rgba(0,229,255,0.05)]' : 'hover:bg-white/[0.02]'}`}>
                {node.active && <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00e5ff]"></div>}
                
                <div className="text-[9px] font-mono text-[#00e5ff] mb-2">NODE: {node.id}</div>
                <div className="text-[10px] font-mono text-white/40 mb-8">TARGET: {node.target}</div>
                
                <div className="text-2xl font-mono font-bold text-white mb-8 border-l-2 border-[#00e5ff] pl-4">
                  {node.price}
                </div>
                
                <div className="space-y-3 mb-12">
                  {node.features.map((f, idx) => (
                    <div key={idx} className="font-mono text-[9px] text-white/60 tracking-widest flex items-center gap-2">
                      <span className="text-[#00e5ff]">+</span> {f}
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => onAllocateNode(node.id, node.price)}
                  className={`w-full py-3 font-mono text-[10px] tracking-widest uppercase border ${node.active ? 'bg-[#00e5ff] border-[#00e5ff] text-black hover:bg-white hover:border-white' : 'border-white/20 text-white hover:border-[#00e5ff] hover:text-[#00e5ff]'} transition-colors`}
                >
                  [ ALLOCATE_NODE ]
                </button>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#00e5ff]/20 bg-black p-6 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="font-mono text-[10px] text-white/50 tracking-widest">
               &gt; CUSTOM_BUILDS: 0x09C4 - 0x1964 ($2,500 - $6,500)
             </div>
             <button
               type="button"
               onClick={() => {
                 setAllocateBanner('CUSTOM_BUILD // Operator queue opened — describe workload class + compliance in COM_LINK.');
                 setIsChatOpen(true);
                 setChatMessages((prev) => [
                   ...prev,
                   {
                     role: 'system',
                     text:
                       'CUSTOM_BUILD_QUEUE // EMPIRE_ONE\n' +
                       '> Reply with: peak MAU, GPU hours/mo, regions, HIPAA/SOC2, and integrations (Stripe, Vertex, Modal).\n' +
                       '> We return a fixed-scope statement of work + node sizing (ALPHA / OMEGA / SOVEREIGN).',
                   },
                 ]);
               }}
               className="border border-[#00e5ff]/40 text-[#00e5ff] px-6 py-2 font-mono text-[9px] tracking-widest hover:bg-[#00e5ff]/10 transition-colors"
             >
               [ INQUIRE_MANUAL_BUILD ]
             </button>
          </div>
        </section>

      </div>

      {/* Logistics Desk Floating Terminal */}
      <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-300 ease-in-out ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="w-[350px] md:w-[450px] h-[500px] bg-black border border-[#00e5ff]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] flex flex-col tech-border relative">
          {/* Header */}
          <div className="h-10 bg-[#00e5ff]/10 border-b border-[#00e5ff]/20 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00e5ff] animate-pulse"></div>
              <span className="text-[9px] font-mono font-bold tracking-[2px] text-[#00e5ff]">PLATFORM_ENG_UPLINK</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-[#00e5ff]/50 hover:text-[#00e5ff] transition-colors">
              <X size={14} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 font-mono text-[10px] flex flex-col gap-4 custom-scrollbar bg-[#010204]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 border ${
                  msg.role === 'user' 
                  ? 'bg-white/5 border-white/20 text-white' 
                  : 'bg-[#00e5ff]/5 border-[#00e5ff]/30 text-[#00e5ff]'
                }`}>
                  <span className="block text-[7px] opacity-50 mb-2 uppercase tracking-widest border-b border-inherit pb-1">
                    {msg.role === 'user' ? 'OP_INPUT' : 'SYS_RESPONSE'}
                  </span>
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[90%] p-3 border bg-[#00e5ff]/5 border-[#00e5ff]/30 text-[#00e5ff]">
                   <span className="animate-pulse">&gt; COMPILING_DATA...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-black border-t border-[#00e5ff]/20">
            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="> ENTER_COMMAND..."
                className="flex-grow bg-[#010204] border border-[#00e5ff]/20 px-3 text-[10px] font-mono text-[#00e5ff] focus:outline-none focus:border-[#00e5ff] transition-colors"
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()}
                className="w-10 h-10 bg-[#00e5ff]/20 border border-[#00e5ff]/50 text-[#00e5ff] flex justify-center items-center hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-black border border-[#00e5ff]/50 text-[#00e5ff] px-4 py-3 flex items-center gap-2 hover:bg-[#00e5ff]/10 transition-all duration-300 tech-border ${isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Terminal size={14} />
        <span className="text-[9px] font-mono font-bold tracking-[2px]">[ OPEN_COM_LINK ]</span>
      </button>

      {/* Internal CSS Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00e5ff; }
        
        .tech-border { position: relative; }
        .tech-border::before, .tech-border::after {
            content: ''; position: absolute; width: 6px; height: 6px; border: 1px solid #00e5ff; pointer-events: none;
        }
        .tech-border::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .tech-border::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        @keyframes scrollTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes scanline { 0% { top: -100px; } 100% { top: 100vh; } }
      `}} />
    </div>
  );
};

export default EmpireHome;
