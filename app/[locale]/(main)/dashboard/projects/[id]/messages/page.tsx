import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { message, user } from '@/database/schema'
import { MessagesContent } from './messages-content'

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const msgs = await db
    .select({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: user.name,
      senderRole: user.role,
      createdAt: message.createdAt,
    })
    .from(message)
    .innerJoin(user, eq(message.senderId, user.id))
    .where(eq(message.projectId, id))
    .orderBy(asc(message.createdAt))

  return (
    <MessagesContent
      projectId={id}
      messages={msgs.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))}
      currentUserId={session.user.id}
    />
  )
}
