import { eq } from 'drizzle-orm'

import { getContractorSession } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { projectContractor, project, proposal, paymentSchedule } from '@/database/schema'
import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import { FolderKanban, FileText, Wallet, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function ContractorDashboard() {
  const { contractor } = await getContractorSession()

  const assignments = await db
    .select({
      pcId: projectContractor.id,
      status: projectContractor.status,
      specialty: projectContractor.specialty,
      projectId: project.id,
      projectTitle: project.title,
      projectStatus: project.status,
      projectCity: project.city,
    })
    .from(projectContractor)
    .innerJoin(project, eq(projectContractor.projectId, project.id))
    .where(eq(projectContractor.contractorId, contractor.id))

  const activeProjects = assignments.filter(a => a.status !== 'rejected' && a.status !== 'completed')
  const pendingInvites = assignments.filter(a => a.status === 'invited')

  // Earnings summary
  const schedules = await db
    .select()
    .from(paymentSchedule)
    .where(eq(paymentSchedule.contractorId, contractor.id))

  const totalEarnings = schedules
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + Number(s.amount), 0)

  const pendingPayments = schedules
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.amount), 0)

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Tableau de bord
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          Bienvenue, {contractor.companyName}
        </p>
      </div>

      {/* KPIs */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <FolderKanban className='size-5 text-[#c9a96e]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>{activeProjects.length}</p>
              <p className='text-xs text-[#9b9b9b]'>Projets actifs</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <Clock className='size-5 text-[#c9a96e]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>{pendingInvites.length}</p>
              <p className='text-xs text-[#9b9b9b]'>Invitations en attente</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <Wallet className='size-5 text-[#c9a96e]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>
                {totalEarnings.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-[#9b9b9b]'>Gains reçus</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
              <FileText className='size-5 text-[#c9a96e]' />
            </div>
            <div>
              <p className='text-2xl font-bold text-[#1a1a2e]'>
                {pendingPayments.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-[#9b9b9b]'>En attente</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent projects */}
      <GlassCard className='overflow-hidden'>
        <div className='p-4 border-b border-[#e8e4df] flex items-center justify-between'>
          <h2 className='font-semibold text-[#1a1a2e]'>Mes projets</h2>
          <Link href='/contractor/projects' className='text-sm text-[#c9a96e] hover:underline'>
            Voir tout
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <div className='p-8 text-center text-[#9b9b9b]'>
            Aucun projet actif pour le moment
          </div>
        ) : (
          <div className='divide-y divide-[#f5f3f0]'>
            {activeProjects.slice(0, 5).map((a) => (
              <Link
                key={a.pcId}
                href={`/contractor/projects/${a.projectId}`}
                className='flex items-center justify-between px-4 py-3 hover:bg-[#faf9f7] transition-colors'
              >
                <div>
                  <p className='font-medium text-[#1a1a2e]'>{a.projectTitle}</p>
                  <p className='text-xs text-[#9b9b9b]'>{a.projectCity ?? 'Localisation non définie'}</p>
                </div>
                <GlassBadge variant={a.status === 'invited' ? 'warning' : a.status === 'accepted' || a.status === 'active' ? 'success' : 'gold'}>
                  {a.status === 'invited' ? 'À répondre' : a.status === 'proposal_sent' ? 'Devis envoyé' : a.status === 'accepted' ? 'Accepté' : a.status}
                </GlassBadge>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
