const API_BASE = '/api/gtm';

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GTM API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export function getGtmContext() {
  return fetchJSON(`${API_BASE}/context`);
}

export function updateGtmContext(payload: any) {
  return fetchJSON(`${API_BASE}/context`, { method: 'POST', body: JSON.stringify(payload) });
}

export function scoreAccount(payload: any) {
  return fetchJSON(`${API_BASE}/score-account`, { method: 'POST', body: JSON.stringify(payload) });
}

export function scoreBuyers(payload: any) {
  return fetchJSON(`${API_BASE}/score-buyers`, { method: 'POST', body: JSON.stringify(payload) });
}

export function detectSignals(payload: any) {
  return fetchJSON(`${API_BASE}/detect-signals`, { method: 'POST', body: JSON.stringify(payload) });
}

export function buildSignalSequence(payload: any) {
  return fetchJSON(`${API_BASE}/signal-to-sequence`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createCampaignPlan(payload: any) {
  return fetchJSON(`${API_BASE}/campaign-plan`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getCampaigns() {
  return fetchJSON(`${API_BASE}/campaigns`);
}

export function runWeeklyGtmUpdate(payload: any) {
  return fetchJSON(`${API_BASE}/weekly-update`, { method: 'POST', body: JSON.stringify(payload) });
}
