import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { projectAction } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'

const updateSchema = z.object({
  completed: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  const { id, actionId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  await db
    .update(projectAction)
    .set({
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    })
    .where(and(
      eq(projectAction.id, actionId),
      eq(projectAction.projectId, id),
    ))

  return NextResponse.json({ success: true })
}
