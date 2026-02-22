/**
 * Stripe Payment Adapter
 *
 * Implements the PaymentAdapter interface for Stripe integration.
 * Handles customers and webhooks for the Gradia marketplace model.
 */

import Stripe from 'stripe'
import type {
  PaymentAdapter,
  CustomerData,
  WebhookEvent,
  WebhookResult,
} from '../types'
import type { PaymentProvider } from '@/config/payments'
import { env } from '@/config/env'

export class StripeAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'stripe'
  private stripe: Stripe

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for Stripe adapter')
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY)
  }

  async createCustomer(userId: string, email?: string): Promise<CustomerData> {
    let customer: Stripe.Customer

    if (email) {
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await this.stripe.customers.create({
          email,
          metadata: {
            userId,
            provider: 'stripe',
          },
        })
      }
    } else {
      customer = await this.stripe.customers.create({
        metadata: {
          userId,
          provider: 'stripe',
        },
      })
    }

    return {
      id: `stripe_${customer.id}`,
      providerCustomerId: customer.id,
      email: customer.email || undefined,
      userId,
      provider: 'stripe',
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      const stripeEvent = event.rawEvent as Stripe.Event

      switch (stripeEvent.type) {
        case 'customer.created':
        case 'customer.updated': {
          const customer = stripeEvent.data.object as Stripe.Customer
          return {
            processed: true,
            customer: {
              id: `stripe_${customer.id}`,
              providerCustomerId: customer.id,
              email: customer.email || undefined,
              userId: customer.metadata.userId || '',
              provider: 'stripe',
            },
          }
        }

        case 'invoice.payment_succeeded': {
          const invoice = stripeEvent.data.object as Stripe.Invoice
          return {
            processed: true,
            payment: {
              id: `stripe_${invoice.id}`,
              providerPaymentId: invoice.id,
              userId: (invoice as any).customer_metadata?.userId || '',
              customerId:
                typeof invoice.customer === 'string' ? `stripe_${invoice.customer}` : undefined,
              type: 'one_time',
              status: 'succeeded',
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              description: `Payment`,
              provider: 'stripe',
            },
          }
        }

        case 'checkout.session.completed': {
          return { processed: true }
        }
      }

      return { processed: true }
    } catch (error) {
      console.error('Stripe webhook processing error:', error)
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async validateWebhook(rawBody: string, signature: string): Promise<boolean> {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook validation')
    }

    try {
      this.stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
      return true
    } catch (error) {
      console.error('Stripe webhook signature validation failed:', error)
      return false
    }
  }
}
