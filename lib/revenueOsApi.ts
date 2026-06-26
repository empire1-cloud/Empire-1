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

export function runRevenueOS(payload: any) {
  return fetchJSON(`${API_BASE}/run`, { method: 'POST', body: JSON.stringify(payload) });
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
