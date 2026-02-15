import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { paymentSchedule, contractor, designServiceBooking } from '@/database/schema'
import { FinancesContent } from './finances-content'

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [payments, designBookings] = await Promise.all([
    db
      .select({
        id: paymentSchedule.id,
        label: paymentSchedule.label,
        amount: paymentSchedule.amount,
        dueDate: paymentSchedule.dueDate,
        status: paymentSchedule.status,
        invoiceUrl: paymentSchedule.invoiceUrl,
        paidAt: paymentSchedule.paidAt,
        contractorId: paymentSchedule.contractorId,
        stripeTransferId: paymentSchedule.stripeTransferId,
        commissionAmount: paymentSchedule.commissionAmount,
        contractorCompanyName: contractor.companyName,
      })
      .from(paymentSchedule)
      .leftJoin(contractor, eq(paymentSchedule.contractorId, contractor.id))
      .where(eq(paymentSchedule.projectId, id))
      .orderBy(asc(paymentSchedule.dueDate)),
    db
      .select()
      .from(designServiceBooking)
      .where(eq(designServiceBooking.projectId, id)),
  ])

  return (
    <FinancesContent
      payments={payments.map((pm) => ({
        id: pm.id,
        label: pm.label,
        amount: pm.amount,
        dueDate: pm.dueDate.toISOString(),
        status: pm.status,
        invoiceUrl: pm.invoiceUrl,
        paidAt: pm.paidAt?.toISOString() ?? null,
        contractorName: pm.contractorCompanyName ?? null,
        commissionAmount: pm.commissionAmount ?? null,
        hasStripeTransfer: !!pm.stripeTransferId,
      }))}
      designBookings={designBookings.map((b) => ({
        id: b.id,
        type: b.type,
        status: b.status,
        amount: b.amount,
        createdAt: b.createdAt.toISOString(),
      }))}
    />
  )
}
