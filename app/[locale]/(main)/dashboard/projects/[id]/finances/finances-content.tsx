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
  Wrench,
  Sparkles,
  Percent,
} from 'lucide-react'
import { GlassCard, GlassBadge } from '../../../../components/glass-primitives'
import { SCHEDULE_PAYMENT_STATUS_LABELS, type SchedulePaymentStatus } from '@/config/project'
import { DESIGN_SERVICE_PRICING, type DesignServicePricingKey } from '@/config/payments'

interface PaymentItem {
  id: string
  label: string
  amount: string
  dueDate: string
  status: string
  invoiceUrl: string | null
  paidAt: string | null
  contractorName: string | null
  commissionAmount: string | null
  hasStripeTransfer: boolean
}

interface DesignBookingItem {
  id: string
  type: string
  status: string
  amount: string
  createdAt: string
}

interface FinancesContentProps {
  payments: PaymentItem[]
  designBookings: DesignBookingItem[]
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; badgeVariant: 'default' | 'success' | 'warning' }> = {
  pending: { icon: Clock, color: 'text-amber-500', badgeVariant: 'warning' },
  paid: { icon: CheckCircle2, color: 'text-emerald-500', badgeVariant: 'success' },
  overdue: { icon: AlertTriangle, color: 'text-red-500', badgeVariant: 'default' },
}

