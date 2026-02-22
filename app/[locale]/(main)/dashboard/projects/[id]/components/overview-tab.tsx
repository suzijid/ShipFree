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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  // Commercial styles
  professionnel: 'Professionnel / Corporate',
  chaleureux: 'Chaleureux / Accueillant',
  luxe: 'Luxe / Haut de gamme',
  industriel_brut: 'Industriel / Brut',
  nature_eco: 'Nature / Éco-responsable',
  personnalise_marque: 'Personnalisé (identité marque)',
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
  sous_sol: 'Sous-sol / Cave',
  grenier: 'Grenier / Combles',
  piece_principale: 'Pièce principale',
  coin_cuisine: 'Coin cuisine',
  espace_vente: 'Espace de vente',
  reserve: 'Réserve / Stockage',
  cuisine_pro: 'Cuisine professionnelle',
  sanitaires: 'Sanitaires',
  salle_attente: 'Salle d\'attente',
  salle_reunion: 'Salle de réunion',
  vestiaire: 'Vestiaire',
}

const CONSTRAINT_LABELS: Record<string, string> = {
  copropriete: 'Copropriété',
  monument_historique: 'Bâtiment classé / secteur protégé',
  amiante: 'Présence possible d\'amiante',
  accessibilite: 'Accessibilité PMR',
  voisinage: 'Contraintes de voisinage',
  occupation: 'Logement occupé pendant travaux',
  erp: 'Normes ERP (accès public)',
  extraction_ventilation: 'Extraction / Ventilation',
  securite_incendie: 'Sécurité incendie',
  enseigne_vitrine: 'Enseigne / Vitrine',
  nuisances_sonores: 'Nuisances sonores',
  horaires_travaux: 'Horaires de travaux restreints',
  acces_chantier: 'Accès chantier difficile',
  stationnement: 'Stationnement limité',
  horaires_idf: 'Horaires de travaux restreints',
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
          color='text-[#202020]'
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
          color='text-[#202020]'
        />
      </div>

      {/* RDV Cadrage CTA */}
      {project.phase === 'cadrage' && (
        <div className='rounded-none border border-[#202020] bg-[#f5f5f5] p-6'>
          <div className='flex items-start gap-4'>
            <div className='rounded-full bg-[#202020]/20 p-3'>
              <CalendarDays className='size-6 text-[#202020]' />
            </div>
            <div className='flex-1'>
              <h3
                className='font-semibold text-[#202020] text-lg'
                style={{  }}
              >
                Rendez-vous de cadrage
              </h3>
              <p className='text-sm text-[#333] mt-1'>
                Réservez un créneau avec votre chef de projet pour définir ensemble le plan d&apos;action de votre rénovation.
              </p>
              <Button className='mt-4 bg-[#202020] text-white hover:bg-[#333]'>
                <CalendarDays className='size-4 mr-2' />
                Réserver un créneau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Roadmap */}
      <div className='rounded-none border border-[#e0e0e0] bg-white p-6'>
        <h3
          className='font-semibold text-[#202020] mb-4'
          style={{  }}
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
                  className={`flex items-center gap-2 rounded-none px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-[#202020]/10 text-[#202020] font-medium border border-[#202020]/30'
                      : isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-50 text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className='size-4 text-emerald-500 shrink-0' />
                  ) : isCurrent ? (
                    <Circle className='size-4 text-[#202020] fill-[#202020] shrink-0' />
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
      <div className='rounded-none border border-[#e0e0e0] bg-white p-5'>
        <div className='flex items-center gap-4'>
          <div className={`rounded-full p-2.5 ${project.managerName ? 'bg-[#202020]/10' : 'bg-gray-100'}`}>
            <UserCircle className={`size-6 ${project.managerName ? 'text-[#202020]' : 'text-muted-foreground'}`} />
          </div>
          <div className='flex-1'>
            {project.managerName ? (
              <>
                <p className='text-sm font-semibold text-[#202020]'>{project.managerName}</p>
                <p className='text-xs text-muted-foreground'>Chef de projet</p>
              </>
            ) : (
              <>
                <p className='text-sm font-medium text-[#333]'>
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
        <div className='rounded-none border border-[#e0e0e0] bg-white p-6'>
          <h3
            className='font-semibold text-[#202020] mb-4'
            style={{  }}
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
        <div className='rounded-none border border-[#e0e0e0] bg-white p-6'>
          <h3
            className='font-semibold text-[#202020] mb-4'
            style={{  }}
          >
            Validations
          </h3>
          <div className='space-y-3'>
            {validations.map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-3 rounded-none px-4 py-3 ${
                  v.validatedAt
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-[#e0e0e0]'
                }`}
              >
                {v.validatedAt ? (
                  <CheckCircle2 className='size-5 text-emerald-500 shrink-0' />
                ) : (
                  <Circle className='size-5 text-muted-foreground shrink-0' />
                )}
                <span className={`text-sm ${v.validatedAt ? 'text-emerald-700' : 'text-[#333]'}`}>
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
      <div className='rounded-none border border-[#e0e0e0] bg-white'>
        <div className='border-b border-[#e0e0e0] px-6 py-4 flex items-center gap-2'>
          <FileText className='size-4 text-[#202020]' />
          <div>
            <h3
              className='text-base font-semibold text-[#202020]'
              style={{  }}
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
              <p className='text-xs font-semibold text-[#999] uppercase tracking-wider mb-2'>
                Description des travaux
              </p>
              <p className='text-sm text-[#333] leading-relaxed whitespace-pre-line'>
                {questionnaire.workDescription}
              </p>
            </div>
          )}

          {/* Rooms */}
          {questionnaire?.rooms && questionnaire.rooms.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-[#999] uppercase tracking-wider mb-2'>
                Pièces concernées
              </p>
              <div className='flex flex-wrap gap-2'>
                {questionnaire.rooms.map((room) => (
                  <span
                    key={room}
                    className='rounded-none bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#333]'
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
              <p className='text-xs font-semibold text-[#999] uppercase tracking-wider mb-2'>
                Points d&apos;attention
              </p>
              <div className='flex flex-wrap gap-2'>
                {questionnaire.constraints.map((c) => (
                  <span
                    key={c}
                    className='rounded-none bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700'
                  >
                    {CONSTRAINT_LABELS[c] || c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className='border-t border-[#e0e0e0] pt-5'>
            <p className='text-xs font-semibold text-[#999] uppercase tracking-wider mb-2'>
              Prochaines étapes
            </p>
            <ul className='space-y-1.5'>
              <li className='flex items-center gap-2 text-sm text-[#333]'>
                <ChevronRight className='size-3.5 text-[#202020] shrink-0' />
                Prise de contact avec votre chef de projet Gradia
              </li>
              <li className='flex items-center gap-2 text-sm text-[#333]'>
                <ChevronRight className='size-3.5 text-[#202020] shrink-0' />
                Visite technique du bien
              </li>
              <li className='flex items-center gap-2 text-sm text-[#333]'>
                <ChevronRight className='size-3.5 text-[#202020] shrink-0' />
                Élaboration du plan d&apos;action détaillé
              </li>
            </ul>
          </div>
        </div>
      </div>


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
  <div className='rounded-none border border-[#e0e0e0] bg-white p-4'>
    <div className='flex items-center gap-2 mb-2'>
      <Icon className={`size-4 ${color}`} />
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
    <p className='text-lg font-bold text-[#202020]'>{value}</p>
  </div>
)



// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActivePhases = (project: {
  services: { architect: string; contractors: string }
}): ProjectPhase[] => {
  const phases: ProjectPhase[] = ['cadrage']

  if (project.services.architect === 'yes') {
    phases.push('conception')
  }

  phases.push('devis')

  if (project.services.contractors === 'yes') {
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
      className={`flex items-center gap-3 w-full rounded-none px-4 py-3 text-left transition-colors ${
        completed
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-[#f5f5f5] border border-[#e0e0e0] hover:border-[#202020]/40'
      }`}
    >
      {completed ? (
        <CheckCircle2 className='size-5 text-emerald-500 shrink-0' />
      ) : (
        <Circle className='size-5 text-muted-foreground shrink-0' />
      )}
      <span className={`text-sm ${completed ? 'text-emerald-700 line-through' : 'text-[#333]'}`}>
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
  <div className='rounded-none border border-[#e0e0e0] bg-white p-3.5'>
    <div className='flex items-center gap-2 mb-1'>
      <Icon className='size-3.5 text-[#202020]' />
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
    <p className='text-sm font-medium text-[#202020]'>{value}</p>
  </div>
)

