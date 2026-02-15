'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from '@/i18n/navigation'
import {
  ArrowLeft,
  ArrowRight,
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSession } from '@/lib/auth/auth-client'
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  RENOVATION_TYPES,
  BUDGET_RANGES,
  BUDGET_RANGE_LABELS,
  type PropertyType,
  type RenovationType,
  type BudgetRange,
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
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROOMS = [
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

const CONSTRAINTS = [
  { id: 'copropriete', label: 'Copropriété' },
  { id: 'monument_historique', label: 'Bâtiment classé / secteur protégé' },
  { id: 'amiante', label: 'Présence possible d\'amiante' },
  { id: 'accessibilite', label: 'Accessibilité PMR' },
  { id: 'voisinage', label: 'Contraintes de voisinage' },
  { id: 'occupation', label: 'Logement occupé pendant travaux' },
]

const STYLES = [
  { id: 'moderne', label: 'Moderne / Contemporain', icon: Sparkles },
  { id: 'classique', label: 'Classique / Haussmannien', icon: Building2 },
  { id: 'industriel', label: 'Industriel / Loft', icon: Wrench },
  { id: 'scandinave', label: 'Scandinave / Minimaliste', icon: LayoutDashboard },
  { id: 'autre', label: 'Autre / Pas encore décidé', icon: Palette },
]

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
  local_commercial: Building2,
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
    tagColor: 'text-[#c9a96e] bg-[#c9a96e]/10',
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
    tagColor: 'text-[#9b9b9b] bg-[#f5f3f0]',
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

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'property', label: 'Bien', icon: Home },
  { id: 'ownership', label: 'Statut', icon: KeyRound },
  { id: 'location', label: 'Lieu', icon: MapPin },
  { id: 'renovation', label: 'Travaux', icon: Hammer },
  { id: 'details', label: 'Détails', icon: Ruler },
  { id: 'description', label: 'Projet', icon: PaintBucket },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'design', label: 'Conception', icon: Palette },
  { id: 'involvement', label: 'Rôle', icon: UserCog },
  { id: 'priority', label: 'Priorité', icon: Target },
  { id: 'summary', label: 'Récap', icon: CheckCircle2 },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const totalSteps = STEPS.length
  const isComplex = data.renovationType === 'complete' || data.renovationType === 'extension'

  const updateField = useCallback(<K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const toggleArrayItem = useCallback((field: 'constraints', item: string) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }))
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
    switch (step) {
      case 0: return data.propertyType !== ''
      case 1: return data.ownershipStatus !== ''
      case 2: return data.postalCode.trim().length >= 4 && data.city.trim().length >= 1
      case 3: return data.renovationType !== ''
      case 4: return true // surface and rooms optional
      case 5: return data.workDescription.trim().length >= 10
      case 6: return data.budgetRange !== '' && data.urgency !== ''
      case 7: return data.designLevel !== ''
      case 8: return data.involvementLevel !== ''
      case 9: return data.topPriority !== ''
      case 10: return true // recap — always valid
      default: return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps - 1 && canGoNext()) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        propertyType: data.propertyType,
        ownershipStatus: data.ownershipStatus,
        postalCode: data.postalCode,
        city: data.city,
        renovationType: data.renovationType,
        surface: data.surface,
        rooms: data.rooms,
        workDescription: data.workDescription,
        constraints: data.constraints,
        style: data.style,
        budgetRange: data.budgetRange,
        urgency: data.urgency,
        designLevel: data.designLevel,
        involvementLevel: data.involvementLevel,
        topPriority: data.topPriority,
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
          router.push(`/dashboard/projects/${projectId}`)
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

  // ─── Helpers for summary ───────────────────────────────────────────────────

  const formatRooms = () => {
    const entries = Object.entries(data.rooms).filter(([, count]) => count > 0)
    if (entries.length === 0) return '—'
    return entries
      .map(([id, count]) => {
        const label = ROOMS.find((r) => r.id === id)?.label || id
        return count > 1 ? `${count} ${label}` : label
      })
      .join(', ')
  }

  return (
    <div className='min-h-screen bg-[#fafaf8]'>
      {/* Header */}
      <header className='border-b border-[#e8e4df] bg-[#fafaf8]/95 backdrop-blur-sm'>
        <div className='mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6'>
          <Link
            href='/'
            className='text-lg font-bold tracking-tight text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Gradia
          </Link>
          <span className='text-sm text-[#9b9b9b]'>
            Étape {step + 1} / {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className='mx-auto max-w-3xl px-4 pt-6 sm:px-6'>
        <div className='flex items-center gap-1'>
          {STEPS.map((s, i) => (
            <div key={s.id} className='flex-1'>
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-[#c9a96e]' : 'bg-[#e8e4df]'
                }`}
              />
            </div>
          ))}
        </div>
        <div className='mt-2 flex items-center justify-between'>
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`hidden text-[10px] lg:block ${
                i <= step ? 'font-medium text-[#1a1a2e]' : 'text-[#9b9b9b]'
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-3xl px-4 py-10 sm:px-6'>

        {/* ── Step 0: Property Type ───────────────────────────────────────── */}
        {step === 0 && (
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
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all duration-200 ${
                      data.propertyType === type
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${data.propertyType === type ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <span className={`text-sm font-medium ${data.propertyType === type ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                      {PROPERTY_TYPE_LABELS[type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 1: Ownership ───────────────────────────────────────────── */}
        {step === 1 && (
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
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${selected ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                        {opt.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 2: Location ────────────────────────────────────────────── */}
        {step === 2 && (
          <StepContainer
            title='Où se situe le bien ?'
            subtitle='Pour trouver les meilleurs artisans près de chez vous.'
          >
            <div className='grid grid-cols-2 gap-4 max-w-md'>
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>Code postal</Label>
                <div className='mt-2'>
                  <Input
                    type='text'
                    placeholder='75001'
                    value={data.postalCode}
                    onChange={(e) => updateField('postalCode', (e.target as HTMLInputElement).value)}
                    maxLength={5}
                  />
                </div>
              </div>
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>Ville</Label>
                <div className='mt-2'>
                  <Input
                    type='text'
                    placeholder='Paris'
                    value={data.city}
                    onChange={(e) => updateField('city', (e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>
            </div>
            <p className='mt-4 text-xs text-[#9b9b9b]'>
              Nous utilisons votre localisation pour sélectionner des artisans vérifiés intervenant dans votre zone.
            </p>
          </StepContainer>
        )}

        {/* ── Step 3: Renovation Type ─────────────────────────────────────── */}
        {step === 3 && (
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
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      data.renovationType === type
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${data.renovationType === type ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${data.renovationType === type ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                        {config.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{config.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 4: Details (surface, rooms with counters, constraints) ── */}
        {step === 4 && (
          <StepContainer
            title='Quelles pièces sont concernées ?'
            subtitle='Indiquez le nombre de chaque pièce à rénover.'
          >
            <div className='space-y-8'>
              {/* Surface */}
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Surface approximative (m²)
                </Label>
                <div className='mt-2 max-w-48'>
                  <Input
                    type='number'
                    placeholder='Ex: 75'
                    value={data.surface}
                    onChange={(e) => updateField('surface', (e.target as HTMLInputElement).value)}
                    min={1}
                    max={10000}
                  />
                </div>
              </div>

              {/* Rooms with counters */}
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Pièces concernées par les travaux
                </Label>
                <p className='mt-1 text-xs text-[#9b9b9b]'>Utilisez +/- pour indiquer le nombre de chaque pièce.</p>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {ROOMS.map((room) => (
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

              {/* Constraints (only for complex projects) */}
              {isComplex && (
                <div>
                  <Label className='text-sm font-medium text-[#1a1a2e]'>
                    Contraintes particulières
                  </Label>
                  <p className='mt-1 text-xs text-[#9b9b9b]'>
                    Pour une rénovation {data.renovationType === 'complete' ? 'complète' : 'avec extension'}, certaines contraintes sont importantes à identifier.
                  </p>
                  <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {CONSTRAINTS.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all ${
                          data.constraints.includes(c.id)
                            ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                            : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb]'
                        }`}
                      >
                        <Checkbox
                          checked={data.constraints.includes(c.id)}
                          onCheckedChange={() => toggleArrayItem('constraints', c.id)}
                        />
                        <span className='text-sm text-[#1a1a2e]'>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StepContainer>
        )}

        {/* ── Step 5: Description + Style ─────────────────────────────────── */}
        {step === 5 && (
          <StepContainer
            title='Décrivez votre projet'
            subtitle={"Plus votre description est précise, meilleure sera notre sélection d'artisans."}
          >
            <div className='space-y-8'>
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Décrivez les travaux envisagés
                </Label>
                <p className='mt-1 text-xs text-[#9b9b9b]'>
                  État actuel, ce que vous souhaitez changer, résultat attendu...
                </p>
                <div className='mt-2'>
                  <Textarea
                    placeholder='Ex: L&#x27;appartement n&#x27;a pas été rénové depuis 20 ans. Nous souhaitons refaire la cuisine en ouvrant sur le salon, rénover la salle de bain, et refaire les sols et peintures de l&#x27;ensemble...'
                    value={data.workDescription}
                    onChange={(e) => updateField('workDescription', (e.target as HTMLTextAreaElement).value)}
                    rows={5}
                  />
                </div>
                <p className={`mt-1.5 text-xs ${data.workDescription.trim().length >= 10 ? 'text-[#9b9b9b]' : 'text-[#c9a96e]'}`}>
                  {data.workDescription.trim().length < 10
                    ? `Encore ${10 - data.workDescription.trim().length} caractères minimum`
                    : 'Parfait, continuez si vous le souhaitez'
                  }
                </p>
              </div>

              {/* Style preference */}
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Style souhaité
                </Label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {STYLES.map((s) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.id}
                        type='button'
                        onClick={() => updateField('style', s.id)}
                        className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                          data.style === s.id
                            ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                            : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb]'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${data.style === s.id ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                        <span className={`text-sm ${data.style === s.id ? 'font-medium text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
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

        {/* ── Step 6: Budget + Urgency ────────────────────────────────────── */}
        {step === 6 && (
          <StepContainer
            title='Budget et calendrier'
            subtitle='Nous ne communiquons jamais votre budget aux prestataires sans votre accord.'
          >
            <div className='space-y-8'>
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Enveloppe budgétaire estimée
                </Label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range}
                      type='button'
                      onClick={() => updateField('budgetRange', range)}
                      className={`rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                        data.budgetRange === range
                          ? 'border-[#c9a96e] bg-[#c9a96e]/5 font-medium text-[#1a1a2e]'
                          : 'border-[#e8e4df] bg-white text-[#6b6b6b] hover:border-[#d4d0cb]'
                      }`}
                    >
                      {BUDGET_RANGE_LABELS[range]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Quand souhaitez-vous démarrer ?
                </Label>
                <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {URGENCIES.map((u) => (
                    <button
                      key={u.id}
                      type='button'
                      onClick={() => updateField('urgency', u.id)}
                      className={`rounded-lg border-2 px-4 py-3 text-left transition-all ${
                        data.urgency === u.id
                          ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                          : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb]'
                      }`}
                    >
                      <p className={`text-sm ${data.urgency === u.id ? 'font-medium text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                        {u.label}
                      </p>
                      <p className='text-xs text-[#9b9b9b]'>{u.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ── Step 7: Design Level (Block-style) ─────────────────────────── */}
        {step === 7 && (
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
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className={`text-sm font-semibold ${selected ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                          {opt.label}
                        </p>
                        {opt.tag && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${opt.tagColor}`}>
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 8: Involvement Level ───────────────────────────────────── */}
        {step === 8 && (
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
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className={`text-sm font-semibold ${selected ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                          {opt.label}
                        </p>
                        {opt.tag && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${opt.tagColor}`}>
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 9: Top Priority ────────────────────────────────────────── */}
        {step === 9 && (
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
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      selected
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${selected ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                        {opt.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* ── Step 10: Summary ────────────────────────────────────────────── */}
        {step === 10 && (
          <StepContainer
            title='Récapitulatif de votre projet'
            subtitle='Vérifiez vos informations avant de lancer votre projet.'
          >
            <div className='space-y-6'>
              <div className='rounded-xl border border-[#e8e4df] bg-white p-6'>
                <div className='space-y-3'>
                  <SummaryRow label='Type de bien' value={data.propertyType ? PROPERTY_TYPE_LABELS[data.propertyType] : '—'} />
                  <SummaryRow
                    label='Propriétaire'
                    value={
                      data.ownershipStatus === 'owner' ? 'Oui'
                        : data.ownershipStatus === 'buying' ? 'En cours d\'achat'
                        : data.ownershipStatus === 'tenant' ? 'Locataire'
                        : '—'
                    }
                  />
                  <SummaryRow label='Localisation' value={data.postalCode && data.city ? `${data.postalCode} ${data.city}` : '—'} />
                  <SummaryRow label='Travaux' value={data.renovationType ? RENOVATION_TYPE_CONFIG[data.renovationType].label : '—'} />
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
                    <SummaryRow label='Style' value={STYLES.find((s) => s.id === data.style)?.label || '—'} />
                  )}
                  {data.constraints.length > 0 && (
                    <SummaryRow
                      label='Contraintes'
                      value={data.constraints.map((c) => CONSTRAINTS.find((ct) => ct.id === c)?.label).filter(Boolean).join(', ')}
                    />
                  )}
                </div>
                <div className='mt-4 border-t border-[#e8e4df] pt-4'>
                  <p className='text-xs font-medium text-[#9b9b9b]'>Description</p>
                  <p className='mt-1 text-sm text-[#6b6b6b]'>{data.workDescription || '—'}</p>
                </div>
              </div>

              {submitError && (
                <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-center'>
                  <p className='text-sm text-red-600'>{submitError}</p>
                </div>
              )}
              <p className='text-center text-xs text-[#9b9b9b]'>
                {session?.user
                  ? 'Votre projet sera créé et nous commencerons à sélectionner les meilleurs artisans pour vous.'
                  : 'En continuant, vous créerez un compte pour recevoir les propositions d\'artisans vérifiés.'}
              </p>
            </div>
          </StepContainer>
        )}

        {/* Navigation */}
        <div className='mt-10 flex items-center justify-between'>
          {step > 0 ? (
            <Button
              variant='outline'
              onClick={handleBack}
              className='h-11 px-6 border-[#e8e4df] text-[#6b6b6b] hover:bg-[#f0ede8]'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Retour
            </Button>
          ) : (
            <Link href='/'>
              <Button variant='outline' className='h-11 px-6 border-[#e8e4df] text-[#6b6b6b] hover:bg-[#f0ede8]'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Accueil
              </Button>
            </Link>
          )}

          {step < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className='h-11 px-8 bg-[#1a1a2e] text-white hover:bg-[#16213e] font-semibold disabled:opacity-40'
            >
              Continuer
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext() || isSubmitting}
              className='h-11 px-8 bg-[#c9a96e] text-white hover:bg-[#b8944f] font-semibold disabled:opacity-40'
            >
              {isSubmitting
                ? 'Envoi en cours...'
                : session?.user
                  ? 'Lancer mon projet'
                  : 'Créer mon compte et lancer'}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
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
    <h2
      className='text-2xl font-bold text-[#1a1a2e] sm:text-3xl'
      style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
    >
      {title}
    </h2>
    <p className='mt-2 text-[#6b6b6b]'>{subtitle}</p>
    <div className='mt-8'>{children}</div>
  </div>
)

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className='flex items-start justify-between gap-4'>
    <span className='text-xs font-medium text-[#9b9b9b]'>{label}</span>
    <span className='text-right text-sm text-[#1a1a2e]'>{value}</span>
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
  <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
    count > 0
      ? 'border-[#c9a96e] bg-[#c9a96e]/5'
      : 'border-[#e8e4df] bg-white'
  }`}>
    <span className={`text-sm ${count > 0 ? 'font-medium text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>{label}</span>
    <div className='flex items-center gap-3'>
      <button
        type='button'
        onClick={onDecrement}
        disabled={count === 0}
        className='flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e4df] bg-white text-[#9b9b9b] transition-all hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-30 disabled:hover:border-[#e8e4df] disabled:hover:text-[#9b9b9b]'
      >
        <Minus className='h-3.5 w-3.5' />
      </button>
      <span className='w-5 text-center text-sm font-semibold text-[#1a1a2e]'>{count}</span>
      <button
        type='button'
        onClick={onIncrement}
        className='flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e4df] bg-white text-[#9b9b9b] transition-all hover:border-[#c9a96e] hover:text-[#c9a96e]'
      >
        <Plus className='h-3.5 w-3.5' />
      </button>
    </div>
  </div>
)
