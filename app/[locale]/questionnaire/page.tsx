'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from '@/i18n/navigation'
import {
  Home,
  Building2,
  Ruler,
  PaintBucket,
  Wallet,
  CheckCircle2,
  Hammer,
  Sparkles,
  Wrench,
  LayoutDashboard,
  Palette,
  UserCog,
  MapPin,
  KeyRound,
  Target,
  HelpCircle,
  Minus,
  Plus,
  Zap,
  Award,
  PiggyBank,
  Store,
  Leaf,
  AlertTriangle,
  Info,
  ChevronDown,
  Calendar,
  FileCheck,
} from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { useSession } from '@/lib/auth/auth-client'
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  RENOVATION_TYPES,
  BUDGET_RANGES,
  BUDGET_RANGE_LABELS,
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  COMMERCIAL_ROOMS,
  COMMERCIAL_CONSTRAINTS,
  COMMERCIAL_STYLES,
  MAISON_EXTRA_ROOMS,
  MAISON_EXTERIOR_ELEMENTS,
  STUDIO_ROOMS,
  EXTENSION_TYPES,
  EXTENSION_TYPE_LABELS,
  CURRENT_STATE_OPTIONS,
  DIAGNOSTIC_OPTIONS,
  type PropertyType,
  type RenovationType,
  type BudgetRange,
  type BusinessType,
  type ExtensionType,
} from '@/config/project'

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuestionnaireData {
  propertyType: PropertyType | ''
  ownershipStatus: 'owner' | 'buying' | 'tenant' | ''
  postalCode: string
  city: string
  renovationType: RenovationType | ''
  surface: string
  rooms: Record<string, number>
  constraints: string[]
  workDescription: string
  style: string
  budgetRange: BudgetRange | ''
  urgency: string
  designLevel: 'full' | 'moderate' | 'none' | 'undecided' | ''
  involvementLevel: 'very' | 'moderate' | 'low' | 'undecided' | ''
  topPriority: 'speed' | 'quality' | 'price' | ''
  // New dynamic fields
  businessType: BusinessType | ''
  maisonFloors: string
  maisonExterior: string[]
  maisonRoofWork: boolean
  maisonFacadeWork: boolean
  appartementFloor: string
  appartementElevator: boolean
  appartementParking: boolean
  appartementCave: boolean
  extensionType: ExtensionType | ''
  extensionSurface: string
  extensionPlu: boolean
  extensionPermis: boolean
  renoCurrentState: string
  renoDiagnostics: string[]
  renoOccupied: boolean
  tenantApproval: 'yes' | 'no' | 'in_progress' | ''
  tenantReversible: boolean
  buyingSignDate: string
  buyingConditional: boolean
  descCurrentState: string
  descDesiredChanges: string
  descExpectedResult: string
  descAdditional: string
  departement: string
  region: string
}

const INITIAL_DATA: QuestionnaireData = {
  propertyType: '',
  ownershipStatus: '',
  postalCode: '',
  city: '',
  renovationType: '',
  surface: '',
  rooms: {},
  constraints: [],
  workDescription: '',
  style: '',
  budgetRange: '',
  urgency: '',
  designLevel: '',
  involvementLevel: '',
  topPriority: '',
  businessType: '',
  maisonFloors: '',
  maisonExterior: [],
  maisonRoofWork: false,
  maisonFacadeWork: false,
  appartementFloor: '',
  appartementElevator: false,
  appartementParking: false,
  appartementCave: false,
  extensionType: '',
  extensionSurface: '',
  extensionPlu: false,
  extensionPermis: false,
  renoCurrentState: '',
  renoDiagnostics: [],
  renoOccupied: false,
  tenantApproval: '',
  tenantReversible: false,
  buyingSignDate: '',
  buyingConditional: false,
  descCurrentState: '',
  descDesiredChanges: '',
  descExpectedResult: '',
  descAdditional: '',
  departement: '',
  region: '',
}

// ─── Step Definitions ────────────────────────────────────────────────────────

interface StepDef {
  id: string
  label: string
  icon: typeof Home
}

const ALL_STEPS: StepDef[] = [
  { id: 'property', label: 'Bien', icon: Home },
  { id: 'ownership', label: 'Statut', icon: KeyRound },
  { id: 'tenant_details', label: 'Locataire', icon: KeyRound },
  { id: 'buying_details', label: 'Achat', icon: Calendar },
  { id: 'location', label: 'Lieu', icon: MapPin },
  { id: 'renovation', label: 'Travaux', icon: Hammer },
  { id: 'business_type', label: 'Activité', icon: Store },
  { id: 'maison_details', label: 'Maison', icon: Home },
  { id: 'appartement_details', label: 'Appart', icon: Building2 },
  { id: 'extension_details', label: 'Extension', icon: Building2 },
  { id: 'reno_complete_details', label: 'État', icon: FileCheck },
  { id: 'details', label: 'Détails', icon: Ruler },
  { id: 'description', label: 'Projet', icon: PaintBucket },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'design', label: 'Conception', icon: Palette },
  { id: 'involvement', label: 'Rôle', icon: UserCog },
  { id: 'priority', label: 'Priorité', icon: Target },
  { id: 'summary', label: 'Récap', icon: CheckCircle2 },
]

const computeVisibleSteps = (data: QuestionnaireData): StepDef[] => {
  const steps: StepDef[] = []
  const findStep = (id: string) => ALL_STEPS.find((s) => s.id === id)!

  steps.push(findStep('property'))
  steps.push(findStep('ownership'))

  if (data.ownershipStatus === 'tenant') steps.push(findStep('tenant_details'))
  if (data.ownershipStatus === 'buying') steps.push(findStep('buying_details'))

  steps.push(findStep('location'))
  steps.push(findStep('renovation'))

  if (data.propertyType === 'local_commercial') steps.push(findStep('business_type'))
  if (data.propertyType === 'maison') steps.push(findStep('maison_details'))
  if (data.propertyType === 'appartement') steps.push(findStep('appartement_details'))

  if (data.renovationType === 'extension') steps.push(findStep('extension_details'))
  if (data.renovationType === 'complete') steps.push(findStep('reno_complete_details'))

  // Skip details step for pure decoration
  if (data.renovationType !== 'decoration') steps.push(findStep('details'))

  steps.push(findStep('description'))
  steps.push(findStep('budget'))
  steps.push(findStep('design'))
  steps.push(findStep('involvement'))
  steps.push(findStep('priority'))
  steps.push(findStep('summary'))

  return steps
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RESIDENTIAL_ROOMS = [
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'salon', label: 'Salon / Séjour' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'salle_de_bain', label: 'Salle de bain' },
  { id: 'wc', label: 'WC' },
  { id: 'entree', label: 'Entrée / Couloir' },
  { id: 'bureau', label: 'Bureau' },
  { id: 'buanderie', label: 'Buanderie' },
  { id: 'terrasse', label: 'Terrasse / Balcon' },
  { id: 'garage', label: 'Garage / Cave' },
]

const RESIDENTIAL_CONSTRAINTS = [
  { id: 'copropriete', label: 'Copropriété' },
  { id: 'monument_historique', label: 'Bâtiment classé / secteur protégé' },
  { id: 'amiante', label: 'Présence possible d\'amiante' },
  { id: 'accessibilite', label: 'Accessibilité PMR' },
  { id: 'voisinage', label: 'Contraintes de voisinage' },
  { id: 'occupation', label: 'Logement occupé pendant travaux' },
]

const IDF_CONSTRAINTS = [
  { id: 'acces_chantier', label: 'Accès chantier difficile' },
  { id: 'stationnement', label: 'Stationnement limité' },
  { id: 'horaires_idf', label: 'Horaires de travaux restreints' },
]

