'use client'

import { Palette } from 'lucide-react'
import { GlassCard } from '../../../../components/glass-primitives'

export default function ConceptionPage() {
  return (
    <div className='flex items-center justify-center h-full p-6'>
      <GlassCard className='max-w-md w-full p-8 text-center'>
        <div className='rounded-full bg-[#c9a96e]/10 p-4 inline-flex mb-4'>
          <Palette className='size-8 text-[#c9a96e]' />
        </div>
        <h3
          className='font-semibold text-white/95 text-lg mb-2'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Conception
        </h3>
        <p className='text-sm text-white/50'>
          Le suivi de conception sera disponible une fois la phase lancée par votre chef de projet.
        </p>
      </GlassCard>
    </div>
  )
}
