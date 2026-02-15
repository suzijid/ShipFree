import { desc, eq } from 'drizzle-orm'

import { db } from '@/database'
import { projectEvent, project } from '@/database/schema'
import { ActivityContent } from './activity-content'

export default async function AdminActivityPage() {
  const events = await db
    .select({
      id: projectEvent.id,
      type: projectEvent.type,
      data: projectEvent.data,
      createdAt: projectEvent.createdAt,
      projectId: projectEvent.projectId,
      projectTitle: project.title,
    })
    .from(projectEvent)
    .innerJoin(project, eq(projectEvent.projectId, project.id))
    .orderBy(desc(projectEvent.createdAt))
    .limit(100)

  return <ActivityContent events={events} />
}
