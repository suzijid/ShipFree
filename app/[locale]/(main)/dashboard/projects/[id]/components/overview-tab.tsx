'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Circle,
  CalendarDays,
  MapPin,
  Home,
  Ruler,
  Palette,
  Wallet,
  Clock,
  ChevronRight,
  FileText,
  Hammer,
  UserCircle,
  TrendingUp,
  ListChecks,
  ArrowRight,
  Settings2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  PROJECT_PHASE_LABELS,
  PROPERTY_TYPE_LABELS,
  BUDGET_RANGE_LABELS,
  type ProjectPhase,
  type PropertyType,
  type BudgetRange,
} from '@/config/project'

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

interface QuestionnaireData {
  workDescription?: string
  renovationType?: string
  urgency?: string
  constraints?: string[]
  rooms?: string[]
}

interface OverviewTabProps {
  project: {
    id: string
    title: string
    status: string
    phase: string
    modules: { design: boolean; works: boolean; wallet: boolean }
    services: { architect: string; contractors: string; adminHelp: string }
    aiSummary: Record<string, unknown> | null
    propertyType: string | null
    surface: string | null
    budgetRange: string | null
    style: string | null
    postalCode: string | null
    city: string | null
    managerName: string | null
    createdAt: Date
  }
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
    validatedAt: Date | null
  }[]
  userRole?: 'owner' | 'manager' | 'admin'
}

