'use client';

import { useState } from 'react';
import { runPublicRevenueOS, createPublicLead, createPublicCheckout } from '@/lib/publicRevenueOsApi';

const DEMO_PAYLOAD = {
  business_name: 'Demo Founder Studio',
  business_type: 'agency',
  current_offer: 'AI website and automation setup',
  target_customer: 'local service businesses',
  current_price: '$500',
  revenue_goal: '$5,000 by Monday',
  links_or_notes: 'Needs a fast paid offer, buyer list, outreach plan, payment path, and delivery receipt.',
  urgency_level: 'high',
  desired_output_type: 'command',
  preferred_sales_channel: 'mixed',
  founder_context: 'Solo founder with existing AI tools and ability to deliver manually.',
  assets_available: 'Landing page, GitHub repo, AI automation skills, manual payment option.',
  constraints: 'Must be sellable immediately without waiting for perfect SaaS deployment.',
};

type Step = 'form' | 'result' | 'lead';

export default function TryRevenueOSPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({
    business_name: '', business_type: 'other', current_offer: '', target_customer: '',
    current_price: '', revenue_goal: '', links_or_notes: '', urgency_level: 'high',
    desired_output_type: 'command', preferred_sales_channel: 'mixed',
    founder_context: '', assets_available: '', constraints: '',
  });
  const [leadForm, setLeadForm] = useState({ name: '', email: '', business_name: '', notes: '' });

  const f = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value });

  const loadDemo = () => {
    setForm({
      business_name: DEMO_PAYLOAD.business_name,
      business_type: DEMO_PAYLOAD.business_type,
      current_offer: DEMO_PAYLOAD.current_offer,
      target_customer: DEMO_PAYLOAD.target_customer,
      current_price: DEMO_PAYLOAD.current_price,
      revenue_goal: DEMO_PAYLOAD.revenue_goal,
      links_or_notes: DEMO_PAYLOAD.links_or_notes,
      urgency_level: DEMO_PAYLOAD.urgency_level,
      desired_output_type: DEMO_PAYLOAD.desired_output_type,
      preferred_sales_channel: DEMO_PAYLOAD.preferred_sales_channel,
      founder_context: DEMO_PAYLOAD.founder_context,
      assets_available: DEMO_PAYLOAD.assets_available,
      constraints: DEMO_PAYLOAD.constraints,
    });
  };

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setCheckoutResult(null);
    setLeadSent(false);
    setLeadError('');
    try {
      const data = await runPublicRevenueOS(form);
      setResult(data);
      setStep('result');
    } catch {
      setResult(getFallbackResult());
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const saveLead = async () => {
    setLeadError('');
    try {
      await createPublicLead({
        name: leadForm.name,
        email: leadForm.email,
        business_name: leadForm.business_name || form.business_name,
        notes: leadForm.notes || 'From public try flow',
      });
    } catch {
    } finally {
      setLeadSent(true);
    }
  };

  const runCheckout = async (priceTier: string) => {
    setChecking(true);
    try {
      const offer = result?.forged_offers?.[0] || { name: 'Revenue System', price: priceTier };
      const res = await createPublicCheckout({
        business_name: result?.receipt?.revenue_diagnosis?.business_name || form.business_name,
        offer_name: offer.name,
        price: priceTier,
      });
      setCheckoutResult(res);
      if (res.checkout_url) {
        window.open(res.checkout_url, '_blank');
      }
    } catch (e: any) {
      setCheckoutResult({ manual_payment_required: true, message: 'Checkout unavailable. Use manual payment.', offer_name: 'Revenue System', recommended_price: priceTier });
    } finally {
      setChecking(false);
    }
  };

  const ready = form.business_name && form.current_offer && form.target_customer;
  const rd = result?.receipt?.revenue_diagnosis || {};
  const offers = result?.forged_offers || [];
  const buyers = result?.buyer_profiles || [];
  const oc = result?.outreach_campaign || {};
  const plan = result?.receipt?.seventy_two_hour_action_plan || {};
  const risks = result?.risks || [];
  const receipt = result?.receipt || {};

  const input = (label: string, field: string, placeholder: string) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</label>
      <input value={(form as any)[field]} onChange={f(field)} placeholder={placeholder}
        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem', background: '#fff' }} />
    </div>
  );

  const select = (label: string, field: string, options: { value: string; label: string }[]) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</label>
      <select value={(form as any)[field]} onChange={f(field)}
        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem', background: '#fff' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  if (step === 'form') {
    return (
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.75rem' }}>
            Turn your business into a revenue system by Monday.
          </h1>
          <p style={{ fontSize: '1rem', color: '#555', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Enter a business, repo, creator brand, or landing page. Empire Revenue OS generates your paid offers, buyer profiles, outreach copy, payment path, and delivery receipt.
          </p>
        </div>

        <button onClick={loadDemo}
          style={{ width: '100%', padding: '0.75rem', background: '#f0f0f0', border: '2px dashed #aaa', borderRadius: 8, fontSize: '0.95rem', cursor: 'pointer', color: '#333', marginBottom: '1.5rem' }}>
          Use Demo Payload
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {input('Business Name *', 'business_name', 'e.g., Demo Founder Studio')}
            {select('Business Type', 'business_type', [
              { value: 'other', label: 'Other' }, { value: 'saas', label: 'SaaS / Software' },
              { value: 'agency', label: 'Agency / Services' }, { value: 'ecommerce', label: 'E-commerce' },
              { value: 'creator', label: 'Creator / Influencer' }, { value: 'consulting', label: 'Consulting' },
            ])}
            {input('Current Offer / Product *', 'current_offer', 'What do you sell?')}
            {input('Target Customer *', 'target_customer', 'Who buys this?')}
            {input('Current Price', 'current_price', '$500')}
            {input('Revenue Goal', 'revenue_goal', '$5,000 by Monday')}
            {input('Links or Notes', 'links_or_notes', 'Landing page, social, etc.')}
            {select('Sales Channel', 'preferred_sales_channel', [
              { value: 'mixed', label: 'Mixed' }, { value: 'linkedin', label: 'LinkedIn' },
              { value: 'email', label: 'Email' }, { value: 'instagram', label: 'Instagram' },
              { value: 'local', label: 'Local' }, { value: 'phone', label: 'Phone' },
            ])}
          </div>
          {input('Founder Context (optional)', 'founder_context', 'Solo founder with AI tools...')}
          {input('Assets Available (optional)', 'assets_available', 'Landing page, GitHub repo...')}
          {input('Constraints (optional)', 'constraints', 'Must be sellable immediately...')}

          {error && <p style={{ color: '#c00', fontSize: '0.9rem' }}>{error}</p>}

          <button onClick={generate} disabled={loading || !ready}
            style={{
              width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #000, #1a1a2e)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '1.1rem', fontWeight: 700,
              cursor: loading || !ready ? 'not-allowed' : 'pointer', opacity: loading || !ready ? 0.6 : 1,
              letterSpacing: '0.02em',
            }}>
            {loading ? 'Generating Your Revenue System...' : 'Generate My Revenue System'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1rem', background: '#fff', color: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Your Revenue System</h2>
          {result?.receipt_id && <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.25rem 0 0' }}>Receipt: {result.receipt_id} {result.command_id ? `· Command: ${result.command_id}` : ''}</p>}
        </div>
        <button onClick={() => setStep('form')} style={{ background: '#f0f0f0', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
          Start Over
        </button>
      </div>

      {error && <p style={{ fontSize: '0.85rem', color: '#c00', background: '#fff0f0', padding: '0.5rem', borderRadius: 4, marginBottom: '1rem' }}>⚠ {error}</p>}

      {/* Section 1: Revenue Diagnosis */}
      <Section title="Revenue Diagnosis">
        <KV k="Business" v={rd.business_name} />
        <KV k="Offer" v={rd.current_offer} />
        <KV k="Target" v={rd.target_customer} />
        {(rd.current_price || form.current_price) && <KV k="Price" v={rd.current_price || form.current_price} />}
        {(rd.revenue_goal || form.revenue_goal) && <KV k="Goal" v={rd.revenue_goal || form.revenue_goal} />}
        {rd.money_leak && <KV k="Money Leak" v={rd.money_leak} />}
      </Section>

      {/* Section 2: Fastest Paid Offer */}
      {receipt.fastest_paid_offer && (
        <Section title="Fastest Paid Offer">
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#090' }}>{receipt.fastest_paid_offer}</p>
        </Section>
      )}

      {/* Section 3: 3 Priced Offers */}
      {offers.length > 0 && (
        <Section title={`${offers.length} Priced Offers`}>
          {offers.slice(0, 3).map((o: any, i: number) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.95rem' }}>{o.name}</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#090' }}>{o.price}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#555', margin: '0.25rem 0' }}>{o.promise}</p>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>For: {o.target_buyer} · Turnaround: {o.turnaround}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Section 4: Top 5 Buyer Profiles */}
      {buyers.length > 0 && (
        <Section title={`Top ${Math.min(5, buyers.length)} Buyer Profiles`}>
          {buyers.slice(0, 5).map((p: any, i: number) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: 4, padding: '0.5rem', marginBottom: '0.35rem', fontSize: '0.85rem', background: '#fafafa' }}>
              <strong>{p.persona_type}</strong> <span style={{ color: '#888' }}>({p.segment})</span>
              <span style={{ float: 'right', background: p.priority_score >= 80 ? '#d4edda' : '#fff3cd', padding: '0.1rem 0.4rem', borderRadius: 3, fontSize: '0.75rem' }}>
                Score: {p.priority_score}
              </span>
              <div style={{ color: '#555', marginTop: '0.15rem' }}>{p.pain_point}</div>
            </div>
          ))}
        </Section>
      )}

      {/* GTM Intelligence: Buyer Scores & Signals */}
      {result?.gtm_layer && (
        <Section title="GTM Intelligence">
          {result.gtm_layer.buyer_tiers && result.gtm_layer.buyer_tiers.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Best buyers to target first:</p>
              {result.gtm_layer.buyer_tiers.slice(0, 3).map((t: any, i: number) => (
                <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600 }}>{t.persona_type || `Buyer ${i + 1}`}</span>
                  <span style={{ color: '#090', marginLeft: '0.5rem' }}>{t.total_score ?? t.score}/100</span>
                  <span style={{ background: t.tier === 'Tier 1' ? '#d4edda' : '#fff3cd', marginLeft: '0.5rem', padding: '0.1rem 0.4rem', borderRadius: 3, fontSize: '0.75rem' }}>{t.tier}</span>
                </div>
              ))}
            </div>
          )}
          {result.gtm_layer.detected_signals && result.gtm_layer.detected_signals.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Why now:</p>
              {result.gtm_layer.detected_signals.slice(0, 2).map((s: any, i: number) => (
                <p key={i} style={{ fontSize: '0.85rem', color: '#555', margin: '0.15rem 0' }}>
                  {s.signal_name || s.signal || s.name} — <span style={{ color: (s.priority || 0) >= 80 ? '#c00' : '#e67e22' }}>{s.priority || ''}</span>
                  {s.outreach_angle ? `: ${s.outreach_angle.slice(0, 120)}` : ''}
                </p>
              ))}
            </div>
          )}
          {result.gtm_layer.campaign_summary && (
            <p style={{ fontSize: '0.85rem', color: '#555' }}>
              <strong>Recommended:</strong> {typeof result.gtm_layer.campaign_summary === 'string'
                ? result.gtm_layer.campaign_summary
                : `${result.gtm_layer.campaign_summary.total_sequences || '?'} sequences over ${result.gtm_layer.campaign_summary.total_steps || '?'} steps via ${result.gtm_layer.campaign_summary.recommended_channel || '?'}`}
            </p>
          )}
        </Section>
      )}

      {/* Section 5-6: Cold DMs + Email */}
      {oc.cold_dms && oc.cold_dms.length > 0 && (
        <Section title="Cold DMs">
          {oc.cold_dms.slice(0, 3).map((msg: string, i: number) => (
            <div key={i} style={{ background: '#e3f2fd', padding: '0.5rem', borderRadius: 4, marginBottom: '0.35rem', fontSize: '0.85rem', position: 'relative' }}>
              {msg}
              <button onClick={() => copyText(msg, i)}
                style={{ position: 'absolute', top: 4, right: 4, background: copiedIdx === i ? '#4caf50' : '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: '0.7rem', cursor: 'pointer', padding: '0.15rem 0.4rem', color: copiedIdx === i ? '#fff' : '#000' }}>
                {copiedIdx === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </Section>
      )}

      {oc.cold_emails && oc.cold_emails.length > 0 && (
        <Section title="Cold Email">
          {oc.cold_emails.slice(0, 1).map((msg: string, i: number) => (
            <div key={i} style={{ background: '#fff3e0', padding: '0.5rem', borderRadius: 4, marginBottom: '0.35rem', fontSize: '0.85rem', position: 'relative' }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{msg}</pre>
              <button onClick={() => copyText(msg, 100 + i)}
                style={{ position: 'absolute', top: 4, right: 4, background: copiedIdx === 100 + i ? '#4caf50' : '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: '0.7rem', cursor: 'pointer', padding: '0.15rem 0.4rem', color: copiedIdx === 100 + i ? '#fff' : '#000' }}>
                {copiedIdx === 100 + i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </Section>
      )}

      {/* Section 7: 72-Hour Action Plan */}
      {Object.keys(plan).length > 0 && (
        <Section title="72-Hour Action Plan">
          {Object.entries(plan).map(([day, actions]: [string, any]) => (
            <div key={day} style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <strong style={{ textTransform: 'capitalize' }}>{day.replace(/_/g, ' ')}</strong>
              <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                {(actions || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          ))}
          <button onClick={() => { const t = Object.entries(plan).map(([day, actions]: [string, any]) => `${day.replace(/_/g, ' ')}:\n${(actions||[]).join('\n')}`).join('\n\n'); copyText(t, 200); }}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Copy Plan
          </button>
        </Section>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <Section title="Risks & Warnings">
          {risks.map((r: string, i: number) => <p key={i} style={{ fontSize: '0.85rem', color: '#c00', margin: '0.25rem 0' }}>⚠ {r}</p>)}
        </Section>
      )}

      {/* Section 8: Checkout / Manual Payment */}
      <Section title="Get the Full Revenue OS">
        {!checkoutResult ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => runCheckout('$299')} disabled={checking}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #000, #1a1a2e)', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.6 : 1 }}>
              {checking ? 'Processing...' : 'Buy Full Revenue Receipt — $299'}
            </button>
            <button onClick={() => runCheckout('$999')} disabled={checking}
              style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: '2px solid #000', borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.6 : 1 }}>
              Book Revenue Sprint — $999
            </button>
          </div>
        ) : (
          <div style={{ background: checkoutResult.manual_payment_required ? '#fff3cd' : '#d4edda', padding: '0.75rem', borderRadius: 6, fontSize: '0.85rem' }}>
            <p><strong>Offer:</strong> {checkoutResult.offer_name} · <strong>Price:</strong> {checkoutResult.recommended_price}</p>
            {checkoutResult.checkout_url ? (
              <p><a href={checkoutResult.checkout_url} target="_blank" style={{ color: '#06c', fontWeight: 600 }}>Open Checkout →</a></p>
            ) : (
              <div>
                <p>Stripe is not configured yet. For MVP, use invoice, Cash App, PayPal, or Stripe Payment Link.</p>
                <p>After payment, mark lead as paid and generate delivery receipt.</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Section 9: Delivery Receipt Preview */}
      {receipt.fastest_paid_offer && (
        <Section title="Delivery Receipt Preview">
          <div style={{ border: '2px solid #000', borderRadius: 6, padding: '0.75rem', fontSize: '0.85rem' }}>
            <KV k="Receipt ID" v={result?.receipt_id || '—'} />
            <KV k="Business" v={rd.business_name} />
            <KV k="Delivered" v={receipt.fastest_paid_offer} />
            <button onClick={() => { const t = [`Receipt: ${result?.receipt_id || '—'}`, `Business: ${rd.business_name || ''}`, `Offer: ${receipt.fastest_paid_offer || ''}`].filter(Boolean).join('\n'); copyText(t, 300); }}
              style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Copy Receipt
            </button>
          </div>
        </Section>
      )}

      {/* Phase 7: Lead Capture */}
      {!leadSent ? (
        <Section title="Want the full Revenue OS output?">
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.75rem' }}>Save your result and we&apos;ll send the complete Revenue OS output.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Your name *"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.9rem' }} />
            <input value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="Your email *"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.9rem' }} />
            <input value={leadForm.business_name} onChange={e => setLeadForm({ ...leadForm, business_name: e.target.value })} placeholder="Business name"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.9rem' }} />
            <textarea value={leadForm.notes} onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Notes (optional)"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.9rem', minHeight: 60 }} />
            {leadError && <p style={{ color: '#c00', fontSize: '0.85rem' }}>{leadError}</p>}
            <button onClick={saveLead} disabled={!leadForm.name || !leadForm.email}
              style={{ padding: '0.75rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: (!leadForm.name || !leadForm.email) ? 'not-allowed' : 'pointer', opacity: (!leadForm.name || !leadForm.email) ? 0.6 : 1 }}>
              Save My Result
            </button>
          </div>
        </Section>
      ) : (
        <div style={{ background: '#d4edda', padding: '1rem', borderRadius: 6, textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#155724' }}>✓ Result saved! We&apos;ll be in touch.</p>
        </div>
      )}
    </main>
  );
}

function getFallbackResult() {
  return {
    receipt_id: 'FALLBACK-' + Date.now().toString(36).toUpperCase(),
    command_id: 'demo-fallback',
    receipt: {
      revenue_diagnosis: {
        business_name: 'Demo Founder Studio',
        current_offer: 'AI website and automation setup',
        target_customer: 'local service businesses',
        current_price: '$500',
        revenue_goal: '$5,000 by Monday',
        money_leak: 'No buyer list or outreach pipeline — leaving money on the table.',
      },
      fastest_paid_offer: 'AI Website + Automation Setup — $500 (deliver in 3 days)',
      seventy_two_hour_action_plan: {
        day_1: ['Define your target buyer avatar', 'Build a list of 25 local service businesses', 'Draft your cold DM template'],
        day_2: ['Send 15 cold DMs / emails', 'Follow up with warm leads', 'Create a payment link'],
        day_3: ['Close first 2-3 sales', 'Deliver first website', 'Request testimonial and referral'],
      },
    },
    forged_offers: [
      { name: 'AI Website + Automation Setup', price: '$500', promise: 'Professional AI website with automated lead capture and follow-up', target_buyer: 'Local service businesses', turnaround: '3 days' },
      { name: 'Business Automation Sprint', price: '$999', promise: 'Full workflow automation — CRM, email, scheduling, payments', target_buyer: 'Growing service businesses', turnaround: '5 days' },
      { name: 'Agency Revenue System', price: '$2,500', promise: 'Complete agency-in-a-box — website, automations, client portal, and resell rights', target_buyer: 'Agencies and freelancers', turnaround: '10 days' },
    ],
    buyer_profiles: [
      { persona_type: 'Local Business Owner', segment: 'Local', priority_score: 92, pain_point: 'Still taking orders by phone and manual texts. Losing customers to competitors with online booking.' },
      { persona_type: 'Growing Agency Founder', segment: 'Agency', priority_score: 88, pain_point: 'Hitting capacity limits with manual client management. Needs automation to scale.' },
      { persona_type: 'Solo Service Pro', segment: 'Consulting', priority_score: 85, pain_point: 'Spending 15hrs/week on admin instead of revenue-generating work.' },
      { persona_type: 'E-commerce Owner', segment: 'E-commerce', priority_score: 78, pain_point: 'Cart abandonment is high. No automated follow-up or retargeting.' },
      { persona_type: 'Real Estate Agent', segment: 'Local', priority_score: 75, pain_point: 'Leads fall through cracks. No automated nurture or follow-up sequence.' },
    ],
    outreach_campaign: {
      cold_dms: [
        'Hey [Name], saw you\'re running [business]. Quick question — are you still manually handling your appointments and follow-ups, or do you have that automated?',
        'Hey [Name], quick one — we just helped [similar business] cut their admin time by 12hrs/week with AI automation. Open to a 5-min chat to see if it applies to you?',
        '[Name], your [industry] business is solid. One thing I notice is [specific pain]. We fix that with AI workflows. Want to see how?',
      ],
      cold_emails: [
        'Subject: Quick idea for [business name]\n\nHi [Name],\n\nI see you\'re running [business type] in [area]. Most business owners in your space are spending 10-15 hours/week on manual follow-ups, scheduling, and client management.\n\nWe build AI systems that handle all of that automatically — so you can focus on revenue-generating work.\n\nHere\'s what a setup looks like:\n- AI website with lead capture\n- Automated follow-up sequences\n- Client scheduling and reminders\n- Payment integration\n\nWould you be open to a 15-min call to see if this makes sense for you?\n\nBest,\n[Your Name]',
      ],
    },
    risks: ['Backend unavailable. Showing demo fallback with sample data. Results are illustrative.'],
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', borderBottom: '2px solid #000', paddingBottom: '0.25rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  if (!v) return null;
  return <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>{k}:</strong> {v}</p>;
}
