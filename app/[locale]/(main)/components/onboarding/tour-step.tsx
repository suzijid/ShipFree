'use client'

import { motion } from 'framer-motion'
import { GlassCard, GlassButton } from '../glass-primitives'
import type { TourStep } from './tour-steps-config'

interface TourStepTooltipProps {
  step: TourStep
  currentIndex: number
  totalSteps: number
  onNext: () => void
  onSkip: () => void
  targetRect: DOMRect | null
}

export const TourStepTooltip = ({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
  targetRect,
}: TourStepTooltipProps) => {
  const isWelcome = step.id === 'welcome'
  const isLast = step.id === 'ready'

  // Center on screen for welcome/ready steps
  if (isWelcome || isLast) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='fixed inset-0 z-[60] flex items-center justify-center'
      >
        <GlassCard className='max-w-md w-full mx-4 p-8 text-center border-[#c9a96e]/20 shadow-[0_0_40px_rgba(201,169,110,0.1)]'>
          <div className='rounded-2xl bg-gradient-to-br from-[#c9a96e]/15 to-transparent p-4 inline-flex mb-4'>
            <span
              className='text-3xl font-bold text-[#c9a96e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              G
            </span>
          </div>
          <h3
            className='text-xl font-bold text-white/95 mb-2'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {step.title}
          </h3>
          <p className='text-sm text-white/50 mb-6'>{step.description}</p>
          <div className='flex items-center justify-center gap-3'>
            {!isLast && (
              <GlassButton variant='ghost' size='sm' onClick={onSkip}>
                Passer
              </GlassButton>
            )}
            <GlassButton variant='gold' onClick={onNext}>
              {isLast ? 'C\'est parti !' : 'Commencer'}
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  // Position near target element
  const style: React.CSSProperties = {}
  if (targetRect) {
    const padding = 16
    switch (step.position) {
      case 'right':
        style.left = targetRect.right + padding
        style.top = targetRect.top + targetRect.height / 2
        style.transform = 'translateY(-50%)'
        break
      case 'left':
        style.right = window.innerWidth - targetRect.left + padding
        style.top = targetRect.top + targetRect.height / 2
        style.transform = 'translateY(-50%)'
        break
      case 'bottom':
        style.left = targetRect.left + targetRect.width / 2
        style.top = targetRect.bottom + padding
        style.transform = 'translateX(-50%)'
        break
      case 'top':
        style.left = targetRect.left + targetRect.width / 2
        style.bottom = window.innerHeight - targetRect.top + padding
        style.transform = 'translateX(-50%)'
        break
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className='fixed z-[60]'
      style={style}
    >
      <GlassCard className='max-w-sm w-72 p-5 border-[#c9a96e]/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'>
        <h4
          className='text-sm font-semibold text-white/95 mb-1'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {step.title}
        </h4>
        <p className='text-xs text-white/50 mb-4'>{step.description}</p>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-white/25'>
            {currentIndex + 1} / {totalSteps}
          </span>
          <div className='flex items-center gap-2'>
            <GlassButton variant='ghost' size='sm' onClick={onSkip}>
              Passer
            </GlassButton>
            <GlassButton variant='gold' size='sm' onClick={onNext}>
              Suivant
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
