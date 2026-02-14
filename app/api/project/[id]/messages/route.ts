import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { message, user } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
})

export async function GET(
  _req: Request,
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

  const messages = await db
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

  return NextResponse.json(messages)
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

  const body = await req.json()
  const parsed = messageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
  }

  const msgId = crypto.randomUUID()

  await db.insert(message).values({
    id: msgId,
    projectId: id,
    senderId: session.user.id,
    content: parsed.data.content,
  })

  return NextResponse.json({
    id: msgId,
    content: parsed.data.content,
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole: access.role === 'owner' ? 'client' : session.user.name,
    createdAt: new Date(),
  })
}
