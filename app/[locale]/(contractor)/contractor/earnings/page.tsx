import { eq } from 'drizzle-orm'
import Link from 'next/link'

import { getContractorSession } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { paymentSchedule, project } from '@/database/schema'
import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import { Wallet, TrendingUp, Clock, CreditCard } from 'lucide-react'

export default async function ContractorEarningsPage() {
  const { contractor } = await getContractorSession()

  const schedules = await db
    .select({
      id: paymentSchedule.id,
      label: paymentSchedule.label,
      amount: paymentSchedule.amount,
      dueDate: paymentSchedule.dueDate,
      status: paymentSchedule.status,
      paidAt: paymentSchedule.paidAt,
      commissionAmount: paymentSchedule.commissionAmount,
      projectId: paymentSchedule.projectId,
      projectTitle: project.title,
    })
    .from(paymentSchedule)
    .innerJoin(project, eq(paymentSchedule.projectId, project.id))
    .where(eq(paymentSchedule.contractorId, contractor.id))

  const totalEarnings = schedules
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + Number(s.amount), 0)
  const totalCommissions = schedules
    .filter(s => s.status === 'paid' && s.commissionAmount)
    .reduce((sum, s) => sum + Number(s.commissionAmount), 0)
  const pending = schedules
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.amount), 0)

  const stripeActive = contractor.stripeConnectStatus === 'active'

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Paiements
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          Suivi de vos gains et paiements
        </p>
      </div>

      {!stripeActive && (
        <GlassCard className='p-4 border-l-4 border-l-[#c9a96e]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-[#1a1a2e]'>Configurez Stripe Connect</p>
              <p className='text-sm text-[#9b9b9b]'>Pour recevoir vos paiements, configurez votre compte Stripe.</p>
            </div>
            <Link
              href='/contractor/stripe-setup'
              className='px-4 py-2 rounded-xl bg-[#c9a96e] text-white text-sm font-medium hover:bg-[#b8944f] transition-colors'
            >
              Configurer
            </Link>
          </div>
        </GlassCard>
      )}

      <div className='grid sm:grid-cols-3 gap-4'>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <TrendingUp className='size-5 text-green-600' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>
                {(totalEarnings - totalCommissions).toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-[#9b9b9b]'>Net reçu</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <Clock className='size-5 text-[#c9a96e]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>
                {pending.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-[#9b9b9b]'>En attente</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <CreditCard className='size-5 text-[#9b9b9b]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>
                {totalCommissions.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-[#9b9b9b]'>Commission Gradia</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className='overflow-hidden'>
        <div className='p-4 border-b border-[#e8e4df]'>
          <h2 className='font-semibold text-[#1a1a2e]'>Historique</h2>
        </div>
        {schedules.length === 0 ? (
          <div className='p-8 text-center text-[#9b9b9b]'>
            Aucun paiement pour le moment
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-[#e8e4df]'>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Projet</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Libellé</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Montant</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Échéance</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Statut</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className='border-b border-[#f5f3f0] last:border-0'>
                    <td className='px-4 py-3 text-[#1a1a2e]'>{s.projectTitle}</td>
                    <td className='px-4 py-3 text-[#6b6b6b]'>{s.label}</td>
                    <td className='px-4 py-3 font-medium text-[#1a1a2e]'>
                      {Number(s.amount).toLocaleString('fr-FR')} €
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {new Date(s.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className='px-4 py-3'>
                      <GlassBadge variant={s.status === 'paid' ? 'success' : s.status === 'overdue' ? 'warning' : 'default'}>
                        {s.status === 'paid' ? 'Payé' : s.status === 'overdue' ? 'En retard' : 'En attente'}
                      </GlassBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
