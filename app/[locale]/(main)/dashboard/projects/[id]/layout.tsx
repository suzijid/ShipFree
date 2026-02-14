import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { eq } from 'drizzle-orm'
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
  const modules = (p.modules || { design: false, works: false, wallet: false }) as {
    design: boolean
    works: boolean
    wallet: boolean
  }
  const services = (p.services || { architect: 'no', contractors: 'no', adminHelp: 'no' }) as {
    architect: string
    contractors: string
    adminHelp: string
  }

  // Fetch manager name if assigned
  let managerName: string | null = null
  if (p.managerId) {
    const [mgr] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, p.managerId))
      .limit(1)
    managerName = mgr?.name ?? null
  }

  const projectData: ProjectData = {
    id: p.id,
    title: p.title,
    status: p.status,
    phase: p.phase,
    modules,
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
    managerName,
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
