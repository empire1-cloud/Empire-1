'use client';

import { useState } from 'react';

export default function RevenueReceiptPage() {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('other');
  const [currentOffer, setCurrentOffer] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [revenueGoal, setRevenueGoal] = useState('');
  const [linksOrNotes, setLinksOrNotes] = useState('');
  const [desiredOutput, setDesiredOutput] = useState('quick');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setReceipt(null);

    try {
      const res = await fetch('/api/revenue-receipts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          business_type: businessType,
          current_offer: currentOffer,
          target_customer: targetCustomer,
          current_price: currentPrice || null,
          revenue_goal: revenueGoal || null,
          links_or_notes: linksOrNotes || null,
          urgency_level: urgency,
          desired_output_type: desiredOutput,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setReceipt(data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return <RevenueReceiptResult receipt={receipt} onBack={() => setReceipt(null)} />;
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        Empire Receipts Agent
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Turn any business, offer, or creator brand into a Monday-ready revenue receipt.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Business Name" value={businessName} onChange={setBusinessName} placeholder="e.g., Southern Lifestyle" />
        <Select label="Business Type" value={businessType} onChange={setBusinessType}
          options={[
            { value: 'other', label: 'Other' },
            { value: 'saas', label: 'SaaS / Software' },
            { value: 'agency', label: 'Agency / Services' },
            { value: 'ecommerce', label: 'E-commerce' },
            { value: 'creator', label: 'Creator / Influencer' },
            { value: 'consulting', label: 'Consulting / Coaching' },
          ]}
        />
        <Input label="Current Offer / Product" value={currentOffer} onChange={setCurrentOffer} placeholder="What do you sell?" />
        <Input label="Target Customer" value={targetCustomer} onChange={setTargetCustomer} placeholder="Who buys this?" />
        <Input label="Current Price (optional)" value={currentPrice} onChange={setCurrentPrice} placeholder="e.g., $47/mo" />
        <Input label="Revenue Goal (optional)" value={revenueGoal} onChange={setRevenueGoal} placeholder="e.g., $100K ARR" />
        <Input label="Links or Notes (optional)" value={linksOrNotes} onChange={setLinksOrNotes} placeholder="Landing page, social, etc." />
        <Select label="Output Type" value={desiredOutput} onChange={setDesiredOutput}
          options={[
            { value: 'quick', label: 'Quick Receipt — $97 (fast diagnosis + offer + pricing)' },
            { value: 'full', label: 'Full Receipt — $299 (complete system + outreach kit)' },
            { value: 'sprint', label: 'Revenue Sprint — $999 (done-with-you)' },
          ]}
        />
        <Select label="Urgency" value={urgency} onChange={setUrgency}
          options={[
            { value: 'normal', label: 'Normal (48-72h)' },
            { value: 'high', label: 'High (24h)' },
            { value: 'critical', label: 'Critical (same day)' },
          ]}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button onClick={generate} disabled={loading || !businessName || !currentOffer || !targetCustomer}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            cursor: loading || !businessName || !currentOffer || !targetCustomer ? 'not-allowed' : 'pointer',
            opacity: loading || !businessName || !currentOffer || !targetCustomer ? 0.6 : 1,
          }}
        >
          {loading ? 'Generating Receipt...' : 'Generate Revenue Receipt'}
        </button>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '2rem', textAlign: 'center' }}>
        Results in 48–72 hours. Money leak identified. Offer built. Receipt delivered.
      </p>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #ccc',
          borderRadius: 6,
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #ccc',
          borderRadius: 6,
          fontSize: '0.875rem',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function RevenueReceiptResult({ receipt, onBack }: { receipt: any; onBack: () => void }) {
  const d = receipt.diagnosis || {};
  const offer = receipt.fastest_offer || {};
  const buyer = receipt.target_buyer || {};
  const pricing = receipt.pricing_ladder || {};
  const plan = receipt.execution_plan || {};
  const execReceipt = receipt.execution_receipt || {};

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', borderBottom: '2px solid #000', paddingBottom: '0.25rem' }}>{title}</h3>
      {children}
    </div>
  );

  const tag = (label: string, value: string) => (
    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}><strong>{label}:</strong> {value}</p>
  );

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Revenue Receipt</h1>
        <button onClick={onBack} style={{ background: '#eee', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
          New Receipt
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
        Receipt ID: {receipt.receipt_id || '—'} &middot; {receipt.created_at ? new Date(receipt.created_at).toLocaleString() : ''} &middot; {receipt.price_tier || ''}
      </div>

      {section('Diagnosis', (
        <>
          {tag('Business', d.business_name)}
          {tag('Offer', d.current_offer)}
          {tag('Target', d.target_customer)}
          {tag('Current Price', d.current_price)}
          {tag('Revenue Goal', d.revenue_goal)}
          {d.identified_issues?.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Issues Identified</p>
              <ul style={{ fontSize: '0.875rem', margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                {d.identified_issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}
          {d.money_leak && <p style={{ fontSize: '0.875rem', color: '#c00', marginTop: '0.5rem' }}>⚠ {d.money_leak}</p>}
        </>
      ))}

      {section('Fastest Paid Offer', (
        <>
          {tag('Offer Name', offer.offer_name)}
          {tag('Core Promise', offer.core_promise)}
          {tag('Delivery Time', offer.delivery_time)}
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Deliverables</p>
            <ul style={{ fontSize: '0.875rem', margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
              {offer.deliverables?.map((d: string, i: number) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        </>
      ))}

      {section('Target Buyer', (
        <>
          {tag('Primary', buyer.primary)}
          {tag('Secondary', buyer.secondary)}
          {tag('Pain', buyer.buyer_pain)}
          {tag('Budget', buyer.buyer_budget)}
        </>
      ))}

      {section('Pricing Ladder', (
        <div>
          {pricing.tiers?.map((tier: any, i: number) => (
            <div key={i} style={{
              padding: '0.5rem 0.75rem',
              marginBottom: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: 6,
              background: tier.name === pricing.recommended_tier ? '#f0f7ff' : '#fff',
            }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                {tier.name} — {tier.price}
                {tier.name === pricing.recommended_tier && <span style={{ color: '#0066cc', marginLeft: '0.5rem' }}>★ Recommended</span>}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#666' }}>{tier.audience}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#888' }}>{tier.deliverables}</p>
            </div>
          ))}
        </div>
      ))}

      {section('Landing Page Copy', (
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: 6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
          {receipt.landing_page_copy}
        </pre>
      ))}

      {section('DM Script', (
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: 6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
          {receipt.dm_script}
        </pre>
      ))}

      {section('Email Script', (
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: 6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
          {receipt.email_script}
        </pre>
      ))}

      {section('Execution Plan (72 Hours)', (
        <div>
          {Object.entries(plan).map(([phase, data]: [string, any]) => (
            <div key={phase} style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem', textTransform: 'capitalize' }}>
                {phase.replace(/_/g, ' ')} — {data.days}
              </p>
              <ul style={{ fontSize: '0.8rem', margin: 0, paddingLeft: '1.25rem' }}>
                {data.actions?.map((action: string, i: number) => <li key={i}>{action}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ))}

      {section('Execution Receipt', (
        <>
          {tag('Receipt ID', execReceipt.receipt_id)}
          {tag('Generated', execReceipt.generated_at ? new Date(execReceipt.generated_at).toLocaleString() : '')}
          {execReceipt.next_steps?.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Next Steps</p>
              <ol style={{ fontSize: '0.875rem', margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                {execReceipt.next_steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}
          {execReceipt.roi_projection && (
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', background: '#e6ffe6', padding: '0.5rem', borderRadius: 6 }}>
              ROI: {execReceipt.roi_projection}
            </p>
          )}
        </>
      ))}

      {receipt.note && (
        <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', marginTop: '2rem' }}>
          {receipt.note}
        </p>
      )}
    </main>
  );
}
