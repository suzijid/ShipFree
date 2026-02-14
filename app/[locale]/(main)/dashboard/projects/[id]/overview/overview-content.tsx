'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  CalendarDays,
  MapPin,
  Home,
  Ruler,
  Wallet,
  UserCircle,
  Sparkles,
  FileText,
  Settings2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { GlassCard, GlassButton, GlassBadge } from '../../../../components/glass-primitives'
import { useProject } from '../../../../components/project-context'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogPanel,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  PROJECT_PHASE_LABELS,
  PROPERTY_TYPE_LABELS,
  BUDGET_RANGE_LABELS,
  SERVICE_LABELS,
  type ProjectPhase,
  type PropertyType,
  type BudgetRange,
} from '@/config/project'

// ─── Label maps ────────────────────────────────────────────────────────────

const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Dès que possible',
  normal: 'Dans les prochains mois',
  flexible: 'Pas pressé',
  exploring: 'Phase exploratoire',
}

const STYLE_LABELS: Record<string, string> = {
  moderne: 'Moderne / Contemporain',
  classique: 'Classique / Haussmannien',
  industriel: 'Industriel / Loft',
  scandinave: 'Scandinave / Minimaliste',
  autre: 'Autre',
}

const RENOVATION_LABELS: Record<string, string> = {
  complete: 'Rénovation complète',
  partielle: 'Rénovation partielle',
  extension: 'Extension',
  amenagement: 'Aménagement',
  decoration: 'Décoration',
}

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

interface OverviewContentProps {
  actions: {
    id: string
    label: string
    phase: string
    completed: boolean
  }[]
  validations: {
    id: string
    label: string
    phase: string
    validatedAt: string | null
  }[]
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

// ─── Main Component ────────────────────────────────────────────────────────

export const OverviewContent = ({ actions, validations }: OverviewContentProps) => {
  const { project, userRole } = useProject()
  const questionnaire = project.aiSummary as QuestionnaireData | null

  const activePhases = getActivePhases(project)
  const currentPhaseIndex = activePhases.indexOf(project.phase as ProjectPhase)
  const progressPercent = activePhases.length > 1
    ? Math.round((currentPhaseIndex / (activePhases.length - 1)) * 100)
    : 0
  const completedActions = actions.filter((a) => a.completed).length
  const totalActions = actions.length
  const currentActions = actions.filter((a) => a.phase === project.phase).slice(0, 3)
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )

  const isCadrage = project.phase === 'cadrage'

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='h-full overflow-y-auto md:overflow-hidden p-4 md:p-6'
      data-tour='overview-grid'
    >
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:h-full md:grid-rows-3'>
        {/* Phase Roadmap — 2 cols, 1 row */}
        <motion.div variants={itemVariants} className='md:col-span-2'>
          <PhaseRoadmapCard phases={activePhases} currentPhaseIndex={currentPhaseIndex} />
        </motion.div>

        {/* Quick Stats — 1 col */}
        <motion.div variants={itemVariants}>
          <QuickStatsCard
            progress={progressPercent}
            tasks={totalActions > 0 ? `${completedActions}/${totalActions}` : '—'}
            phase={PROJECT_PHASE_LABELS[project.phase as ProjectPhase] || project.phase}
            days={daysSinceCreation}
          />
        </motion.div>

        {/* Manager — 1 col */}
        <motion.div variants={itemVariants}>
          <ManagerCard managerName={project.managerName} />
        </motion.div>

        {/* RDV Cadrage OR Fiche projet — 2 cols, 2 rows */}
        <motion.div variants={itemVariants} className='md:col-span-2 md:row-span-2'>
          {isCadrage ? (
            <RdvCadrageCard />
          ) : (
            <FicheProjetCard questionnaire={questionnaire} />
          )}
        </motion.div>

        {/* Property — 1 col */}
        <motion.div variants={itemVariants}>
          <PropertyCard
            propertyType={project.propertyType}
            surface={project.surface}
            rooms={questionnaire?.rooms}
            city={project.city}
            postalCode={project.postalCode}
          />
        </motion.div>

        {/* Services — 1 col */}
        <motion.div variants={itemVariants}>
          <ServicesCard services={project.services} />
        </motion.div>

        {/* Budget — 1 col */}
        <motion.div variants={itemVariants}>
          <BudgetCard budgetRange={project.budgetRange} />
        </motion.div>

