import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { projectContractor, contractor, proposal, user } from '@/database/schema'
import { ArtisansContent } from './artisans-content'

export default async function ProjectArtisansPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const { id } = await params
  const access = await getProjectAccess(id, session.user.id)
  if (!access) redirect('/dashboard')

  const assignments = await db
    .select({
      pcId: projectContractor.id,
      specialty: projectContractor.specialty,
      assignmentStatus: projectContractor.status,
      contractorId: contractor.id,
      companyName: contractor.companyName,
      rating: contractor.rating,
      reviewCount: contractor.reviewCount,
      contractorName: user.name,
    })
    .from(projectContractor)
    .innerJoin(contractor, eq(projectContractor.contractorId, contractor.id))
    .innerJoin(user, eq(contractor.userId, user.id))
    .where(eq(projectContractor.projectId, id))

  // Get proposals for each assignment
  const proposalsList = await db
    .select()
    .from(proposal)
    .where(
      eq(proposal.status, 'submitted')
    )

  // Map proposals by projectContractorId
  const proposalMap = new Map<string, typeof proposalsList[0]>()
  for (const p of proposalsList) {
    proposalMap.set(p.projectContractorId, p)
  }

  const data = assignments.map((a) => ({
    ...a,
    proposal: proposalMap.get(a.pcId) ?? null,
  }))

  return (
    <ArtisansContent
      projectId={id}
      contractors={data}
      userRole={access.role}
    />
  )
}
