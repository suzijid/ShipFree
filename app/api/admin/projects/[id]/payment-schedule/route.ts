import { NextResponse } from 'next/server'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, paymentSchedule, projectEvent, contractor } from '@/database/schema'
import { notificationService } from '@/lib/notifications/notification-service'
import { renderPaymentDueEmail, getEmailSubject } from '@/components/emails'

const createSchema = z.object({
  label: z.string().min(1).max(200),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  contractorId: z.string().optional(),
})

/**
 * GET /api/admin/projects/[id]/payment-schedule
 * List all milestones for a project (admin/manager only)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await requireAdminApi()
  if (error) return error

  const [p] = await db.select({ id: project.id }).from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const milestones = await db
    .select({
      id: paymentSchedule.id,
      label: paymentSchedule.label,
      amount: paymentSchedule.amount,
      dueDate: paymentSchedule.dueDate,
      status: paymentSchedule.status,
      paidAt: paymentSchedule.paidAt,
      invoiceUrl: paymentSchedule.invoiceUrl,
      contractorId: paymentSchedule.contractorId,
      contractorName: contractor.companyName,
      commissionAmount: paymentSchedule.commissionAmount,
      stripeTransferId: paymentSchedule.stripeTransferId,
      createdAt: paymentSchedule.createdAt,
    })
    .from(paymentSchedule)
    .leftJoin(contractor, eq(paymentSchedule.contractorId, contractor.id))
    .where(eq(paymentSchedule.projectId, id))
    .orderBy(asc(paymentSchedule.dueDate))

  return NextResponse.json({ milestones })
}

/**
 * POST /api/admin/projects/[id]/payment-schedule
 * Create a new milestone (admin/manager only)
 */
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
    contractorId: parsed.data.contractorId ?? null,
  })

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'payment',
    data: { action: 'created', scheduleId, label: parsed.data.label, amount: parsed.data.amount, by: session.user.id },
  })

  // ── Notification trigger ─────────────────────────────────────────
  try {
    const [proj] = await db
      .select({ userId: project.userId, title: project.title })
      .from(project)
      .where(eq(project.id, id))
      .limit(1)

    if (proj) {
      const link = `/dashboard/projects/${id}/finances`
      const dueDateStr = new Date(parsed.data.dueDate).toLocaleDateString('fr-FR')

      await notificationService.create({
        userId: proj.userId,
        projectId: id,
        type: 'payment_due',
        title: `Paiement en attente : ${parsed.data.label}`,
        body: `Montant : ${parsed.data.amount} € — Échéance : ${dueDateStr}`,
        link,
      })

      const html = await renderPaymentDueEmail({
        projectTitle: proj.title,
        milestoneLabel: parsed.data.label,
        amount: parsed.data.amount.toString(),
        dueDate: dueDateStr,
        projectLink: link,
      })

      notificationService.sendEmail(proj.userId, 'payment_due', {
        subject: getEmailSubject('payment-due'),
        html,
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[notifications] Failed to send payment_due notification:', err)
  }

  return NextResponse.json({ id: scheduleId, success: true })
}
