import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getContractorSession } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { projectContractor, project } from '@/database/schema'
import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  CONTRACTOR_ASSIGNMENT_STATUS_LABELS,
  CONTRACTOR_SPECIALTY_LABELS,
  type ContractorAssignmentStatus,
  type ContractorSpecialty,
} from '@/config/project'

export default async function ContractorProjectsPage() {
  const { contractor } = await getContractorSession()

  const assignments = await db
    .select({
      pcId: projectContractor.id,
      status: projectContractor.status,
      specialty: projectContractor.specialty,
      assignedAt: projectContractor.assignedAt,
      projectId: project.id,
      projectTitle: project.title,
      projectStatus: project.status,
      projectPhase: project.phase,
      projectCity: project.city,
    })
    .from(projectContractor)
    .innerJoin(project, eq(projectContractor.projectId, project.id))
    .where(eq(projectContractor.contractorId, contractor.id))

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Mes projets
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          {assignments.length} projet{assignments.length !== 1 ? 's' : ''} assigné{assignments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {assignments.length === 0 ? (
        <GlassCard className='p-12 text-center'>
          <p className='text-[#9b9b9b]'>Aucun projet pour le moment. Vous recevrez des invitations prochainement.</p>
        </GlassCard>
      ) : (
        <div className='space-y-3'>
          {assignments.map((a) => (
            <GlassCard key={a.pcId} className='p-4'>
              <Link href={`/contractor/projects/${a.projectId}`} className='flex items-center justify-between'>
                <div>
                  <h3 className='font-medium text-[#1a1a2e] hover:text-[#c9a96e] transition-colors'>
                    {a.projectTitle}
                  </h3>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-[#9b9b9b]'>
                      {CONTRACTOR_SPECIALTY_LABELS[a.specialty as ContractorSpecialty] ?? a.specialty}
                    </span>
                    <span className='text-xs text-[#9b9b9b]'>&middot;</span>
                    <span className='text-xs text-[#9b9b9b]'>{a.projectCity ?? '—'}</span>
                    <span className='text-xs text-[#9b9b9b]'>&middot;</span>
                    <span className='text-xs text-[#9b9b9b]'>
                      {new Date(a.assignedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <GlassBadge
                    variant={
                      a.status === 'accepted' || a.status === 'active' ? 'success'
                        : a.status === 'invited' ? 'warning'
                        : a.status === 'proposal_sent' ? 'gold'
                        : 'default'
                    }
                  >
                    {CONTRACTOR_ASSIGNMENT_STATUS_LABELS[a.status as ContractorAssignmentStatus] ?? a.status}
                  </GlassBadge>
                  <ArrowRight className='size-4 text-[#9b9b9b]' />
                </div>
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
