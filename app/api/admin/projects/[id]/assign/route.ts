import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, projectEvent } from '@/database/schema'

const assignSchema = z.object({
  managerId: z.string().min(1),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = assignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { managerId: parsed.data.managerId }
  // Auto-activate if pending assignment
  if (p.status === 'pending_assignment') {
    updates.status = 'active'
  }

  await db.update(project).set(updates).where(eq(project.id, id))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'assignment',
    data: { managerId: parsed.data.managerId, assignedBy: session.user.id },
  })

  return NextResponse.json({ success: true })
}
