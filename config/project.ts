// ============================================================================
// Gradia — Project configuration, types & constants
// ============================================================================

// ─── Project Status ─────────────────────────────────────────────────────────

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

// ─── Project Phases (roadmap) ───────────────────────────────────────────────

export const PROJECT_PHASES = [
  'questionnaire',
  'cadrage',
  'conception',
  'devis',
  'travaux',
  'livraison',
  'termine',
] as const

export type ProjectPhase = (typeof PROJECT_PHASES)[number]

export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
  questionnaire: 'Questionnaire',
  cadrage: 'Cadrage',
  conception: 'Conception',
  devis: 'Devis',
  travaux: 'Travaux',
  livraison: 'Livraison',
  termine: 'Terminé',
}

export const PROJECT_PHASE_DESCRIPTIONS: Record<ProjectPhase, string> = {
  questionnaire: 'Remplissage du questionnaire et génération de la fiche projet',
  cadrage: 'Rendez-vous avec votre chef de projet pour définir le plan d\'action',
  conception: 'Phases de conception architecturale (esquisse, APS, APD, PRO)',
  devis: 'Consultation des artisans et sélection des devis',
  travaux: 'Suivi de l\'avancement du chantier',
  livraison: 'Réception des travaux et vérifications finales',
  termine: 'Projet terminé et archivé',
}

// ─── Project Modules (dashboard tabs) ───────────────────────────────────────

export interface ProjectModules {
  design: boolean
  works: boolean
  wallet: boolean
}

export const DEFAULT_PROJECT_MODULES: ProjectModules = {
  design: false,
  works: false,
  wallet: false,
}

// ─── Services (chosen during questionnaire) ─────────────────────────────────

export type ServiceChoice = 'yes' | 'no' | 'maybe'

export interface ProjectServices {
  architect: ServiceChoice
  contractors: ServiceChoice
  adminHelp: ServiceChoice
}

export const DEFAULT_PROJECT_SERVICES: ProjectServices = {
  architect: 'no',
  contractors: 'no',
  adminHelp: 'no',
}

export const SERVICE_LABELS: Record<keyof ProjectServices, string> = {
  architect: 'Architecte / Conception',
  contractors: 'Mise en relation artisans',
  adminHelp: 'Aide administrative',
}

// ─── Next Best Actions (templates per phase) ────────────────────────────────

export interface ActionTemplate {
  label: string
  phase: ProjectPhase
}

export const ACTION_TEMPLATES: ActionTemplate[] = [
  { label: 'Réserver votre rendez-vous de cadrage', phase: 'cadrage' },
  { label: 'Uploader des photos de votre bien', phase: 'cadrage' },
  { label: 'Préparer vos questions pour le rendez-vous', phase: 'cadrage' },
  { label: 'Valider l\'esquisse de conception', phase: 'conception' },
  { label: 'Choisir les matériaux et finitions', phase: 'conception' },
  { label: 'Consulter les devis reçus', phase: 'devis' },
  { label: 'Comparer et valider votre choix d\'artisans', phase: 'devis' },
  { label: 'Vérifier l\'avancement du chantier', phase: 'travaux' },
  { label: 'Signaler un problème ou une question', phase: 'travaux' },
  { label: 'Compléter la checklist de réception', phase: 'livraison' },
  { label: 'Valider la livraison des travaux', phase: 'livraison' },
]

// ─── Validation Milestones ──────────────────────────────────────────────────

export interface ValidationTemplate {
  label: string
  phase: ProjectPhase
}

export const VALIDATION_TEMPLATES: ValidationTemplate[] = [
  { label: 'Valider le brief projet', phase: 'cadrage' },
  { label: 'Valider les options de conception', phase: 'conception' },
  { label: 'Valider le devis retenu', phase: 'devis' },
  { label: 'Valider la réception des travaux', phase: 'livraison' },
]

// ─── Payment Schedule Statuses ──────────────────────────────────────────────

