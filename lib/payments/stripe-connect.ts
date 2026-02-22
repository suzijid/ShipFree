import Stripe from 'stripe'
import { env } from '@/config/env'
import { MARKETPLACE_CONFIG } from '@/config/payments'

const getStripe = () => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required for Stripe Connect')
  }
  return new Stripe(env.STRIPE_SECRET_KEY)
}

export const createConnectAccount = async (email: string) => {
  const stripe = getStripe()
  const account = await stripe.accounts.create({
    type: 'standard',
    country: MARKETPLACE_CONFIG.stripeConnectCountry,
    email,
  })
  return account
}

export const createAccountLink = async (
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) => {
  const stripe = getStripe()
  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  })
  return link
}

export const getAccountStatus = async (accountId: string) => {
  const stripe = getStripe()
  const account = await stripe.accounts.retrieve(accountId)
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  }
}

export const createMilestonePayment = async ({
  amount,
  contractorConnectAccountId,
  projectId,
  scheduleId,
  customerEmail,
  commissionRate,
}: {
  amount: number // in cents
  contractorConnectAccountId: string
  projectId: string
  scheduleId: string
  customerEmail: string
  commissionRate?: number // per-project override; falls back to global default
}) => {
  const stripe = getStripe()
  const effectiveRate = commissionRate ?? MARKETPLACE_CONFIG.commissionRate
  const commissionAmount = Math.round(amount * effectiveRate)
  const contractorAmount = amount - commissionAmount

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: MARKETPLACE_CONFIG.currency,
    receipt_email: customerEmail,
    transfer_data: {
      destination: contractorConnectAccountId,
      amount: contractorAmount,
    },
    metadata: {
      projectId,
      scheduleId,
      commissionAmount: commissionAmount.toString(),
      type: 'milestone_payment',
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    commissionAmount,
  }
}
