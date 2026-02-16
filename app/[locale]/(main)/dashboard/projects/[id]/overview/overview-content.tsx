'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Sparkles,
  FileText,
  Image,
  TrendingUp,
  Clock,
  ExternalLink,
  Check,
  CreditCard,
  ListChecks,
  Loader2,
  CheckCircle2,
  Wrench,
  Search,
  Star,
  Phone,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { GlassCard, GlassButton, GlassProgress, GlassBadge } from '../../../../components/glass-primitives'
import { useProject } from '../../../../components/project-context'
import {
  PROJECT_PHASE_LABELS,
  PROJECT_PHASE_DESCRIPTIONS,
  FILE_CATEGORY_LABELS,
  MATCHING_STATUS_LABELS,
  CONTRACTOR_SPECIALTY_LABELS,
  type ProjectPhase,
  type FileCategory,
  type MatchingStatus,
  type ContractorSpecialty,
} from '@/config/project'
import { cn } from '@/lib/utils'
import { toastManager } from '@/components/ui/toast'
import { getCalApi } from '@calcom/embed-react'

// ─── Label maps ────────────────────────────────────────────────────────────

const ROOM_LABELS: Record<string, string> = {
  cuisine: 'Cuisine',
  salon: 'Salon / Séjour',
  chambre: 'Chambre(s)',
  salle_de_bain: 'Salle de bain',
  wc: 'WC',
  entree: 'Entrée / Couloir',
  bureau: 'Bureau',
  buanderie: 'Buanderie',
  terrasse: 'Terrasse / Balcon',
  garage: 'Garage / Cave',
}

const CONSTRAINT_LABELS: Record<string, string> = {
  copropriete: 'Copropriété',
  monument_historique: 'Bâtiment classé / secteur protégé',
  amiante: 'Présence possible d\'amiante',
  accessibilite: 'Accessibilité PMR',
  voisinage: 'Contraintes de voisinage',
  occupation: 'Logement occupé pendant travaux',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  status_change: 'Changement de statut',
  phase_change: 'Changement de phase',
  module_activated: 'Module activé',
  assignment: 'Assignation',
  payment: 'Paiement',
  note: 'Note',
}

// ─── Animations ────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuestionnaireData {
  workDescription?: string
  renovationType?: string
  urgency?: string
  constraints?: string[]
  rooms?: string[]
}

interface ActionItem {
  id: string
  label: string
  phase: string
  completed: boolean
}

interface ContractorItem {
  pcId: string
  specialty: string
  assignmentStatus: string
  companyName: string
  contractorName: string
  rating: string | null
  proposalAmount: string | null
  proposalStatus: string | null
}

interface DesignBookingItem {
  id: string
  type: string
  status: string
  amount: string
  deliveredAt: string | null
}

