import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { notificationPreference } from '@/database/schema'
import { notificationService } from '@/lib/notifications/notification-service'

/**
 * GET /api/notifications/preferences
 * List all notification preferences for the authenticated user.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const prefs = await notificationService.getUserPreferences(session.user.id)

  return NextResponse.json({ preferences: prefs })
}

/**
 * PATCH /api/notifications/preferences
 * Update a specific notification preference.
 * Body: { channel: string, notificationType: string, enabled: boolean }
 */
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()

  const schema = z.object({
    channel: z.enum(['in_app', 'email', 'push', 'sms']),
    notificationType: z.string().min(1),
    enabled: z.boolean(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { channel, notificationType, enabled } = parsed.data

  // Check if preference exists
  const [existing] = await db
    .select()
    .from(notificationPreference)
    .where(
      and(
        eq(notificationPreference.userId, session.user.id),
        eq(notificationPreference.channel, channel),
        eq(notificationPreference.notificationType, notificationType)
      )
    )
    .limit(1)

  if (existing) {
    await db
      .update(notificationPreference)
      .set({ enabled })
      .where(eq(notificationPreference.id, existing.id))
  } else {
    await db.insert(notificationPreference).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      channel,
      notificationType,
      enabled,
    })
  }

  return NextResponse.json({ success: true })
}
