import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'

import { env } from '@/config/env'
import { db } from '@/database'
import { contractor, paymentSchedule, projectEvent } from '@/database/schema'

export const POST = async (req: Request) => {
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !env.STRIPE_CONNECT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_CONNECT_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      let status = 'onboarding'
      if (account.charges_enabled && account.payouts_enabled) {
        status = 'active'
      } else if (account.details_submitted && !account.charges_enabled) {
        status = 'restricted'
      }

      await db
        .update(contractor)
        .set({ stripeConnectStatus: status })
        .where(eq(contractor.stripeConnectAccountId, account.id))
      break
    }

    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const scheduleId = pi.metadata?.scheduleId
      const projectId = pi.metadata?.projectId
      const commissionAmount = pi.metadata?.commissionAmount

      if (scheduleId) {
        await db
          .update(paymentSchedule)
          .set({
            status: 'paid',
            paidAt: new Date(),
            stripeTransferId: pi.latest_charge as string,
            commissionAmount: commissionAmount ? (Number(commissionAmount) / 100).toString() : null,
          })
          .where(eq(paymentSchedule.id, scheduleId))

        if (projectId) {
          await db.insert(projectEvent).values({
            id: crypto.randomUUID(),
            projectId,
            type: 'payment',
            data: { scheduleId, amount: pi.amount / 100, status: 'succeeded' },
          })
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const projectId = pi.metadata?.projectId
      const scheduleId = pi.metadata?.scheduleId

      if (projectId) {
        await db.insert(projectEvent).values({
          id: crypto.randomUUID(),
          projectId,
          type: 'payment',
          data: { scheduleId, amount: pi.amount / 100, status: 'failed' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
