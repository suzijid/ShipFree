'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, MessageSquare } from 'lucide-react'

import { GlassCard, GlassButton, GlassInput } from '@/app/[locale]/(main)/components/glass-primitives'

interface Event {
  id: string
  type: string
  data: unknown
  createdAt: Date
}

interface ActivityTabProps {
  projectId: string
  events: Event[]
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  status_change: 'Changement de statut',
  phase_change: 'Changement de phase',
  module_activated: 'Module activé',
  assignment: 'Assignation manager',
  payment: 'Paiement',
  note: 'Note',
  validation: 'Validation jalon',
  created: 'Projet créé',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  status_change: 'bg-blue-400',
  phase_change: 'bg-purple-400',
  assignment: 'bg-[#c9a96e]',
  payment: 'bg-emerald-400',
  note: 'bg-gray-400',
  validation: 'bg-amber-400',
  created: 'bg-[#c9a96e]',
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
      return `Manager assigné`
    case 'note':
      return (d.content as string) ?? ''
    case 'validation':
      return `${d.label}${d.validated ? ' — Validé' : ' — Invalidé'}`
    case 'payment':
      return `${d.action}: ${d.label ?? ''}`
    default:
      return JSON.stringify(d)
  }
}

export const ActivityTab = ({ projectId, events }: ActivityTabProps) => {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setLoading(true)
    await fetch(`/api/admin/projects/${projectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'note', content: note.trim() }),
    })
    setNote('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className='space-y-6'>
      {/* Add note */}
      <GlassCard className='p-5'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2'>
          <MessageSquare className='size-4' /> Ajouter une note
        </h3>
        <form onSubmit={handleAddNote} className='flex gap-2'>
          <GlassInput
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='Écrire une note interne...'
            className='flex-1'
          />
          <GlassButton type='submit' variant='gold' size='md' disabled={loading || !note.trim()}>
            <Send className='size-4' />
          </GlassButton>
        </form>
      </GlassCard>

      {/* Timeline */}
      <GlassCard className='p-5'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4'>Historique</h3>
        {events.length === 0 ? (
          <p className='text-sm text-[#9b9b9b]'>Aucun événement</p>
        ) : (
          <div className='space-y-0'>
            {events.map((event, idx) => (
              <div key={event.id} className='flex gap-3'>
                {/* Timeline line */}
                <div className='flex flex-col items-center'>
                  <div className={`size-2.5 rounded-full shrink-0 mt-1.5 ${EVENT_TYPE_COLORS[event.type] ?? 'bg-gray-300'}`} />
                  {idx < events.length - 1 && <div className='w-px flex-1 bg-[#e8e4df]' />}
                </div>
                {/* Content */}
                <div className='pb-4 min-w-0 flex-1'>
                  <p className='text-sm font-medium text-[#1a1a2e]'>
                    {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  </p>
                  <p className='text-xs text-[#6b6b6b] mt-0.5'>
                    {formatEventDetail(event.type, event.data)}
                  </p>
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
