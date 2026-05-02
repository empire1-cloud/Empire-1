/**
 * EMPIRE ONE Billing API Helper
 * 
 * Public billing endpoints for Stripe integration.
 */

const getApiBase = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  return '' // Next.js rewrites handle this
}

const API_BASE = getApiBase()

export interface BillingResponse<T = any> {
  success: boolean
  checkout_url?: string
  portal_url?: string
  tier?: string
  error?: string
  data?: T
}

async function billingRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: any
): Promise<BillingResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || 'Billing Error')
    return result
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

/**
 * Create Stripe checkout session
 */
export const createCheckoutSession = (tierId: string, email: string) => 
  billingRequest(`/api/empire1/billing/checkout?tier_id=${tierId}&customer_email=${email}`, 'POST')

/**
 * Get Stripe customer portal URL
 */
export const getCustomerPortal = (customerId: string) =>
  billingRequest(`/api/empire1/billing/portal?customer_id=${customerId}`, 'GET')

/**
 * Get available subscription tiers
 */
export const getSubscriptionTiers = () =>
  billingRequest('/api/empire1/subscription/tiers', 'GET')
