import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { paymentSchedule, contractor } from '@/database/schema'
import { createMilestonePayment } from '@/lib/payments/stripe-connect'

export const POST = async (
  _req: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { scheduleId } = await params

  const [schedule] = await db
    .select()
    .from(paymentSchedule)
    .where(eq(paymentSchedule.id, scheduleId))
    .limit(1)

  if (!schedule) return NextResponse.json({ error: 'Échéance non trouvée' }, { status: 404 })

  const access = await getProjectAccess(schedule.projectId, session.user.id)
  if (!access || access.role !== 'owner') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  if (schedule.status === 'paid') {
    return NextResponse.json({ error: 'Déjà payé' }, { status: 400 })
  }

  if (!schedule.contractorId) {
    return NextResponse.json({ error: 'Aucun artisan associé à cette échéance' }, { status: 400 })
  }

  const [c] = await db
    .select()
    .from(contractor)
    .where(eq(contractor.id, schedule.contractorId))
    .limit(1)

  if (!c || !c.stripeConnectAccountId || c.stripeConnectStatus !== 'active') {
    return NextResponse.json({ error: 'Le compte Stripe de l\'artisan n\'est pas actif' }, { status: 400 })
  }

  const amountInCents = Math.round(Number(schedule.amount) * 100)

  const result = await createMilestonePayment({
    amount: amountInCents,
    contractorConnectAccountId: c.stripeConnectAccountId,
    projectId: schedule.projectId,
    scheduleId: schedule.id,
    customerEmail: session.user.email,
  })

  return NextResponse.json({
    clientSecret: result.clientSecret,
    commissionAmount: result.commissionAmount / 100,
  })
}
