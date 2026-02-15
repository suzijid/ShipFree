'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Activity } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'

interface EventRow {
  id: string
  type: string
  data: unknown
  createdAt: Date
  projectId: string
  projectTitle: string
}

const EVENT_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'status_change', label: 'Changement de statut' },
  { value: 'phase_change', label: 'Changement de phase' },
  { value: 'assignment', label: 'Assignation' },
  { value: 'validation', label: 'Validation jalon' },
  { value: 'payment', label: 'Paiement' },
  { value: 'note', label: 'Note' },
  { value: 'created', label: 'Création' },
  { value: 'module_activated', label: 'Module activé' },
]

const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.filter((t) => t.value !== 'all').map((t) => [t.value, t.label])
)

const EVENT_TYPE_COLORS: Record<string, string> = {
  status_change: 'bg-blue-400',
  phase_change: 'bg-purple-400',
  assignment: 'bg-[#c9a96e]',
  payment: 'bg-emerald-400',
  note: 'bg-gray-400',
  validation: 'bg-amber-400',
  created: 'bg-[#c9a96e]',
  module_activated: 'bg-indigo-400',
}

const formatEventDetail = (type: string, data: unknown): string => {
  const d = data as Record<string, unknown> | null
  if (!d) return ''

  switch (type) {
    case 'status_change':
      return `${d.from} → ${d.to}`
    case 'phase_change':
      return `${d.from} → ${d.to}`
    case 'assignment':
      return 'Manager assigné'
    case 'note':
      return (d.content as string) ?? ''
    case 'validation':
      return `${d.label}${d.validated ? ' — Validé' : ' — Invalidé'}`
    case 'payment':
      return `${d.action}: ${d.label ?? ''}`
    default:
      return ''
  }
}

export const ActivityContent = ({ events }: { events: EventRow[] }) => {
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return events
    return events.filter((e) => e.type === typeFilter)
  }, [events, typeFilter])

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1
            className='text-2xl font-bold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Activité
          </h1>
          <p className='text-sm text-[#9b9b9b] mt-1'>Journal d&apos;audit global</p>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <GlassCard className='p-5'>
        {filtered.length === 0 ? (
          <div className='text-center py-8'>
            <Activity className='size-8 text-[#9b9b9b] mx-auto mb-3' />
            <p className='text-sm text-[#9b9b9b]'>Aucun événement</p>
          </div>
        ) : (
          <div className='space-y-0'>
            {filtered.map((event, idx) => (
              <div key={event.id} className='flex gap-3'>
                {/* Timeline */}
                <div className='flex flex-col items-center'>
                  <div className={`size-2.5 rounded-full shrink-0 mt-1.5 ${EVENT_TYPE_COLORS[event.type] ?? 'bg-gray-300'}`} />
                  {idx < filtered.length - 1 && <div className='w-px flex-1 bg-[#e8e4df]' />}
                </div>
                {/* Content */}
                <div className='pb-4 min-w-0 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <GlassBadge variant='default'>
                      {EVENT_TYPE_LABELS[event.type] ?? event.type}
                    </GlassBadge>
                    <Link
                      href={`/admin/projects/${event.projectId}`}
                      className='text-sm text-[#c9a96e] hover:underline font-medium'
                    >
                      {event.projectTitle}
                    </Link>
                  </div>
                  {formatEventDetail(event.type, event.data) && (
                    <p className='text-xs text-[#6b6b6b] mt-1'>
                      {formatEventDetail(event.type, event.data)}
                    </p>
                  )}
                  <p className='text-xs text-[#9b9b9b] mt-1'>
                    {new Date(event.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
