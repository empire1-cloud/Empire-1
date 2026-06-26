const API_BASE = '/api/revenue-os';

async function publicFetch(url: string, options?: RequestInit) {
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

export function runPublicRevenueOS(payload: any) {
  return publicFetch(`${API_BASE}/run`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createPublicLead(payload: any) {
  return publicFetch(`${API_BASE}/leads`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createPublicCheckout(payload: any) {
  return publicFetch(`${API_BASE}/checkout`, { method: 'POST', body: JSON.stringify(payload) });
}
