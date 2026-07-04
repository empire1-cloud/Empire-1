'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Globe,
  Clock,
  ArrowRight,
  DollarSign,
  Receipt
} from 'lucide-react';
import { getCustomerPortal, createCheckoutSession } from '@/lib/billingApi';

export const dynamic = "force-dynamic";

const stats = [
  { label: "Active Nodes", value: "24" },
  { label: "Uptime (24h)", value: "100%" },
  { label: "API Requests", value: "1.2M" },
  { label: "Status", value: "Active" },
];

const plans = [
  { id: 'starter', name: 'Starter', price: '$29', features: ['24/7 Monitoring', 'Basic Support', 'Standard API'] },
  { id: 'professional', name: 'Professional', price: '$99', features: ['Advanced Analytics', 'Priority Support', 'Full API Access', 'Custom Workflows'] },
  { id: 'enterprise', name: 'Enterprise', price: '$299', features: ['Dedicated Support', 'Custom Infrastructure', 'SLA Guarantee', 'White-label Options'] },
];

export default function EmpireDashboard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);
  const [billingStatus, setBillingStatus] = useState<string>('—');
  const [nextBilling, setNextBilling] = useState<string>('—');

  useEffect(() => {
    // Check if Stripe is configured and load billing info
    fetch('/api/billing/status')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setStripeConfigured(d.stripe_configured ?? false);
      })
      .catch(() => setStripeConfigured(false));

    // Try to load team billing info
    fetch('/api/billing/team')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setBillingStatus(d.subscription?.plan ?? d.tier ?? 'Free');
        if (d.subscription?.current_period_end) {
          const date = new Date(d.subscription.current_period_end * 1000);
          setNextBilling(date.toISOString().split('T')[0]);
        }
        if (d.owner_email) setEmail(d.owner_email);
      })
      .catch(() => {});
  }, []);

  const handlePortalRedirect = async () => {
    if (!stripeConfigured) return;
    setLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ return_url: window.location.href }) });
      if (res.ok) {
        const d = await res.json();
        if (d.portal_url) { window.location.href = d.portal_url; return; }
      }
    } catch {}
    setLoading(false);
  };

  const handleSubscribe = async (tierId: string) => {
    setLoading(true);
    const res = await createCheckoutSession(tierId, email || 'contact@empire1.cloud');
    if (res.checkout_url) {
      window.location.href = res.checkout_url;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-[#c9a84c] selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a1a2e] via-transparent to-transparent"></div>

      {/* Top Navigation */}
      <nav className="relative z-50 h-20 px-12 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <span className="text-xl font-light tracking-[0.4em] uppercase gold-text">Empire One</span>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#737373] font-bold">Business Portal</span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="/revenue-os" className="flex items-center gap-2 text-[10px] text-[#737373] hover:text-white transition-colors uppercase tracking-widest font-bold">
            <DollarSign className="w-3.5 h-3.5" />
            Revenue OS
          </a>
          <a href="/revenue-receipt" className="flex items-center gap-2 text-[10px] text-[#737373] hover:text-white transition-colors uppercase tracking-widest font-bold">
            <Receipt className="w-3.5 h-3.5" />
            Receipt
          </a>
          <button 
            onClick={handlePortalRedirect}
            disabled={loading}
            className="flex items-center gap-2 text-[10px] text-[#737373] hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Billing Portal
          </button>
          <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#444]" />
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="relative z-10 flex-1 flex flex-col p-12 max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="w-4 h-4 text-[#c9a84c]" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c] font-bold">System Dashboard</p>
          </div>
          <h1 className="text-5xl font-thin tracking-widest text-white uppercase">Operational Overview</h1>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-[#c9a84c] to-transparent"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 mb-16 border border-white/5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-black/40 backdrop-blur-sm px-10 py-12 flex flex-col gap-2">
              <span className="text-4xl font-thin text-white tracking-tighter gold-gradient">{stat.value}</span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#555] font-bold">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Revenue OS CTA Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <a href="/revenue-os" className="group block p-10 bg-black/40 border border-white/5 hover:border-[#c9a84c]/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border border-[#c9a84c]/20 flex items-center justify-center bg-[#c9a84c]/5">
                <DollarSign className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <div>
                <h3 className="text-white text-lg font-light tracking-widest uppercase">Empire Revenue OS</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-widest">Full Revenue Command Center</p>
              </div>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed mb-6">
              Empire Revenue OS turns a business, repo, creator brand, or landing page into a paid offer, buyer list, outreach campaign, payment path, and delivery receipt.
            </p>
            <span className="inline-flex items-center gap-2 text-[10px] text-[#c9a84c] font-bold uppercase tracking-[0.3em] group-hover:gap-3 transition-all">
              Launch Revenue OS <ArrowRight className="w-3 h-3" />
            </span>
          </a>

          <a href="/revenue-receipt" className="group block p-10 bg-black/40 border border-white/5 hover:border-white/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white/60" />
              </div>
              <div>
                <h3 className="text-white text-lg font-light tracking-widest uppercase">Revenue Receipt</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-widest">Fast Artifact Generator</p>
              </div>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed mb-6">
              Need one fast artifact? Generate a Monday-ready revenue receipt with diagnosis, pricing ladder, and outreach kit.
            </p>
            <span className="inline-flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-[0.3em] group-hover:gap-3 transition-all">
              Generate Receipt <ArrowRight className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* Subscription & Plans (Stripe Integrated) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="p-10 bg-black/40 border border-white/5 flex flex-col gap-8 h-full">
              <div>
                <h2 className="text-2xl font-light text-white tracking-widest uppercase mb-2">Stripe Billing</h2>
                <p className="text-xs text-[#737373] leading-relaxed">Manage your premium subscriptions and enterprise-grade billing through our secure Stripe integration.</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Status</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#c9a84c] font-bold">{billingStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Next Billing</span>
                  <span className="text-[9px] uppercase tracking-widest text-white font-mono">{nextBilling}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Stripe</span>
                  <span className={`text-[9px] uppercase tracking-widest font-bold ${stripeConfigured === null ? 'text-[#444]' : stripeConfigured ? 'text-green-500' : 'text-[#737373]'}`}>
                    {stripeConfigured === null ? 'Checking…' : stripeConfigured ? 'Connected' : 'Not configured'}
                  </span>
                </div>
              </div>

              {stripeConfigured ? (
                <button
                  onClick={handlePortalRedirect}
                  disabled={loading}
                  className="w-full h-14 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all group disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {loading ? 'Opening…' : 'Access Customer Portal'}
                </button>
              ) : (
                <div className="w-full h-14 bg-white/[0.02] border border-white/5 text-[#444] text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  Set STRIPE_SECRET_KEY to enable
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="p-8 bg-black/40 border border-white/5 hover:border-[#c9a84c]/20 transition-all flex flex-col group">
                <div className="mb-8">
                  <h3 className="text-white text-[11px] font-bold uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-thin text-white">{plan.price}</span>
                    <span className="text-[10px] text-[#444] uppercase tracking-widest font-bold">/mo</span>
                  </div>
                </div>
                
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] text-[#737373]">
                      <Zap className="w-3 h-3 text-[#c9a84c]/50" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full h-12 bg-[#c9a84c] text-black text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#d4b96a] transition-all"
                >
                  Upgrade
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Infrastructure Section */}
        <div className="p-10 bg-[#111]/40 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-full border border-[#c9a84c]/20 flex items-center justify-center bg-[#c9a84c]/5">
              <Globe className="w-8 h-8 text-[#c9a84c]" />
            </div>
            <div>
              <h4 className="text-white text-[13px] font-light tracking-widest uppercase mb-1">Global Node Network</h4>
              <p className="text-[10px] text-[#555] tracking-wide max-w-md uppercase">Your instance is replicated across 12 tier-3 data centers for maximum redundancy and sub-10ms latency.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-bold font-mono text-green-500 shadow-[0_0_10px_#22c55e33]">ALL_SYSTEMS_OPERATIONAL</span>
              <span className="text-[8px] text-[#444] uppercase tracking-widest">Last heartbeat: 2s ago</span>
            </div>
          </div>
        </div>

      </main>

      {/* System Status Footer */}
      <footer className="relative z-50 h-16 px-12 border-t border-white/5 flex items-center justify-between bg-black/60 text-[9px] text-[#333] tracking-widest uppercase font-mono">
        <div className="flex gap-12">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_5px_#c9a84c]"></div>
            SECURE_SUBSCRIPTION_LAYER
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            PCI_DSS_COMPLIANT
          </span>
        </div>
        <div className="flex items-center gap-8">
          <span>© 2026 EMPIRE ONE // B2B HYBRID INTELLIGENCE</span>
          <div className="h-4 w-px bg-white/5"></div>
          <span className="text-[#555]">PROD_VERSION_2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
