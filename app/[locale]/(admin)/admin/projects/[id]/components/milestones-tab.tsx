'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock } from 'lucide-react'

import { GlassCard, GlassButton, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import { PROJECT_PHASE_LABELS, type ProjectPhase } from '@/config/project'

interface Validation {
  id: string
  label: string
  phase: string
  validatedAt: Date | null
  validatedBy: string | null
  createdAt: Date
}

interface MilestonesTabProps {
  projectId: string
  validations: Validation[]
}

export const MilestonesTab = ({ projectId, validations }: MilestonesTabProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (vid: string, validated: boolean) => {
    setLoading(vid)
    await fetch(`/api/admin/projects/${projectId}/validations/${vid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validated }),
    })
    setLoading(null)
    router.refresh()
  }

  // Group by phase
  const grouped = validations.reduce<Record<string, Validation[]>>((acc, v) => {
    if (!acc[v.phase]) acc[v.phase] = []
    acc[v.phase].push(v)
    return acc
  }, {})

  if (validations.length === 0) {
    return (
      <GlassCard className='p-8 text-center'>
        <Clock className='size-8 text-[#9b9b9b] mx-auto mb-3' />
        <p className='text-sm text-[#9b9b9b]'>Aucun jalon défini pour ce projet</p>
      </GlassCard>
    )
  }

  return (
    <div className='space-y-6'>
      {Object.entries(grouped).map(([phase, items]) => (
        <GlassCard key={phase} className='p-5'>
          <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4'>
            {PROJECT_PHASE_LABELS[phase as ProjectPhase] ?? phase}
          </h3>
          <div className='space-y-3'>
            {items.map((v) => {
              const isValidated = !!v.validatedAt
              return (
                <div
                  key={v.id}
                  className='flex items-center justify-between gap-3 p-3 rounded-xl bg-[#faf9f7]'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isValidated ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      {isValidated ? (
                        <Check className='size-4 text-emerald-600' />
                      ) : (
                        <Clock className='size-4 text-[#9b9b9b]' />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-medium text-[#1a1a2e]'>{v.label}</p>
                      {isValidated && v.validatedAt && (
                        <p className='text-xs text-[#9b9b9b]'>
                          Validé le {new Date(v.validatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <GlassButton
                    size='sm'
                    variant={isValidated ? 'ghost' : 'gold'}
                    onClick={() => handleToggle(v.id, !isValidated)}
                    disabled={loading === v.id}
                  >
                    {isValidated ? (
                      <><X className='size-3' /> Invalider</>
                    ) : (
                      <><Check className='size-3' /> Valider</>
                    )}
                  </GlassButton>
                </div>
              )
            })}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
