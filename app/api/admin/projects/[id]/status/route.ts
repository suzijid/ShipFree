import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, projectEvent } from '@/database/schema'
import { PROJECT_STATUS } from '@/config/project'

const statusSchema = z.object({
  status: z.enum([
    PROJECT_STATUS.DRAFT,
    PROJECT_STATUS.PENDING_ASSIGNMENT,
    PROJECT_STATUS.ACTIVE,
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.COMPLETED,
    PROJECT_STATUS.CANCELLED,
  ]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  await db.update(project).set({ status: parsed.data.status }).where(eq(project.id, id))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'status_change',
    data: { from: p.status, to: parsed.data.status, changedBy: session.user.id },
  })

  return NextResponse.json({ success: true })
}
