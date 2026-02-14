'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  HardHat,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  renovationType: RenovationType | ''
  surface: string
  rooms: string[]
  workDescription: string
  constraints: string[]
  style: string
  budgetRange: BudgetRange | ''
  urgency: string
  services: { architect: boolean; contractors: boolean; adminHelp: boolean }
  postalCode: string
  city: string
}

const INITIAL_DATA: QuestionnaireData = {
  propertyType: '',
  renovationType: '',
  surface: '',
  rooms: [],
  workDescription: '',
  constraints: [],
  style: '',
  budgetRange: '',
  urgency: '',
  services: { architect: false, contractors: false, adminHelp: false },
  postalCode: '',
  city: '',
}

const SERVICE_CHOICES = [
  {
    key: 'architect' as const,
    label: 'Un architecte pour concevoir mon projet',
    desc: 'Conception architecturale, esquisse, plans, suivi',
    icon: Palette,
  },
  {
    key: 'contractors' as const,
    label: 'Un gestionnaire pour coordonner les travaux',
    desc: 'Mise en relation artisans, suivi de chantier',
    icon: HardHat,
  },
  {
    key: 'adminHelp' as const,
    label: 'Un suivi financier et des appels de fonds',
    desc: 'Échéancier de paiement, suivi budget',
    icon: Wallet,
  },
]

