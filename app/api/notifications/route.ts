import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { notificationService } from '@/lib/notifications/notification-service'

/**
 * GET /api/notifications
 * List notifications for the authenticated user with pagination.
 */
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))

  const result = await notificationService.getNotifications(session.user.id, page, limit)

  return NextResponse.json(result)
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read.
 * Body: { id: string } or { all: true }
 */
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()

  const schema = z.union([
    z.object({ id: z.string() }),
    z.object({ all: z.literal(true) }),
  ])

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  if ('all' in parsed.data) {
    await notificationService.markAllAsRead(session.user.id)
  } else {
    await notificationService.markAsRead(parsed.data.id, session.user.id)
  }

  return NextResponse.json({ success: true })
}
