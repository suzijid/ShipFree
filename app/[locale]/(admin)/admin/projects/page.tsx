import { desc } from 'drizzle-orm'
import { aliasedTable, eq } from 'drizzle-orm'

import { db } from '@/database'
import { project, user } from '@/database/schema'
import { ProjectsList } from './projects-list'

export default async function AdminProjectsPage() {
  const clientUser = aliasedTable(user, 'client_user')
  const managerUser = aliasedTable(user, 'manager_user')

  const projects = await db
    .select({
      id: project.id,
      title: project.title,
      status: project.status,
      phase: project.phase,
      city: project.city,
      budgetRange: project.budgetRange,
      createdAt: project.createdAt,
      clientName: clientUser.name,
      clientEmail: clientUser.email,
      managerName: managerUser.name,
    })
    .from(project)
    .innerJoin(clientUser, eq(project.userId, clientUser.id))
    .leftJoin(managerUser, eq(project.managerId, managerUser.id))
    .orderBy(desc(project.createdAt))

  return <ProjectsList projects={projects} />
}
