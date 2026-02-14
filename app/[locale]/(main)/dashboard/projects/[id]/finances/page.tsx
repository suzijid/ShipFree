import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { paymentSchedule } from '@/database/schema'
import { FinancesContent } from './finances-content'

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const payments = await db
    .select()
    .from(paymentSchedule)
    .where(eq(paymentSchedule.projectId, id))
    .orderBy(asc(paymentSchedule.dueDate))

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
      }))}
    />
  )
}
