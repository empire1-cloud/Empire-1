/**
 * SLA113 Admin API Helper
 * 
 * This module ONLY contains calls to INTERNAL ADMIN endpoints:
 * - /api/admin/universe/*
 * - /api/song/*
 * 
 * STRICT BOUNDARY:
 * - Admin authentication REQUIRED
 * - Never call from public UI
 * - Admin console (SLA113) ONLY
 * - Contains internal engines and orchestration logic
 */

const getApiBase = (): string => {
  const envUrl = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : process.env.NEXT_PUBLIC_API_URL
  
  if (envUrl) return envUrl.replace(/\/$/, '')
  
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'southernlifestyle.org'
  return `${protocol}//${domain}`
}

const API_BASE = getApiBase()

export interface SLA113VoiceRequest {
  character: string
  text: string
  emotion?: string
  speed?: number
}

export interface Engine {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  category: string
  version: string
}

export interface EngineList {
  engines: Engine[]
  total: number
  categories: string[]
}

export interface AdminAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

function verifyAdminToken(): string {
  if (typeof window === 'undefined') return 'admin-token-dev'
  const token = localStorage.getItem('admin_token')
  return token || 'admin-token-dev'
}

async function adminRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<AdminAPIResponse<T>> {
  try {
    const token = verifyAdminToken()
    const url = `${API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || 'API Error')
    return { success: true, data: result.data || result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

export const getEngines = () => adminRequest<EngineList>('/api/admin/universe/engines')
export const getCanonInfo = () => adminRequest<any>('/api/admin/universe/canon/info')
export const setAdminToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('admin_token', token)
}
export const getAdminToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('admin_token')
  return null
}