export const OverviewTab = ({ project, actions, validations, userRole }: OverviewTabProps) => {
  const questionnaire = project.aiSummary as QuestionnaireData | null

  // Get active phases for this project
  const activePhases = getActivePhases(project)
  const currentPhaseIndex = activePhases.indexOf(project.phase as ProjectPhase)

  // KPI calculations
  const progressPercent = activePhases.length > 1
    ? Math.round((currentPhaseIndex / (activePhases.length - 1)) * 100)
    : 0
  const completedActions = actions.filter((a) => a.completed).length
  const totalActions = actions.length

  // Current phase actions (max 3)
  const currentActions = actions
    .filter((a) => a.phase === project.phase)
    .slice(0, 3)

  return (
    <div className='space-y-6'>
      {/* KPI Row */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <KpiCard
          icon={TrendingUp}
          label='Avancement'
          value={`${progressPercent} %`}
          color='text-[#c9a96e]'
        />
        <KpiCard
          icon={Wallet}
          label='Budget'
          value={project.budgetRange
            ? BUDGET_RANGE_LABELS[project.budgetRange as BudgetRange] || project.budgetRange
            : '—'
          }
          color='text-emerald-600'
        />
        <KpiCard
          icon={ListChecks}
          label='Tâches'
          value={totalActions > 0 ? `${completedActions}/${totalActions}` : '—'}
          color='text-blue-600'
        />
        <KpiCard
          icon={ArrowRight}
          label='Phase actuelle'
          value={PROJECT_PHASE_LABELS[project.phase as ProjectPhase] || project.phase}
          color='text-[#1a1a2e]'
        />
      </div>

      {/* RDV Cadrage CTA */}
      {project.phase === 'cadrage' && (
        <div className='rounded-xl border-2 border-[#c9a96e]/40 bg-gradient-to-r from-[#c9a96e]/5 to-[#c9a96e]/10 p-6'>
          <div className='flex items-start gap-4'>
            <div className='rounded-full bg-[#c9a96e]/20 p-3'>
              <CalendarDays className='size-6 text-[#c9a96e]' />
            </div>
            <div className='flex-1'>
              <h3
                className='font-semibold text-[#1a1a2e] text-lg'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Rendez-vous de cadrage
              </h3>
              <p className='text-sm text-[#4a4a4a] mt-1'>
                Réservez un créneau avec votre chef de projet pour définir ensemble le plan d&apos;action de votre rénovation.
              </p>
              <Button className='mt-4 bg-[#c9a96e] text-white hover:bg-[#b8944f]'>
                <CalendarDays className='size-4 mr-2' />
                Réserver un créneau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Roadmap */}
      <div className='rounded-xl border border-[#e8e4df] bg-white p-6'>
        <h3
          className='font-semibold text-[#1a1a2e] mb-4'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Avancement du projet
        </h3>
        <div className='flex items-center gap-1 overflow-x-auto pb-2'>
          {activePhases.map((phase, i) => {
            const isCompleted = i < currentPhaseIndex
            const isCurrent = i === currentPhaseIndex
            return (
              <div key={phase} className='flex items-center min-w-0'>
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-[#c9a96e]/10 text-[#c9a96e] font-medium border border-[#c9a96e]/30'
                      : isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-50 text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className='size-4 text-emerald-500 shrink-0' />
                  ) : isCurrent ? (
                    <Circle className='size-4 text-[#c9a96e] fill-[#c9a96e] shrink-0' />
                  ) : (
                    <Circle className='size-4 shrink-0' />
                  )}
                  {PROJECT_PHASE_LABELS[phase]}
                </div>
                {i < activePhases.length - 1 && (
                  <ChevronRight className='size-4 text-muted-foreground/40 shrink-0 mx-1' />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Manager Card */}
      <div className='rounded-xl border border-[#e8e4df] bg-white p-5'>
        <div className='flex items-center gap-4'>
          <div className={`rounded-full p-2.5 ${project.managerName ? 'bg-[#c9a96e]/10' : 'bg-gray-100'}`}>
            <UserCircle className={`size-6 ${project.managerName ? 'text-[#c9a96e]' : 'text-muted-foreground'}`} />
          </div>
          <div className='flex-1'>
            {project.managerName ? (
              <>
                <p className='text-sm font-semibold text-[#1a1a2e]'>{project.managerName}</p>
                <p className='text-xs text-muted-foreground'>Chef de projet</p>
              </>
            ) : (
              <>
                <p className='text-sm font-medium text-[#4a4a4a]'>
                  Un chef de projet sera bientôt assigné
                </p>
                <p className='text-xs text-muted-foreground'>
                  Vous serez notifié par email dès l&apos;assignation.
                </p>
              </>
            )}
          </div>
          {project.managerName && (
            <Badge variant='outline' className='text-xs'>
              Assigné
            </Badge>
          )}
        </div>
      </div>

      {/* Next Best Actions */}
      {currentActions.length > 0 && (
        <div className='rounded-xl border border-[#e8e4df] bg-white p-6'>
          <h3
            className='font-semibold text-[#1a1a2e] mb-4'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            À faire maintenant
          </h3>
          <div className='space-y-3'>
            {currentActions.map((action) => (
              <ActionItem key={action.id} action={action} projectId={project.id} />
            ))}
          </div>
        </div>
      )}

      {/* Validation Milestones */}
      {validations.length > 0 && (
        <div className='rounded-xl border border-[#e8e4df] bg-white p-6'>
          <h3
            className='font-semibold text-[#1a1a2e] mb-4'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Validations
          </h3>
          <div className='space-y-3'>
            {validations.map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                  v.validatedAt
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-[#e8e4df]'
                }`}
              >
                {v.validatedAt ? (
                  <CheckCircle2 className='size-5 text-emerald-500 shrink-0' />
                ) : (
                  <Circle className='size-5 text-muted-foreground shrink-0' />
                )}
                <span className={`text-sm ${v.validatedAt ? 'text-emerald-700' : 'text-[#4a4a4a]'}`}>
                  {v.label}
                </span>
                {v.validatedAt && (
                  <span className='ml-auto text-xs text-emerald-600'>
                    {new Date(v.validatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        {project.propertyType && (
          <MetaCard
            icon={Home}
            label='Type de bien'
            value={PROPERTY_TYPE_LABELS[project.propertyType as PropertyType] || project.propertyType}
          />
        )}
        {questionnaire?.renovationType && (
          <MetaCard
            icon={Hammer}
            label='Type de travaux'
            value={RENOVATION_LABELS[questionnaire.renovationType] || questionnaire.renovationType}
          />
        )}
        {project.city && (
          <MetaCard
            icon={MapPin}
            label='Localisation'
            value={`${project.postalCode} ${project.city}`}
          />
        )}
        {project.surface && (
          <MetaCard
            icon={Ruler}
            label='Surface'
            value={`${project.surface} m²`}
          />
        )}
        {project.style && (
          <MetaCard
            icon={Palette}
            label='Style'
            value={STYLE_LABELS[project.style] || project.style}
          />
        )}
        {project.budgetRange && (
          <MetaCard
            icon={Wallet}
            label='Budget indicatif'
            value={BUDGET_RANGE_LABELS[project.budgetRange as BudgetRange] || project.budgetRange}
          />
        )}
        {questionnaire?.urgency && (
          <MetaCard
            icon={Clock}
            label='Calendrier'
            value={URGENCY_LABELS[questionnaire.urgency] || questionnaire.urgency}
          />
        )}
      </div>

      {/* Fiche projet — built from questionnaire data */}
      <div className='rounded-xl border border-[#e8e4df] bg-white'>
        <div className='border-b border-[#e8e4df] px-6 py-4 flex items-center gap-2'>
          <FileText className='size-4 text-[#c9a96e]' />
          <div>
            <h3
              className='text-base font-semibold text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Fiche projet
            </h3>
            <p className='text-xs text-muted-foreground'>
              Synthèse de vos réponses au questionnaire
            </p>
          </div>
        </div>
        <div className='px-6 py-6 space-y-5'>
          {/* Work description */}
          {questionnaire?.workDescription && (
            <div>
              <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-2'>
                Description des travaux
              </p>
              <p className='text-sm text-[#4a4a4a] leading-relaxed whitespace-pre-line'>
                {questionnaire.workDescription}
              </p>
            </div>
          )}

          {/* Rooms */}
          {questionnaire?.rooms && questionnaire.rooms.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-2'>
                Pièces concernées
              </p>
              <div className='flex flex-wrap gap-2'>
                {questionnaire.rooms.map((room) => (
                  <span
                    key={room}
                    className='rounded-md bg-[#f5f3f0] px-2.5 py-1 text-xs font-medium text-[#4a4a4a]'
                  >
                    {ROOM_LABELS[room] || room}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {questionnaire?.constraints && questionnaire.constraints.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-2'>
                Points d&apos;attention
              </p>
              <div className='flex flex-wrap gap-2'>
                {questionnaire.constraints.map((c) => (
                  <span
                    key={c}
                    className='rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700'
                  >
                    {CONSTRAINT_LABELS[c] || c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className='border-t border-[#e8e4df] pt-5'>
            <p className='text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-2'>
              Prochaines étapes
            </p>
            <ul className='space-y-1.5'>
              <li className='flex items-center gap-2 text-sm text-[#4a4a4a]'>
                <ChevronRight className='size-3.5 text-[#c9a96e] shrink-0' />
                Prise de contact avec votre chef de projet Gradia
              </li>
              <li className='flex items-center gap-2 text-sm text-[#4a4a4a]'>
                <ChevronRight className='size-3.5 text-[#c9a96e] shrink-0' />
                Visite technique du bien
              </li>
              <li className='flex items-center gap-2 text-sm text-[#4a4a4a]'>
                <ChevronRight className='size-3.5 text-[#c9a96e] shrink-0' />
                Élaboration du plan d&apos;action détaillé
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configure Modules (manager/admin only) */}
      {(userRole === 'manager' || userRole === 'admin') && (
        <ConfigureModulesButton projectId={project.id} modules={project.modules} />
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const KpiCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  color: string
}) => (
  <div className='rounded-xl border border-[#e8e4df] bg-white p-4'>
    <div className='flex items-center gap-2 mb-2'>
      <Icon className={`size-4 ${color}`} />
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
    <p className='text-lg font-bold text-[#1a1a2e]'>{value}</p>
  </div>
)

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
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant='outline' className='w-full border-[#e8e4df] text-[#6b6b6b] hover:bg-[#f0ede8]' />}
      >
        <Settings2 className='size-4 mr-2' />
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
                <p className='text-sm font-medium text-[#1a1a2e]'>Conception</p>
                <p className='text-xs text-muted-foreground'>Esquisse, APS, APD, matériaux</p>
              </div>
              <Switch checked={design} onCheckedChange={setDesign} />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-[#1a1a2e]'>Travaux</p>
                <p className='text-xs text-muted-foreground'>Suivi de chantier, tâches</p>
              </div>
              <Switch checked={works} onCheckedChange={setWorks} />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-[#1a1a2e]'>Finances</p>
                <p className='text-xs text-muted-foreground'>Appels de fonds, échéancier</p>
              </div>
              <Switch checked={wallet} onCheckedChange={setWallet} />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter variant='bare'>
          <DialogClose render={<Button variant='outline' />}>
            Annuler
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving}
            className='bg-[#1a1a2e] text-white hover:bg-[#16213e]'
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActivePhases = (project: {
  modules: { design: boolean; works: boolean }
  services: { architect: string; contractors: string }
}): ProjectPhase[] => {
  const phases: ProjectPhase[] = ['cadrage']

  if (project.modules.design || project.services.architect === 'yes') {
    phases.push('conception')
  }

  phases.push('devis')

  if (project.modules.works || project.services.contractors === 'yes') {
    phases.push('travaux')
    phases.push('livraison')
  }

  return phases
}

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
      className={`flex items-center gap-3 w-full rounded-lg px-4 py-3 text-left transition-colors ${
        completed
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-[#fafaf8] border border-[#e8e4df] hover:border-[#c9a96e]/40'
      }`}
    >
      {completed ? (
        <CheckCircle2 className='size-5 text-emerald-500 shrink-0' />
      ) : (
        <Circle className='size-5 text-muted-foreground shrink-0' />
      )}
      <span className={`text-sm ${completed ? 'text-emerald-700 line-through' : 'text-[#4a4a4a]'}`}>
        {action.label}
      </span>
    </button>
  )
}

const MetaCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home
  label: string
  value: string
}) => (
  <div className='rounded-lg border border-[#e8e4df] bg-white p-3.5'>
    <div className='flex items-center gap-2 mb-1'>
      <Icon className='size-3.5 text-[#c9a96e]' />
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
    <p className='text-sm font-medium text-[#1a1a2e]'>{value}</p>
  </div>
)

