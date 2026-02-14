import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { projectAction, projectValidation } from '@/database/schema'
import { OverviewContent } from './overview-content'

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [actions, validations] = await Promise.all([
    db
      .select()
      .from(projectAction)
      .where(eq(projectAction.projectId, id))
      .orderBy(asc(projectAction.createdAt)),
    db
      .select()
      .from(projectValidation)
      .where(eq(projectValidation.projectId, id))
      .orderBy(asc(projectValidation.createdAt)),
  ])

  return (
    <OverviewContent
      actions={actions.map((a) => ({
        id: a.id,
        label: a.label,
        phase: a.phase,
        completed: a.completed,
      }))}
      validations={validations.map((v) => ({
        id: v.id,
        label: v.label,
        phase: v.phase,
        validatedAt: v.validatedAt?.toISOString() ?? null,
      }))}
    />
  )
}
