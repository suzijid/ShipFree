'use client'

import { Palette, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { GlassCard } from '../../../../components/glass-primitives'
import { useProject } from '../../../../components/project-context'
import { PROJECT_PHASE_LABELS, DESIGN_PHASE_LABELS, type ProjectPhase } from '@/config/project'

const CONCEPTION_STEPS = [
  { key: 'cadrage', label: 'Cadrage terminé', description: 'Définition du brief et des objectifs' },
  { key: 'conception', label: 'Conception lancée', description: 'Esquisse, APS, APD, choix matériaux' },
  { key: 'devis', label: 'Devis validés', description: 'Sélection des artisans et validation' },
] as const

export default function ConceptionPage() {
  const { project } = useProject()
  const phases: ProjectPhase[] = ['cadrage', 'conception', 'devis']
  const currentIdx = phases.indexOf(project.phase as ProjectPhase)

  return (
    <div className='flex items-center justify-center h-full p-6'>
      <GlassCard className='max-w-lg w-full p-8'>
        <div className='text-center mb-8'>
          <div className='rounded-2xl bg-[#c9a96e]/10 p-4 inline-flex mb-4'>
            <Palette className='size-8 text-[#c9a96e]' />
          </div>
          <h3
            className='font-semibold text-[#1a1a2e] text-xl mb-2'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Conception
          </h3>
          <p className='text-sm text-[#9b9b9b] max-w-sm mx-auto'>
            Le suivi de conception sera disponible une fois la phase lancée par votre chef de projet.
          </p>
        </div>

        {/* Timeline */}
        <div className='space-y-0'>
          {CONCEPTION_STEPS.map((step, i) => {
            const isDone = i < currentIdx || (i === currentIdx && project.phase !== step.key)
            const isCurrent = i === currentIdx && project.phase === step.key
            return (
              <div key={step.key} className='flex gap-4'>
                {/* Vertical line + circle */}
                <div className='flex flex-col items-center'>
                  <div className={`rounded-full p-1 ${
                    isDone ? 'bg-emerald-100' : isCurrent ? 'bg-[#c9a96e]/15' : 'bg-[#f5f3f0]'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className='size-5 text-emerald-500' />
                    ) : isCurrent ? (
                      <ArrowRight className='size-5 text-[#c9a96e]' />
                    ) : (
                      <Circle className='size-5 text-[#c9c5bf]' />
                    )}
                  </div>
                  {i < CONCEPTION_STEPS.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 rounded-full ${
                      isDone ? 'bg-emerald-200' : 'bg-[#e8e4df]'
                    }`} />
                  )}
                </div>
                {/* Content */}
                <div className='pb-6 flex-1'>
                  <p className={`text-sm font-medium ${
                    isDone ? 'text-emerald-600' : isCurrent ? 'text-[#1a1a2e]' : 'text-[#9b9b9b]'
                  }`}>
                    {step.label}
                  </p>
                  <p className='text-xs text-[#9b9b9b] mt-0.5'>{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
