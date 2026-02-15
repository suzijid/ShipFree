import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getContractorSession } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { project, projectContractor, proposal, user } from '@/database/schema'
import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import { ContractorProjectDetail } from './project-detail'

export default async function ContractorProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { contractor } = await getContractorSession()
  const { id } = await params

  // Verify contractor is assigned to this project
  const [pc] = await db
    .select()
    .from(projectContractor)
    .where(
      and(
        eq(projectContractor.projectId, id),
        eq(projectContractor.contractorId, contractor.id)
      )
    )
    .limit(1)

  if (!pc) notFound()

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) notFound()

  const [client] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, p.userId))
    .limit(1)

  // Get existing proposal
  const [existingProposal] = await db
    .select()
    .from(proposal)
    .where(eq(proposal.projectContractorId, pc.id))
    .limit(1)

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/contractor/projects'
          className='flex items-center justify-center size-10 rounded-xl border border-[#e8e4df] text-[#9b9b9b] hover:bg-[#f5f3f0] transition-colors'
        >
          <ArrowLeft className='size-5' />
        </Link>
        <div>
          <h1
            className='text-2xl font-bold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {p.title}
          </h1>
          <div className='flex items-center gap-2 mt-1'>
            <GlassBadge variant='gold'>{pc.specialty}</GlassBadge>
            {p.city && <span className='text-sm text-[#9b9b9b]'>{p.city}</span>}
          </div>
        </div>
      </div>

      {/* Project overview */}
      <div className='grid md:grid-cols-2 gap-6'>
        <GlassCard className='p-6 space-y-3'>
          <h2 className='font-semibold text-[#1a1a2e]'>Informations du projet</h2>
          <div className='text-sm space-y-2'>
            <div className='flex justify-between'>
              <span className='text-[#9b9b9b]'>Client</span>
              <span className='text-[#1a1a2e]'>{client?.name ?? '—'}</span>
            </div>
            {p.propertyType && (
              <div className='flex justify-between'>
                <span className='text-[#9b9b9b]'>Type de bien</span>
                <span className='text-[#1a1a2e]'>{p.propertyType}</span>
              </div>
            )}
            {p.surface && (
              <div className='flex justify-between'>
                <span className='text-[#9b9b9b]'>Surface</span>
                <span className='text-[#1a1a2e]'>{p.surface} m²</span>
              </div>
            )}
            {p.budgetRange && (
              <div className='flex justify-between'>
                <span className='text-[#9b9b9b]'>Budget</span>
                <span className='text-[#1a1a2e]'>{p.budgetRange}</span>
              </div>
            )}
          </div>
        </GlassCard>

        <ContractorProjectDetail
          projectId={id}
          projectContractorId={pc.id}
          assignmentStatus={pc.status}
          existingProposal={existingProposal ?? null}
        />
      </div>
    </div>
  )
}
