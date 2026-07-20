import { getSla113AdminHeaders } from '@/lib/sla113Auth'

/**
 * SLA113 Universe API Helper
 * 
 * High-level orchestration for:
 * - Image Generation (Vision Smith)
 * - Voice Generation (Voice King)
 * - SFX/Ambient (Sonic Forge)
 * - Engine Management
 */

const getApiBase = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL
  
  if (envUrl) return envUrl.replace(/\/$/, '')
  
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'empire1.cloud'
  return `${protocol}//${domain}`
}

const API_BASE = getApiBase()

interface ApiResponse<T = any> {
  success: boolean;
  status?: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: any;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getSla113AdminHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
  created_at: string;
}

export const universeApi = {
  // Image Generation
  getImageGenerations: () => fetchApi<ImageGeneration[]>('/foundry/api/audit-state'), // Using audit-state as placeholder if specific endpoint missing
  generateImage: (data: any) =>
    fetchApi<ImageGeneration>('/foundry/api/approve', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  // Voice Generation
  getVoices: () => fetchApi<any[]>('/sla113/universe/pipelines'), // Placeholders for missing endpoints
  
  // Engine Registry
  getEngines: () => fetchApi<any>('/sla113/universe/engines/registry'),
  
  // Canon Info
  getCanonInfo: () => fetchApi<any>('/sla113/universe/canon'),
};

export default universeApi;
