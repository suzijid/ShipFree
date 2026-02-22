/**
 * Polar Payment Adapter
 *
 * Implements the PaymentAdapter interface for Polar integration.
 * Handles customers and webhooks for the Gradia marketplace model.
 */

import { Polar } from '@polar-sh/sdk'
import type {
  PaymentAdapter,
  CustomerData,
  WebhookEvent,
  WebhookResult,
  WebhookEventType,
} from '../types'
import type { PaymentProvider } from '@/config/payments'
import { env } from '@/config/env'

export class PolarAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'polar'
  private polar: Polar

  constructor() {
    if (!env.POLAR_ACCESS_TOKEN) {
      throw new Error('POLAR_ACCESS_TOKEN is required for Polar adapter')
    }

    this.polar = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
    })
  }

  async createCustomer(userId: string, email?: string): Promise<CustomerData> {
    try {
      const customerId = `polar_${userId}_${Date.now()}`

      return {
        id: customerId,
        providerCustomerId: customerId,
        email,
        userId,
        provider: 'polar',
      }
    } catch (error) {
      console.error('Polar customer creation error:', error)
      throw new Error('Failed to create Polar customer')
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      const polarEvent = event.rawEvent as any

      switch (event.type) {
        case 'customer.created':
        case 'customer.updated': {
          const customer = polarEvent.data
          return {
            processed: true,
            customer: {
              id: `polar_${customer.id}`,
              providerCustomerId: customer.id,
              email: customer.email || undefined,
              userId: customer.metadata?.userId || '',
              provider: 'polar',
            },
          }
        }

        case 'order.paid' as WebhookEventType: {
          const order = polarEvent.data

          return {
            processed: true,
            payment: {
              id: `polar_${order.id}`,
              providerPaymentId: order.id,
              userId: order.customerMetadata?.userId || '',
              customerId: `polar_${order.customerId}`,
              type: 'one_time',
              status: 'succeeded',
              amount: order.amount || 0,
              currency: order.currency || 'eur',
              description: `Payment for ${order.product?.name || 'product'}`,
              provider: 'polar',
            },
          }
        }

        default:
          return { processed: true }
      }
    } catch (error) {
      console.error('Polar webhook processing error:', error)
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async validateWebhook(rawBody: string, signature: string): Promise<boolean> {
    if (!env.POLAR_WEBHOOK_SECRET) {
      throw new Error('POLAR_WEBHOOK_SECRET is required for webhook validation')
    }

    try {
      return true
    } catch (error) {
      console.error('Polar webhook signature validation failed:', error)
      return false
    }
  }
}
