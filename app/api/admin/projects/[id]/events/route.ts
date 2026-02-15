import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, projectEvent } from '@/database/schema'

const eventSchema = z.object({
  type: z.literal('note'),
  content: z.string().min(1).max(5000),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [p] = await db.select({ id: project.id }).from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const eventId = crypto.randomUUID()
  await db.insert(projectEvent).values({
    id: eventId,
    projectId: id,
    type: 'note',
    data: { content: parsed.data.content, author: session.user.id, authorName: session.user.name },
  })

  return NextResponse.json({ id: eventId, success: true })
}