const DESIGN_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  scheduled: 'Planifié',
  in_progress: 'En cours',
  delivered: 'Livré',
  cancelled: 'Annulé',
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export const FinancesContent = ({ payments, designBookings }: FinancesContentProps) => {
  // Separate contractor payments from MOE payments
  const contractorPayments = payments.filter((p) => p.contractorName)
  const moePayments = payments.filter((p) => !p.contractorName)
  const paidPayments = payments.filter((p) => p.status === 'paid')

  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const paid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = total - paid
  const overdueCount = payments.filter((p) => p.status === 'overdue').length

  const totalCommission = payments
    .filter((p) => p.commissionAmount && p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.commissionAmount!), 0)

  const designTotal = designBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + parseFloat(b.amount), 0)

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='h-full flex flex-col p-4 md:p-6 overflow-y-auto'
    >
      {/* KPIs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <Wallet className='size-4 text-[#202020]' />
              <span className='text-xs text-[#999]'>Total travaux</span>
            </div>
            <p className='text-xl font-bold text-[#202020]'>{total.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='size-4 text-emerald-500' />
              <span className='text-xs text-[#999]'>Payé</span>
            </div>
            <p className='text-xl font-bold text-emerald-600'>{paid.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown className='size-4 text-amber-500' />
              <span className='text-xs text-[#999]'>Reste à payer</span>
            </div>
            <p className='text-xl font-bold text-[#202020]'>{remaining.toLocaleString('fr-FR')} €</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard hover className='p-5'>
            <div className='flex items-center gap-2 mb-2'>
              <Percent className='size-4 text-purple-500' />
              <span className='text-xs text-[#999]'>Commission Gradia</span>
            </div>
            <p className='text-xl font-bold text-[#202020]'>
              {totalCommission > 0 ? `${totalCommission.toLocaleString('fr-FR')} €` : '10%'}
            </p>
          </GlassCard>
        </motion.div>
      </div>

      <div className='space-y-6 flex-1'>
        {/* Contractor Payments */}
        {contractorPayments.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className='border-b border-[#e0e0e0] px-6 py-4'>
                <div className='flex items-center gap-2'>
                  <Wrench className='size-4 text-[#202020]' />
                  <h3
                    className='font-semibold text-[#202020]'
                    style={{  }}
                  >
                    Paiements artisans
                  </h3>
                </div>
                <p className='text-xs text-[#999] mt-0.5'>
                  Paiements sécurisés par jalons via Stripe Connect
                </p>
              </div>
              <div className='divide-y divide-[#e0e0e0]'>
                {contractorPayments.map((p) => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  const StatusIcon = config.icon
                  const amount = parseFloat(p.amount)
                  const commission = p.commissionAmount ? parseFloat(p.commissionAmount) : amount * 0.10
                  const artisanAmount = amount - commission
                  return (
                    <div key={p.id} className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <StatusIcon className={`size-5 shrink-0 ${config.color}`} />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-[#202020]'>{p.label}</p>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <span className='text-xs text-[#202020] font-medium'>{p.contractorName}</span>
                            <span className='text-xs text-[#999]'>
                              Échéance : {new Date(p.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </span>
                          </div>
                          {p.status === 'paid' && (
                            <p className='text-[11px] text-[#999] mt-1'>
                              Artisan : {artisanAmount.toLocaleString('fr-FR')} € · Commission : {commission.toLocaleString('fr-FR')} €
                              {p.hasStripeTransfer && ' · Transféré'}
                            </p>
                          )}
                        </div>
                        <p className='text-sm font-semibold text-[#202020] shrink-0'>
                          {amount.toLocaleString('fr-FR')} €
                        </p>
                        <GlassBadge variant={config.badgeVariant}>
                          {SCHEDULE_PAYMENT_STATUS_LABELS[p.status as SchedulePaymentStatus] || p.status}
                        </GlassBadge>
                        {p.invoiceUrl && (
                          <a
                            href={p.invoiceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='shrink-0 p-1.5 rounded-lg text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                          >
                            <Download className='size-4' />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* MOE Payment Schedule */}
        {moePayments.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className='border-b border-[#e0e0e0] px-6 py-4'>
                <h3
                  className='font-semibold text-[#202020]'
                  style={{  }}
                >
                  Échéancier Gradia
                </h3>
                {overdueCount > 0 && (
                  <p className='text-xs text-red-500 mt-0.5'>
                    {overdueCount} paiement{overdueCount > 1 ? 's' : ''} en retard
                  </p>
                )}
              </div>
              <div className='divide-y divide-[#e0e0e0]'>
                {moePayments.map((p) => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  const StatusIcon = config.icon
                  return (
                    <div key={p.id} className='flex items-center gap-4 px-6 py-4'>
                      <StatusIcon className={`size-5 shrink-0 ${config.color}`} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[#202020]'>{p.label}</p>
                        <p className='text-xs text-[#999]'>
                          Échéance : {new Date(p.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {p.paidAt && (
                            <> — Payé le {new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</>
                          )}
                        </p>
                      </div>
                      <p className='text-sm font-semibold text-[#202020] shrink-0'>
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
                          className='shrink-0 p-1.5 rounded-lg text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                        >
                          <Download className='size-4' />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Design Services */}
        {designBookings.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className='border-b border-[#e0e0e0] px-6 py-4'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='size-4 text-[#202020]' />
                  <h3
                    className='font-semibold text-[#202020]'
                    style={{  }}
                  >
                    Services Design
                  </h3>
                </div>
              </div>
              <div className='divide-y divide-[#e0e0e0]'>
                {designBookings.map((b) => {
                  const pricing = DESIGN_SERVICE_PRICING[b.type as DesignServicePricingKey]
                  const isCancelled = b.status === 'cancelled'
                  return (
                    <div key={b.id} className={`flex items-center gap-4 px-6 py-4 ${isCancelled ? 'opacity-50' : ''}`}>
                      <Sparkles className={`size-5 shrink-0 ${b.status === 'delivered' ? 'text-emerald-500' : 'text-[#202020]'}`} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[#202020]'>
                          {pricing?.label ?? b.type}
                        </p>
                        <p className='text-xs text-[#999]'>
                          {new Date(b.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <p className='text-sm font-semibold text-[#202020] shrink-0'>
                        {parseFloat(b.amount).toLocaleString('fr-FR')} €
                      </p>
                      <GlassBadge variant={b.status === 'delivered' ? 'success' : b.status === 'cancelled' ? 'default' : 'gold'}>
                        {DESIGN_STATUS_LABELS[b.status] || b.status}
                      </GlassBadge>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Historique des paiements */}
        {paidPayments.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className='border-b border-[#e0e0e0] px-6 py-4'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='size-4 text-emerald-500' />
                  <h3
                    className='font-semibold text-[#202020]'
                    style={{  }}
                  >
                    Historique des paiements
                  </h3>
                </div>
                <p className='text-xs text-[#999] mt-0.5'>
                  {paidPayments.length} paiement{paidPayments.length > 1 ? 's' : ''} effectué{paidPayments.length > 1 ? 's' : ''}
                </p>
              </div>
              {/* Table header */}
              <div className='hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-2.5 text-[10px] font-semibold text-[#999] uppercase tracking-wider border-b border-[#f0f0f0]'>
                <span>Libellé</span>
                <span className='w-28 text-center'>Date de paiement</span>
                <span className='w-24 text-right'>Montant</span>
                <span className='w-20 text-center'>Statut</span>
                <span className='w-10' />
              </div>
              <div className='divide-y divide-[#f0f0f0]'>
                {paidPayments.map((p, idx) => {
                  const amount = parseFloat(p.amount)
                  return (
                    <div
                      key={p.id}
                      className={`px-6 py-3.5 ${idx % 2 === 1 ? 'bg-[#fafafa]' : ''}`}
                    >
                      {/* Desktop row */}
                      <div className='hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center'>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium text-[#202020] truncate'>{p.label}</p>
                          {p.contractorName && (
                            <p className='text-xs text-[#999] mt-0.5'>{p.contractorName}</p>
                          )}
                        </div>
                        <span className='w-28 text-center text-xs text-[#666]'>
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                        <span className='w-24 text-right text-sm font-semibold text-[#202020]'>
                          {amount.toLocaleString('fr-FR')} €
                        </span>
                        <span className='w-20 flex justify-center'>
                          <GlassBadge variant='success'>Payé</GlassBadge>
                        </span>
                        <span className='w-10 flex justify-center'>
                          {p.invoiceUrl ? (
                            <a
                              href={p.invoiceUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-1.5 rounded-lg text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                              title='Télécharger le reçu'
                            >
                              <Download className='size-4' />
                            </a>
                          ) : (
                            <span className='p-1.5 text-[#ddd]'>
                              <Download className='size-4' />
                            </span>
                          )}
                        </span>
                      </div>
                      {/* Mobile row */}
                      <div className='flex md:hidden items-center gap-3'>
                        <CheckCircle2 className='size-5 text-emerald-500 shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-[#202020] truncate'>{p.label}</p>
                          <p className='text-xs text-[#999]'>
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                            {p.contractorName && ` · ${p.contractorName}`}
                          </p>
                        </div>
                        <span className='text-sm font-semibold text-[#202020] shrink-0'>
                          {amount.toLocaleString('fr-FR')} €
                        </span>
                        {p.invoiceUrl && (
                          <a
                            href={p.invoiceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='shrink-0 p-1.5 rounded-lg text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                          >
                            <Download className='size-4' />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Empty state */}
        {payments.length === 0 && designBookings.length === 0 && (
          <div className='flex-1 flex flex-col items-center justify-center'>
            <Wallet className='size-10 text-[#ccc] mb-3' />
            <p className='text-sm text-[#999]'>
              L&apos;échéancier sera créé une fois les devis des artisans acceptés.
            </p>
            <p className='text-xs text-[#bbb] mt-1'>
              Les paiements sont sécurisés par jalons via Stripe.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