export const SCHEDULE_PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const

export type SchedulePaymentStatus = (typeof SCHEDULE_PAYMENT_STATUS)[keyof typeof SCHEDULE_PAYMENT_STATUS]

export const SCHEDULE_PAYMENT_STATUS_LABELS: Record<SchedulePaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  overdue: 'En retard',
}

// ─── Design Phases (for Conception module) ──────────────────────────────────

export const DESIGN_PHASES = ['esquisse', 'aps', 'apd', 'pro'] as const

export type DesignPhase = (typeof DESIGN_PHASES)[number]

export const DESIGN_PHASE_LABELS: Record<DesignPhase, string> = {
  esquisse: 'Esquisse',
  aps: 'APS (Avant-Projet Sommaire)',
  apd: 'APD (Avant-Projet Détaillé)',
  pro: 'PRO (Projet)',
}

// ─── User Roles ─────────────────────────────────────────────────────────────

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

// ─── Property Types ─────────────────────────────────────────────────────────

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

// ─── Renovation Types ───────────────────────────────────────────────────────

export const RENOVATION_TYPES = [
  'complete',
  'partielle',
  'extension',
  'amenagement',
  'decoration',
] as const

export type RenovationType = (typeof RENOVATION_TYPES)[number]

// ─── Budget Ranges ──────────────────────────────────────────────────────────

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

// ─── AI Summary ─────────────────────────────────────────────────────────────

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

// ─── Payment Status (Stripe for MOE fee) ────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

// ─── File Categories (Documents tab) ────────────────────────────────────────

export const FILE_CATEGORIES = [
  'plans',
  'devis',
  'photos',
  'administratif',
  'conception',
] as const

export type FileCategory = (typeof FILE_CATEGORIES)[number]

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  plans: 'Plans',
  devis: 'Devis',
  photos: 'Photos',
  administratif: 'Administratif',
  conception: 'Conception',
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// ─── Material Categories (Design module) ──────────────────────────────────

export const MATERIAL_CATEGORIES = [
  'sols',
  'murs',
  'menuiseries',
  'cuisine',
  'sdb',
  'autre',
] as const

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  sols: 'Sols',
  murs: 'Murs & Plafonds',
  menuiseries: 'Menuiseries',
  cuisine: 'Cuisine',
  sdb: 'Salle de bain',
  autre: 'Autre',
}

export const MATERIAL_STATUS = ['shortlisted', 'validated', 'ordered', 'delivered'] as const

export type MaterialStatus = (typeof MATERIAL_STATUS)[number]

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  shortlisted: 'Présélectionné',
  validated: 'Validé',
  ordered: 'Commandé',
  delivered: 'Livré',
}

// ─── Message Channels ─────────────────────────────────────────────────────

export const DEFAULT_CHANNELS = [
  { name: 'general', label: 'Général', order: 0 },
  { name: 'decisions', label: 'Décisions', order: 1 },
  { name: 'administratif', label: 'Administratif', order: 2 },
  { name: 'chantier_urgent', label: 'Chantier urgent', order: 3 },
] as const

export type ChannelName = (typeof DEFAULT_CHANNELS)[number]['name']

// ─── Service Options (questionnaire → modules mapping) ────────────────────

export const SERVICE_OPTIONS = [
  {
    key: 'architect' as const,
    label: 'Un architecte pour concevoir mon projet',
    description: 'Conception architecturale, esquisse, plans, suivi de conception',
    module: 'design' as const,
  },
  {
    key: 'contractors' as const,
    label: 'Un gestionnaire pour coordonner les travaux',
    description: 'Mise en relation artisans, suivi de chantier',
    module: 'works' as const,
  },
  {
    key: 'adminHelp' as const,
    label: 'Un suivi financier et des appels de fonds',
    description: 'Échéancier de paiement, appels de fonds, suivi budget',
    module: 'wallet' as const,
  },
] as const
