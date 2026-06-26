'use client';

import { useState } from 'react';
import { runRevenueOS, createLead, listLeads, updateLead, createCheckout, generateDeliveryReceipt, getRevenueOSAnalytics, getRevenueOSDashboard } from '@/lib/revenueOsApi';

type Tab = 'command' | 'receipt' | 'offers' | 'buyers' | 'outreach' | 'pipeline' | 'checkout' | 'delivery' | 'analytics';

export default function RevenueOSPage() {
  const [tab, setTab] = useState<Tab>('command');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [activeTabLabel, setActiveTabLabel] = useState('Command Run');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'command', label: 'Command Run' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'offers', label: 'Offers' },
    { key: 'buyers', label: 'Buyers' },
    { key: 'outreach', label: 'Outreach' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'checkout', label: 'Checkout' },
    { key: 'delivery', label: 'Delivery Receipt' },
    { key: 'analytics', label: 'Analytics' },
  ];

  const switchTab = (key: Tab, label: string) => {
    setTab(key);
    setActiveTabLabel(label);
  };

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Empire Revenue OS</h1>
        <p style={{ color: '#666', margin: '0.25rem 0 1rem' }}>
          Generate, sell, track, charge, deliver, and report revenue workflows.
        </p>

        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key, t.label)}
              style={{
                padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: 'none',
                background: tab === t.key ? '#000' : '#f0f0f0',
                color: tab === t.key ? '#fff' : '#333',
                borderRadius: 6, cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400,
              }}
            >{t.label}</button>
          ))}
        </div>
      </header>

      {tab === 'command' && <CommandRunPanel onResult={setOutput} loading={loading} setLoading={setLoading} onTab={switchTab} />}
      {tab === 'receipt' && <ReceiptPanel output={output} />}
      {tab === 'offers' && <OfferForgePanel output={output} />}
      {tab === 'buyers' && <BuyerFinderPanel output={output} />}
      {tab === 'outreach' && <OutreachDeskPanel output={output} />}
      {tab === 'pipeline' && <PipelinePanel />}
      {tab === 'checkout' && <CheckoutDeskPanel output={output} />}
      {tab === 'delivery' && <DeliveryReceiptPanel output={output} />}
      {tab === 'analytics' && <AnalyticsPanel />}
    </main>
  );
}

