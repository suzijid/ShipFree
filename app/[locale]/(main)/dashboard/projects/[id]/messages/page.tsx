import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { messageChannel } from '@/database/schema'
import { MessagesContent } from './messages-content'

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  // Fetch channels
  const channels = await db
    .select({
      id: messageChannel.id,
      name: messageChannel.name,
      label: messageChannel.label,
      type: messageChannel.type,
      contractorId: messageChannel.contractorId,
      order: messageChannel.order,
    })
    .from(messageChannel)
    .where(eq(messageChannel.projectId, id))
    .orderBy(asc(messageChannel.order))

  return (
    <MessagesContent
      projectId={id}
      channels={channels}
      currentUserId={session.user.id}
      currentUserName={session.user.name}
    />
  )
}
