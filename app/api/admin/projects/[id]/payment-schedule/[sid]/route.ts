import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { paymentSchedule, projectEvent } from '@/database/schema'

const updateSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [entry] = await db
    .select()
    .from(paymentSchedule)
    .where(and(eq(paymentSchedule.id, sid), eq(paymentSchedule.projectId, id)))
    .limit(1)

  if (!entry) {
    return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.label) updates.label = parsed.data.label
  if (parsed.data.amount) updates.amount = parsed.data.amount.toString()
  if (parsed.data.dueDate) updates.dueDate = new Date(parsed.data.dueDate)
  if (parsed.data.status) {
    updates.status = parsed.data.status
    if (parsed.data.status === 'paid' && !entry.paidAt) {
      updates.paidAt = new Date()
    }
  }

  await db.update(paymentSchedule).set(updates).where(eq(paymentSchedule.id, sid))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'payment',
    data: { action: 'updated', scheduleId: sid, changes: parsed.data, by: session.user.id },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const [entry] = await db
    .select()
    .from(paymentSchedule)
    .where(and(eq(paymentSchedule.id, sid), eq(paymentSchedule.projectId, id)))
    .limit(1)

  if (!entry) {
    return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 })
  }

  await db.delete(paymentSchedule).where(eq(paymentSchedule.id, sid))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'payment',
    data: { action: 'deleted', scheduleId: sid, label: entry.label, by: session.user.id },
  })

  return NextResponse.json({ success: true })
}