// ---------------------------------------------------------
// COMMAND RUN PANEL
// ---------------------------------------------------------
function CommandRunPanel({ onResult, loading, setLoading, onTab }: {
  onResult: (d: any) => void; loading: boolean; setLoading: (v: boolean) => void; onTab: (k: any, l: string) => void;
}) {
  const [form, setForm] = useState({
    business_name: '', business_type: 'other', current_offer: '', target_customer: '',
    current_price: '', revenue_goal: '', links_or_notes: '', urgency_level: 'normal',
    desired_output_type: 'quick', preferred_sales_channel: 'mixed',
    founder_context: '', assets_available: '', constraints: '',
  });

  const run = async () => {
    setLoading(true);
    try {
      const result = await runRevenueOS(form);
      onResult(result);
      onTab('receipt', 'Receipt');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const f = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value });

  const input = (label: string, field: string, placeholder: string) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</label>
      <input value={(form as any)[field]} onChange={f(field)} placeholder={placeholder}
        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.85rem' }} />
    </div>
  );

  const select = (label: string, field: string, options: { value: string; label: string }[]) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</label>
      <select value={(form as any)[field]} onChange={f(field)}
        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.85rem' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const ready = form.business_name && form.current_offer && form.target_customer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {input('Business Name', 'business_name', 'e.g., Test Founder Studio')}
        {select('Business Type', 'business_type', [
          { value: 'other', label: 'Other' }, { value: 'saas', label: 'SaaS / Software' },
          { value: 'agency', label: 'Agency / Services' }, { value: 'ecommerce', label: 'E-commerce' },
          { value: 'creator', label: 'Creator / Influencer' }, { value: 'consulting', label: 'Consulting' },
        ])}
        {input('Current Offer', 'current_offer', 'AI website and automation setup')}
        {input('Target Customer', 'target_customer', 'local service businesses')}
        {input('Current Price', 'current_price', '$500')}
        {input('Revenue Goal', 'revenue_goal', '$5,000 by Monday')}
        {input('Links or Notes', 'links_or_notes', 'Needs fast paid offer, buyer list...')}
        {select('Output Type', 'desired_output_type', [
          { value: 'quick', label: 'Quick Receipt ($97)' }, { value: 'full', label: 'Full Receipt ($299)' },
          { value: 'sprint', label: 'Revenue Sprint ($999)' }, { value: 'command', label: 'Full Command (all modules)' },
        ])}
        {select('Sales Channel', 'preferred_sales_channel', [
          { value: 'mixed', label: 'Mixed' }, { value: 'linkedin', label: 'LinkedIn' },
          { value: 'email', label: 'Email' }, { value: 'instagram', label: 'Instagram' },
          { value: 'local', label: 'Local' }, { value: 'phone', label: 'Phone' },
        ])}
        {select('Urgency', 'urgency_level', [
          { value: 'normal', label: 'Normal (48-72h)' }, { value: 'high', label: 'High (24h)' },
          { value: 'critical', label: 'Critical (same day)' },
        ])}
      </div>
      {input('Founder Context (optional)', 'founder_context', 'Solo founder with AI tools...')}
      {input('Assets Available (optional)', 'assets_available', 'Landing page, GitHub repo...')}
      {input('Constraints (optional)', 'constraints', 'Must be sellable immediately...')}

      <button onClick={run} disabled={loading || !ready}
        style={{
          padding: '0.7rem 1.5rem', background: '#000', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: '1rem', cursor: loading || !ready ? 'not-allowed' : 'pointer',
          opacity: loading || !ready ? 0.6 : 1, marginTop: '0.5rem',
        }}
      >
        {loading ? 'Running Revenue OS...' : 'Run Revenue OS'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------
// RECEIPT PANEL
// ---------------------------------------------------------
function ReceiptPanel({ output }: { output: any }) {
  if (!output) return <Empty msg="Run a command first to see the receipt." />;
  const r = output.receipt || {};
  const rd = r.revenue_diagnosis || {};
  const risks = output.risks || [];

  return (
    <div>
      <Section title="Revenue Diagnosis">
        <KV k="Business" v={rd.business_name} />
        <KV k="Offer" v={rd.current_offer} />
        <KV k="Target" v={rd.target_customer} />
        <KV k="Price" v={rd.current_price} />
        <KV k="Goal" v={rd.revenue_goal} />
        <KV k="Money Leak" v={rd.money_leak} />
      </Section>

      <Section title="Fastest Paid Offer">
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>{r.fastest_paid_offer}</p>
      </Section>

      <Section title="Price Ladder">
        {(r.price_ladder?.tiers || []).map((t: any, i: number) => (
          <div key={i} style={{ padding: '0.4rem 0.6rem', marginBottom: '0.4rem', border: '1px solid #ddd', borderRadius: 4, background: t.name === r.price_ladder?.recommended ? '#f0f7ff' : '#fff' }}>
            <strong>{t.name}</strong> — {t.price} {t.name === r.price_ladder?.recommended && <span style={{ color: '#06c' }}>★</span>}
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{t.audience}</div>
          </div>
        ))}
      </Section>

      <Section title="72-Hour Action Plan">
        {Object.entries(r.seventy_two_hour_action_plan || {}).map(([day, actions]: [string, any]) => (
          <div key={day} style={{ marginBottom: '0.5rem' }}>
            <strong style={{ textTransform: 'capitalize' }}>{day.replace(/_/g, ' ')}</strong>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
              {(actions || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        ))}
      </Section>

      {risks.length > 0 && (
        <Section title="Risks & Warnings">
          {risks.map((r: string, i: number) => <p key={i} style={{ fontSize: '0.85rem', color: '#c00', margin: '0.25rem 0' }}>⚠ {r}</p>)}
        </Section>
      )}

      {output.engine_output && <p style={{ fontSize: '0.75rem', color: '#090' }}>✓ Engine-enhanced with Money Pipeline</p>}
      <p style={{ fontSize: '0.75rem', color: '#999' }}>ID: {output.receipt_id} | Command: {output.command_id}</p>
    </div>
  );
}

// ---------------------------------------------------------
// OFFER FORGE PANEL
// ---------------------------------------------------------
function OfferForgePanel({ output }: { output: any }) {
  const offers = output?.forged_offers || [];
  if (offers.length === 0) return <Empty msg="Run a command first to generate offers." />;

  return (
    <div>
      {offers.map((o: any, i: number) => (
        <div key={i} style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{o.name}</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#090' }}>{o.price}</p>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>{o.promise}</p>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>For:</strong> {o.target_buyer}</p>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>Turnaround:</strong> {o.turnaround}</p>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>Risk Reversal:</strong> {o.risk_reversal}</p>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>Upsell:</strong> {o.upsell_path}</p>
          <details style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Deliverables ({o.deliverables?.length || 0})</summary>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
              {(o.deliverables || []).map((d: string, j: number) => <li key={j}>{d}</li>)}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------
// BUYER FINDER PANEL
// ---------------------------------------------------------
function BuyerFinderPanel({ output }: { output: any }) {
  const profiles = output?.buyer_profiles || [];
  if (profiles.length === 0) return <Empty msg="Run a command first to generate buyer profiles." />;

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>{profiles.length} buyer profiles generated (personas only — no real people or emails).</p>
      {profiles.map((p: any, i: number) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 4, padding: '0.5rem', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
          <strong>{p.persona_type}</strong> <span style={{ color: '#888' }}>({p.segment})</span>
          <span style={{ float: 'right', background: p.priority_score >= 80 ? '#d4edda' : p.priority_score >= 60 ? '#fff3cd' : '#f8d7da', padding: '0.1rem 0.4rem', borderRadius: 3, fontSize: '0.75rem' }}>
            Score: {p.priority_score}
          </span>
          <div style={{ marginTop: '0.2rem', color: '#555' }}>{p.pain_point}</div>
          <div style={{ marginTop: '0.2rem' }}>
            <strong>Channel:</strong> {p.best_channel} | <strong>Angle:</strong> {p.opening_angle}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------
// OUTREACH DESK PANEL
// ---------------------------------------------------------
function OutreachDeskPanel({ output }: { output: any }) {
  const oc = output?.outreach_campaign || {};
  const allEmpty = !oc.cold_dms && !oc.cold_emails;
  if (allEmpty) return <Empty msg="Run a command first to generate outreach." />;

  const sections = [
    { title: 'Cold DMs', items: oc.cold_dms || [], color: '#e3f2fd' },
    { title: 'Cold Emails', items: oc.cold_emails || [], color: '#fff3e0' },
    { title: 'Follow-ups', items: oc.followups || [], color: '#f3e5f5' },
    { title: 'Objection Replies', items: oc.objection_replies || [], color: '#e8f5e9' },
    { title: 'Close Messages', items: oc.close_messages || [], color: '#fce4ec' },
  ];

  return (
    <div>
      {sections.map(s => s.items.length > 0 && (
        <Section key={s.title} title={s.title}>
          {s.items.map((msg: string, i: number) => (
            <div key={i} style={{ background: s.color, padding: '0.5rem', borderRadius: 4, marginBottom: '0.4rem', fontSize: '0.85rem', position: 'relative' }}>
              {msg}
              <button onClick={() => navigator.clipboard.writeText(msg)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: '1px solid #ccc', borderRadius: 3, fontSize: '0.7rem', cursor: 'pointer', padding: '0.1rem 0.3rem' }}>
                Copy
              </button>
            </div>
          ))}
        </Section>
      ))}
      {oc.call_confirmation && (
        <Section title="Call Confirmation Template">
          <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: 4, whiteSpace: 'pre-wrap' }}>{oc.call_confirmation}</pre>
        </Section>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// PIPELINE PANEL
// ---------------------------------------------------------
function PipelinePanel() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', segment: '', channel: '', offer: '', estimated_value: 0 });
  const create = async () => {
    if (!leadForm.name) return;
    await createLead(leadForm);
    setLeadForm({ name: '', segment: '', channel: '', offer: '', estimated_value: 0 });
    load();
  };
  const load = async () => {
    const data = await listLeads();
    setLeads(data.leads || []);
    setLoaded(true);
  };
  const updateStatus = async (id: string, status: string) => {
    await updateLead(id, { status });
    load();
  };

  if (!loaded) { load(); return <div style={{ fontSize: '0.85rem' }}>Loading leads...</div>; }

  return (
    <div>
      <Section title="Create Lead">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <input value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Lead name" style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.85rem' }} />
          <select value={leadForm.segment} onChange={e => setLeadForm({ ...leadForm, segment: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.85rem' }}>
            <option value="">Segment</option><option value="SaaS">SaaS</option><option value="Agency">Agency</option><option value="E-commerce">E-commerce</option><option value="Creator">Creator</option><option value="Local">Local</option>
          </select>
          <input value={leadForm.estimated_value || ''} onChange={e => setLeadForm({ ...leadForm, estimated_value: Number(e.target.value) || 0 })} placeholder="$ value" type="number" style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.85rem', width: 80 }} />
          <button onClick={create} style={{ padding: '0.4rem 0.8rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' }}>Add Lead</button>
        </div>
      </Section>

      <Section title={`Pipeline (${leads.length} leads)`}>
        {leads.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#888' }}>No leads yet. Create one above.</p> : (
          <div style={{ fontSize: '0.85rem' }}>
            {leads.map((l: any) => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{l.name}</strong> <span style={{ color: '#888' }}>({l.segment || '—'})</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#090' }}>${l.estimated_value || 0}</span>
                  {l.actual_value && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#060' }}>paid: ${l.actual_value}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: 3, background: '#eee' }}>{l.status}</span>
                  <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                    style={{ padding: '0.2rem', border: '1px solid #ccc', borderRadius: 3, fontSize: '0.75rem' }}>
                    {['new', 'targeted', 'contacted', 'replied', 'call_booked', 'invoice_sent', 'paid', 'delivered', 'upsell', 'lost'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ---------------------------------------------------------
// CHECKOUT DESK PANEL
// ---------------------------------------------------------
function CheckoutDeskPanel({ output }: { output: any }) {
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const runCheckout = async () => {
    if (!output?.forged_offers?.length) { alert('Run a command first to generate offers.'); return; }
    setChecking(true);
    try {
      const offer = output.forged_offers[1] || output.forged_offers[0];
      const result = await createCheckout({
        business_name: output.receipt?.revenue_diagnosis?.business_name || 'Business',
        offer_name: offer.name,
        price: offer.price,
      });
      setCheckoutResult(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      {!checkoutResult ? (
        <div>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Create a checkout recommendation based on the current command output.</p>
          <button onClick={runCheckout} disabled={checking}
            style={{ padding: '0.6rem 1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.6 : 1 }}>
            {checking ? 'Creating...' : 'Create Checkout'}
          </button>
        </div>
      ) : (
        <div>
          <Section title="Checkout Recommendation">
            <KV k="Offer" v={checkoutResult.offer_name} />
            <KV k="Price" v={checkoutResult.recommended_price} />
            <KV k="Stripe Configured" v={checkoutResult.stripe_configured ? 'Yes ✓' : 'No — manual payment'} />
            {checkoutResult.checkout_url && (
              <p><a href={checkoutResult.checkout_url} target="_blank" style={{ color: '#06c' }}>Open Checkout →</a></p>
            )}
            <div style={{ background: checkoutResult.manual_payment_required ? '#fff3cd' : '#d4edda', padding: '0.5rem', borderRadius: 4, marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {checkoutResult.message}
            </div>
            {checkoutResult.manual_payment_required && (
              <div style={{ background: '#fef3cd', border: '1px solid #e6c952', borderRadius: 4, padding: '0.6rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <strong>Manual Payment Instructions</strong>
                <ol style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                  <li>Send the buyer an invoice via PayPal, CashApp, Venmo, or Stripe invoice link.</li>
                  <li>Mark the lead as <strong>invoice_sent</strong> in Pipeline Composer.</li>
                  <li>When payment arrives, update the lead status to <strong>paid</strong> and record the actual value.</li>
                  <li>Come back to this panel and run the Delivery Receipt step to send the receipt.</li>
                </ol>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}><strong>Next step:</strong> {checkoutResult.next_step}</p>
          </Section>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// DELIVERY RECEIPT PANEL
// ---------------------------------------------------------
function DeliveryReceiptPanel({ output }: { output: any }) {
  const [dr, setDr] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const run = async () => {
    setGenerating(true);
    try {
      const rd = output?.receipt?.revenue_diagnosis || {};
      const offers = output?.forged_offers || [];
      const result = await generateDeliveryReceipt({
        customer_name: '[Customer Name]',
        purchased_offer: offers[1]?.name || offers[0]?.name || 'Revenue System',
        business_name: rd.business_name || 'Business',
      });
      setDr(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {!dr ? (
        <div>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Generate a customer-facing delivery receipt based on the current command output.</p>
          <button onClick={run} disabled={generating}
            style={{ padding: '0.6rem 1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1 }}>
            {generating ? 'Generating...' : 'Generate Delivery Receipt'}
          </button>
        </div>
      ) : (
        <div style={{ border: '2px solid #000', borderRadius: 8, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Delivery Receipt</h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => { const t = [`Receipt: ${dr.receipt_id}`, `Customer: ${dr.customer_name}`, `Purchased: ${dr.purchased_offer}`, `Delivered Assets: ${(dr.delivered_assets||[]).join(', ')}`, `Next 7 Days: ${(dr.next_7_days||[]).join(' | ')}`, dr.upsell_recommendation ? `Upsell: ${dr.upsell_recommendation}` : ''].filter(Boolean).join('\n'); navigator.clipboard.writeText(t); }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} title="Copy to clipboard">Copy</button>
              <button onClick={() => { const blob = new Blob([`=== DELIVERY RECEIPT ===\nReceipt ID: ${dr.receipt_id}\nCustomer: ${dr.customer_name}\nPurchased: ${dr.purchased_offer}\n\n--- Delivered Assets ---\n${(dr.delivered_assets||[]).join('\n')}\n\n--- Next 7 Days ---\n${(dr.next_7_days||[]).join('\n')}${dr.upsell_recommendation ? `\n\nUpsell: ${dr.upsell_recommendation}` : ''}\n\nGenerated: ${dr.timestamp ? new Date(dr.timestamp).toLocaleString() : ''}`], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `receipt-${dr.receipt_id || 'download'}.txt`; a.click(); URL.revokeObjectURL(a.href); }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} title="Download as .txt">Download</button>
            </div>
          </div>
          <KV k="Receipt ID" v={dr.receipt_id} />
          <KV k="Customer" v={dr.customer_name} />
          <KV k="Purchased" v={dr.purchased_offer} />
          <KV k="Delivered" v={`${dr.delivered_assets?.length || 0} assets`} />
          <details style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Delivered Assets</summary>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
              {(dr.delivered_assets || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </details>
          <Section title="Next 7 Days">
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
              {(dr.next_7_days || []).map((d: string, i: number) => <li key={i}>{d}</li>)}
            </ol>
          </Section>
          {dr.upsell_recommendation && <KV k="Upsell" v={dr.upsell_recommendation} />}
          <KV k="Generated" v={dr.timestamp ? new Date(dr.timestamp).toLocaleString() : ''} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// ANALYTICS PANEL
// ---------------------------------------------------------
function AnalyticsPanel() {
  const [data, setData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    getRevenueOSAnalytics().then(setData).catch(() => {}).finally(() => setLoaded(true));
    return <div style={{ fontSize: '0.85rem' }}>Loading analytics...</div>;
  }

  if (!data) return <Empty msg="Could not load analytics." />;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <Card label="Commands" value={data.total_commands} />
        <Card label="Receipts" value={data.total_receipts} />
        <Card label="Leads" value={data.total_leads} />
        <Card label="Pipeline Value" value={`$${data.estimated_pipeline_value?.toLocaleString() || 0}`} />
        <Card label="Paid Revenue" value={`$${data.paid_value?.toLocaleString() || 0}`} />
        <Card label="Paid Leads" value={data.paid_count} />
      </div>

      <Section title="Leads by Status">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.4rem' }}>
          {Object.entries(data.leads_by_status || {}).map(([s, c]: [string, any]) => (
            <div key={s} style={{ textAlign: 'center', padding: '0.4rem', background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c}</div>
              <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </Section>

      {data.top_segments?.length > 0 && (
        <Section title="Top Segments">
          <p style={{ fontSize: '0.85rem' }}>{data.top_segments.join(', ')}</p>
        </Section>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value ?? 0}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', borderBottom: '2px solid #000', paddingBottom: '0.2rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  return <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>{k}:</strong> {v || '—'}</p>;
}

function Empty({ msg }: { msg: string }) {
  return <p style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', padding: '2rem' }}>{msg}</p>;
}
