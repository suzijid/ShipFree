'use client'

import { motion } from 'framer-motion'

interface TourOverlayProps {
  targetRect: DOMRect | null
  isModal: boolean
}

export const TourOverlay = ({ targetRect, isModal }: TourOverlayProps) => {
  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm'
      />
    )
  }

  if (!targetRect) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[55] bg-black/60'
      />
    )
  }

  const padding = 8
  const x = targetRect.left - padding
  const y = targetRect.top - padding
  const w = targetRect.width + padding * 2
  const h = targetRect.height + padding * 2
  const r = 16

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[55]'
    >
      <svg className='w-full h-full'>
        <defs>
          <mask id='tour-mask'>
            <rect width='100%' height='100%' fill='white' />
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ x, y, width: w, height: h, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              rx={r}
              ry={r}
              fill='black'
            />
          </mask>
        </defs>
        <rect
          width='100%'
          height='100%'
          fill='rgba(0,0,0,0.65)'
          mask='url(#tour-mask)'
        />
        <motion.rect
          animate={{ x: x - 2, y: y - 2, width: w + 4, height: h + 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          rx={r + 2}
          ry={r + 2}
          fill='none'
          stroke='rgba(201,169,110,0.3)'
          strokeWidth={2}
        />
      </svg>
    </motion.div>
  )
}
