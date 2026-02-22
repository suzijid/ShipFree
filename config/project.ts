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
  CONTRACTOR: 'contractor',
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  manager: 'Chef de projet',
  admin: 'Administrateur',
  contractor: 'Artisan',
}

// ─── Matching Status ──────────────────────────────────────────────────────────

export const MATCHING_STATUS = {
  OPEN: 'open',
  MATCHING: 'matching',
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

export type MatchingStatus = (typeof MATCHING_STATUS)[keyof typeof MATCHING_STATUS]

export const MATCHING_STATUS_LABELS: Record<MatchingStatus, string> = {
  open: 'Ouvert',
  matching: 'Recherche d\'artisans',
  matched: 'Artisans confirmés',
  in_progress: 'Travaux en cours',
  completed: 'Terminé',
}

// ─── Contractor Assignment Status ─────────────────────────────────────────────

export const CONTRACTOR_ASSIGNMENT_STATUS = {
  INVITED: 'invited',
  PROPOSAL_SENT: 'proposal_sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const

export type ContractorAssignmentStatus = (typeof CONTRACTOR_ASSIGNMENT_STATUS)[keyof typeof CONTRACTOR_ASSIGNMENT_STATUS]

export const CONTRACTOR_ASSIGNMENT_STATUS_LABELS: Record<ContractorAssignmentStatus, string> = {
  invited: 'Invité',
  proposal_sent: 'Devis envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  active: 'Actif',
  completed: 'Terminé',
}

// ─── Proposal Status ──────────────────────────────────────────────────────────

export const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  REVISED: 'revised',
} as const

export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS]

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  accepted: 'Accepté',
  rejected: 'Refusé',
  revised: 'Révisé',
}

// ─── Contractor Specialties ───────────────────────────────────────────────────

export const CONTRACTOR_SPECIALTIES = [
  'plomberie',
  'electricite',
  'maconnerie',
  'menuiserie',
  'peinture',
  'carrelage',
  'chauffage_climatisation',
  'isolation',
  'cuisine',
  'salle_de_bain',
  'toiture',
  'facade',
  'demolition',
  'general',
] as const

export type ContractorSpecialty = (typeof CONTRACTOR_SPECIALTIES)[number]

export const CONTRACTOR_SPECIALTY_LABELS: Record<ContractorSpecialty, string> = {
  plomberie: 'Plomberie',
  electricite: 'Électricité',
  maconnerie: 'Maçonnerie',
  menuiserie: 'Menuiserie',
  peinture: 'Peinture',
  carrelage: 'Carrelage',
  chauffage_climatisation: 'Chauffage / Climatisation',
  isolation: 'Isolation',
  cuisine: 'Cuisine',
  salle_de_bain: 'Salle de bain',
  toiture: 'Toiture',
  facade: 'Façade',
  demolition: 'Démolition',
  general: 'Général / Multi-corps',
}

// ─── Design Service Types ─────────────────────────────────────────────────────

export const DESIGN_SERVICE_TYPES = [
  'consultation',
  '2d_plans',
  '3d_renders',
  'full_package',
] as const

export type DesignServiceType = (typeof DESIGN_SERVICE_TYPES)[number]

export const DESIGN_SERVICE_TYPE_LABELS: Record<DesignServiceType, string> = {
  consultation: 'Consultation déco',
  '2d_plans': 'Plans 2D',
  '3d_renders': 'Rendus 3D',
  full_package: 'Pack complet',
}

// ─── Design Booking Workflow Statuses ─────────────────────────────────────────

export const DESIGN_BOOKING_WORKFLOW_STEPS = [
  'booking',
  'assignation_designer',
  'brief',
  'esquisse',
  'revisions',
  'livraison',
] as const

export type DesignBookingWorkflowStep = (typeof DESIGN_BOOKING_WORKFLOW_STEPS)[number]

export const DESIGN_BOOKING_WORKFLOW_LABELS: Record<DesignBookingWorkflowStep, string> = {
  booking: 'R\u00e9servation',
  assignation_designer: 'Assignation designer',
  brief: 'Brief cr\u00e9atif',
  esquisse: 'Esquisse',
  revisions: 'R\u00e9visions',
  livraison: 'Livraison',
}

export const DESIGN_BOOKING_WORKFLOW_DESCRIPTIONS: Record<DesignBookingWorkflowStep, string> = {
  booking: 'Votre r\u00e9servation a \u00e9t\u00e9 confirm\u00e9e',
  assignation_designer: 'Un designer est assign\u00e9 \u00e0 votre projet',
  brief: 'D\u00e9finition du cahier des charges cr\u00e9atif',
  esquisse: 'Premi\u00e8res propositions de design',
  revisions: 'Ajustements et modifications',
  livraison: 'Livraison des fichiers finaux',
}

