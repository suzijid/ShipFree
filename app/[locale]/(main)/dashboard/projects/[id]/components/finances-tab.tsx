'use client'

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  SCHEDULE_PAYMENT_STATUS_LABELS,
  type SchedulePaymentStatus,
} from '@/config/project'

interface PaymentItem {
  id: string
  label: string
  amount: string
  dueDate: Date
  status: string
  invoiceUrl: string | null
  paidAt: Date | null
}

interface FinancesTabProps {
  payments: PaymentItem[]
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'success' | 'warning' }> = {
  pending: { icon: Clock, color: 'text-amber-500', badgeVariant: 'warning' },
  paid: { icon: CheckCircle2, color: 'text-emerald-500', badgeVariant: 'success' },
  overdue: { icon: AlertTriangle, color: 'text-red-500', badgeVariant: 'default' },
}

export const FinancesTab = ({ payments }: FinancesTabProps) => {
  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const paid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = total - paid
  const overdueCount = payments.filter((p) => p.status === 'overdue').length

  return (
    <div className='space-y-6'>
      {/* KPIs */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='rounded-xl border border-[#e8e4df] bg-white p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Wallet className='size-4 text-[#c9a96e]' />
            <span className='text-xs text-muted-foreground'>Budget total</span>
          </div>
          <p className='text-lg font-semibold text-[#1a1a2e]'>
            {total.toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className='rounded-xl border border-[#e8e4df] bg-white p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='size-4 text-emerald-500' />
            <span className='text-xs text-muted-foreground'>Payé</span>
          </div>
          <p className='text-lg font-semibold text-emerald-600'>
            {paid.toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className='rounded-xl border border-[#e8e4df] bg-white p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingDown className='size-4 text-amber-500' />
            <span className='text-xs text-muted-foreground'>Reste à payer</span>
          </div>
          <p className='text-lg font-semibold text-[#1a1a2e]'>
            {remaining.toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {/* Payment schedule */}
      {payments.length === 0 ? (
        <div className='rounded-xl border border-dashed border-[#e8e4df] bg-[#fafaf8] p-8 text-center'>
          <Wallet className='size-8 text-muted-foreground/40 mx-auto mb-3' />
          <p className='text-sm text-muted-foreground'>
            L&apos;échéancier sera créé par votre chef de projet après le rendez-vous de cadrage.
          </p>
        </div>
      ) : (
        <div className='rounded-xl border border-[#e8e4df] bg-white'>
          <div className='border-b border-[#e8e4df] px-6 py-4'>
            <h3
              className='font-semibold text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Échéancier
            </h3>
            {overdueCount > 0 && (
              <p className='text-xs text-red-500 mt-0.5'>
                {overdueCount} paiement{overdueCount > 1 ? 's' : ''} en retard
              </p>
            )}
          </div>
          <div className='divide-y divide-[#e8e4df]'>
            {payments.map((p) => {
              const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
              const StatusIcon = config.icon
              return (
                <div key={p.id} className='flex items-center gap-4 px-6 py-4'>
                  <StatusIcon className={`size-5 shrink-0 ${config.color}`} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-[#1a1a2e]'>{p.label}</p>
                    <p className='text-xs text-muted-foreground'>
                      Échéance : {new Date(p.dueDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {p.paidAt && (
                        <> — Payé le {new Date(p.paidAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}</>
                      )}
                    </p>
                  </div>
                  <p className='text-sm font-semibold text-[#1a1a2e] shrink-0'>
                    {parseFloat(p.amount).toLocaleString('fr-FR')} €
                  </p>
                  <Badge variant={config.badgeVariant} className='shrink-0'>
                    {SCHEDULE_PAYMENT_STATUS_LABELS[p.status as SchedulePaymentStatus] || p.status}
                  </Badge>
                  {p.invoiceUrl && (
                    <a
                      href={p.invoiceUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0 p-1.5 rounded-md text-muted-foreground hover:bg-[#e8e4df] transition-colors'
                    >
                      <Download className='size-4' />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
