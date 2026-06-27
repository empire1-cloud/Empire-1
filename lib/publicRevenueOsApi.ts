const API_BASE = '/api/revenue-os';

async function publicFetch(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error('Backend unavailable');
    }
    return res.json();
  } catch {
    clearTimeout(timeout);
    throw new Error('Backend unavailable');
  }
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