const RESIDENTIAL_STYLES = [
  { id: 'moderne', label: 'Moderne / Contemporain', icon: Sparkles },
  { id: 'classique', label: 'Classique / Haussmannien', icon: Building2 },
  { id: 'industriel', label: 'Industriel / Loft', icon: Wrench },
  { id: 'scandinave', label: 'Scandinave / Minimaliste', icon: LayoutDashboard },
  { id: 'autre', label: 'Autre / Pas encore décidé', icon: Palette },
]

const COMMERCIAL_STYLE_ICONS: Record<string, typeof Sparkles> = {
  professionnel: Building2,
  chaleureux: Sparkles,
  luxe: Award,
  industriel_brut: Wrench,
  nature_eco: Leaf,
  personnalise_marque: Palette,
}

const getRoomsForProperty = (propertyType: PropertyType | ''): { id: string; label: string }[] => {
  switch (propertyType) {
    case 'local_commercial':
      return [...COMMERCIAL_ROOMS]
    case 'studio':
      return [...STUDIO_ROOMS]
    case 'maison':
      return [...RESIDENTIAL_ROOMS, ...MAISON_EXTRA_ROOMS]
    default:
      return RESIDENTIAL_ROOMS
  }
}

const getConstraintsForProperty = (
  propertyType: PropertyType | '',
  postalCode: string,
  isComplex: boolean,
): { id: string; label: string }[] => {
  if (propertyType === 'local_commercial') {
    return [...COMMERCIAL_CONSTRAINTS]
  }
  if (!isComplex) return []

  const constraints = [...RESIDENTIAL_CONSTRAINTS]

  // Auto-add IDF constraints for apartments in Paris/close suburbs
  const dept = postalCode.slice(0, 2)
  if (propertyType === 'appartement' && ['75', '92', '93', '94'].includes(dept)) {
    constraints.push(...IDF_CONSTRAINTS)
  }

  return constraints
}

const getStylesForProperty = (propertyType: PropertyType | ''): { id: string; label: string; icon: typeof Sparkles }[] => {
  if (propertyType === 'local_commercial') {
    return COMMERCIAL_STYLES.map((s) => ({
      id: s.id,
      label: s.label,
      icon: COMMERCIAL_STYLE_ICONS[s.id] || Palette,
    }))
  }
  return RESIDENTIAL_STYLES
}

const URGENCIES = [
  { id: 'urgent', label: 'Dès que possible', desc: 'Sous 1 mois' },
  { id: 'normal', label: 'Dans les prochains mois', desc: '1 à 3 mois' },
  { id: 'flexible', label: 'Pas pressé', desc: '3 mois et plus' },
  { id: 'exploring', label: 'Je me renseigne', desc: 'Pas de date précise' },
]

const RENOVATION_TYPE_CONFIG: Record<RenovationType, { label: string; icon: typeof Hammer; desc: string }> = {
  complete: { label: 'Rénovation complète', icon: Hammer, desc: 'Refaire entièrement l\'intérieur' },
  partielle: { label: 'Rénovation partielle', icon: Wrench, desc: 'Une ou plusieurs pièces' },
  extension: { label: 'Extension', icon: Building2, desc: 'Agrandir la surface habitable' },
  amenagement: { label: 'Aménagement', icon: LayoutDashboard, desc: 'Optimiser l\'espace existant' },
  decoration: { label: 'Décoration', icon: PaintBucket, desc: 'Peinture, revêtements, mobilier' },
}

const PROPERTY_TYPE_ICONS: Record<PropertyType, typeof Home> = {
  appartement: Building2,
  maison: Home,
  studio: Building2,
  loft: Building2,
  local_commercial: Store,
  autre: Home,
}

const OWNERSHIP_OPTIONS = [
  { id: 'owner' as const, label: 'Oui, je suis propriétaire', desc: 'Vous êtes propriétaire du bien à rénover', icon: KeyRound },
  { id: 'buying' as const, label: 'Je suis sur le point de signer', desc: 'Achat en cours ou compromis signé', icon: CheckCircle2 },
  { id: 'tenant' as const, label: 'Non, je suis locataire', desc: 'Accord du propriétaire nécessaire', icon: Home },
]

const DESIGN_LEVEL_OPTIONS = [
  {
    id: 'full' as const,
    label: 'Aide complète',
    desc: 'Un architecte conçoit votre projet de A à Z : plans, rendus 3D, choix matériaux, suivi de conception',
    tag: 'À partir de 1 190 €',
    tagColor: 'text-[#202020] bg-[#f5f5f5]',
    icon: Sparkles,
  },
  {
    id: 'moderate' as const,
    label: 'Aide modérée',
    desc: 'Consultation professionnelle et plans 2D pour valider votre projet avant les travaux',
    tag: 'À partir de 490 €',
    tagColor: 'text-blue-600 bg-blue-50',
    icon: Palette,
  },
  {
    id: 'none' as const,
    label: 'Aucune aide',
    desc: 'Vous avez déjà vos plans ou savez exactement ce que vous voulez',
    tag: 'Inclus',
    tagColor: 'text-emerald-600 bg-emerald-50',
    icon: CheckCircle2,
  },
  {
    id: 'undecided' as const,
    label: 'Indécis',
    desc: 'On en discute lors du rendez-vous de cadrage gratuit',
    tag: 'Gratuit',
    tagColor: 'text-[#999] bg-[#f5f5f5]',
    icon: HelpCircle,
  },
]

const INVOLVEMENT_OPTIONS = [
  {
    id: 'very' as const,
    label: 'Très impliqué',
    desc: 'Je veux choisir chaque matériau et suivre chaque étape du chantier',
    tag: 'Moins coûteux',
    tagColor: 'text-emerald-600 bg-emerald-50',
    icon: UserCog,
  },
  {
    id: 'moderate' as const,
    label: 'Assez impliqué',
    desc: 'Je veux valider les grandes décisions mais déléguer le quotidien',
    tag: '',
    tagColor: '',
    icon: CheckCircle2,
  },
  {
    id: 'low' as const,
    label: 'Peu impliqué',
    desc: 'Je préfère tout déléguer et être informé de l\'avancement',
    tag: 'Plus coûteux',
    tagColor: 'text-amber-600 bg-amber-50',
    icon: Sparkles,
  },
  {
    id: 'undecided' as const,
    label: 'Indécis',
    desc: 'On en discute lors du rendez-vous de cadrage',
    tag: '',
    tagColor: '',
    icon: HelpCircle,
  },
]

const PRIORITY_OPTIONS = [
  {
    id: 'speed' as const,
    label: 'Rapidité',
    desc: 'Finir le plus vite possible, quitte à y mettre le prix',
    icon: Zap,
  },
  {
    id: 'quality' as const,
    label: 'Qualité',
    desc: 'Des finitions irréprochables, même si ça prend plus de temps',
    icon: Award,
  },
  {
    id: 'price' as const,
    label: 'Prix',
    desc: 'Optimiser le budget, quitte à faire des compromis',
    icon: PiggyBank,
  },
]

