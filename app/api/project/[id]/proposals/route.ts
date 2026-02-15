import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { projectContractor, proposal, contractor, user } from '@/database/schema'

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params
  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  const proposals = await db
    .select({
      proposalId: proposal.id,
      amount: proposal.amount,
      description: proposal.description,
      estimatedDuration: proposal.estimatedDuration,
      startDate: proposal.startDate,
      attachments: proposal.attachments,
      proposalStatus: proposal.status,
      submittedAt: proposal.submittedAt,
      projectContractorId: projectContractor.id,
      specialty: projectContractor.specialty,
      assignmentStatus: projectContractor.status,
      contractorId: contractor.id,
      companyName: contractor.companyName,
      rating: contractor.rating,
      reviewCount: contractor.reviewCount,
      contractorName: user.name,
    })
    .from(proposal)
    .innerJoin(projectContractor, eq(proposal.projectContractorId, projectContractor.id))
    .innerJoin(contractor, eq(projectContractor.contractorId, contractor.id))
    .innerJoin(user, eq(contractor.userId, user.id))
    .where(eq(projectContractor.projectId, id))

  return NextResponse.json(proposals)
}
