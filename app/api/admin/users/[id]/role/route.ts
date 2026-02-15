import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { user } from '@/database/schema'
import { USER_ROLE } from '@/config/project'

const roleSchema = z.object({
  role: z.enum([USER_ROLE.CLIENT, USER_ROLE.MANAGER, USER_ROLE.ADMIN]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = roleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
  }

  // Prevent self-demotion
  if (id === session.user.id && parsed.data.role !== 'admin') {
    return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre rôle' }, { status: 400 })
  }

  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1)
  if (!target) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
  }

  await db.update(user).set({ role: parsed.data.role }).where(eq(user.id, id))

  return NextResponse.json({ success: true })
}