interface OverviewContentProps {
  userName: string
  userEmail: string
  actions: ActionItem[]
  validations: {
    id: string
    label: string
    phase: string
    validatedAt: string | null
  }[]
  documents: {
    id: string
    name: string
    url: string
    mimeType: string | null
    size: number | null
    category: string
    createdAt: string
    uploadedByName: string
  }[]
  events: {
    id: string
    type: string
    data: Record<string, unknown> | null
    createdAt: string
  }[]
  payments: {
    id: string
    label: string
    amount: string
    dueDate: string
    status: string
    paidAt: string | null
  }[]
  contractors: ContractorItem[]
  designBookings: DesignBookingItem[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getActivePhases = (project: {
  modules: { design: boolean; works: boolean }
  services: { architect: string; contractors: string }
}): ProjectPhase[] => {
  const phases: ProjectPhase[] = ['cadrage']
  if (project.modules.design || project.services.architect === 'yes') phases.push('conception')
  phases.push('devis')
  if (project.modules.works || project.services.contractors === 'yes') {
    phases.push('travaux', 'livraison')
  }
  return phases
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatDateLong = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main Component ────────────────────────────────────────────────────────

const CheckoutSuccessBanner = () => {
  const searchParams = useSearchParams()
  const checkoutStatus = searchParams.get('checkout')

  if (checkoutStatus !== 'success') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className='mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3'
    >
      <Check className='size-5 text-emerald-600 shrink-0' />
      <p className='text-sm text-emerald-700'>
        Paiement confirmé ! Le module sera activé dans quelques instants.
      </p>
    </motion.div>
  )
}

export const OverviewContent = ({ userName, userEmail, actions: initialActions, validations, documents, events, payments, contractors, designBookings }: OverviewContentProps) => {
  const { project } = useProject()
  const questionnaire = project.aiSummary as QuestionnaireData | null
  const [actions, setActions] = useState<ActionItem[]>(initialActions)

  const activePhases = getActivePhases(project)
  const currentPhaseIndex = activePhases.indexOf(project.phase as ProjectPhase)

  const isCadrage = project.phase === 'cadrage'
  const hasContractors = contractors.length > 0

  const showDesignBanner =
    (project.services.architect !== 'no') ||
    (project.modules.design === true)

  if (isCadrage) {
    return (
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='h-full overflow-y-auto p-4 md:p-6 space-y-8 md:space-y-10'
        data-tour='overview-grid'
      >
        <Suspense fallback={null}>
          <CheckoutSuccessBanner />
        </Suspense>

        {/* ─── 1. Welcome Hero (dramatic, with photo) ──────────────── */}
        <motion.div variants={itemVariants}>
          <WelcomeHero userName={userName} />
        </motion.div>

        {/* ─── 2. Process Steps (Block-style 4-card grid) ──────────── */}
        <motion.div variants={itemVariants}>
          <ProcessSteps
            matchingStatus={project.matchingStatus}
            phase={project.phase}
          />
        </motion.div>

        {/* ─── 3. Team & Booking (advisor + trust signals) ─────────── */}
        <motion.div variants={itemVariants}>
          <TeamSection projectId={project.id} userName={userName} userEmail={userEmail} />
        </motion.div>

        {/* ─── 4. Design Banner (magazine-style, conditional) ──────── */}
        {showDesignBanner && (
          <motion.div variants={itemVariants}>
            <DesignBanner projectId={project.id} userName={userName} userEmail={userEmail} />
          </motion.div>
        )}

        {/* ─── 5. Actions Checklist ────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <ActionsChecklistCard
            actions={actions}
            setActions={setActions}
            currentPhase={project.phase as ProjectPhase}
            projectId={project.id}
          />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='h-full overflow-y-auto p-4 md:p-6'
      data-tour='overview-grid'
    >
      <Suspense fallback={null}>
        <CheckoutSuccessBanner />
      </Suspense>

      {/* ─── Row 1: Phase Stepper ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className='mb-6'>
        <PhaseStepper
          activePhases={activePhases}
          currentPhaseIndex={currentPhaseIndex}
          currentPhase={project.phase as ProjectPhase}
        />
      </motion.div>

      {/* ─── Row 1.5: Marketplace Status Banner ────────────────────── */}
      <motion.div variants={itemVariants} className='mb-6'>
        <MarketplaceStatusCard
          matchingStatus={project.matchingStatus}
          contractors={contractors}
          projectId={project.id}
        />
      </motion.div>

      {/* ─── Row 2: Two-column layout ──────────────────────────────── */}
      <div className='flex flex-col lg:flex-row gap-5'>
        {/* Left column */}
        <div className='flex-1 flex flex-col gap-5 min-w-0'>
          <motion.div variants={itemVariants}>
            <FicheProjetCard questionnaire={questionnaire} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DocumentsTableCard documents={documents} projectId={project.id} />
          </motion.div>
        </div>

        {/* Right column */}
        <div className='w-full lg:w-[340px] shrink-0 flex flex-col gap-5'>
          {hasContractors && (
            <motion.div variants={itemVariants}>
              <ContractorsSummaryCard contractors={contractors} projectId={project.id} />
            </motion.div>
          )}
          <motion.div variants={itemVariants}>
            <ActionsChecklistCard
              actions={actions}
              setActions={setActions}
              currentPhase={project.phase as ProjectPhase}
              projectId={project.id}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <EcheancesCard
              isCadrage={isCadrage}
              validations={validations}
              payments={payments}
              events={events}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PhaseProgressCard
              activePhases={activePhases}
              currentPhaseIndex={currentPhaseIndex}
              actions={actions}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Phase Stepper ────────────────────────────────────────────────────────

const PhaseStepper = ({
  activePhases,
  currentPhaseIndex,
  currentPhase,
}: {
  activePhases: ProjectPhase[]
  currentPhaseIndex: number
  currentPhase: ProjectPhase
}) => (
  <div className='glass-card rounded-2xl p-5'>
    {/* Desktop horizontal stepper */}
    <div className='hidden md:flex items-start'>
      {activePhases.map((phase, i) => {
        const isCompleted = i < currentPhaseIndex
        const isCurrent = i === currentPhaseIndex
        const isFuture = i > currentPhaseIndex

        return (
          <div key={phase} className='flex items-start flex-1 min-w-0'>
            {/* Step */}
            <div className='flex flex-col items-center min-w-0'>
              {/* Circle */}
              <div
                className={cn(
                  'relative flex items-center justify-center size-10 rounded-full shrink-0 transition-all',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-[#c9a96e] text-white shadow-[0_0_16px_rgba(201,169,110,0.4)]',
                  isFuture && 'bg-[#e8e4df] text-[#9b9b9b]',
                )}
              >
                {isCompleted ? (
                  <Check className='size-5' />
                ) : (
                  <span className='text-sm font-bold'>{i + 1}</span>
                )}
                {isCurrent && (
                  <span className='absolute inset-0 rounded-full animate-ping bg-[#c9a96e]/30' />
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center leading-tight',
                  isCompleted && 'text-emerald-600',
                  isCurrent && 'text-[#1a1a2e] font-semibold',
                  isFuture && 'text-[#9b9b9b]',
                )}
              >
                {PROJECT_PHASE_LABELS[phase]}
              </span>
              {/* Description for current phase */}
              {isCurrent && (
                <span className='mt-1 text-[11px] text-[#9b9b9b] text-center max-w-[140px] leading-snug'>
                  {PROJECT_PHASE_DESCRIPTIONS[currentPhase]}
                </span>
              )}
            </div>
            {/* Connector line */}
            {i < activePhases.length - 1 && (
              <div className='flex-1 flex items-center mt-5 px-2'>
                <div
                  className={cn(
                    'h-0.5 w-full',
                    isCompleted ? 'bg-emerald-500' : 'border-t-2 border-dashed border-[#e8e4df]',
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>

    {/* Mobile vertical stepper */}
    <div className='flex flex-col md:hidden'>
      {activePhases.map((phase, i) => {
        const isCompleted = i < currentPhaseIndex
        const isCurrent = i === currentPhaseIndex
        const isFuture = i > currentPhaseIndex

        return (
          <div key={phase} className='flex gap-3'>
            {/* Circle + vertical line */}
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  'relative flex items-center justify-center size-8 rounded-full shrink-0',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-[#c9a96e] text-white shadow-[0_0_12px_rgba(201,169,110,0.4)]',
                  isFuture && 'bg-[#e8e4df] text-[#9b9b9b]',
                )}
              >
                {isCompleted ? (
                  <Check className='size-4' />
                ) : (
                  <span className='text-xs font-bold'>{i + 1}</span>
                )}
              </div>
              {i < activePhases.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-1',
                    isCompleted ? 'bg-emerald-500' : 'border-l-2 border-dashed border-[#e8e4df]',
                  )}
                />
              )}
            </div>
            {/* Label */}
            <div className={cn('pb-4', i === activePhases.length - 1 && 'pb-0')}>
              <span
                className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-emerald-600',
                  isCurrent && 'text-[#1a1a2e] font-semibold',
                  isFuture && 'text-[#9b9b9b]',
                )}
              >
                {PROJECT_PHASE_LABELS[phase]}
              </span>
              {isCurrent && (
                <p className='text-xs text-[#9b9b9b] mt-0.5 leading-snug'>
                  {PROJECT_PHASE_DESCRIPTIONS[currentPhase]}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

// ─── Actions Checklist Card ───────────────────────────────────────────────

const ActionsChecklistCard = ({
  actions,
  setActions,
  currentPhase,
  projectId,
}: {
  actions: ActionItem[]
  setActions: React.Dispatch<React.SetStateAction<ActionItem[]>>
  currentPhase: ProjectPhase
  projectId: string
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const phaseActions = actions.filter((a) => a.phase === currentPhase)
  const pendingActions = phaseActions.filter((a) => !a.completed)
  const pendingCount = pendingActions.length

  const handleToggle = async (actionId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted
    setLoadingId(actionId)

    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, completed: newCompleted } : a)),
    )

    try {
      const res = await fetch(`/api/project/${projectId}/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      })

      if (!res.ok) throw new Error()
    } catch {
      // Revert
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, completed: currentCompleted } : a)),
      )
      toastManager.add({
        title: 'Erreur lors de la mise à jour',
        type: 'error',
      })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <GlassCard hover className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2.5'>
          <div className='rounded-lg bg-[#c9a96e]/10 p-2'>
            <ListChecks className='size-4 text-[#c9a96e]' />
          </div>
          <h3
            className='font-semibold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Prochaines actions
          </h3>
        </div>
        {pendingCount > 0 && (
          <GlassBadge variant='gold'>{pendingCount}</GlassBadge>
        )}
      </div>

      {phaseActions.length === 0 ? (
        <div className='py-4 text-center'>
          <p className='text-sm text-[#9b9b9b]'>Aucune action pour cette phase.</p>
        </div>
      ) : pendingCount === 0 ? (
        <div className='flex flex-col items-center justify-center py-6 text-center'>
          <div className='rounded-full bg-emerald-50 p-3 mb-3'>
            <CheckCircle2 className='size-6 text-emerald-500' />
          </div>
          <p className='text-sm font-medium text-emerald-600'>Tout est à jour !</p>
          <p className='text-xs text-[#9b9b9b] mt-1'>Toutes les actions de cette phase sont complétées.</p>
        </div>
      ) : (
        <div className='space-y-0'>
          <AnimatePresence mode='popLayout'>
            {phaseActions.map((action) => (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.3 } }}
                className='flex items-center gap-3 py-2.5 group'
              >
                <button
                  onClick={() => handleToggle(action.id, action.completed)}
                  disabled={loadingId === action.id}
                  className={cn(
                    'relative flex items-center justify-center size-5 rounded-md border-2 shrink-0 transition-all',
                    action.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-[#d4d0cc] hover:border-[#c9a96e] group-hover:border-[#c9a96e]',
                  )}
                >
                  {loadingId === action.id ? (
                    <Loader2 className='size-3 animate-spin' />
                  ) : action.completed ? (
                    <Check className='size-3' />
                  ) : null}
                </button>
                <span
                  className={cn(
                    'text-sm transition-all',
                    action.completed
                      ? 'text-[#9b9b9b] line-through'
                      : 'text-[#3a3a4e]',
                  )}
                >
                  {action.label}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  )
}

// ─── RDV Cadrage Card ──────────────────────────────────────────────────────

const RdvCadrageCard = () => {
  const [showEmbed, setShowEmbed] = useState(false)
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK

  return (
    <GlassCard glow className='p-6 flex flex-col border-[#c9a96e]/20 min-h-[280px]'>
      <div className='flex items-start gap-4 mb-4'>
        <div className='rounded-full bg-[#c9a96e]/10 p-3 shrink-0'>
          <CalendarDays className='size-6 text-[#c9a96e]' />
        </div>
        <div>
          <h3
            className='font-semibold text-[#1a1a2e] text-lg'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Rendez-vous de cadrage
          </h3>
          <p className='text-sm text-[#9b9b9b] mt-1'>
            Réservez un créneau avec votre chef de projet pour définir ensemble le plan d&apos;action de votre rénovation.
          </p>
        </div>
      </div>

      {!showEmbed ? (
        <div className='flex-1 flex flex-col items-center justify-center'>
          <div className='rounded-2xl bg-gradient-to-b from-[#c9a96e]/5 to-transparent p-8 text-center'>
            <Sparkles className='size-10 text-[#c9a96e] mx-auto mb-4 opacity-60' />
            <p className='text-sm text-[#9b9b9b] mb-6 max-w-sm'>
              Ce rendez-vous est gratuit et sans engagement. Il dure environ 30 minutes.
            </p>
            <GlassButton
              variant='gold'
              size='lg'
              onClick={() => {
                if (calLink) {
                  setShowEmbed(true)
                } else {
                  window.open('mailto:contact@gradia.fr?subject=RDV%20Cadrage', '_blank')
                }
              }}
            >
              <CalendarDays className='size-5' />
              Réserver un créneau
            </GlassButton>
          </div>
        </div>
      ) : (
        <div className='flex-1 rounded-xl overflow-hidden bg-[#f5f3f0]'>
          {calLink ? (
            <iframe
              src={`https://cal.com/${calLink}?theme=light`}
              className='w-full h-full min-h-[400px] border-0'
              title='Réserver un rendez-vous'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-[#9b9b9b] text-sm'>
              Configuration Cal.com manquante
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}

// ─── Fiche Projet Card ─────────────────────────────────────────────────────

const FicheProjetCard = ({ questionnaire }: { questionnaire: QuestionnaireData | null }) => (
  <GlassCard hover className='p-6 flex flex-col overflow-y-auto min-h-[280px]'>
    <div className='flex items-center gap-2.5 mb-5'>
      <div className='rounded-lg bg-[#c9a96e]/10 p-2'>
        <FileText className='size-4 text-[#c9a96e]' />
      </div>
      <h3
        className='font-semibold text-[#1a1a2e]'
        style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        Fiche projet
      </h3>
    </div>
    <div className='space-y-4 flex-1'>
      {questionnaire?.workDescription && (
        <div>
          <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5'>
            Description des travaux
          </p>
          <p className='text-sm text-[#3a3a4e] leading-relaxed whitespace-pre-line'>
            {questionnaire.workDescription}
          </p>
        </div>
      )}
      {questionnaire?.rooms && questionnaire.rooms.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5'>
            Pièces concernées
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {questionnaire.rooms.map((room) => (
              <span key={room} className='rounded-lg bg-[#f5f3f0] px-2 py-1 text-xs text-[#6b6b6b]'>
                {ROOM_LABELS[room] || room}
              </span>
            ))}
          </div>
        </div>
      )}
      {questionnaire?.constraints && questionnaire.constraints.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5'>
            Points d&apos;attention
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {questionnaire.constraints.map((c) => (
              <span key={c} className='rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-700'>
                {CONSTRAINT_LABELS[c] || c}
              </span>
            ))}
          </div>
        </div>
      )}
      {!questionnaire?.workDescription && !questionnaire?.rooms?.length && (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-[#9b9b9b]'>Aucune donnée questionnaire disponible</p>
        </div>
      )}
    </div>
  </GlassCard>
)

// ─── Documents Table Card ──────────────────────────────────────────────────

const DocumentsTableCard = ({
  documents,
  projectId,
}: {
  documents: OverviewContentProps['documents']
  projectId: string
}) => {
  const getDocIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) return Image
    return FileText
  }

  return (
    <GlassCard hover className='p-6'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2.5'>
          <div className='rounded-lg bg-[#c9a96e]/10 p-2'>
            <FileText className='size-4 text-[#c9a96e]' />
          </div>
          <h3
            className='font-semibold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Documents récents
          </h3>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}/documents`}
          className='text-xs text-[#c9a96e] hover:text-[#b8944f] transition-colors flex items-center gap-1 font-medium'
        >
          Voir tout
          <ExternalLink className='size-3' />
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className='py-10 text-center'>
          <div className='rounded-2xl bg-[#f5f3f0] p-4 inline-flex mb-3'>
            <FileText className='size-7 text-[#c9a96e]/40' />
          </div>
          <p className='text-sm text-[#9b9b9b]'>Aucun document pour le moment</p>
          <p className='text-xs text-[#c9c5bf] mt-1'>Les documents uploadés apparaîtront ici</p>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className='grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider'>
            <span>Nom</span>
            <span className='w-24 text-center'>Catégorie</span>
            <span className='w-20 text-right'>Date</span>
          </div>
          <div className='glass-separator mb-1' />
          {/* Rows */}
          {documents.map((doc, idx) => {
            const DocIcon = getDocIcon(doc.mimeType)
            return (
              <a
                key={doc.id}
                href={doc.url}
                target='_blank'
                rel='noopener noreferrer'
                className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-3 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 group ${
                  idx % 2 === 1 ? 'bg-[#f5f3f0]/30' : ''
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='rounded-lg bg-[#f5f3f0] p-1.5 group-hover:bg-[#c9a96e]/10 transition-colors'>
                    <DocIcon className='size-3.5 text-[#9b9b9b] group-hover:text-[#c9a96e] transition-colors' />
                  </div>
                  <span className='text-sm text-[#3a3a4e] truncate group-hover:text-[#1a1a2e] font-medium'>
                    {doc.name}
                  </span>
                </div>
                <span className='w-24 text-center'>
                  <span className='inline-block rounded-full bg-[#f5f3f0] px-2.5 py-0.5 text-[11px] text-[#6b6b6b] font-medium'>
                    {FILE_CATEGORY_LABELS[doc.category as FileCategory] || doc.category}
                  </span>
                </span>
                <span className='w-20 text-right text-xs text-[#9b9b9b]'>
                  {formatDate(doc.createdAt)}
                </span>
              </a>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}

// ─── Echéances Card (dark) ─────────────────────────────────────────────────

const EcheancesCard = ({
  isCadrage,
  validations,
  payments,
  events,
}: {
  isCadrage: boolean
  validations: OverviewContentProps['validations']
  payments: OverviewContentProps['payments']
  events: OverviewContentProps['events']
}) => {
  type EcheanceItem = { label: string; date: string; type: 'rdv' | 'validation' | 'payment' | 'event' }

  const items: EcheanceItem[] = []

  // RDV cadrage if in cadrage phase
  if (isCadrage) {
    items.push({
      label: 'Rendez-vous de cadrage',
      date: 'À planifier',
      type: 'rdv',
    })
  }

  // Pending validations
  validations
    .filter((v) => !v.validatedAt)
    .forEach((v) => {
      items.push({
        label: v.label,
        date: 'En attente',
        type: 'validation',
      })
    })

  // Pending/overdue payments
  payments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .forEach((p) => {
      items.push({
        label: p.label,
        date: formatDateLong(p.dueDate),
        type: 'payment',
      })
    })

  // Recent events (3 latest)
  events.slice(0, 3).forEach((e) => {
    items.push({
      label: EVENT_TYPE_LABELS[e.type] || e.type,
      date: formatDate(e.createdAt),
      type: 'event',
    })
  })

  return (
    <div className='glass-dark rounded-2xl p-6 text-white'>
      <div className='flex items-center gap-2.5 mb-1'>
        <div className='rounded-lg bg-[#c9a96e]/20 p-1.5'>
          <Clock className='size-4 text-[#c9a96e]' />
        </div>
        <h3
          className='font-semibold text-lg'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Prochaines échéances
        </h3>
      </div>
      <p className='text-xs text-white/40 mb-5'>Points d&apos;attention et jalons à venir</p>

      {items.length === 0 ? (
        <div className='py-4 text-center'>
          <p className='text-sm text-white/30'>Aucune échéance en cours.</p>
        </div>
      ) : (
        <div className='space-y-0'>
          {items.map((item, i) => (
            <div key={i}>
              <div className='flex items-start gap-3 py-3'>
                <div className='mt-1 size-2.5 rounded-full bg-[#c9a96e] shrink-0 shadow-[0_0_6px_rgba(201,169,110,0.5)]' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-white/90 font-medium'>{item.label}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-white/40'>{item.date}</span>
                    {item.type === 'payment' && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/20 px-2 py-0.5 text-[10px] text-[#c9a96e] font-medium'>
                        <CreditCard className='size-2.5' />
                        Paiement
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {i < items.length - 1 && (
                <div className='h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Phase Progress Card ───────────────────────────────────────────────────

const PhaseProgressCard = ({
  activePhases,
  currentPhaseIndex,
  actions,
}: {
  activePhases: ProjectPhase[]
  currentPhaseIndex: number
  actions: ActionItem[]
}) => {
  const getPhaseProgress = (phase: ProjectPhase, phaseIndex: number) => {
    if (phaseIndex < currentPhaseIndex) return 100
    if (phaseIndex > currentPhaseIndex) return 0
    // Current phase: ratio of completed actions
    const phaseActions = actions.filter((a) => a.phase === phase)
    if (phaseActions.length === 0) return 0
    const completed = phaseActions.filter((a) => a.completed).length
    return Math.round((completed / phaseActions.length) * 100)
  }

  return (
    <GlassCard hover className='p-6'>
      <div className='flex items-center gap-2.5 mb-5'>
        <div className='rounded-lg bg-[#c9a96e]/10 p-2'>
          <TrendingUp className='size-4 text-[#c9a96e]' />
        </div>
        <h3
          className='font-semibold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Avancement par phase
        </h3>
      </div>
      <div className='space-y-4'>
        {activePhases.map((phase, i) => {
          const progress = getPhaseProgress(phase, i)
          const variant = i < currentPhaseIndex ? 'emerald' : i === currentPhaseIndex ? 'gold' : 'default'
          return (
            <div key={phase}>
              <div className='flex items-center justify-between mb-1.5'>
                <span className='text-sm text-[#3a3a4e]'>{PROJECT_PHASE_LABELS[phase]}</span>
                <span className={`text-xs font-medium ${
                  i < currentPhaseIndex
                    ? 'text-emerald-500'
                    : i === currentPhaseIndex
                      ? 'text-[#c9a96e]'
                      : 'text-[#9b9b9b]'
                }`}>
                  {progress}%
                </span>
              </div>
              <GlassProgress value={progress} variant={variant} size='sm' />
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

// ─── Welcome Hero (Block Renovation inspired) ──────────────────────────

const WelcomeHero = ({ userName }: { userName: string }) => {
  const firstName = userName.split(' ')[0] || ''

  return (
    <div className='py-2'>
      <h1
        className='text-xl font-bold text-[#1a1a2e] tracking-tight'
        style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        {firstName ? `Bonjour ${firstName}, ` : ''}votre rénovation commence ici.
      </h1>
      <p className='mt-2 text-[#9b9b9b] text-sm md:text-base'>
        Votre projet est entre de bonnes mains. Suivez les étapes ci-dessous pour avancer sereinement.
      </p>
    </div>
  )
}

// ─── Process Steps (Block-style numbered cards) ─────────────────────────

const PROCESS_STEPS = [
  {
    icon: FileText,
    number: '01',
    label: 'Projet créé',
    description: 'Votre fiche projet est analysée par notre équipe pour comprendre vos besoins.',
  },
  {
    icon: CalendarDays,
    number: '02',
    label: 'Cadrage gratuit',
    description: 'Un rendez-vous avec votre chef de projet pour définir le plan d\'action.',
  },
  {
    icon: Search,
    number: '03',
    label: 'Artisans sélectionnés',
    description: 'Nous sélectionnons les meilleurs artisans qualifiés pour votre projet.',
  },
  {
    icon: CreditCard,
    number: '04',
    label: 'Devis & travaux',
    description: 'Comparez les devis détaillés et lancez les travaux en toute confiance.',
  },
]

const getTimelineStep = (matchingStatus: string, _phase: string): number => {
  if (matchingStatus === 'matched' || matchingStatus === 'in_progress' || matchingStatus === 'completed') return 3
  if (matchingStatus === 'matching') return 2
  return 0
}

const ProcessSteps = ({
  matchingStatus,
  phase,
}: {
  matchingStatus: string
  phase: string
}) => {
  const activeStep = getTimelineStep(matchingStatus, phase)

  return (
    <div>
      {/* Section header */}
      <div className='flex items-center gap-4 mb-6'>
        <h2
          className='text-xl font-bold text-[#1a1a2e] whitespace-nowrap'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Votre parcours
        </h2>
        <div className='h-px flex-1 bg-gradient-to-r from-[#e8e4df] to-transparent' />
      </div>

      {/* Desktop: 4-card grid */}
      <div className='hidden md:grid md:grid-cols-4 gap-4'>
        {PROCESS_STEPS.map((step, i) => {
          const isCompleted = i < activeStep
          const isCurrent = i === activeStep
          const isFuture = i > activeStep
          const StepIcon = step.icon

          return (
            <div
              key={step.label}
              className={cn(
                'relative rounded-2xl p-5 transition-all duration-300 overflow-hidden',
                isCurrent && 'glass-card shadow-[0_0_30px_rgba(201,169,110,0.12)] ring-1 ring-[#c9a96e]/30',
                isCompleted && 'glass-card',
                isFuture && 'bg-[#f5f3f0]/50 border border-[#e8e4df]/60',
              )}
            >
              {/* Number badge */}
              <div
                className={cn(
                  'size-11 rounded-xl flex items-center justify-center text-sm font-bold mb-4',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-[0_4px_16px_rgba(201,169,110,0.35)]',
                  isFuture && 'bg-[#e8e4df] text-[#9b9b9b]',
                )}
              >
                {isCompleted ? <Check className='size-5' /> : step.number}
              </div>

              {/* Current indicator badge */}
              {isCurrent && (
                <div className='absolute top-4 right-4'>
                  <span className='flex items-center gap-1 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#c9a96e]'>
                    <span className='size-1.5 rounded-full bg-[#c9a96e] animate-pulse' />
                    En cours
                  </span>
                </div>
              )}

              <h3
                className={cn(
                  'font-semibold text-sm mb-1',
                  isCompleted && 'text-emerald-600',
                  isCurrent && 'text-[#1a1a2e]',
                  isFuture && 'text-[#9b9b9b]',
                )}
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {step.label}
              </h3>
              <p
                className={cn(
                  'text-xs leading-relaxed',
                  isCurrent ? 'text-[#6b6b6b]' : 'text-[#9b9b9b]',
                )}
              >
                {step.description}
              </p>

              {/* Watermark icon */}
              <StepIcon
                className={cn(
                  'absolute bottom-3 right-3 size-10',
                  isCurrent ? 'opacity-[0.07] text-[#c9a96e]' : 'opacity-[0.04]',
                )}
              />
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className='flex flex-col gap-3 md:hidden'>
        {PROCESS_STEPS.map((step, i) => {
          const isCompleted = i < activeStep
          const isCurrent = i === activeStep
          const isFuture = i > activeStep

          return (
            <div
              key={step.label}
              className={cn(
                'flex items-center gap-4 rounded-xl p-4 transition-all',
                isCurrent && 'glass-card shadow-[0_0_20px_rgba(201,169,110,0.1)] ring-1 ring-[#c9a96e]/20',
                isCompleted && 'bg-emerald-50/50',
                isFuture && 'bg-[#f5f3f0]/30',
              )}
            >
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-[0_4px_12px_rgba(201,169,110,0.3)]',
                  isFuture && 'bg-[#e8e4df] text-[#9b9b9b]',
                )}
              >
                {isCompleted ? <Check className='size-4' /> : step.number}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <h3
                    className={cn(
                      'font-semibold text-sm',
                      isCompleted && 'text-emerald-600',
                      isCurrent && 'text-[#1a1a2e]',
                      isFuture && 'text-[#9b9b9b]',
                    )}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <span className='flex items-center gap-1 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 px-2 py-0.5 text-[10px] font-semibold text-[#c9a96e]'>
                      <span className='size-1.5 rounded-full bg-[#c9a96e] animate-pulse' />
                      En cours
                    </span>
                  )}
                </div>
                <p className='text-xs text-[#9b9b9b] mt-0.5'>{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Team Section (Advisor + Trust) ─────────────────────────────────────

const TeamSection = ({ projectId, userName, userEmail }: { projectId: string; userName: string; userEmail: string }) => {
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK || 'expert-reno/project-manager-meeting'

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'expert' })
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#c9a96e' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [])

  const openExpertModal = useCallback(async () => {
    const cal = await getCalApi({ namespace: 'expert' })
    cal('modal', {
      calLink,
      config: {
        name: userName,
        email: userEmail,
        theme: 'light',
        layout: 'month_view',
      },
    })
  }, [calLink, userName, userEmail])

  return (
    <div>
      {/* Section header — same style as ProcessSteps */}
      <div className='flex items-center gap-4 mb-2'>
        <h2
          className='text-xl font-bold text-[#1a1a2e] whitespace-nowrap'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Préparez les prochaines étapes
        </h2>
        <div className='h-px flex-1 bg-gradient-to-r from-[#e8e4df] to-transparent' />
      </div>
      <p className='text-sm text-[#9b9b9b] mb-6'>
        Nous sommes là pour vous accompagner à chaque étape. Voici ce que vous pouvez faire pendant que votre consultant prépare la sélection d&apos;artisans sur mesure.
      </p>

      {/* 2-col grid, same height as process step cards */}
      <div className='grid md:grid-cols-2 gap-4'>
        {/* Card 1 — Advisor */}
        <div className='glass-card rounded-2xl p-5 flex flex-col overflow-hidden relative'>
          <div className='flex items-center gap-3 mb-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&q=80&auto=format&fit=crop'
              alt='Claire'
              className='size-11 rounded-xl object-cover shadow-[0_4px_16px_rgba(0,0,0,0.1)] shrink-0'
            />
            <div className='min-w-0'>
              <h3
                className='font-semibold text-sm text-[#1a1a2e]'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Votre chef de projet
              </h3>
              <span className='text-xs text-[#9b9b9b]'>Claire · Équipe Gradia</span>
            </div>
            <span className='ml-auto flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-600 font-medium shrink-0'>
              <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
              Disponible
            </span>
          </div>

          <p className='text-xs text-[#9b9b9b] leading-relaxed'>
            Claire peut vous aider à comparer vos propositions, comprendre les prochaines étapes et vous apporter un regard expert et impartial.
          </p>

          <div className='flex items-center gap-2 mt-auto pt-3'>
            <GlassButton
              variant='gold'
              size='sm'
              onClick={openExpertModal}
            >
              <CalendarDays className='size-3.5' />
              Réserver un créneau
            </GlassButton>
            <GlassButton
              variant='ghost'
              size='sm'
              onClick={() => window.open('mailto:contact@gradia.fr', '_blank')}
            >
              Message
            </GlassButton>
          </div>

          <CalendarDays className='absolute bottom-3 right-3 size-10 opacity-[0.04]' />
        </div>

        {/* Card 2 — Guide / Pourquoi Gradia */}
        <div className='glass-card rounded-2xl p-5 flex flex-col overflow-hidden relative'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='size-11 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center shrink-0'>
              <Sparkles className='size-5 text-[#c9a96e]' />
            </div>
            <h3
              className='font-semibold text-sm text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Pourquoi Gradia ?
            </h3>
          </div>

          <div className='space-y-3 flex-1'>
            {[
              { icon: CheckCircle2, label: 'Artisans vérifiés', desc: 'Sélectionnés et contrôlés' },
              { icon: CreditCard, label: 'Paiement sécurisé', desc: 'Libéré par étape validée' },
              { icon: TrendingUp, label: 'Suivi en temps réel', desc: 'Dashboard & notifications' },
            ].map((item) => (
              <div key={item.label} className='flex items-center gap-2.5'>
                <div className='size-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0'>
                  <item.icon className='size-3.5 text-emerald-500' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-medium text-[#1a1a2e]'>{item.label}</p>
                  <p className='text-[11px] text-[#9b9b9b]'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href='/faq'
            className='inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-[#c9a96e] hover:text-[#b8944f] transition-colors'
          >
            En savoir plus
            <ExternalLink className='size-3' />
          </Link>

          <Sparkles className='absolute bottom-3 right-3 size-10 opacity-[0.04]' />
        </div>
      </div>
    </div>
  )
}

// ─── Design Banner (Magazine-style with photo) ──────────────────────────

const DesignBanner = ({ projectId, userName, userEmail }: { projectId: string; userName: string; userEmail: string }) => {
  const designCalLink = process.env.NEXT_PUBLIC_CALCOM_DESIGNER_LINK || 'expert-reno/designer-consultation'

  const DESIGN_FEATURES = [
    'Plans 2D du projet',
    'Design intérieur',
    'Sélection matériaux',
    'Rendus 3D',
    'Coordination design',
  ]

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'designer' })
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#c9a96e' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [])

  const openDesignerModal = useCallback(async () => {
    const cal = await getCalApi({ namespace: 'designer' })
    cal('modal', {
      calLink: designCalLink,
      config: {
        name: userName,
        email: userEmail,
        theme: 'light',
        layout: 'month_view',
      },
    })
  }, [designCalLink, userName, userEmail])

  return (
    <div className='relative overflow-hidden rounded-2xl border border-[#e8e4df]/60'>
      <div className='flex flex-col md:flex-row'>
        {/* Left: Photo */}
        <div className='relative w-full md:w-1/3 min-h-[200px]'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format'
            alt='Design intérieur'
            className='absolute inset-0 w-full h-full object-cover'
            loading='lazy'
          />
        </div>

        {/* Right: Content */}
        <div className='flex-1 bg-white/80 backdrop-blur-sm p-6 md:py-6 md:px-8 flex flex-col justify-between'>
          <div>
            <h3
              className='text-xl font-bold text-[#1a1a2e] mb-1.5'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Parlez à un designer
            </h3>
            <p className='text-sm text-[#9b9b9b] mb-4'>
              Réservez une consultation gratuite de 30 minutes pour obtenir des conseils d&apos;experts sur votre projet et trouver le bon niveau d&apos;accompagnement design.
            </p>

            <div className='flex flex-wrap gap-x-5 gap-y-2 mb-5'>
              {DESIGN_FEATURES.map((feature) => (
                <div key={feature} className='flex items-center gap-1.5'>
                  <Check className='size-3.5 text-emerald-500 shrink-0' />
                  <span className='text-sm text-[#3a3a4e]'>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href={`/dashboard/projects/${projectId}/design-services`}
              className='inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] bg-[#f5f3f0] border border-[#e8e4df] text-[#1a1a2e] hover:bg-[#ebe8e4] hover:border-[#ddd8d2] px-5 py-2.5 text-sm'
            >
              En savoir plus
            </Link>
            <button
              onClick={openDesignerModal}
              className='inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-[#c9a96e] to-[#b8944f] text-white shadow-[0_2px_12px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)] hover:brightness-110 px-5 py-2.5 text-sm'
            >
              <Phone className='size-4' />
              Réserver un appel gratuit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Marketplace Status Card ──────────────────────────────────────────────

const MATCHING_STATUS_CONFIG: Record<string, { icon: typeof Search; color: string; bgColor: string }> = {
  open: { icon: Search, color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' },
  matching: { icon: Search, color: 'text-amber-500', bgColor: 'bg-amber-50 border-amber-200' },
  matched: { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50 border-emerald-200' },
  in_progress: { icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50 border-emerald-200' },
}

const MATCHING_STATUS_DESCRIPTIONS: Record<string, string> = {
  open: 'Votre projet est en attente de sélection d\'artisans par notre équipe.',
  matching: 'Nous sélectionnons les meilleurs artisans pour votre projet. Vous recevrez leurs propositions sous 48-72h.',
  matched: 'Vos artisans sont sélectionnés. Consultez leurs propositions dans l\'onglet Artisans.',
  in_progress: 'Les travaux sont en cours avec vos artisans sélectionnés.',
  completed: 'Tous les travaux sont terminés. Merci de votre confiance !',
}

const MarketplaceStatusCard = ({
  matchingStatus,
  contractors,
  projectId,
}: {
  matchingStatus: string
  contractors: ContractorItem[]
  projectId: string
}) => {
  const config = MATCHING_STATUS_CONFIG[matchingStatus] || MATCHING_STATUS_CONFIG.open
  const StatusIcon = config.icon
  const description = MATCHING_STATUS_DESCRIPTIONS[matchingStatus] || MATCHING_STATUS_DESCRIPTIONS.open
  const label = MATCHING_STATUS_LABELS[matchingStatus as MatchingStatus] || matchingStatus

  const proposalsReceived = contractors.filter((c) => c.proposalStatus === 'submitted' || c.proposalStatus === 'accepted').length
  const proposalsAccepted = contractors.filter((c) => c.proposalStatus === 'accepted').length

  return (
    <div className={`rounded-2xl border px-5 py-4 ${config.bgColor}`}>
      <div className='flex items-start gap-3'>
        <StatusIcon className={`size-5 mt-0.5 shrink-0 ${config.color}`} />
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-semibold text-[#1a1a2e]'>{label}</p>
            {contractors.length > 0 && (
              <span className='text-xs text-[#9b9b9b]'>
                {contractors.length} artisan{contractors.length > 1 ? 's' : ''}
                {proposalsReceived > 0 && ` · ${proposalsReceived} devis`}
                {proposalsAccepted > 0 && ` · ${proposalsAccepted} accepté${proposalsAccepted > 1 ? 's' : ''}`}
              </span>
            )}
          </div>
          <p className='text-xs text-[#6b6b6b] mt-1'>{description}</p>
          {(matchingStatus === 'matched' || proposalsReceived > 0) && (
            <Link
              href={`/dashboard/projects/${projectId}/artisans`}
              className='inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#c9a96e] hover:text-[#b8944f] transition-colors'
            >
              Voir les propositions
              <ExternalLink className='size-3' />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Contractors Summary Card ─────────────────────────────────────────────

const ContractorsSummaryCard = ({
  contractors,
  projectId,
}: {
  contractors: ContractorItem[]
  projectId: string
}) => (
  <GlassCard hover className='p-6'>
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center gap-2.5'>
        <div className='rounded-lg bg-[#c9a96e]/10 p-2'>
          <Wrench className='size-4 text-[#c9a96e]' />
        </div>
        <h3
          className='font-semibold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Artisans
        </h3>
      </div>
      <Link
        href={`/dashboard/projects/${projectId}/artisans`}
        className='text-xs text-[#c9a96e] hover:text-[#b8944f] transition-colors flex items-center gap-1 font-medium'
      >
        Voir tout
        <ExternalLink className='size-3' />
      </Link>
    </div>

    <div className='space-y-3'>
      {contractors.map((c) => (
        <div key={c.pcId} className='flex items-center gap-3'>
          <div className='size-8 rounded-lg bg-[#f5f3f0] flex items-center justify-center text-xs font-bold text-[#9b9b9b]'>
            {c.companyName.charAt(0).toUpperCase()}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-[#1a1a2e] truncate'>{c.companyName}</p>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-[#9b9b9b]'>
                {CONTRACTOR_SPECIALTY_LABELS[c.specialty as ContractorSpecialty] || c.specialty}
              </span>
              {c.rating && parseFloat(c.rating) > 0 && (
                <span className='flex items-center gap-0.5 text-xs text-[#c9a96e]'>
                  <Star className='size-3 fill-[#c9a96e]' />
                  {parseFloat(c.rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
          {c.proposalAmount && (
            <span className='text-sm font-semibold text-[#1a1a2e] shrink-0'>
              {parseFloat(c.proposalAmount).toLocaleString('fr-FR')} €
            </span>
          )}
          {!c.proposalAmount && (
            <GlassBadge variant='default'>En attente</GlassBadge>
          )}
        </div>
      ))}
    </div>
  </GlassCard>
)
