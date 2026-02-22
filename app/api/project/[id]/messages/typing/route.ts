import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'

// In-memory typing indicators store
// Key: projectId:channelId, Value: Map of userId -> { name, timestamp }
const typingStore = new Map<string, Map<string, { name: string; timestamp: number }>>()

const TYPING_TIMEOUT = 5000 // 5 seconds

const cleanExpired = (storeKey: string) => {
  const users = typingStore.get(storeKey)
  if (!users) return
  const now = Date.now()
  for (const [userId, data] of users) {
    if (now - data.timestamp > TYPING_TIMEOUT) {
      users.delete(userId)
    }
  }
  if (users.size === 0) {
    typingStore.delete(storeKey)
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const url = new URL(req.url)
  const channelId = url.searchParams.get('channelId') || 'default'
  const storeKey = `${id}:${channelId}`

  cleanExpired(storeKey)

  const users = typingStore.get(storeKey)
  const typingUsers: { userId: string; name: string }[] = []

  if (users) {
    for (const [userId, data] of users) {
      if (userId !== session.user.id) {
        typingUsers.push({ userId, name: data.name })
      }
    }
  }

  return NextResponse.json({ typing: typingUsers })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const channelId = body.channelId || 'default'
  const storeKey = `${id}:${channelId}`

  if (!typingStore.has(storeKey)) {
    typingStore.set(storeKey, new Map())
  }

  typingStore.get(storeKey)!.set(session.user.id, {
    name: session.user.name,
    timestamp: Date.now(),
  })

  return NextResponse.json({ ok: true })
}
