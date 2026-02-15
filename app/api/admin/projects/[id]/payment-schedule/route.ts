import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, paymentSchedule, projectEvent } from '@/database/schema'

const createSchema = z.object({
  label: z.string().min(1).max(200),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [p] = await db.select({ id: project.id }).from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const scheduleId = crypto.randomUUID()
  await db.insert(paymentSchedule).values({
    id: scheduleId,
    projectId: id,
    label: parsed.data.label,
    amount: parsed.data.amount.toString(),
    dueDate: new Date(parsed.data.dueDate),
    status: parsed.data.status,
  })

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'payment',
    data: { action: 'created', scheduleId, label: parsed.data.label, amount: parsed.data.amount, by: session.user.id },
  })

  return NextResponse.json({ id: scheduleId, success: true })
}
