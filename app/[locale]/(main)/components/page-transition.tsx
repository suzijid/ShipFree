'use client'

import { motion } from 'framer-motion'

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    className='flex-1 flex flex-col h-full'
  >
    {children}
  </motion.div>
)
