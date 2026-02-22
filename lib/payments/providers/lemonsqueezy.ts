/**
 * Lemon Squeezy Payment Adapter
 *
 * Implements the PaymentAdapter interface for Lemon Squeezy integration.
 * Handles customers and webhooks for the Gradia marketplace model.
 *
 * Dependency: @lemonsqueezy/lemonsqueezy.js
 */

import {
  lemonSqueezySetup,
  listCustomers,
} from '@lemonsqueezy/lemonsqueezy.js'
import type {
  PaymentAdapter,
  CustomerData,
  WebhookEvent,
  WebhookResult,
} from '../types'
import type { PaymentProvider } from '@/config/payments'
import crypto from 'crypto'

export class LemonSqueezyAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'lemonsqueezy'

  constructor() {
    if (process.env.LEMONSQUEEZY_API_KEY) {
      lemonSqueezySetup({
        apiKey: process.env.LEMONSQUEEZY_API_KEY,
        onError: (error: any) => console.error('Lemon Squeezy API Error:', error),
      })
    }
  }

  async createCustomer(userId: string, email?: string): Promise<CustomerData> {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID is required')

    if (email) {
      const { data } = await listCustomers({
        filter: { email },
        page: { size: 1 },
      })

      if (data?.data && data.data.length > 0) {
        const customer = data.data[0]
        return {
          id: `ls_${customer.id}`,
          providerCustomerId: customer.id,
          email: customer.attributes.email,
          userId,
          provider: 'lemonsqueezy',
        }
      }
    }

    const customerId = `ls_pending_${userId}`
    return {
      id: customerId,
      providerCustomerId: customerId,
      email,
      userId,
      provider: 'lemonsqueezy',
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    const body = event.rawEvent
    const eventName = body.meta.event_name
    const data = body.data

    switch (eventName) {
      case 'order_created': {
        const attrs = data.attributes
        return {
          processed: true,
          payment: {
            id: `ls_${data.id}`,
            providerPaymentId: data.id,
            userId: body.meta.custom_data?.user_id || '',
            customerId: `ls_${attrs.customer_id}`,
            type: 'one_time',
            status: attrs.status === 'paid' ? 'succeeded' : 'pending',
            amount: attrs.total / 100,
            currency: attrs.currency,
            description: `Order ${data.id}`,
            provider: 'lemonsqueezy',
          },
        }
      }

      default:
        return { processed: true }
    }
  }

  async validateWebhook(rawBody: string, signature: string): Promise<boolean> {
    if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
      throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is required')
    }

    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signatureBuffer = Buffer.from(signature, 'utf8')

    return crypto.timingSafeEqual(digest, signatureBuffer)
  }
}
