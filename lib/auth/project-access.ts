import { eq, and, or } from 'drizzle-orm'

import { db } from '@/database'
import { project, user, projectContractor, contractor } from '@/database/schema'

export type ProjectAccessRole = 'owner' | 'manager' | 'admin' | 'contractor'

export interface ProjectAccessResult {
  project: typeof project.$inferSelect
  role: ProjectAccessRole
}

/**
 * Check if a user has access to a project.
 * Returns the project and the user's role, or null if no access.
 *
 * Access is granted if:
 * - User is the project owner (project.userId === userId)
 * - User is the assigned manager (project.managerId === userId)
 * - User is an admin (user.role === 'admin')
 * - User is a contractor assigned to the project
 */
export const getProjectAccess = async (
  projectId: string,
  userId: string
): Promise<ProjectAccessResult | null> => {
  // Check if user is owner or assigned manager
  const [p] = await db
    .select()
    .from(project)
    .where(
      and(
        eq(project.id, projectId),
        or(
          eq(project.userId, userId),
          eq(project.managerId, userId)
        )
      )
    )
    .limit(1)

  if (p) {
    const role: ProjectAccessRole = p.userId === userId ? 'owner' : 'manager'
    return { project: p, role }
  }

  // Check if user is admin
  const [adminUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(and(eq(user.id, userId), eq(user.role, 'admin')))
    .limit(1)

  if (adminUser) {
    const [adminProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1)

    if (adminProject) {
      return { project: adminProject, role: 'admin' }
    }
  }

  // Check if user is a contractor assigned to this project
  const [contractorAssignment] = await db
    .select({ contractorId: projectContractor.contractorId })
    .from(projectContractor)
    .innerJoin(contractor, eq(contractor.id, projectContractor.contractorId))
    .where(
      and(
        eq(projectContractor.projectId, projectId),
        eq(contractor.userId, userId)
      )
    )
    .limit(1)

  if (contractorAssignment) {
    const [contractorProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1)

    if (contractorProject) {
      return { project: contractorProject, role: 'contractor' }
    }
  }

  return null
}
