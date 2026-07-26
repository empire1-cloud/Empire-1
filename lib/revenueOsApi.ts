const API_BASE = '/api/revenue-os';

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function buildContinuityResult(payload: any, reason: unknown) {
  const business = payload.business_name || 'Your business';
  const offer = payload.current_offer || 'your current offer';
  const target = payload.target_customer || 'your target customer';
  const currentPrice = payload.current_price || 'Not set';
  const revenueGoal = payload.revenue_goal || 'Not specified';

  return {
    receipt_id: `CONTINUITY-${Date.now().toString(36).toUpperCase()}`,
    command_id: 'local-continuity-mode',
    continuity_mode: true,
    backend_verified: false,
    receipt: {
      revenue_diagnosis: {
        business_name: business,
        current_offer: offer,
        target_customer: target,
        current_price: currentPrice,
        revenue_goal: revenueGoal,
        money_leak: `The fastest path is packaging ${offer} as a clear paid outcome for ${target}.`,
      },
      fastest_paid_offer: `${offer} — packaged execution offer for ${target}`,
      price_ladder: {
        tiers: [
          { name: 'Quick Start', price: '$97', audience: 'Fast diagnosis and next step' },
          { name: 'Core System', price: '$299', audience: 'Complete revenue output' },
          { name: 'Revenue Sprint', price: '$999', audience: 'Done-with-you execution' },
        ],
        recommended: 'Core System',
      },
      seventy_two_hour_action_plan: {
        day_1: [`Define the paid outcome for ${offer}`, `Build a list of 25 ${target}`, 'Write one direct outreach message'],
        day_2: ['Send the first outreach batch', 'Create a payment path', 'Prepare a delivery checklist'],
        day_3: ['Follow up with engaged buyers', 'Close the first paid commitment', 'Issue a delivery receipt'],
      },
    },
    forged_offers: [
      { name: `${offer} Quick Audit`, price: '$97', promise: 'A clear revenue diagnosis and next move', target_buyer: target, turnaround: '24 hours' },
      { name: `${offer} Revenue System`, price: '$299', promise: 'Offer, buyer, outreach, and delivery system', target_buyer: target, turnaround: '48 hours' },
      { name: `${offer} Revenue Sprint`, price: '$999', promise: 'Done-with-you execution and refinement', target_buyer: target, turnaround: 'One weekend' },
    ],
    buyer_profiles: [
      { persona_type: 'Primary Buyer', segment: target, priority_score: 90, pain_point: `Needs a faster, clearer path to buy ${offer}.` },
      { persona_type: 'Referral Partner', segment: 'Partner channel', priority_score: 82, pain_point: `Needs a reliable offer to recommend to ${target}.` },
      { persona_type: 'Expansion Buyer', segment: 'Existing network', priority_score: 76, pain_point: `Already understands the value but needs a packaged next step.` },
    ],
    outreach_campaign: {
      cold_dms: [
        `Hey — quick question. Are you currently looking for help with ${offer}, or is that still being handled manually?`,
        `I built a focused ${offer} package for ${target}. It is designed to produce a usable result fast. Want the breakdown?`,
      ],
      cold_emails: [
        `Subject: A faster path for ${business}\n\nI mapped ${offer} into a clear paid system for ${target}: one defined outcome, a simple price ladder, direct outreach, and a delivery receipt. Want the one-page breakdown?`,
      ],
    },
    risks: [
      `Live backend verification is unavailable. This output was generated in clearly labeled local continuity mode.`,
      reason instanceof Error ? reason.message : 'Upstream API unavailable.',
    ],
  };
}

export async function runRevenueOS(payload: any) {
  try {
    return await fetchJSON(`${API_BASE}/run`, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    return buildContinuityResult(payload, error);
  }
}

export function forgeOffers(payload: any) {
  return fetchJSON(`${API_BASE}/offer-forge`, { method: 'POST', body: JSON.stringify(payload) });
}

export function findBuyers(payload: any) {
  return fetchJSON(`${API_BASE}/buyer-finder`, { method: 'POST', body: JSON.stringify(payload) });
}

export function generateOutreach(payload: any) {
  return fetchJSON(`${API_BASE}/outreach`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createLead(payload: any) {
  return fetchJSON(`${API_BASE}/leads`, { method: 'POST', body: JSON.stringify(payload) });
}

export function listLeads(status?: string) {
  const qs = status ? `?status=${status}` : '';
  return fetchJSON(`${API_BASE}/leads${qs}`);
}

export function updateLead(leadId: string, payload: any) {
  return fetchJSON(`${API_BASE}/leads/${leadId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function createCheckout(payload: any) {
  return fetchJSON(`${API_BASE}/checkout`, { method: 'POST', body: JSON.stringify(payload) });
}

export function generateDeliveryReceipt(payload: any) {
  return fetchJSON(`${API_BASE}/delivery-receipt`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getRevenueOSAnalytics() {
  return fetchJSON(`${API_BASE}/analytics`);
}

export function getRevenueOSDashboard() {
  return fetchJSON(`${API_BASE}/dashboard`);
}
