import { NextResponse } from 'next/server'
import { eq, and, sql } from 'drizzle-orm'

import { requireContractorApi } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { paymentSchedule } from '@/database/schema'

export const GET = async () => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  const schedules = await db
    .select()
    .from(paymentSchedule)
    .where(eq(paymentSchedule.contractorId, result.contractor.id))

  const total = schedules.reduce((sum, s) => sum + Number(s.amount), 0)
  const paid = schedules
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + Number(s.amount), 0)
  const pending = schedules
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.amount), 0)
  const commissions = schedules
    .filter((s) => s.status === 'paid' && s.commissionAmount)
    .reduce((sum, s) => sum + Number(s.commissionAmount), 0)

  const upcoming = schedules
    .filter((s) => s.status === 'pending')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      label: s.label,
      amount: Number(s.amount),
      dueDate: s.dueDate,
    }))

  return NextResponse.json({
    total,
    paid,
    pending,
    commissions,
    netEarnings: paid - commissions,
    upcoming,
  })
}