const TENANT_APPROVAL_OPTIONS = [
  { id: 'yes' as const, label: 'Oui, j\'ai l\'accord écrit', icon: CheckCircle2 },
  { id: 'in_progress' as const, label: 'Demande en cours', icon: HelpCircle },
  { id: 'no' as const, label: 'Pas encore demandé', icon: AlertTriangle },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const computeWorkDescription = (data: QuestionnaireData): string => {
  const parts: string[] = []
  if (data.descCurrentState.trim()) parts.push(`État actuel : ${data.descCurrentState.trim()}`)
  if (data.descDesiredChanges.trim()) parts.push(`Changements souhaités : ${data.descDesiredChanges.trim()}`)
  if (data.descExpectedResult.trim()) parts.push(`Résultat attendu : ${data.descExpectedResult.trim()}`)
  if (data.descAdditional.trim()) parts.push(`Précisions : ${data.descAdditional.trim()}`)
  // Fallback to workDescription if guided fields are empty
  if (parts.length === 0 && data.workDescription.trim()) return data.workDescription
  return parts.join('\n\n')
}

const getBudgetWarnings = (data: QuestionnaireData): { type: 'warning' | 'info'; message: string }[] => {
  const warnings: { type: 'warning' | 'info'; message: string }[] = []

  if (data.budgetRange === '5000-15000' && data.renovationType === 'extension') {
    warnings.push({ type: 'warning', message: 'Un budget de 5 000 – 15 000 € est généralement insuffisant pour une extension. Nous en discuterons lors du cadrage.' })
  }
  if (['100000-200000', '200000+'].includes(data.budgetRange) && data.renovationType === 'complete') {
    warnings.push({ type: 'info', message: 'Pour un budget supérieur à 100 000 €, nous recommandons un accompagnement architecte complet.' })
  }
  if (data.urgency === 'urgent' && data.renovationType === 'complete') {
    warnings.push({ type: 'info', message: 'Une rénovation complète nécessite généralement 3 à 6 mois. Nous adapterons le planning au plus vite.' })
  }
  if (data.constraints.includes('copropriete')) {
    warnings.push({ type: 'info', message: 'Un accord du syndic de copropriété sera nécessaire avant le démarrage des travaux.' })
  }

  return warnings
}

// ─── Geo lookup types ────────────────────────────────────────────────────────

interface GeoCommune {
  nom: string
  departement: string
  departementCode: string
  region: string
}

// ─── Component ───────────────────────────────────────────────────────────────

// ─── Draft session ID helper ─────────────────────────────────────────────────

const getOrCreateSessionId = (): string => {
  const key = 'gradia_draft_session_id'
  let id = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (!id) {
    id = crypto.randomUUID()
    if (typeof window !== 'undefined') localStorage.setItem(key, id)
  }
  return id
}

export default function QuestionnairePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStepId, setCurrentStepId] = useState('property')
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [communes, setCommunes] = useState<GeoCommune[]>([])
  const [communeDropdownOpen, setCommuneDropdownOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ─── Draft state ──────────────────────────────────────────────────────────
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [draftSavedIndicator, setDraftSavedIndicator] = useState(false)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftSessionId = useRef<string>('')

  // Initialize session ID
  useEffect(() => {
    draftSessionId.current = getOrCreateSessionId()
  }, [])

  // ─── Load draft on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const sid = getOrCreateSessionId()
        const params = new URLSearchParams()
        params.set('sessionId', sid)
        const res = await fetch(`/api/questionnaire/draft?${params.toString()}`)
        if (!res.ok) { setDraftLoaded(true); return }
        const { draft } = await res.json()
        if (draft && draft.data) {
          // We have a draft — show the resume banner
          setShowDraftBanner(true)
          // Store the draft temporarily so we can restore it if user clicks "Reprendre"
          draftDataRef.current = { data: draft.data as QuestionnaireData, currentStep: draft.currentStep }
        }
      } catch {
        // Silently fail
      } finally {
        setDraftLoaded(true)
      }
    }
    loadDraft()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const draftDataRef = useRef<{ data: QuestionnaireData; currentStep: number } | null>(null)

  const handleResumeDraft = useCallback(() => {
    if (draftDataRef.current) {
      setData(draftDataRef.current.data)
      // Find the step ID from the saved step index
      const steps = computeVisibleSteps(draftDataRef.current.data)
      const targetStep = steps[draftDataRef.current.currentStep]
      if (targetStep) {
        setCurrentStepId(targetStep.id)
      }
    }
    setShowDraftBanner(false)
  }, [])

  const handleRestartDraft = useCallback(async () => {
    setShowDraftBanner(false)
    draftDataRef.current = null
    // Delete the draft on the server
    try {
      const sid = draftSessionId.current
      const params = new URLSearchParams()
      params.set('sessionId', sid)
      await fetch(`/api/questionnaire/draft?${params.toString()}`, { method: 'DELETE' })
    } catch {
      // Silently fail
    }
  }, [])

  // ─── Debounced auto-save ──────────────────────────────────────────────────
  const saveDraft = useCallback(async (draftData: QuestionnaireData, stepId: string) => {
    try {
      const steps = computeVisibleSteps(draftData)
      const stepIndex = steps.findIndex((s) => s.id === stepId)
      const sid = draftSessionId.current
      await fetch('/api/questionnaire/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          currentStep: Math.max(0, stepIndex),
          data: draftData,
        }),
      })
      // Show saved indicator briefly
      setDraftSavedIndicator(true)
      setTimeout(() => setDraftSavedIndicator(false), 2000)
    } catch {
      // Silently fail
    }
  }, [])

  // Trigger debounced save on data or step changes
  useEffect(() => {
    if (!draftLoaded || showDraftBanner) return
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      saveDraft(data, currentStepId)
    }, 2000)
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    }
  }, [data, currentStepId, draftLoaded, showDraftBanner, saveDraft])

  // ─── Delete draft helper (after project creation) ─────────────────────────
  const deleteDraft = useCallback(async () => {
    try {
      const sid = draftSessionId.current
      const params = new URLSearchParams()
      params.set('sessionId', sid)
      await fetch(`/api/questionnaire/draft?${params.toString()}`, { method: 'DELETE' })
    } catch {
      // Silently fail
    }
  }, [])

  const visibleSteps = useMemo(() => computeVisibleSteps(data), [data])
  const currentIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  const totalSteps = visibleSteps.length

  const isComplex = data.renovationType === 'complete' || data.renovationType === 'extension'

  // Safety: if current step is no longer visible, navigate to nearest valid step
  useEffect(() => {
    if (currentIndex === -1 && visibleSteps.length > 0) {
      // Find the step just before the one that disappeared
      const allIdx = ALL_STEPS.findIndex((s) => s.id === currentStepId)
      let nearestStep = visibleSteps[0]
      for (const vs of visibleSteps) {
        const vsAllIdx = ALL_STEPS.findIndex((s) => s.id === vs.id)
        if (vsAllIdx <= allIdx) nearestStep = vs
      }
      setCurrentStepId(nearestStep.id)
    }
  }, [currentIndex, visibleSteps, currentStepId])

  // Auto-add copropriété constraint for apartments
  useEffect(() => {
    if (data.propertyType === 'appartement' && !data.constraints.includes('copropriete')) {
      setData((prev) => ({
        ...prev,
        constraints: [...prev.constraints, 'copropriete'],
      }))
    }
  }, [data.propertyType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Geo API lookup when postal code reaches 5 digits
  useEffect(() => {
    if (data.postalCode.length === 5 && /^\d{5}$/.test(data.postalCode)) {
      fetch(`/api/geo/communes?cp=${data.postalCode}`)
        .then((res) => res.json())
        .then(({ communes: results }: { communes: GeoCommune[] }) => {
          setCommunes(results || [])
          if (results?.length === 1) {
            setData((prev) => ({
              ...prev,
              city: results[0].nom,
              departement: results[0].departement,
              region: results[0].region,
            }))
            setCommuneDropdownOpen(false)
          } else if (results?.length > 1) {
            setCommuneDropdownOpen(true)
          }
        })
        .catch(() => setCommunes([]))
    } else {
      setCommunes([])
      setCommuneDropdownOpen(false)
    }
  }, [data.postalCode])

  const updateField = useCallback(<K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const toggleArrayItem = useCallback((field: 'constraints' | 'maisonExterior' | 'renoDiagnostics', item: string) => {
    setData((prev) => {
      const arr = prev[field] as string[]
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      }
    })
  }, [])

  const updateRoomCount = useCallback((roomId: string, delta: number) => {
    setData((prev) => {
      const current = prev.rooms[roomId] || 0
      const next = Math.max(0, current + delta)
      const rooms = { ...prev.rooms }
      if (next === 0) {
        delete rooms[roomId]
      } else {
        rooms[roomId] = next
      }
      return { ...prev, rooms }
    })
  }, [])

  const canGoNext = (): boolean => {
    switch (currentStepId) {
      case 'property': return data.propertyType !== ''
      case 'ownership': return data.ownershipStatus !== ''
      case 'tenant_details': return data.tenantApproval !== ''
      case 'buying_details': return true
      case 'location': return data.postalCode.trim().length >= 4 && data.city.trim().length >= 1
      case 'renovation': return data.renovationType !== ''
      case 'business_type': return data.businessType !== ''
      case 'maison_details': return true
      case 'appartement_details': return true
      case 'extension_details': return data.extensionType !== ''
      case 'reno_complete_details': return data.renoCurrentState !== ''
      case 'details': return true
      case 'description': {
        const desc = computeWorkDescription(data)
        return desc.trim().length >= 10
      }
      case 'budget': return data.budgetRange !== '' && data.urgency !== ''
      case 'design': return data.designLevel !== ''
      case 'involvement': return data.involvementLevel !== ''
      case 'priority': return data.topPriority !== ''
      case 'summary': return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentIndex < totalSteps - 1 && canGoNext()) {
      setCurrentStepId(visibleSteps[currentIndex + 1].id)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStepId(visibleSteps[currentIndex - 1].id)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const workDescription = computeWorkDescription(data)
      const payload: Record<string, unknown> = {
        propertyType: data.propertyType,
        ownershipStatus: data.ownershipStatus,
        postalCode: data.postalCode,
        city: data.city,
        renovationType: data.renovationType,
        surface: data.surface,
        rooms: data.rooms,
        workDescription,
        constraints: data.constraints,
        style: data.style,
        budgetRange: data.budgetRange,
        urgency: data.urgency,
        designLevel: data.designLevel,
        involvementLevel: data.involvementLevel,
        topPriority: data.topPriority,
        departement: data.departement || undefined,
        region: data.region || undefined,
      }

      // Conditional fields
      if (data.propertyType === 'local_commercial' && data.businessType) {
        payload.businessType = data.businessType
      }
      if (data.propertyType === 'maison') {
        payload.maisonDetails = {
          floors: data.maisonFloors ? parseInt(data.maisonFloors) : undefined,
          exterior: data.maisonExterior.length > 0 ? data.maisonExterior : undefined,
          roofWork: data.maisonRoofWork || undefined,
          facadeWork: data.maisonFacadeWork || undefined,
        }
      }
      if (data.propertyType === 'appartement') {
        payload.appartementDetails = {
          floor: data.appartementFloor ? parseInt(data.appartementFloor) : undefined,
          elevator: data.appartementElevator || undefined,
          parking: data.appartementParking || undefined,
          cave: data.appartementCave || undefined,
        }
      }
      if (data.renovationType === 'extension') {
        payload.extensionDetails = {
          type: data.extensionType || undefined,
          surfaceWanted: data.extensionSurface || undefined,
          pluChecked: data.extensionPlu || undefined,
          permisNeeded: data.extensionPermis || undefined,
        }
      }
      if (data.renovationType === 'complete') {
        payload.renoCompleteDetails = {
          currentState: data.renoCurrentState || undefined,
          diagnostics: data.renoDiagnostics.length > 0 ? data.renoDiagnostics : undefined,
          occupiedDuringWorks: data.renoOccupied || undefined,
        }
      }
      if (data.ownershipStatus === 'tenant') {
        payload.tenantDetails = {
          ownerApproval: data.tenantApproval || undefined,
          reversibleOnly: data.tenantReversible || undefined,
        }
      }
      if (data.ownershipStatus === 'buying') {
        payload.buyingDetails = {
          expectedSignDate: data.buyingSignDate || undefined,
          renoConditional: data.buyingConditional || undefined,
        }
      }
      if (data.descCurrentState || data.descDesiredChanges || data.descExpectedResult || data.descAdditional) {
        payload.guidedDescription = {
          currentState: data.descCurrentState || undefined,
          desiredChanges: data.descDesiredChanges || undefined,
          expectedResult: data.descExpectedResult || undefined,
          additionalInfo: data.descAdditional || undefined,
        }
      }

      // Safety net for unauthenticated users
      localStorage.setItem('gradia_questionnaire', JSON.stringify(payload))

      if (session?.user) {
        const res = await fetch('/api/project/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const { projectId } = await res.json()
          localStorage.removeItem('gradia_questionnaire')
          // Delete the server-side draft
          await deleteDraft()
          router.push(`/dashboard/projects/${projectId}/overview`)
          return
        }
        const errorData = await res.json().catch(() => ({}))
        setSubmitError(errorData.error || 'Une erreur est survenue. Veuillez réessayer.')
        setIsSubmitting(false)
        return
      }

      router.push('/register?from=questionnaire')
    } catch {
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
      setIsSubmitting(false)
    }
  }

  // ─── Room/constraint/style helpers ──────────────────────────────────────────

  const rooms = useMemo(() => getRoomsForProperty(data.propertyType), [data.propertyType])
  const constraintsList = useMemo(
    () => getConstraintsForProperty(data.propertyType, data.postalCode, isComplex),
    [data.propertyType, data.postalCode, isComplex],
  )
  const styles = useMemo(() => getStylesForProperty(data.propertyType), [data.propertyType])
  const budgetWarnings = useMemo(() => getBudgetWarnings(data), [data])

  // ─── Summary helpers ───────────────────────────────────────────────────────

  const formatRooms = () => {
    const entries = Object.entries(data.rooms).filter(([, count]) => count > 0)
    if (entries.length === 0) return '—'
    const allRooms = getRoomsForProperty(data.propertyType)
    return entries
      .map(([id, count]) => {
        const label = allRooms.find((r) => r.id === id)?.label || id
        return count > 1 ? `${count} ${label}` : label
      })
      .join(', ')
  }

  const allConstraintLabels = useMemo(() => {
    const all = [...RESIDENTIAL_CONSTRAINTS, ...COMMERCIAL_CONSTRAINTS.map((c) => ({ id: c.id, label: c.label })), ...IDF_CONSTRAINTS]
    return Object.fromEntries(all.map((c) => [c.id, c.label]))
  }, [])

  return (
    <div className='flex h-dvh flex-col bg-white'>
      {/* Header */}
      <header className='shrink-0 border-b border-[#e0e0e0] bg-white'>
        <div className='mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6'>
          <Link href='/' className='flex items-center gap-3'>
            <span className='text-[28px] font-bold text-[#b8960c] leading-none'>G</span>
            <span className='text-[14px] font-light tracking-[0.35em] text-[#202020] uppercase'>Gradia</span>
          </Link>
          <span className='uppercase text-[11px] tracking-[0.15em] text-[#999]'>
            {currentIndex + 1} / {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className='shrink-0 mx-auto w-full max-w-3xl px-4 pt-4 pb-2 sm:px-6'>
        <div className='flex items-center gap-1'>
          {visibleSteps.map((s, i) => (
            <div key={s.id} className='flex-1'>
              <div
                className={`h-[2px] transition-all duration-500 ${
                  i <= currentIndex ? 'bg-[#202020]' : 'bg-[#e8e4df]'
                }`}
              />
            </div>
          ))}
        </div>
        <div className='mt-1.5 flex items-center justify-between'>
          {visibleSteps.map((s, i) => (
            <span
              key={s.id}
              className={`hidden text-[10px] uppercase tracking-[0.1em] lg:block ${
                i <= currentIndex ? 'font-medium text-[#202020]' : 'text-[#999]'
              }`}
            >
              {s.label}
            </span>
          ))}
          {/* Draft saved indicator */}
          <AnimatePresence>
            {draftSavedIndicator && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className='text-[10px] text-[#999] tracking-[0.05em] lg:hidden'
              >
                Brouillon sauvegard&eacute;
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* Draft saved indicator — visible on large screens under step labels */}
        <AnimatePresence>
          {draftSavedIndicator && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='hidden lg:block text-right text-[10px] text-[#999] mt-1 tracking-[0.05em]'
            >
              Brouillon sauvegard&eacute;
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable content area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-3xl px-4 py-6 sm:px-6'>

        {/* ── Draft Resume Banner ─────────────────────────────────────── */}
        <AnimatePresence>
          {showDraftBanner && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className='mb-6'
            >
              <div className='glass-card border border-[#e0e0e0] bg-white/80 backdrop-blur-sm p-6'>
                <h3 className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020] mb-1'>
                  Brouillon en cours
                </h3>
                <p className='text-sm text-[#999] mb-4'>
                  Vous avez un brouillon en cours. Reprendre o&ugrave; vous en &eacute;tiez ?
                </p>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={handleResumeDraft}
                    className='h-10 px-6 bg-[#202020] text-white uppercase tracking-[0.15em] text-[12px] font-normal hover:bg-[#333] transition-colors'
                  >
                    Reprendre
                  </button>
                  <button
                    onClick={handleRestartDraft}
                    className='h-10 px-6 border border-[#e0e0e0] bg-transparent text-[#202020] uppercase tracking-[0.15em] text-[12px] font-normal hover:bg-[#f5f5f5] transition-colors'
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Property Type ─────────────────────────────────────────────── */}
        {currentStepId === 'property' && (
          <StepContainer
            title='Quel type de bien rénovez-vous ?'
            subtitle='Sélectionnez le type de bien concerné par votre projet.'
          >
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {PROPERTY_TYPES.map((type) => {
                const Icon = PROPERTY_TYPE_ICONS[type]
                return (
                  <button
                    key={type}
                    type='button'
                    onClick={() => updateField('propertyType', type)}
                    className={`flex flex-col items-center gap-2 rounded-none border p-5 transition-all duration-200 ${
                      data.propertyType === type
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${data.propertyType === type ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <span className={`text-sm font-medium ${data.propertyType === type ? 'text-[#202020]' : 'text-[#666]'}`}>
                      {PROPERTY_TYPE_LABELS[type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Ownership ─────────────────────────────────────────────────── */}
        {currentStepId === 'ownership' && (
          <StepContainer
            title='Êtes-vous propriétaire du bien ?'
            subtitle='Cela nous aide à adapter votre accompagnement.'
          >
            <div className='grid gap-3'>
              {OWNERSHIP_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = data.ownershipStatus === opt.id
                return (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => updateField('ownershipStatus', opt.id)}
                    className={`flex items-start gap-4 rounded-none border p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <div>
                      <p className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                        {opt.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#999]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Tenant Details ────────────────────────────────────────────── */}
        {currentStepId === 'tenant_details' && (
          <StepContainer
            title='Précisions sur votre statut de locataire'
            subtitle={"L'accord du propriétaire est nécessaire pour certains travaux."}
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  Avez-vous l&apos;accord de votre propriétaire ?
                </label>
                <div className='mt-3 grid gap-3'>
                  {TENANT_APPROVAL_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const selected = data.tenantApproval === opt.id
                    return (
                      <button
                        key={opt.id}
                        type='button'
                        onClick={() => updateField('tenantApproval', opt.id)}
                        className={`flex items-center gap-4 rounded-none border p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'border-[#202020] bg-[#fafafa]'
                            : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                        }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                        <span className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                <Checkbox
                  checked={data.tenantReversible}
                  onCheckedChange={(checked) => updateField('tenantReversible', !!checked)}
                />
                <div>
                  <span className='text-sm font-medium text-[#202020]'>Travaux réversibles uniquement</span>
                  <p className='text-xs text-[#999]'>Modifications pouvant être annulées au départ du logement</p>
                </div>
              </label>
            </div>
          </StepContainer>
        )}

        {/* ── Buying Details ─────────────────────────────────────────────── */}
        {currentStepId === 'buying_details' && (
          <StepContainer
            title='Précisions sur votre achat'
            subtitle='Ces informations nous aident à planifier votre projet.'
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  Date de signature prévue
                </label>
                <div className='mt-2 max-w-xs'>
                  <input
                    type='date'
                    value={data.buyingSignDate}
                    onChange={(e) => updateField('buyingSignDate', e.target.value)}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full'
                  />
                </div>
              </div>
              <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                <Checkbox
                  checked={data.buyingConditional}
                  onCheckedChange={(checked) => updateField('buyingConditional', !!checked)}
                />
                <div>
                  <span className='text-sm font-medium text-[#202020]'>Rénovation conditionnelle à l&apos;achat</span>
                  <p className='text-xs text-[#999]'>Le projet ne démarrera qu&apos;après la signature</p>
                </div>
              </label>
            </div>
          </StepContainer>
        )}

        {/* ── Location ──────────────────────────────────────────────────── */}
        {currentStepId === 'location' && (
          <StepContainer
            title='Où se situe le bien ?'
            subtitle='Pour trouver les meilleurs artisans près de chez vous.'
          >
            <div className='grid grid-cols-2 gap-4 max-w-md'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Code postal</label>
                <div className='mt-2'>
                  <input
                    type='text'
                    placeholder='75001'
                    value={data.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    maxLength={5}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
              </div>
              <div className='relative'>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Ville</label>
                <div className='mt-2'>
                  <input
                    type='text'
                    placeholder='Paris'
                    value={data.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
                {/* Commune dropdown when multiple results */}
                {communeDropdownOpen && communes.length > 1 && (
                  <div className='absolute left-0 right-0 top-full z-10 mt-1 rounded-none border border-[#e0e0e0] bg-white shadow-lg'>
                    {communes.map((c) => (
                      <button
                        key={c.nom}
                        type='button'
                        onClick={() => {
                          setData((prev) => ({
                            ...prev,
                            city: c.nom,
                            departement: c.departement,
                            region: c.region,
                          }))
                          setCommuneDropdownOpen(false)
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] first:rounded-t-lg last:rounded-b-lg'
                      >
                        <MapPin className='h-3.5 w-3.5 text-[#999]' />
                        <span className='text-[#202020]'>{c.nom}</span>
                        <span className='ml-auto text-xs text-[#999]'>{c.departement}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {data.departement && (
              <p className='mt-3 text-xs text-[#999]'>
                {data.departement}{data.region ? ` — ${data.region}` : ''}
              </p>
            )}
            <p className='mt-4 text-xs text-[#999]'>
              Nous utilisons votre localisation pour sélectionner des artisans vérifiés intervenant dans votre zone.
            </p>
          </StepContainer>
        )}

        {/* ── Renovation Type ───────────────────────────────────────────── */}
        {currentStepId === 'renovation' && (
          <StepContainer
            title='Quel type de travaux envisagez-vous ?'
            subtitle='Cela nous aide à adapter les questions suivantes.'
          >
            <div className='grid gap-3 sm:grid-cols-2'>
              {RENOVATION_TYPES.map((type) => {
                const config = RENOVATION_TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    type='button'
                    onClick={() => updateField('renovationType', type)}
                    className={`flex items-start gap-4 rounded-none border p-5 text-left transition-all duration-200 ${
                      data.renovationType === type
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${data.renovationType === type ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <div>
                      <p className={`text-sm font-medium ${data.renovationType === type ? 'text-[#202020]' : 'text-[#666]'}`}>
                        {config.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#999]'>{config.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Business Type (commercial only) ───────────────────────────── */}
        {currentStepId === 'business_type' && (
          <StepContainer
            title='Quel type d&apos;activité ?'
            subtitle='Pour adapter les pièces et contraintes spécifiques à votre activité.'
          >
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {BUSINESS_TYPES.map((type) => {
                const selected = data.businessType === type
                return (
                  <button
                    key={type}
                    type='button'
                    onClick={() => updateField('businessType', type)}
                    className={`flex flex-col items-center gap-2 rounded-none border p-5 transition-all duration-200 ${
                      selected
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Store className={`h-6 w-6 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <span className={`text-sm font-medium text-center ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                      {BUSINESS_TYPE_LABELS[type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Maison Details ─────────────────────────────────────────────── */}
        {currentStepId === 'maison_details' && (
          <StepContainer
            title='Précisions sur votre maison'
            subtitle='Ces détails nous aident à évaluer les travaux.'
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Nombre d&apos;étages</label>
                <div className='mt-2 max-w-32'>
                  <input
                    type='number'
                    placeholder='2'
                    value={data.maisonFloors}
                    onChange={(e) => updateField('maisonFloors', e.target.value)}
                    min={1}
                    max={10}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
              </div>

              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Éléments extérieurs</label>
                <p className='mt-1 text-xs text-[#999]'>Sélectionnez les éléments extérieurs concernés.</p>
                <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {MAISON_EXTERIOR_ELEMENTS.map((el) => (
                    <label
                      key={el.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-none border px-3 py-2.5 transition-all ${
                        data.maisonExterior.includes(el.id)
                          ? 'border-[#202020] bg-[#fafafa]'
                          : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                      }`}
                    >
                      <Checkbox
                        checked={data.maisonExterior.includes(el.id)}
                        onCheckedChange={() => toggleArrayItem('maisonExterior', el.id)}
                      />
                      <span className='text-sm text-[#202020]'>{el.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.maisonRoofWork}
                    onCheckedChange={(checked) => updateField('maisonRoofWork', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Travaux de toiture</span>
                    <p className='text-xs text-[#999]'>Réfection, isolation, charpente</p>
                  </div>
                </label>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.maisonFacadeWork}
                    onCheckedChange={(checked) => updateField('maisonFacadeWork', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Ravalement de façade</span>
                    <p className='text-xs text-[#999]'>Enduit, peinture, ITE</p>
                  </div>
                </label>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ── Appartement Details ──────────────────────────────────────── */}
        {currentStepId === 'appartement_details' && (
          <StepContainer
            title='Précisions sur votre appartement'
            subtitle='Ces informations impactent la logistique du chantier.'
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Étage</label>
                <div className='mt-2 max-w-32'>
                  <input
                    type='number'
                    placeholder='3'
                    value={data.appartementFloor}
                    onChange={(e) => updateField('appartementFloor', e.target.value)}
                    min={0}
                    max={50}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.appartementElevator}
                    onCheckedChange={(checked) => updateField('appartementElevator', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Ascenseur</span>
                    <p className='text-xs text-[#999]'>L&apos;immeuble dispose d&apos;un ascenseur</p>
                  </div>
                </label>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.appartementParking}
                    onCheckedChange={(checked) => updateField('appartementParking', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Parking</span>
                    <p className='text-xs text-[#999]'>Place de parking disponible</p>
                  </div>
                </label>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.appartementCave}
                    onCheckedChange={(checked) => updateField('appartementCave', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Cave</span>
                    <p className='text-xs text-[#999]'>Stockage en cave possible</p>
                  </div>
                </label>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ── Extension Details ──────────────────────────────────────────── */}
        {currentStepId === 'extension_details' && (
          <StepContainer
            title='Précisions sur votre extension'
            subtitle='Le type d&apos;extension détermine les démarches nécessaires.'
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Type d&apos;extension</label>
                <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                  {EXTENSION_TYPES.map((type) => {
                    const selected = data.extensionType === type
                    return (
                      <button
                        key={type}
                        type='button'
                        onClick={() => updateField('extensionType', type)}
                        className={`rounded-none border p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'border-[#202020] bg-[#fafafa]'
                            : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                        }`}
                      >
                        <span className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                          {EXTENSION_TYPE_LABELS[type]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Surface souhaitée (m²)</label>
                <div className='mt-2 max-w-48'>
                  <input
                    type='number'
                    placeholder='Ex: 30'
                    value={data.extensionSurface}
                    onChange={(e) => updateField('extensionSurface', e.target.value)}
                    min={1}
                    max={500}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.extensionPlu}
                    onCheckedChange={(checked) => updateField('extensionPlu', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>PLU vérifié</span>
                    <p className='text-xs text-[#999]'>J&apos;ai consulté le Plan Local d&apos;Urbanisme</p>
                  </div>
                </label>
                <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                  <Checkbox
                    checked={data.extensionPermis}
                    onCheckedChange={(checked) => updateField('extensionPermis', !!checked)}
                  />
                  <div>
                    <span className='text-sm font-medium text-[#202020]'>Permis de construire</span>
                    <p className='text-xs text-[#999]'>Un permis de construire sera nécessaire</p>
                  </div>
                </label>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ── Réno Complète Details ──────────────────────────────────────── */}
        {currentStepId === 'reno_complete_details' && (
          <StepContainer
            title='État actuel du bien'
            subtitle='Pour mieux évaluer l&apos;ampleur des travaux.'
          >
            <div className='space-y-6'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>État actuel</label>
                <div className='mt-3 grid gap-3'>
                  {CURRENT_STATE_OPTIONS.map((opt) => {
                    const selected = data.renoCurrentState === opt.id
                    return (
                      <button
                        key={opt.id}
                        type='button'
                        onClick={() => updateField('renoCurrentState', opt.id)}
                        className={`rounded-none border p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'border-[#202020] bg-[#fafafa]'
                            : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                        }`}
                      >
                        <span className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>Diagnostics disponibles</label>
                <p className='mt-1 text-xs text-[#999]'>Cochez les diagnostics que vous possédez déjà.</p>
                <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                  {DIAGNOSTIC_OPTIONS.map((diag) => (
                    <label
                      key={diag.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-none border px-3 py-2.5 transition-all ${
                        data.renoDiagnostics.includes(diag.id)
                          ? 'border-[#202020] bg-[#fafafa]'
                          : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                      }`}
                    >
                      <Checkbox
                        checked={data.renoDiagnostics.includes(diag.id)}
                        onCheckedChange={() => toggleArrayItem('renoDiagnostics', diag.id)}
                      />
                      <span className='text-sm text-[#202020]'>{diag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className='flex cursor-pointer items-center gap-3 rounded-none border border-[#e0e0e0] bg-white p-4'>
                <Checkbox
                  checked={data.renoOccupied}
                  onCheckedChange={(checked) => updateField('renoOccupied', !!checked)}
                />
                <div>
                  <span className='text-sm font-medium text-[#202020]'>Logement occupé pendant les travaux</span>
                  <p className='text-xs text-[#999]'>Nous adapterons le planning en conséquence</p>
                </div>
              </label>
            </div>
          </StepContainer>
        )}

        {/* ── Details (surface, rooms, constraints) ─────────────────────── */}
        {currentStepId === 'details' && (
          <StepContainer
            title='Quelles pièces sont concernées ?'
            subtitle='Indiquez le nombre de chaque pièce à rénover.'
          >
            <div className='space-y-8'>
              {/* Surface */}
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  Surface approximative (m²)
                </label>
                <div className='mt-2 max-w-48'>
                  <input
                    type='number'
                    placeholder='Ex: 75'
                    value={data.surface}
                    onChange={(e) => updateField('surface', e.target.value)}
                    min={1}
                    max={10000}
                    className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
                  />
                </div>
              </div>

              {/* Rooms with counters */}
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  {data.propertyType === 'local_commercial' ? 'Espaces concernés par les travaux' : 'Pièces concernées par les travaux'}
                </label>
                <p className='mt-1 text-xs text-[#999]'>Utilisez +/- pour indiquer le nombre de chaque pièce.</p>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {rooms.map((room) => (
                    <RoomCounter
                      key={room.id}
                      label={room.label}
                      count={data.rooms[room.id] || 0}
                      onIncrement={() => updateRoomCount(room.id, 1)}
                      onDecrement={() => updateRoomCount(room.id, -1)}
                    />
                  ))}
                </div>
              </div>

              {/* Constraints */}
              {constraintsList.length > 0 && (
                <div>
                  <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                    {data.propertyType === 'local_commercial' ? 'Contraintes réglementaires' : 'Contraintes particulières'}
                  </label>
                  {data.propertyType !== 'local_commercial' && (
                    <p className='mt-1 text-xs text-[#999]'>
                      Pour une rénovation {data.renovationType === 'complete' ? 'complète' : 'avec extension'}, certaines contraintes sont importantes à identifier.
                    </p>
                  )}
                  <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {constraintsList.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-none border px-3 py-2.5 transition-all ${
                          data.constraints.includes(c.id)
                            ? 'border-[#202020] bg-[#fafafa]'
                            : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                        }`}
                      >
                        <Checkbox
                          checked={data.constraints.includes(c.id)}
                          onCheckedChange={() => toggleArrayItem('constraints', c.id)}
                        />
                        <span className='text-sm text-[#202020]'>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StepContainer>
        )}

        {/* ── Description + Style ───────────────────────────────────────── */}
        {currentStepId === 'description' && (
          <StepContainer
            title='Décrivez votre projet'
            subtitle={"Plus votre description est précise, meilleure sera notre sélection d'artisans."}
          >
            <div className='space-y-8'>
              {/* Guided description */}
              <div className='space-y-4'>
                <div>
                  <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                    Décrivez l&apos;état actuel du bien
                  </label>
                  <div className='mt-2'>
                    <textarea
                      placeholder={"Ex: L'appartement n'a pas \u00e9t\u00e9 r\u00e9nov\u00e9 depuis 20 ans, la cuisine est d'origine..."}
                      value={data.descCurrentState}
                      onChange={(e) => updateField('descCurrentState', e.target.value)}
                      rows={3}
                      className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc] resize-none'
                    />
                  </div>
                </div>

                <div>
                  <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                    Qu&apos;est-ce que vous souhaitez changer ?
                  </label>
                  <div className='mt-2'>
                    <textarea
                      placeholder='Ex: Ouvrir la cuisine sur le salon, refaire la salle de bain, changer les sols...'
                      value={data.descDesiredChanges}
                      onChange={(e) => updateField('descDesiredChanges', e.target.value)}
                      rows={3}
                      className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc] resize-none'
                    />
                  </div>
                </div>

                <div>
                  <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                    Quel résultat attendez-vous ?
                  </label>
                  <div className='mt-2'>
                    <textarea
                      placeholder='Ex: Un espace lumineux et moderne, fonctionnel pour une famille de 4 personnes...'
                      value={data.descExpectedResult}
                      onChange={(e) => updateField('descExpectedResult', e.target.value)}
                      rows={3}
                      className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc] resize-none'
                    />
                  </div>
                </div>

                <div>
                  <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                    Autre chose à préciser ? <span className='font-normal text-[#999]'>(optionnel)</span>
                  </label>
                  <div className='mt-2'>
                    <textarea
                      placeholder='Contraintes particuli&egrave;res, inspirations, points importants...'
                      value={data.descAdditional}
                      onChange={(e) => updateField('descAdditional', e.target.value)}
                      rows={2}
                      className='border-0 border-b border-[#e0e0e0] px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc] resize-none'
                    />
                  </div>
                </div>
              </div>

              {(() => {
                const desc = computeWorkDescription(data)
                return (
                  <p className={`text-xs ${desc.trim().length >= 10 ? 'text-[#999]' : 'text-[#202020]'}`}>
                    {desc.trim().length < 10
                      ? `Encore ${10 - desc.trim().length} caractères minimum`
                      : 'Parfait, continuez si vous le souhaitez'
                    }
                  </p>
                )
              })()}

              {/* Style preference */}
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  {data.propertyType === 'local_commercial' ? 'Ambiance souhaitée' : 'Style souhaité'}
                </label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {styles.map((s) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.id}
                        type='button'
                        onClick={() => updateField('style', s.id)}
                        className={`flex items-center gap-3 rounded-none border px-4 py-3 text-left transition-all ${
                          data.style === s.id
                            ? 'border-[#202020] bg-[#fafafa]'
                            : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${data.style === s.id ? 'text-[#202020]' : 'text-[#999]'}`} />
                        <span className={`text-sm ${data.style === s.id ? 'font-medium text-[#202020]' : 'text-[#666]'}`}>
                          {s.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ── Budget + Urgency ──────────────────────────────────────────── */}
        {currentStepId === 'budget' && (
          <StepContainer
            title='Budget et calendrier'
            subtitle='Nous ne communiquons jamais votre budget aux prestataires sans votre accord.'
          >
            <div className='space-y-8'>
              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  Enveloppe budgétaire estimée
                </label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range}
                      type='button'
                      onClick={() => updateField('budgetRange', range)}
                      className={`rounded-none border px-4 py-3 text-left text-sm transition-all ${
                        data.budgetRange === range
                          ? 'border-[#202020] bg-[#fafafa] font-medium text-[#202020]'
                          : 'border-[#e0e0e0] bg-white text-[#666] hover:border-[#999]'
                      }`}
                    >
                      {BUDGET_RANGE_LABELS[range]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'>
                  Quand souhaitez-vous démarrer ?
                </label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {URGENCIES.map((u) => (
                    <button
                      key={u.id}
                      type='button'
                      onClick={() => updateField('urgency', u.id)}
                      className={`rounded-none border px-4 py-3 text-left transition-all ${
                        data.urgency === u.id
                          ? 'border-[#202020] bg-[#fafafa]'
                          : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                      }`}
                    >
                      <p className={`text-sm ${data.urgency === u.id ? 'font-medium text-[#202020]' : 'text-[#666]'}`}>
                        {u.label}
                      </p>
                      <p className='text-xs text-[#999]'>{u.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart warnings */}
              {budgetWarnings.length > 0 && (
                <div className='space-y-2'>
                  {budgetWarnings.map((w, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 rounded-none border p-3 ${
                        w.type === 'warning'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      {w.type === 'warning' ? (
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                      ) : (
                        <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                      )}
                      <p className={`text-xs ${w.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>
                        {w.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StepContainer>
        )}

        {/* ── Design Level ──────────────────────────────────────────────── */}
        {currentStepId === 'design' && (
          <StepContainer
            title='Cherchez-vous une aide pour la conception ?'
            subtitle={"Nos architectes et designers vous accompagnent de l'esquisse à la réalisation."}
          >
            <div className='grid gap-3'>
              {DESIGN_LEVEL_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = data.designLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => updateField('designLevel', opt.id)}
                    className={`flex items-start gap-4 rounded-none border p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                          {opt.label}
                        </p>
                        {opt.tag && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-none ${opt.tagColor}`}>
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 text-xs text-[#999]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Involvement Level ─────────────────────────────────────────── */}
        {currentStepId === 'involvement' && (
          <StepContainer
            title={"Quel niveau d'implication souhaitez-vous ?"}
            subtitle='Dites-nous comment vous voulez participer à votre projet.'
          >
            <div className='grid gap-3'>
              {INVOLVEMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = data.involvementLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => updateField('involvementLevel', opt.id)}
                    className={`flex items-start gap-4 rounded-none border p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                          {opt.label}
                        </p>
                        {opt.tag && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-none ${opt.tagColor}`}>
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 text-xs text-[#999]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Top Priority ──────────────────────────────────────────────── */}
        {currentStepId === 'priority' && (
          <StepContainer
            title='Quelle est votre priorité n°1 ?'
            subtitle='Cela nous aide à sélectionner les artisans les plus adaptés à vos attentes.'
          >
            <div className='grid gap-3'>
              {PRIORITY_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = data.topPriority === opt.id
                return (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => updateField('topPriority', opt.id)}
                    className={`flex items-start gap-4 rounded-none border p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#202020] bg-[#fafafa]'
                        : 'border-[#e0e0e0] bg-white hover:border-[#999]'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#202020]' : 'text-[#999]'}`} />
                    <div>
                      <p className={`text-sm font-medium ${selected ? 'text-[#202020]' : 'text-[#666]'}`}>
                        {opt.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#999]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Summary ───────────────────────────────────────────────────── */}
        {currentStepId === 'summary' && (
          <StepContainer
            title='Récapitulatif de votre projet'
            subtitle='Vérifiez vos informations avant de lancer votre projet.'
          >
            <div className='space-y-6'>
              <div className='rounded-none border border-[#e0e0e0] bg-white p-6'>
                <div className='space-y-3'>
                  <SummaryRow label='Type de bien' value={data.propertyType ? PROPERTY_TYPE_LABELS[data.propertyType] : '—'} />
                  {data.propertyType === 'local_commercial' && data.businessType && (
                    <SummaryRow label='Activité' value={BUSINESS_TYPE_LABELS[data.businessType]} />
                  )}
                  <SummaryRow
                    label='Propriétaire'
                    value={
                      data.ownershipStatus === 'owner' ? 'Oui'
                        : data.ownershipStatus === 'buying' ? 'En cours d\'achat'
                        : data.ownershipStatus === 'tenant' ? 'Locataire'
                        : '—'
                    }
                  />
                  {data.ownershipStatus === 'tenant' && data.tenantApproval && (
                    <SummaryRow
                      label='Accord propriétaire'
                      value={TENANT_APPROVAL_OPTIONS.find((o) => o.id === data.tenantApproval)?.label || '—'}
                    />
                  )}
                  {data.ownershipStatus === 'buying' && data.buyingSignDate && (
                    <SummaryRow label='Signature prévue' value={data.buyingSignDate} />
                  )}
                  <SummaryRow label='Localisation' value={data.postalCode && data.city ? `${data.postalCode} ${data.city}` : '—'} />
                  <SummaryRow label='Travaux' value={data.renovationType ? RENOVATION_TYPE_CONFIG[data.renovationType].label : '—'} />
                  {data.renovationType === 'extension' && data.extensionType && (
                    <SummaryRow label={"Type d'extension"} value={EXTENSION_TYPE_LABELS[data.extensionType]} />
                  )}
                  {data.renovationType === 'complete' && data.renoCurrentState && (
                    <SummaryRow
                      label='État actuel'
                      value={CURRENT_STATE_OPTIONS.find((o) => o.id === data.renoCurrentState)?.label || '—'}
                    />
                  )}
                  {data.propertyType === 'maison' && data.maisonFloors && (
                    <SummaryRow label='Étages' value={data.maisonFloors} />
                  )}
                  {data.propertyType === 'appartement' && data.appartementFloor && (
                    <SummaryRow label='Étage' value={data.appartementFloor} />
                  )}
                  {data.surface && <SummaryRow label='Surface' value={`${data.surface} m²`} />}
                  {Object.keys(data.rooms).length > 0 && (
                    <SummaryRow label='Pièces' value={formatRooms()} />
                  )}
                  <SummaryRow label='Budget' value={data.budgetRange ? BUDGET_RANGE_LABELS[data.budgetRange] : '—'} />
                  <SummaryRow label='Calendrier' value={URGENCIES.find((u) => u.id === data.urgency)?.label || '—'} />
                  <SummaryRow
                    label='Conception'
                    value={DESIGN_LEVEL_OPTIONS.find((d) => d.id === data.designLevel)?.label || '—'}
                  />
                  <SummaryRow
                    label='Implication'
                    value={INVOLVEMENT_OPTIONS.find((i) => i.id === data.involvementLevel)?.label || '—'}
                  />
                  <SummaryRow
                    label='Priorité'
                    value={PRIORITY_OPTIONS.find((p) => p.id === data.topPriority)?.label || '—'}
                  />
                  {data.style && (
                    <SummaryRow
                      label='Style'
                      value={styles.find((s) => s.id === data.style)?.label || data.style}
                    />
                  )}
                  {data.constraints.length > 0 && (
                    <SummaryRow
                      label='Contraintes'
                      value={data.constraints.map((c) => allConstraintLabels[c] || c).join(', ')}
                    />
                  )}
                </div>
                <div className='mt-4 border-t border-[#e0e0e0] pt-4'>
                  <p className='uppercase text-[11px] tracking-[0.1em] text-[#999]'>Description</p>
                  <p className='mt-1 whitespace-pre-line text-sm text-[#666]'>{computeWorkDescription(data) || '—'}</p>
                </div>
              </div>

              {submitError && (
                <div className='rounded-none border border-red-200 bg-red-50 p-3 text-center'>
                  <p className='text-sm text-red-600'>{submitError}</p>
                </div>
              )}
              <p className='text-center text-xs text-[#999]'>
                {session?.user
                  ? 'Votre projet sera créé et nous commencerons à sélectionner les meilleurs artisans pour vous.'
                  : 'En continuant, vous créerez un compte pour recevoir les propositions d\'artisans vérifiés.'}
              </p>
            </div>
          </StepContainer>
        )}

        </div>
      </div>

      {/* Fixed navigation footer */}
      <div className='shrink-0 border-t border-[#e0e0e0] bg-white'>
        <div className='mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6'>
          {currentIndex > 0 ? (
            <button
              onClick={handleBack}
              className='h-11 px-6 border border-[#e0e0e0] bg-transparent text-[#202020] uppercase tracking-[0.15em] text-[13px] font-normal hover:bg-[#f5f5f5] transition-colors'
            >
              Retour
            </button>
          ) : (
            <Link href='/'>
              <span className='inline-flex h-11 items-center px-6 border border-[#e0e0e0] bg-transparent text-[#202020] uppercase tracking-[0.15em] text-[13px] font-normal hover:bg-[#f5f5f5] transition-colors'>
                Accueil
              </span>
            </Link>
          )}

          {currentIndex < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className='h-11 px-8 bg-[#202020] text-white uppercase tracking-[0.15em] text-[13px] font-normal hover:bg-[#333] transition-colors disabled:opacity-40'
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canGoNext() || isSubmitting}
              className='h-11 px-8 bg-[#202020] text-white uppercase tracking-[0.15em] text-[13px] font-normal hover:bg-[#333] transition-colors disabled:opacity-40'
            >
              {isSubmitting
                ? 'Envoi en cours...'
                : session?.user
                  ? 'Lancer mon projet'
                  : "Cr\u00e9er mon compte et lancer"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StepContainer = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) => (
  <div>
    <h2 className='uppercase tracking-[0.2em] text-[15px] font-normal text-[#202020]'>
      {title}
    </h2>
    <p className='mt-2 text-[12px] text-[#999]'>{subtitle}</p>
    <div className='mt-8'>{children}</div>
  </div>
)

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className='flex items-start justify-between gap-4'>
    <span className='uppercase text-[11px] tracking-[0.1em] text-[#999]'>{label}</span>
    <span className='text-right text-sm text-[#202020]'>{value}</span>
  </div>
)

const RoomCounter = ({
  label,
  count,
  onIncrement,
  onDecrement,
}: {
  label: string
  count: number
  onIncrement: () => void
  onDecrement: () => void
}) => (
  <div className={`flex items-center justify-between rounded-none border px-4 py-3 transition-all ${
    count > 0
      ? 'border-[#202020] bg-[#fafafa]'
      : 'border-[#e0e0e0] bg-white'
  }`}>
    <span className={`text-sm ${count > 0 ? 'font-medium text-[#202020]' : 'text-[#666]'}`}>{label}</span>
    <div className='flex items-center gap-3'>
      <button
        type='button'
        onClick={onDecrement}
        disabled={count === 0}
        className='flex h-7 w-7 items-center justify-center border border-[#e0e0e0] bg-white text-[#999] transition-all hover:border-[#202020] hover:text-[#202020] disabled:opacity-30 disabled:hover:border-[#e0e0e0] disabled:hover:text-[#999]'
      >
        <Minus className='h-3.5 w-3.5' />
      </button>
      <span className='w-5 text-center text-sm font-medium text-[#202020]'>{count}</span>
      <button
        type='button'
        onClick={onIncrement}
        className='flex h-7 w-7 items-center justify-center border border-[#e0e0e0] bg-white text-[#999] transition-all hover:border-[#202020] hover:text-[#202020]'
      >
        <Plus className='h-3.5 w-3.5' />
      </button>
    </div>
  </div>
)
