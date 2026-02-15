import { sql, desc } from 'drizzle-orm'

import { db } from '@/database'
import { user, project } from '@/database/schema'
import { UsersList } from './users-list'

export default async function AdminUsersPage() {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      projectCount: sql<number>`(SELECT COUNT(*) FROM project WHERE project.user_id = ${user.id})`.as('project_count'),
    })
    .from(user)
    .orderBy(desc(user.createdAt))

  return <UsersList users={users} />
}