        {/* Next Actions — 1 col */}
        <motion.div variants={itemVariants}>
          <NextActionsCard
            actions={currentActions}
            projectId={project.id}
            userRole={userRole}
            modules={project.modules}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Bento Cards ───────────────────────────────────────────────────────────

const PhaseRoadmapCard = ({
  phases,
  currentPhaseIndex,
}: {
  phases: ProjectPhase[]
  currentPhaseIndex: number
}) => (
  <GlassCard hover className='h-full p-5 flex flex-col'>
    <h3
      className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-4'
      style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
    >
      Avancement
    </h3>
    <div className='flex items-center gap-1 flex-wrap flex-1'>
      {phases.map((phase, i) => {
        const isCompleted = i < currentPhaseIndex
        const isCurrent = i === currentPhaseIndex
        return (
          <div key={phase} className='flex items-center'>
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-all ${
                isCurrent
                  ? 'bg-[#c9a96e]/15 text-[#c9a96e] font-medium border border-[#c9a96e]/30 shadow-[0_0_12px_rgba(201,169,110,0.15)]'
                  : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-white/5 text-white/30'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className='size-4 text-emerald-400 shrink-0' />
              ) : isCurrent ? (
                <Circle className='size-4 text-[#c9a96e] fill-[#c9a96e] shrink-0' />
              ) : (
                <Circle className='size-4 shrink-0' />
              )}
              {PROJECT_PHASE_LABELS[phase]}
            </div>
            {i < phases.length - 1 && (
              <ChevronRight className='size-4 text-white/20 shrink-0 mx-1' />
            )}
          </div>
        )
      })}
    </div>
  </GlassCard>
)

const QuickStatsCard = ({
  progress,
  tasks,
  phase,
  days,
}: {
  progress: number
  tasks: string
  phase: string
  days: number
}) => (
  <GlassCard hover className='h-full p-5'>
    <h3 className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-3'>Stats</h3>
    <div className='grid grid-cols-2 gap-3'>
      <div>
        <p className='text-2xl font-bold text-[#c9a96e]'>{progress}%</p>
        <p className='text-xs text-white/40'>Avancement</p>
      </div>
      <div>
        <p className='text-2xl font-bold text-white/90'>{tasks}</p>
        <p className='text-xs text-white/40'>Tâches</p>
      </div>
      <div>
        <p className='text-sm font-medium text-white/80 truncate'>{phase}</p>
        <p className='text-xs text-white/40'>Phase</p>
      </div>
      <div>
        <p className='text-2xl font-bold text-white/90'>J+{days}</p>
        <p className='text-xs text-white/40'>Jours</p>
      </div>
    </div>
  </GlassCard>
)

const ManagerCard = ({ managerName }: { managerName: string | null }) => (
  <GlassCard hover className='h-full p-5 flex flex-col justify-center'>
    <div className='flex items-center gap-3'>
      <div className={`rounded-full p-2.5 ${managerName ? 'bg-[#c9a96e]/10' : 'bg-white/5'}`}>
        <UserCircle className={`size-6 ${managerName ? 'text-[#c9a96e]' : 'text-white/30'}`} />
      </div>
      <div className='flex-1 min-w-0'>
        {managerName ? (
          <>
            <p className='text-sm font-semibold text-white/95 truncate'>{managerName}</p>
            <p className='text-xs text-white/40'>Chef de projet</p>
          </>
        ) : (
          <>
            <p className='text-sm font-medium text-white/60'>En attente d&apos;assignation</p>
            <p className='text-xs text-white/30'>Notification par email</p>
          </>
        )}
      </div>
      {managerName && <GlassBadge variant='gold'>Assigné</GlassBadge>}
    </div>
  </GlassCard>
)

