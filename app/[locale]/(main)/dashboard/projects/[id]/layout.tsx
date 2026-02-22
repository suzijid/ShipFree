import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user, projectContractor, proposal } from '@/database/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getProjectAccess } from '@/lib/auth/project-access'
import { ProjectProvider, type ProjectData } from '../../../components/project-context'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) return notFound()

  const access = await getProjectAccess(id, session.user.id)
  if (!access) return notFound()

  const p = access.project
  const services = (p.services || { architect: 'no', contractors: 'no', adminHelp: 'no' }) as {
    architect: string
    contractors: string
    adminHelp: string
  }

  // Fetch manager name + marketplace counts in parallel
  const [managerResult, contractorCountResult, proposalCountResult, acceptedProposalResult] = await Promise.all([
    p.managerId
      ? db.select({ name: user.name }).from(user).where(eq(user.id, p.managerId)).limit(1)
      : Promise.resolve([]),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectContractor)
      .where(eq(projectContractor.projectId, p.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(proposal)
      .innerJoin(projectContractor, eq(proposal.projectContractorId, projectContractor.id))
      .where(and(
        eq(projectContractor.projectId, p.id),
        eq(proposal.status, 'submitted'),
      )),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(proposal)
      .innerJoin(projectContractor, eq(proposal.projectContractorId, projectContractor.id))
      .where(and(
        eq(projectContractor.projectId, p.id),
        eq(proposal.status, 'accepted'),
      )),
  ])

  const managerName = managerResult[0]?.name ?? null

  const projectData: ProjectData = {
    id: p.id,
    title: p.title,
    status: p.status,
    phase: p.phase,
    services,
    aiSummary: p.aiSummary as Record<string, unknown> | null,
    propertyType: p.propertyType,
    surface: p.surface,
    rooms: p.rooms,
    budgetRange: p.budgetRange,
    style: p.style,
    postalCode: p.postalCode,
    city: p.city,
    paymentStatus: p.paymentStatus,
    matchingStatus: p.matchingStatus,
    managerName,
    contractorCount: contractorCountResult[0]?.count ?? 0,
    proposalCount: proposalCountResult[0]?.count ?? 0,
    acceptedProposalCount: acceptedProposalResult[0]?.count ?? 0,
    createdAt: p.createdAt.toISOString(),
  }

  return (
    <ProjectProvider
      value={{
        project: projectData,
        currentUserId: session.user.id,
        userRole: access.role,
      }}
    >
      {children}
    </ProjectProvider>
  )
}
