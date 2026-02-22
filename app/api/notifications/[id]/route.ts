import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth/auth'
import { notificationService } from '@/lib/notifications/notification-service'

/**
 * DELETE /api/notifications/[id]
 * Delete a single notification by ID (must belong to the authenticated user).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  await notificationService.delete(id, session.user.id)

  return NextResponse.json({ success: true })
}
