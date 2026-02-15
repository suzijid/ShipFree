import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import Stripe from 'stripe'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { designServiceBooking, project } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'
import { env } from '@/config/env'
import { DESIGN_SERVICE_PRICING, type DesignServicePricingKey } from '@/config/payments'

const bookSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(['consultation', '2d_plans', '3d_renders', 'full_package']),
})

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const { projectId, type } = parsed.data

  // Verify project access
  const access = await getProjectAccess(projectId, session.user.id)
  if (!access || access.role === 'contractor') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  }

  const pricing = DESIGN_SERVICE_PRICING[type as DesignServicePricingKey]
  if (!pricing) {
    return NextResponse.json({ error: 'Type de service inconnu' }, { status: 400 })
  }

  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Paiement non configuré' }, { status: 500 })
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)

  const bookingId = crypto.randomUUID()

  // Create Stripe Checkout session (one-time payment, NOT Connect)
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.user.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: pricing.label,
            description: `Service design pour votre projet de rénovation`,
          },
          unit_amount: pricing.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId,
      projectId,
      userId: session.user.id,
      type,
    },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}/design-services?booking=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}/design-services?booking=cancelled`,
  })

  // Create booking record
  await db.insert(designServiceBooking).values({
    id: bookingId,
    projectId,
    userId: session.user.id,
    type,
    status: 'pending',
    amount: (pricing.amount / 100).toFixed(2),
    stripePaymentId: checkoutSession.id,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
