import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, projectEvent } from '@/database/schema'
import { PROJECT_PHASES } from '@/config/project'

const phaseSchema = z.object({
  phase: z.enum(PROJECT_PHASES),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = phaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Phase invalide' }, { status: 400 })
  }

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  await db.update(project).set({ phase: parsed.data.phase }).where(eq(project.id, id))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'phase_change',
    data: { from: p.phase, to: parsed.data.phase, changedBy: session.user.id },
  })

  return NextResponse.json({ success: true })
}