const RdvCadrageCard = () => {
  const [showEmbed, setShowEmbed] = useState(false)
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK

  return (
    <GlassCard glow className='h-full p-6 flex flex-col border-[#c9a96e]/20'>
      <div className='flex items-start gap-4 mb-4'>
        <div className='rounded-full bg-[#c9a96e]/15 p-3 shrink-0'>
          <CalendarDays className='size-6 text-[#c9a96e]' />
        </div>
        <div>
          <h3
            className='font-semibold text-white/95 text-lg'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Rendez-vous de cadrage
          </h3>
          <p className='text-sm text-white/50 mt-1'>
            Réservez un créneau avec votre chef de projet pour définir ensemble le plan d&apos;action de votre rénovation.
          </p>
        </div>
      </div>

      {!showEmbed ? (
        <div className='flex-1 flex flex-col items-center justify-center'>
          <div className='rounded-2xl bg-gradient-to-b from-[#c9a96e]/10 to-transparent p-8 text-center'>
            <Sparkles className='size-10 text-[#c9a96e] mx-auto mb-4 opacity-60' />
            <p className='text-sm text-white/50 mb-6 max-w-sm'>
              Ce rendez-vous est gratuit et sans engagement. Il dure environ 30 minutes.
            </p>
            <GlassButton
              variant='gold'
              size='lg'
              onClick={() => {
                if (calLink) {
                  setShowEmbed(true)
                } else {
                  // Fallback: no cal link configured
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
        <div className='flex-1 rounded-xl overflow-hidden bg-white/5'>
          {calLink ? (
            <iframe
              src={`https://cal.com/${calLink}?theme=dark`}
              className='w-full h-full min-h-[400px] border-0'
              title='Réserver un rendez-vous'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-white/40 text-sm'>
              Configuration Cal.com manquante
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}

const FicheProjetCard = ({ questionnaire }: { questionnaire: QuestionnaireData | null }) => (
  <GlassCard hover className='h-full p-6 flex flex-col overflow-y-auto'>
    <div className='flex items-center gap-2 mb-4'>
      <FileText className='size-4 text-[#c9a96e]' />
      <h3
        className='text-sm font-semibold text-white/60 uppercase tracking-wider'
        style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        Fiche projet
      </h3>
    </div>
    <div className='space-y-4 flex-1'>
      {questionnaire?.workDescription && (
        <div>
          <p className='text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5'>
            Description des travaux
          </p>
          <p className='text-sm text-white/70 leading-relaxed whitespace-pre-line'>
            {questionnaire.workDescription}
          </p>
        </div>
      )}
      {questionnaire?.rooms && questionnaire.rooms.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5'>
            Pièces concernées
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {questionnaire.rooms.map((room) => (
              <span key={room} className='rounded-lg bg-white/8 px-2 py-1 text-xs text-white/60'>
                {ROOM_LABELS[room] || room}
              </span>
            ))}
          </div>
        </div>
      )}
      {questionnaire?.constraints && questionnaire.constraints.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5'>
            Points d&apos;attention
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {questionnaire.constraints.map((c) => (
              <span key={c} className='rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs text-amber-400/80'>
                {CONSTRAINT_LABELS[c] || c}
              </span>
            ))}
          </div>
        </div>
      )}
      {!questionnaire?.workDescription && !questionnaire?.rooms?.length && (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-white/30'>Aucune donnée questionnaire disponible</p>
        </div>
      )}
    </div>
  </GlassCard>
)

const PropertyCard = ({
  propertyType,
  surface,
  rooms,
  city,
  postalCode,
}: {
  propertyType: string | null
  surface: string | null
  rooms?: string[]
  city: string | null
  postalCode: string | null
}) => (
  <GlassCard hover className='h-full p-5'>
    <h3 className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-3'>Bien</h3>
    <div className='space-y-2.5'>
      {propertyType && (
        <div className='flex items-center gap-2'>
          <Home className='size-3.5 text-[#c9a96e]' />
          <span className='text-sm text-white/80'>
            {PROPERTY_TYPE_LABELS[propertyType as PropertyType] || propertyType}
          </span>
        </div>
      )}
      {surface && (
        <div className='flex items-center gap-2'>
          <Ruler className='size-3.5 text-[#c9a96e]' />
          <span className='text-sm text-white/80'>{surface} m²</span>
        </div>
      )}
      {city && (
        <div className='flex items-center gap-2'>
          <MapPin className='size-3.5 text-[#c9a96e]' />
          <span className='text-sm text-white/80'>{postalCode} {city}</span>
        </div>
      )}
      {rooms && rooms.length > 0 && (
        <p className='text-xs text-white/40'>{rooms.length} pièce{rooms.length > 1 ? 's' : ''}</p>
      )}
    </div>
  </GlassCard>
)

const ServicesCard = ({
  services,
}: {
  services: { architect: string; contractors: string; adminHelp: string }
}) => {
  const serviceEntries = [
    { key: 'architect' as const, value: services.architect },
    { key: 'contractors' as const, value: services.contractors },
    { key: 'adminHelp' as const, value: services.adminHelp },
  ]

  const choiceColor = (v: string) => {
    if (v === 'yes') return 'text-emerald-400'
    if (v === 'maybe') return 'text-amber-400'
    return 'text-white/25'
  }

  const choiceLabel = (v: string) => {
    if (v === 'yes') return 'Oui'
    if (v === 'maybe') return 'Peut-être'
    return 'Non'
  }

  return (
    <GlassCard hover className='h-full p-5'>
      <h3 className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-3'>Services</h3>
      <div className='space-y-2.5'>
        {serviceEntries.map((s) => (
          <div key={s.key} className='flex items-center justify-between gap-2'>
            <span className='text-xs text-white/60 truncate'>
              {SERVICE_LABELS[s.key]}
            </span>
            <span className={`text-xs font-medium ${choiceColor(s.value)}`}>
              {choiceLabel(s.value)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

const BudgetCard = ({ budgetRange }: { budgetRange: string | null }) => {
  const label = budgetRange
    ? BUDGET_RANGE_LABELS[budgetRange as BudgetRange] || budgetRange
    : 'Non défini'

  return (
    <GlassCard hover className='h-full p-5 flex flex-col justify-between'>
      <h3 className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-3'>Budget</h3>
      <div>
        <Wallet className='size-5 text-[#c9a96e] mb-2' />
        <p className='text-lg font-bold text-white/90'>{label}</p>
        <p className='text-xs text-white/30 mt-1'>Budget indicatif</p>
      </div>
    </GlassCard>
  )
}

const NextActionsCard = ({
  actions,
  projectId,
  userRole,
  modules,
}: {
  actions: { id: string; label: string; completed: boolean }[]
  projectId: string
  userRole: string
  modules: { design: boolean; works: boolean; wallet: boolean }
}) => (
  <GlassCard hover className='h-full p-5 flex flex-col'>
    <h3 className='text-sm font-semibold text-white/60 uppercase tracking-wider mb-3'>À faire</h3>
    <div className='space-y-2 flex-1'>
      {actions.length === 0 ? (
        <p className='text-sm text-white/30'>Aucune action en cours</p>
      ) : (
        actions.map((action) => (
          <ActionItem key={action.id} action={action} projectId={projectId} />
        ))
      )}
    </div>
    {(userRole === 'manager' || userRole === 'admin') && (
      <div className='mt-3 pt-3 border-t border-white/[0.06]'>
        <ConfigureModulesButton projectId={projectId} modules={modules} />
      </div>
    )}
  </GlassCard>
)

// ─── Sub-components ────────────────────────────────────────────────────────

const ActionItem = ({
  action,
  projectId,
}: {
  action: { id: string; label: string; completed: boolean }
  projectId: string
}) => {
  const [completed, setCompleted] = useState(action.completed)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/project/${projectId}/actions/${action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (res.ok) setCompleted(!completed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
        completed
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-white/5 text-white/70 hover:bg-white/8'
      }`}
    >
      {completed ? (
        <CheckCircle2 className='size-4 text-emerald-400 shrink-0' />
      ) : (
        <Circle className='size-4 text-white/30 shrink-0' />
      )}
      <span className={completed ? 'line-through' : ''}>{action.label}</span>
    </button>
  )
}

const ConfigureModulesButton = ({
  projectId,
  modules,
}: {
  projectId: string
  modules: { design: boolean; works: boolean; wallet: boolean }
}) => {
  const router = useRouter()
  const [design, setDesign] = useState(modules.design)
  const [works, setWorks] = useState(modules.works)
  const [wallet, setWallet] = useState(modules.wallet)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/project/${projectId}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design, works, wallet }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className='flex items-center gap-1.5 text-xs text-white/40 hover:text-[#c9a96e] transition-colors' />
        }
      >
        <Settings2 className='size-3.5' />
        Configurer les modules
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Modules du projet</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <div className='space-y-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Conception</p>
                <p className='text-xs text-muted-foreground'>Esquisse, APS, APD, matériaux</p>
              </div>
              <Switch checked={design} onCheckedChange={setDesign} />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Travaux</p>
                <p className='text-xs text-muted-foreground'>Suivi de chantier, tâches</p>
              </div>
              <Switch checked={works} onCheckedChange={setWorks} />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Finances</p>
                <p className='text-xs text-muted-foreground'>Appels de fonds, échéancier</p>
              </div>
              <Switch checked={wallet} onCheckedChange={setWallet} />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter variant='bare'>
          <DialogClose render={<Button variant='outline' />}>Annuler</DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
