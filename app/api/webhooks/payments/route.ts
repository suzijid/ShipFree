import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { getPaymentAdapter } from '@/lib/payments/service'
import { db } from '@/database'
import { customer, payment, designServiceBooking, project, projectEvent } from '@/database/schema'
import type { WebhookEvent } from '@/lib/payments/types'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const headerList = await headers()

    const adapter = getPaymentAdapter()
    const provider = adapter.provider

    // 1. Verify signature based on active provider
    let isValid = false
    let signature = ''

    switch (provider) {
      case 'stripe':
        signature = headerList.get('stripe-signature') || ''
        break
      case 'polar':
        signature = headerList.get('polar-webhook-signature') || ''
        break
      case 'lemonsqueezy':
        signature = headerList.get('x-signature') || ''
        break
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    isValid = await adapter.validateWebhook(rawBody, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Parse event
    let event: WebhookEvent

    try {
      const parsedBody = JSON.parse(rawBody)

      // Each adapter should handle raw parsing in processWebhook,
      // but here we just construct the generic event structure
      // Note: We might need provider-specific parsing here if the raw structure varies significantly
      // For now, we pass the parsed body as rawEvent

      // Determine event type based on provider (simplified)
      let type: WebhookEvent['type'] | undefined

      if (provider === 'stripe') {
        type = parsedBody.type
      } else if (provider === 'polar') {
        type = parsedBody.type
      } else if (provider === 'lemonsqueezy') {
        // Lemon Squeezy event name is in meta.event_name
        type = parsedBody.meta?.event_name
      }

      if (!type) {
        // Fallback or ignore
        return NextResponse.json({ processed: true })
      }

      event = {
        type: type as WebhookEvent['type'],
        provider,
        data:
          provider === 'lemonsqueezy'
            ? parsedBody
            : parsedBody.data?.object || parsedBody.data || parsedBody,
        rawEvent: parsedBody,
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // 3. Process event via adapter
    const result = await adapter.processWebhook(event)

    if (result.error) {
      console.error('Webhook processing error:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // 4. Update database
    if (result.processed) {
      // Handle customer updates
      if (result.customer) {
        const existingCustomer = await db.query.customer.findFirst({
          where: eq(customer.providerCustomerId, result.customer.providerCustomerId),
        })

        if (existingCustomer) {
          await db
            .update(customer)
            .set({
              email: result.customer.email,
              updatedAt: new Date(),
            })
            .where(eq(customer.id, existingCustomer.id))
        } else if (result.customer.userId) {
          // Only create if we have a userId
          await db.insert(customer).values({
            id: result.customer.id,
            userId: result.customer.userId,
            provider: result.customer.provider,
            providerCustomerId: result.customer.providerCustomerId,
            email: result.customer.email,
          })
        }
      }

      // Handle payment updates
      if (result.payment) {
        const existingPayment = await db.query.payment.findFirst({
          where: eq(payment.providerPaymentId, result.payment.providerPaymentId),
        })

        // Resolve references
        const dbCustomerId = result.payment.customerId
        const dbSubscriptionId = result.payment.subscriptionId

        if (existingPayment) {
          await db
            .update(payment)
            .set({
              status: result.payment.status,
              updatedAt: new Date(),
            })
            .where(eq(payment.id, existingPayment.id))
        } else if (result.payment.userId) {
          await db.insert(payment).values({
            id: result.payment.id,
            userId: result.payment.userId,
            customerId: dbCustomerId,
            subscriptionId: dbSubscriptionId,
            provider: result.payment.provider as any, // Cast if needed
            providerPaymentId: result.payment.providerPaymentId,
            type: result.payment.type,
            status: result.payment.status,
            amount: result.payment.amount.toString(),
            currency: result.payment.currency,
            description: result.payment.description,
          })
        }

      }

      // Handle design service payment auto-activation
      // For Stripe checkout.session.completed with design-service metadata
      if (
        event.type === 'checkout.session.completed' &&
        event.data?.metadata?.type === 'design-service'
      ) {
        const metadata = event.data.metadata as Record<string, string>
        const bookingId = metadata.bookingId
        const projectId = metadata.projectId

        if (bookingId) {
          await db
            .update(designServiceBooking)
            .set({
              status: 'scheduled',
              stripePaymentId: (event.data as Record<string, unknown>).payment_intent as string ?? null,
            })
            .where(eq(designServiceBooking.id, bookingId))
        }

        if (projectId) {
          // Activate design module on the project
          const [p] = await db
            .select({ modules: project.modules })
            .from(project)
            .where(eq(project.id, projectId))
            .limit(1)

          if (p) {
            const currentModules = p.modules as { design: boolean; works: boolean; wallet: boolean }
            await db
              .update(project)
              .set({
                modules: { ...currentModules, design: true },
              })
              .where(eq(project.id, projectId))
          }

          await db.insert(projectEvent).values({
            id: crypto.randomUUID(),
            projectId,
            type: 'module_activated',
            data: {
              module: 'design',
              bookingId,
              trigger: 'design_service_payment',
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
