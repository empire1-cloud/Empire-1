export type Sla113Role = 'operator_standard' | 'operator_advanced' | 'operator_executive' | 'engineer_platform';

const STORAGE_KEY = 'sla113_admin_token';
const ROLE_KEY = 'sla113_admin_role';

export function getSla113AdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function getSla113AdminRole(): Sla113Role | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ROLE_KEY) as Sla113Role | null;
}

export function setSla113Session(key: string, role: Sla113Role): void {
  localStorage.setItem(STORAGE_KEY, key);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSla113Session(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getSla113AdminHeaders(): Record<string, string> {
  const key = getSla113AdminToken();
  const role = getSla113AdminRole();
  const headers: Record<string, string> = {};
  if (key) headers['X-SLA113-Key'] = key;
  if (role) headers['X-SLA113-Role'] = role;
  return headers;
}
