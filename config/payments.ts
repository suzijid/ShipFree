/**
 * Payment Configuration
 *
 * Gradia revenue model: free platform + design services upsell + 10% commission on artisan payments.
 * No SaaS tiers, no paid modules.
 */

export type PaymentProvider = 'stripe' | 'polar' | 'lemonsqueezy'

// ============================================================================
// Gradia — Marketplace configuration
// ============================================================================

/**
 * Default marketplace configuration.
 * The `commissionRate` here is the platform default (10%).
 * Per-project rates can override this via `project.commissionRate`.
 * When calculating commission, prefer the project-level rate if set.
 */
export const MARKETPLACE_CONFIG = {
  commissionRate: 0.10,
  stripeConnectCountry: 'FR',
  currency: 'eur',
} as const

/**
 * Resolve the commission rate for a given project.
 * Falls back to the global default if no project-level rate is set.
 */
export const getProjectCommissionRate = (projectCommissionRate?: string | null): number => {
  if (projectCommissionRate != null) {
    const rate = Number(projectCommissionRate)
    if (!isNaN(rate) && rate >= 0 && rate <= 1) return rate
  }
  return MARKETPLACE_CONFIG.commissionRate
}

export type DesignServicePricingKey = 'consultation' | '2d_plans' | '3d_renders' | 'full_package'

export const DESIGN_SERVICE_PRICING: Record<DesignServicePricingKey, { label: string; amount: number; currency: 'eur' }> = {
  consultation: { label: 'Consultation déco', amount: 15000, currency: 'eur' },
  '2d_plans': { label: 'Plans 2D', amount: 49000, currency: 'eur' },
  '3d_renders': { label: 'Rendus 3D', amount: 79000, currency: 'eur' },
  full_package: { label: 'Pack complet', amount: 119000, currency: 'eur' },
}