const ROOMS = [
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'salon', label: 'Salon / Séjour' },
  { id: 'chambre', label: 'Chambre(s)' },
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

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'property', label: 'Votre bien', icon: Home },
  { id: 'renovation', label: 'Travaux', icon: Hammer },
  { id: 'details', label: 'Détails', icon: Ruler },
  { id: 'description', label: 'Description', icon: PaintBucket },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'services', label: 'Services', icon: UserCog },
  { id: 'summary', label: 'Récapitulatif', icon: CheckCircle2 },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = STEPS.length
  const isComplex = data.renovationType === 'complete' || data.renovationType === 'extension'

  const updateField = useCallback(<K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const toggleArrayItem = useCallback((field: 'rooms' | 'constraints', item: string) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }))
  }, [])

  const canGoNext = (): boolean => {
    switch (step) {
      case 0: return data.propertyType !== ''
      case 1: return data.renovationType !== ''
      case 2: return true // surface and rooms are optional
      case 3: return data.workDescription.trim().length >= 10
      case 4: return data.budgetRange !== '' && data.urgency !== ''
      case 5: return true // services step — always valid
      case 6: return data.postalCode.trim().length >= 4 && data.city.trim().length >= 1
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
    try {
      // Transform boolean services to 'yes'/'no' for the API
      const payload = {
        ...data,
        services: {
          architect: data.services.architect ? 'yes' : 'no',
          contractors: data.services.contractors ? 'yes' : 'no',
          adminHelp: data.services.adminHelp ? 'yes' : 'no',
        },
      }
      // Save to localStorage so data survives auth redirect
      localStorage.setItem('gradia_questionnaire', JSON.stringify(payload))
      // Redirect to register (or login) — project will be created after auth
      router.push('/register?from=questionnaire')
    } catch {
      setIsSubmitting(false)
    }
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
        <div className='flex items-center gap-2'>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className='flex-1'
            >
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
              className={`hidden text-xs sm:block ${
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
        {/* Step 0: Property Type */}
        {step === 0 && (
          <StepContainer
            title='Quel type de bien souhaitez-vous rénover ?'
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

        {/* Step 1: Renovation Type */}
        {step === 1 && (
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

        {/* Step 2: Surface, Rooms */}
        {step === 2 && (
          <StepContainer
            title='Parlez-nous de votre bien'
            subtitle='Ces informations aident à dimensionner votre projet.'
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

              {/* Rooms */}
              <div>
                <Label className='text-sm font-medium text-[#1a1a2e]'>
                  Pièces concernées par les travaux
                </Label>
                <p className='mt-1 text-xs text-[#9b9b9b]'>Sélectionnez toutes les pièces à rénover.</p>
                <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {ROOMS.map((room) => (
                    <label
                      key={room.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all ${
                        data.rooms.includes(room.id)
                          ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                          : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb]'
                      }`}
                    >
                      <Checkbox
                        checked={data.rooms.includes(room.id)}
                        onCheckedChange={() => toggleArrayItem('rooms', room.id)}
                      />
                      <span className='text-sm text-[#1a1a2e]'>{room.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra question for complex projects */}
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

        {/* Step 3: Description + Style */}
        {step === 3 && (
          <StepContainer
            title='Décrivez votre projet'
            subtitle='Plus votre description est précise, meilleure sera votre fiche projet.'
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

        {/* Step 4: Budget + Urgency */}
        {step === 4 && (
          <StepContainer
            title='Budget et calendrier'
            subtitle='Nous ne communiquons jamais votre budget aux prestataires sans votre accord.'
          >
            <div className='space-y-8'>
              {/* Budget range */}
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

              {/* Urgency */}
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

        {/* Step 5: Services */}
        {step === 5 && (
          <StepContainer
            title='De quels services avez-vous besoin ?'
            subtitle='Sélectionnez les services qui vous intéressent. Vous pourrez modifier ce choix plus tard.'
          >
            <div className='grid gap-3'>
              {SERVICE_CHOICES.map((svc) => {
                const Icon = svc.icon
                const checked = data.services[svc.key]
                return (
                  <button
                    key={svc.key}
                    type='button'
                    onClick={() => setData((prev) => ({
                      ...prev,
                      services: { ...prev.services, [svc.key]: !prev.services[svc.key] },
                    }))}
                    className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                      checked
                        ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
                        : 'border-[#e8e4df] bg-white hover:border-[#d4d0cb] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? 'text-[#c9a96e]' : 'text-[#9b9b9b]'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${checked ? 'text-[#1a1a2e]' : 'text-[#6b6b6b]'}`}>
                        {svc.label}
                      </p>
                      <p className='mt-0.5 text-xs text-[#9b9b9b]'>{svc.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className='mt-4 text-center text-xs text-[#9b9b9b]'>
              Vous ne savez pas encore ? Pas de souci, nous en parlerons lors du rendez-vous de cadrage.
            </p>
          </StepContainer>
        )}

        {/* Step 6: Summary + Location */}
        {step === 6 && (
          <StepContainer
            title='Dernière étape !'
            subtitle='Indiquez la localisation du bien pour finaliser votre demande.'
          >
            <div className='space-y-8'>
              {/* Location */}
              <div className='grid grid-cols-2 gap-4'>
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

              {/* Summary */}
              <div className='rounded-xl border border-[#e8e4df] bg-white p-6'>
                <h3 className='text-sm font-semibold text-[#1a1a2e]'>Récapitulatif de votre projet</h3>
                <div className='mt-4 space-y-3'>
                  <SummaryRow label='Type de bien' value={data.propertyType ? PROPERTY_TYPE_LABELS[data.propertyType] : '—'} />
                  <SummaryRow label='Travaux' value={data.renovationType ? RENOVATION_TYPE_CONFIG[data.renovationType].label : '—'} />
                  {data.surface && <SummaryRow label='Surface' value={`${data.surface} m²`} />}
                  {data.rooms.length > 0 && (
                    <SummaryRow
                      label='Pièces'
                      value={data.rooms.map((r) => ROOMS.find((rm) => rm.id === r)?.label).filter(Boolean).join(', ')}
                    />
                  )}
                  <SummaryRow label='Budget' value={data.budgetRange ? BUDGET_RANGE_LABELS[data.budgetRange] : '—'} />
                  <SummaryRow label='Calendrier' value={URGENCIES.find((u) => u.id === data.urgency)?.label || '—'} />
                  <SummaryRow
                    label='Services'
                    value={
                      SERVICE_CHOICES.filter((s) => data.services[s.key]).map((s) => s.label).join(', ')
                      || 'Aucun sélectionné'
                    }
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

              <p className='text-center text-xs text-[#9b9b9b]'>
                En continuant, vous serez invité à créer un compte pour recevoir votre fiche projet personnalisée.
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
              {isSubmitting ? 'Envoi en cours...' : 'Créer mon compte et recevoir ma fiche'}
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
