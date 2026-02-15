import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { proposal, projectContractor, project, projectEvent } from '@/database/schema'

export const POST = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id, pid } = await params
  const access = await getProjectAccess(id, session.user.id)
  if (!access || (access.role !== 'owner' && access.role !== 'admin')) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  // Verify proposal belongs to this project
  const [p] = await db
    .select({
      proposalId: proposal.id,
      projectContractorId: proposal.projectContractorId,
      pcProjectId: projectContractor.projectId,
    })
    .from(proposal)
    .innerJoin(projectContractor, eq(proposal.projectContractorId, projectContractor.id))
    .where(and(eq(proposal.id, pid), eq(projectContractor.projectId, id)))
    .limit(1)

  if (!p) return NextResponse.json({ error: 'Proposition non trouvée' }, { status: 404 })

  // Update proposal status
  await db.update(proposal).set({ status: 'accepted', respondedAt: new Date() }).where(eq(proposal.id, pid))

  // Update projectContractor status
  await db.update(projectContractor).set({ status: 'accepted' }).where(eq(projectContractor.id, p.projectContractorId))

  // Check if all contractors with proposals have been accepted
  const allPCs = await db
    .select({ status: projectContractor.status })
    .from(projectContractor)
    .where(eq(projectContractor.projectId, id))

  const allAccepted = allPCs.length > 0 && allPCs.every(pc => pc.status === 'accepted' || pc.status === 'active' || pc.status === 'completed')
  if (allAccepted) {
    await db.update(project).set({ matchingStatus: 'matched' }).where(eq(project.id, id))
  }

  // Log event
  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'assignment',
    data: { proposalId: pid, action: 'proposal_accepted' },
  })

  return NextResponse.json({ success: true })
}
