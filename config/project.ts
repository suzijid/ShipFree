// ============================================================================
// Gradia — Project configuration, types & constants
// ============================================================================

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PENDING_ASSIGNMENT: 'pending_assignment',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  pending_assignment: 'En attente d\'assignation',
  active: 'Actif',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

export const USER_ROLE = {
  CLIENT: 'client',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  manager: 'Chef de projet',
  admin: 'Administrateur',
}

export const PROPERTY_TYPES = [
  'appartement',
  'maison',
  'studio',
  'loft',
  'local_commercial',
  'autre',
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  loft: 'Loft',
  local_commercial: 'Local commercial',
  autre: 'Autre',
}

export const RENOVATION_TYPES = [
  'complete',
  'partielle',
  'extension',
  'amenagement',
  'decoration',
] as const

export type RenovationType = (typeof RENOVATION_TYPES)[number]

export const BUDGET_RANGES = [
  '5000-15000',
  '15000-30000',
  '30000-50000',
  '50000-100000',
  '100000-200000',
  '200000+',
] as const

export type BudgetRange = (typeof BUDGET_RANGES)[number]

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  '5000-15000': '5 000 - 15 000 €',
  '15000-30000': '15 000 - 30 000 €',
  '30000-50000': '30 000 - 50 000 €',
  '50000-100000': '50 000 - 100 000 €',
  '100000-200000': '100 000 - 200 000 €',
  '200000+': '200 000 € et plus',
}

export const MIN_PROJECT_BUDGET = 5000

/** Structured output from the AI questionnaire */
export interface AiProjectSummary {
  propertyType: string
  surface: number | null
  rooms: string[]
  renovationType: string
  workDescription: string
  constraints: string[]
  style: string
  budgetRange: string
  urgency: string
  additionalNotes: string
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
