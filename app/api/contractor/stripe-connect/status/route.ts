import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { requireContractorApi } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { contractor } from '@/database/schema'
import { getAccountStatus } from '@/lib/payments/stripe-connect'

export const GET = async () => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  if (!result.contractor.stripeConnectAccountId) {
    return NextResponse.json({
      status: 'not_started',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    })
  }

  const status = await getAccountStatus(result.contractor.stripeConnectAccountId)

  // Update status in DB if changed
  let newStatus: string = result.contractor.stripeConnectStatus
  if (status.chargesEnabled && status.payoutsEnabled) {
    newStatus = 'active'
  } else if (status.detailsSubmitted && !status.chargesEnabled) {
    newStatus = 'restricted'
  } else if (!status.detailsSubmitted) {
    newStatus = 'onboarding'
  }

  if (newStatus !== result.contractor.stripeConnectStatus) {
    await db.update(contractor).set({ stripeConnectStatus: newStatus }).where(eq(contractor.id, result.contractor.id))
  }

  return NextResponse.json({
    status: newStatus,
    ...status,
  })
}
