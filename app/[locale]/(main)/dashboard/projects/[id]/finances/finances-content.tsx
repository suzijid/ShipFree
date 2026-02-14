'use client'

import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { GlassCard, GlassBadge } from '../../../../components/glass-primitives'
import { SCHEDULE_PAYMENT_STATUS_LABELS, type SchedulePaymentStatus } from '@/config/project'

interface PaymentItem {
  id: string
  label: string
  amount: string
  dueDate: string
  status: string
  invoiceUrl: string | null
  paidAt: string | null
}

interface FinancesContentProps {
  payments: PaymentItem[]
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; badgeVariant: 'default' | 'success' | 'warning' }> = {
  pending: { icon: Clock, color: 'text-amber-400', badgeVariant: 'warning' },
  paid: { icon: CheckCircle2, color: 'text-emerald-400', badgeVariant: 'success' },
  overdue: { icon: AlertTriangle, color: 'text-red-400', badgeVariant: 'default' },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export const FinancesContent = ({ payments }: FinancesContentProps) => {
  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const paid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = total - paid
  const overdueCount = payments.filter((p) => p.status === 'overdue').length

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='h-full flex flex-col p-4 md:p-6 overflow-y-auto'
    >
      {/* KPIs */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <Wallet className='size-4 text-[#c9a96e]' />
              <span className='text-xs text-white/40'>Budget total</span>
            </div>
            <p className='text-xl font-bold text-white/90'>{total.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='size-4 text-emerald-400' />
              <span className='text-xs text-white/40'>Payé</span>
            </div>
            <p className='text-xl font-bold text-emerald-400'>{paid.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown className='size-4 text-amber-400' />
              <span className='text-xs text-white/40'>Reste à payer</span>
            </div>
            <p className='text-xl font-bold text-white/90'>{remaining.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Payment schedule */}
      {payments.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center'>
          <Wallet className='size-10 text-white/10 mb-3' />
          <p className='text-sm text-white/30'>
            L&apos;échéancier sera créé par votre chef de projet après le rendez-vous de cadrage.
          </p>
        </div>
      ) : (
        <GlassCard className='flex-1'>
          <div className='border-b border-white/[0.06] px-6 py-4'>
            <h3
              className='font-semibold text-white/90'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Échéancier
            </h3>
            {overdueCount > 0 && (
              <p className='text-xs text-red-400 mt-0.5'>
                {overdueCount} paiement{overdueCount > 1 ? 's' : ''} en retard
              </p>
            )}
          </div>
          <div className='divide-y divide-white/[0.06]'>
            {payments.map((p, i) => {
              const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
              const StatusIcon = config.icon
              return (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  className='flex items-center gap-4 px-6 py-4'
                >
                  <StatusIcon className={`size-5 shrink-0 ${config.color}`} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-white/90'>{p.label}</p>
                    <p className='text-xs text-white/30'>
                      Échéance : {new Date(p.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {p.paidAt && (
                        <> — Payé le {new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</>
                      )}
                    </p>
                  </div>
                  <p className='text-sm font-semibold text-white/90 shrink-0'>
                    {parseFloat(p.amount).toLocaleString('fr-FR')} €
                  </p>
                  <GlassBadge variant={config.badgeVariant}>
                    {SCHEDULE_PAYMENT_STATUS_LABELS[p.status as SchedulePaymentStatus] || p.status}
                  </GlassBadge>
                  {p.invoiceUrl && (
                    <a
                      href={p.invoiceUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0 p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white/60 transition-all'
                    >
                      <Download className='size-4' />
                    </a>
                  )}
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