/** Maps the DB status values to the workflow step for display purposes */
export const STATUS_TO_WORKFLOW_STEP: Record<string, DesignBookingWorkflowStep> = {
  pending: 'booking',
  scheduled: 'booking',
  assignation_designer: 'assignation_designer',
  brief: 'brief',
  esquisse: 'esquisse',
  revisions: 'revisions',
  in_progress: 'esquisse',
  delivered: 'livraison',
  livraison: 'livraison',
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

// ─── Ownership Status ──────────────────────────────────────────────────────

export const OWNERSHIP_STATUSES = ['owner', 'buying', 'tenant'] as const

export type OwnershipStatus = (typeof OWNERSHIP_STATUSES)[number]

export const OWNERSHIP_STATUS_LABELS: Record<OwnershipStatus, string> = {
  owner: 'Propriétaire',
  buying: 'Sur le point de signer',
  tenant: 'Locataire',
}

// ─── Design Level ──────────────────────────────────────────────────────────

export const DESIGN_LEVELS = ['full', 'moderate', 'none', 'undecided'] as const

export type DesignLevel = (typeof DESIGN_LEVELS)[number]

export const DESIGN_LEVEL_LABELS: Record<DesignLevel, string> = {
  full: 'Aide complète',
  moderate: 'Aide modérée',
  none: 'Aucune aide',
  undecided: 'Indécis',
}

// ─── Involvement Level ─────────────────────────────────────────────────────

export const INVOLVEMENT_LEVELS = ['very', 'moderate', 'low', 'undecided'] as const

export type InvolvementLevel = (typeof INVOLVEMENT_LEVELS)[number]

export const INVOLVEMENT_LEVEL_LABELS: Record<InvolvementLevel, string> = {
  very: 'Très impliqué',
  moderate: 'Assez impliqué',
  low: 'Peu impliqué',
  undecided: 'Indécis',
}

// ─── Top Priority ──────────────────────────────────────────────────────────

export const TOP_PRIORITIES = ['speed', 'quality', 'price'] as const

export type TopPriority = (typeof TOP_PRIORITIES)[number]

export const TOP_PRIORITY_LABELS: Record<TopPriority, string> = {
  speed: 'Rapidité',
  quality: 'Qualité',
  price: 'Prix',
}

// ─── Business Types (local commercial) ──────────────────────────────────────

export const BUSINESS_TYPES = [
  'restaurant',
  'boutique',
  'bureau',
  'cabinet_medical',
  'salon_coiffure',
  'autre',
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: 'Restaurant / Bar',
  boutique: 'Boutique / Commerce',
  bureau: 'Bureau / Espace de travail',
  cabinet_medical: 'Cabinet médical',
  salon_coiffure: 'Salon de coiffure / Beauté',
  autre: 'Autre activité',
}

// ─── Commercial Rooms ────────────────────────────────────────────────────────

export const COMMERCIAL_ROOMS = [
  { id: 'espace_vente', label: 'Espace de vente' },
  { id: 'bureau', label: 'Bureau' },
  { id: 'reserve', label: 'Réserve / Stockage' },
  { id: 'cuisine_pro', label: 'Cuisine professionnelle' },
  { id: 'sanitaires', label: 'Sanitaires' },
  { id: 'salle_attente', label: 'Salle d\'attente' },
  { id: 'salle_reunion', label: 'Salle de réunion' },
  { id: 'vestiaire', label: 'Vestiaire' },
] as const

// ─── Commercial Constraints ──────────────────────────────────────────────────

export const COMMERCIAL_CONSTRAINTS = [
  { id: 'erp', label: 'Normes ERP (accès public)' },
  { id: 'extraction_ventilation', label: 'Extraction / Ventilation' },
  { id: 'securite_incendie', label: 'Sécurité incendie' },
  { id: 'enseigne_vitrine', label: 'Enseigne / Vitrine' },
  { id: 'nuisances_sonores', label: 'Nuisances sonores' },
  { id: 'horaires_travaux', label: 'Horaires de travaux restreints' },
] as const

// ─── Commercial Styles ───────────────────────────────────────────────────────

export const COMMERCIAL_STYLES = [
  { id: 'professionnel', label: 'Professionnel / Corporate', icon: 'Building2' },
  { id: 'chaleureux', label: 'Chaleureux / Accueillant', icon: 'Sparkles' },
  { id: 'luxe', label: 'Luxe / Haut de gamme', icon: 'Award' },
  { id: 'industriel_brut', label: 'Industriel / Brut', icon: 'Wrench' },
  { id: 'nature_eco', label: 'Nature / Éco-responsable', icon: 'Leaf' },
  { id: 'personnalise_marque', label: 'Personnalisé (identité marque)', icon: 'Palette' },
] as const

// ─── Maison Extra Rooms ──────────────────────────────────────────────────────

export const MAISON_EXTRA_ROOMS = [
  { id: 'sous_sol', label: 'Sous-sol / Cave' },
  { id: 'grenier', label: 'Grenier / Combles' },
] as const

// ─── Maison Exterior Elements ────────────────────────────────────────────────

export const MAISON_EXTERIOR_ELEMENTS = [
  { id: 'jardin', label: 'Jardin' },
  { id: 'piscine', label: 'Piscine' },
  { id: 'terrasse_ext', label: 'Terrasse' },
  { id: 'cloture', label: 'Clôture' },
  { id: 'portail', label: 'Portail' },
] as const

// ─── Studio Rooms ────────────────────────────────────────────────────────────

export const STUDIO_ROOMS = [
  { id: 'piece_principale', label: 'Pièce principale' },
  { id: 'coin_cuisine', label: 'Coin cuisine' },
  { id: 'salle_de_bain', label: 'Salle de bain' },
  { id: 'wc', label: 'WC' },
] as const

// ─── Extension Types ─────────────────────────────────────────────────────────

export const EXTENSION_TYPES = [
  'surelevation',
  'veranda',
  'annexe_sol',
  'autre',
] as const

export type ExtensionType = (typeof EXTENSION_TYPES)[number]

export const EXTENSION_TYPE_LABELS: Record<ExtensionType, string> = {
  surelevation: 'Surélévation',
  veranda: 'Véranda',
  annexe_sol: 'Annexe au sol',
  autre: 'Autre',
}

// ─── Current State Options ───────────────────────────────────────────────────

export const CURRENT_STATE_OPTIONS = [
  { id: 'jamais_renove', label: 'Jamais rénové' },
  { id: 'renove_ancien', label: 'Rénové il y a plus de 15 ans' },
  { id: 'recent', label: 'Rénové récemment' },
] as const

// ─── Diagnostic Options ──────────────────────────────────────────────────────

export const DIAGNOSTIC_OPTIONS = [
  { id: 'dpe', label: 'DPE (Diagnostic de Performance Énergétique)' },
  { id: 'amiante', label: 'Diagnostic amiante' },
  { id: 'plomb', label: 'Diagnostic plomb' },
] as const

// ─── AI Summary ─────────────────────────────────────────────────────────────

/** Structured output from the AI questionnaire */
export interface AiProjectSummary {
  propertyType: string
  surface: number | null
  rooms: Record<string, number> | string[]
  renovationType: string
  workDescription: string
  constraints: string[]
  style: string
  budgetRange: string
  urgency: string
  additionalNotes: string
  ownershipStatus?: string
  designLevel?: string
  involvementLevel?: string
  topPriority?: string
  postalCode?: string
  city?: string
  // Dynamic questionnaire fields
  businessType?: string
  maisonDetails?: {
    floors?: number
    exterior?: string[]
    roofWork?: boolean
    facadeWork?: boolean
  }
  appartementDetails?: {
    floor?: number
    elevator?: boolean
    parking?: boolean
    cave?: boolean
  }
  extensionDetails?: {
    type?: string
    surfaceWanted?: string
    pluChecked?: boolean
    permisNeeded?: boolean
  }
  renoCompleteDetails?: {
    currentState?: string
    diagnostics?: string[]
    occupiedDuringWorks?: boolean
  }
  tenantDetails?: {
    ownerApproval?: 'yes' | 'no' | 'in_progress'
    reversibleOnly?: boolean
  }
  buyingDetails?: {
    expectedSignDate?: string
    renoConditional?: boolean
  }
  guidedDescription?: {
    currentState?: string
    desiredChanges?: string
    expectedResult?: string
    additionalInfo?: string
  }
  departement?: string
  region?: string
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
  'design_deliverable',
] as const

export type FileCategory = (typeof FILE_CATEGORIES)[number]

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  plans: 'Plans',
  devis: 'Devis',
  photos: 'Photos',
  administratif: 'Administratif',
  conception: 'Conception',
  design_deliverable: 'Livrable design',
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

// ─── Service Options (questionnaire) ──────────────────────────────────────

export const SERVICE_OPTIONS = [
  {
    key: 'architect' as const,
    label: 'Un architecte pour concevoir mon projet',
    description: 'Conception architecturale, esquisse, plans, suivi de conception',
  },
  {
    key: 'contractors' as const,
    label: 'Un gestionnaire pour coordonner les travaux',
    description: 'Mise en relation artisans, suivi de chantier',
  },
  {
    key: 'adminHelp' as const,
    label: 'Un suivi financier et des appels de fonds',
    description: 'Échéancier de paiement, appels de fonds, suivi budget',
  },
] as const
