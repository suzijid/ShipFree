import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { designServiceBooking, user } from '@/database/schema'
import { requireAdminApi } from '@/lib/auth/require-admin'

// GET — Booking details (accessible by booking owner or admin)
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params

  const [booking] = await db
    .select()
    .from(designServiceBooking)
    .where(eq(designServiceBooking.id, id))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
  }

  // Check access: owner or admin
  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (booking.userId !== session.user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  return NextResponse.json(booking)
}

// PATCH — Admin: mark as delivered, add deliverables
const patchSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'delivered', 'cancelled']).optional(),
  deliverables: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
  scheduledAt: z.string().datetime().optional(),
})

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const adminCheck = await requireAdminApi()
  if (adminCheck.error) return adminCheck.error

  const { id } = await params

  const [booking] = await db
    .select()
    .from(designServiceBooking)
    .where(eq(designServiceBooking.id, id))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (parsed.data.status) {
    updates.status = parsed.data.status
    if (parsed.data.status === 'delivered') {
      updates.deliveredAt = new Date()
    }
  }

  if (parsed.data.deliverables) {
    updates.deliverables = parsed.data.deliverables
  }

  if (parsed.data.scheduledAt) {
    updates.scheduledAt = new Date(parsed.data.scheduledAt)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
  }

  await db
    .update(designServiceBooking)
    .set(updates)
    .where(eq(designServiceBooking.id, id))

  return NextResponse.json({ success: true })
}
