'use client'

import { HardHat } from 'lucide-react'
import { GlassCard } from '../../../../components/glass-primitives'

export default function TravauxPage() {
  return (
    <div className='flex items-center justify-center h-full p-6'>
      <GlassCard className='max-w-md w-full p-8 text-center'>
        <div className='rounded-full bg-[#c9a96e]/10 p-4 inline-flex mb-4'>
          <HardHat className='size-8 text-[#c9a96e]' />
        </div>
        <h3
          className='font-semibold text-white/95 text-lg mb-2'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Suivi travaux
        </h3>
        <p className='text-sm text-white/50'>
          Le suivi de chantier sera disponible une fois les travaux démarrés.
        </p>
      </GlassCard>
    </div>
  )
}
