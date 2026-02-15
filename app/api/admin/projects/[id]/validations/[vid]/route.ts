import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { projectValidation, projectEvent } from '@/database/schema'

const validationSchema = z.object({
  validated: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  const { id, vid } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = validationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [v] = await db
    .select()
    .from(projectValidation)
    .where(eq(projectValidation.id, vid))
    .limit(1)

  if (!v || v.projectId !== id) {
    return NextResponse.json({ error: 'Jalon non trouvé' }, { status: 404 })
  }

  await db
    .update(projectValidation)
    .set({
      validatedAt: parsed.data.validated ? new Date() : null,
      validatedBy: parsed.data.validated ? session.user.id : null,
    })
    .where(eq(projectValidation.id, vid))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'validation',
    data: {
      validationId: vid,
      label: v.label,
      validated: parsed.data.validated,
      by: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
