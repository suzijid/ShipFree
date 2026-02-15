'use client'

import Link from 'next/link'
import {
  FolderKanban,
  Zap,
  Clock,
  Wallet,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

import { GlassCard } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  PROJECT_PHASE_LABELS,
  type ProjectPhase,
} from '@/config/project'

interface KPIs {
  total: number
  active: number
  pending: number
  revenue: number
  overdueMilestones: number
}

interface EventRow {
  id: string
  type: string
  data: unknown
  createdAt: Date
  projectId: string
  projectTitle: string
}

interface DashboardContentProps {
  kpis: KPIs
  phaseDistribution: Record<string, number>
  recentEvents: EventRow[]
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  status_change: 'Changement de statut',
  phase_change: 'Changement de phase',
  module_activated: 'Module activé',
  assignment: 'Assignation',
  payment: 'Paiement',
  note: 'Note',
  validation: 'Validation',
  created: 'Création',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export const DashboardContent = ({
  kpis,
  phaseDistribution,
  recentEvents,
}: DashboardContentProps) => {
  const kpiCards = [
    { label: 'Total projets', value: kpis.total, icon: FolderKanban, color: 'text-[#1a1a2e]' },
    { label: 'Projets actifs', value: kpis.active, icon: Zap, color: 'text-emerald-600' },
    { label: 'En attente', value: kpis.pending, icon: Clock, color: 'text-amber-600' },
    { label: 'Revenus encaissés', value: formatCurrency(kpis.revenue), icon: Wallet, color: 'text-[#c9a96e]' },
    { label: 'Jalons en attente', value: kpis.overdueMilestones, icon: AlertTriangle, color: 'text-red-500' },
  ]

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Tableau de bord
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>Vue d&apos;ensemble de l&apos;activité Gradia</p>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
        {kpiCards.map((kpi) => (
          <GlassCard key={kpi.label} className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <kpi.icon className={`size-4 ${kpi.color}`} />
              <span className='text-xs text-[#9b9b9b]'>{kpi.label}</span>
            </div>
            <p className='text-xl font-bold text-[#1a1a2e]'>{kpi.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Phase distribution */}
        <GlassCard className='p-5'>
          <h2 className='text-sm font-semibold text-[#1a1a2e] mb-4'>Répartition par phase</h2>
          <div className='space-y-3'>
            {Object.entries(PROJECT_PHASE_LABELS).map(([phase, label]) => {
              const count = phaseDistribution[phase] ?? 0
              const total = kpiCards[0].value as number
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={phase} className='flex items-center gap-3'>
                  <span className='text-xs text-[#9b9b9b] w-24 shrink-0'>{label}</span>
                  <div className='flex-1 h-2 bg-[#f5f3f0] rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#c9a96e] to-[#b8944f] rounded-full transition-all'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className='text-xs font-medium text-[#1a1a2e] w-6 text-right'>{count}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Recent activity */}
        <GlassCard className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-semibold text-[#1a1a2e]'>Activité récente</h2>
            <Link
              href='/admin/activity'
              className='text-xs text-[#c9a96e] hover:text-[#b8944f] flex items-center gap-1'
            >
              Tout voir <ArrowRight className='size-3' />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className='text-sm text-[#9b9b9b]'>Aucune activité récente</p>
          ) : (
            <div className='space-y-3 max-h-80 overflow-y-auto'>
              {recentEvents.map((event) => (
                <div key={event.id} className='flex items-start gap-3'>
                  <div className='size-2 rounded-full bg-[#c9a96e] mt-1.5 shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm text-[#1a1a2e]'>
                      <span className='font-medium'>{EVENT_TYPE_LABELS[event.type] ?? event.type}</span>
                      {' — '}
                      <Link
                        href={`/admin/projects/${event.projectId}`}
                        className='text-[#c9a96e] hover:underline'
                      >
                        {event.projectTitle}
                      </Link>
                    </p>
                    <p className='text-xs text-[#9b9b9b]'>{formatDate(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
