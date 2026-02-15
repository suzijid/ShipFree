import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { requireContractorApi } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { contractor } from '@/database/schema'
import { createConnectAccount, createAccountLink } from '@/lib/payments/stripe-connect'
import { env } from '@/config/env'

export const POST = async () => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let accountId = result.contractor.stripeConnectAccountId

  if (!accountId) {
    const account = await createConnectAccount(result.session.user.email)
    accountId = account.id

    await db.update(contractor).set({
      stripeConnectAccountId: accountId,
      stripeConnectStatus: 'onboarding',
    }).where(eq(contractor.id, result.contractor.id))
  }

  const link = await createAccountLink(
    accountId,
    `${appUrl}/contractor/stripe-setup?success=true`,
    `${appUrl}/contractor/stripe-setup?refresh=true`
  )

  return NextResponse.json({ url: link.url })
}
