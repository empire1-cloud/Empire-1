import { PUBLIC_API_URL } from 'astro:env/client';

const BASE = (PUBLIC_API_URL || 'http://localhost:8001').replace(/\/+$/, '');

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText} — ${path}`);
  }
  return res.json();
}

export interface HealthStatus {
  status: string;
  pipeline: string;
  models: Record<string, string>;
  engines: string[];
}

export interface CoreStatus {
  status: string;
  core: string;
  engines: Record<string, string>;
  models: Record<string, string>;
  drift_report: Record<string, unknown>;
  executions_logged: number;
}

export interface EngineList {
  [name: string]: string;
}

export interface EvalPresets {
  [preset: string]: string[];
}

export interface PipelineTemplates {
  [name: string]: unknown;
}

export const api = {
  health: () => fetchJSON<HealthStatus>('/api/health'),
  coreStatus: () => fetchJSON<CoreStatus>('/api/core/status'),
  coreLog: (limit = 50) => fetchJSON<{ log: unknown[]; total_executions: number }>(`/api/core/log?limit=${limit}`),
  pipelineEngines: () => fetchJSON<EngineList>('/api/pipeline/engines'),
  pipelineTemplates: () => fetchJSON<PipelineTemplates>('/api/pipeline/templates'),
  evalPresets: () => fetchJSON<EvalPresets>('/api/evaluate/presets'),
};
