import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, asc, and } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { message, user, messageChannel, contractor, project } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'
import { storage } from '@/lib/storage'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/project'
import { notificationService } from '@/lib/notifications/notification-service'
import { renderNewMessageEmail, getEmailSubject } from '@/components/emails'

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
  const channelId = url.searchParams.get('channelId')

  const conditions = [eq(message.projectId, id)]
  if (channelId) {
    // Verify user can access this channel
    const [channel] = await db
      .select()
      .from(messageChannel)
      .where(and(eq(messageChannel.id, channelId), eq(messageChannel.projectId, id)))
      .limit(1)

    if (!channel) {
      return NextResponse.json({ error: 'Canal non trouvé' }, { status: 404 })
    }

    // Check private channel access
    if (channel.type === 'private_contractor') {
      const canAccess = access.role === 'owner' || access.role === 'manager' || access.role === 'admin'
      if (!canAccess && access.role === 'contractor' && channel.contractorId) {
        // Contractor can only access their own private channel
        const [contractorRecord] = await db
          .select({ id: contractor.id })
          .from(contractor)
          .where(eq(contractor.userId, session.user.id))
          .limit(1)
        if (!contractorRecord || contractorRecord.id !== channel.contractorId) {
          return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
        }
      }
    }

    conditions.push(eq(message.channelId, channelId))
  }

  const messages = await db
    .select({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: user.name,
      senderRole: user.role,
      channelId: message.channelId,
      attachments: message.attachments,
      createdAt: message.createdAt,
    })
    .from(message)
    .innerJoin(user, eq(message.senderId, user.id))
    .where(and(...conditions))
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

  const contentType = req.headers.get('content-type') || ''

  let content: string
  let channelId: string | null = null
  let attachments: { name: string; url: string; type: string; size: number }[] | null = null

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload with message
    const formData = await req.formData()
    content = (formData.get('content') as string) || ''
    channelId = formData.get('channelId') as string | null
    const file = formData.get('file') as File | null

    if (!content && !file) {
      return NextResponse.json({ error: 'Message ou fichier requis' }, { status: 400 })
    }

    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
        return NextResponse.json(
          { error: 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Fichier trop volumineux. Taille maximale : 10 Mo' },
          { status: 400 }
        )
      }

      const fileId = crypto.randomUUID()
      const key = `projects/${id}/messages/${fileId}-${file.name}`

      const buffer = Buffer.from(await file.arrayBuffer())
      const { url } = await storage.upload({
        key,
        body: buffer,
        opts: { contentType: file.type },
        bucket: 'public',
      })

      attachments = [{ name: file.name, url, type: file.type, size: file.size }]
    }

    // Default content for attachment-only messages
    if (!content && attachments) {
      content = ''
    }
  } else {
    // Handle JSON message
    const body = await req.json()
    const messageSchema = z.object({
      content: z.string().max(5000),
      channelId: z.string().nullable().optional(),
    })
    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
    }
    content = parsed.data.content
    channelId = parsed.data.channelId || null
  }

  if (!content && !attachments) {
    return NextResponse.json({ error: 'Message ou fichier requis' }, { status: 400 })
  }

  // Validate channel access if provided
  if (channelId) {
    const [channel] = await db
      .select()
      .from(messageChannel)
      .where(and(eq(messageChannel.id, channelId), eq(messageChannel.projectId, id)))
      .limit(1)

    if (!channel) {
      return NextResponse.json({ error: 'Canal non trouvé' }, { status: 404 })
    }

    if (channel.type === 'private_contractor' && access.role === 'contractor' && channel.contractorId) {
      const [contractorRecord] = await db
        .select({ id: contractor.id })
        .from(contractor)
        .where(eq(contractor.userId, session.user.id))
        .limit(1)
      if (!contractorRecord || contractorRecord.id !== channel.contractorId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    }
  }

  const msgId = crypto.randomUUID()

  await db.insert(message).values({
    id: msgId,
    projectId: id,
    channelId,
    senderId: session.user.id,
    content: content || '',
    attachments,
  })

  // Determine the role label
  let senderRole = 'client'
  if (access.role === 'owner') senderRole = 'client'
  else if (access.role === 'manager') senderRole = 'manager'
  else if (access.role === 'admin') senderRole = 'admin'
  else if (access.role === 'contractor') senderRole = 'contractor'

  // ── Notification trigger ─────────────────────────────────────────
  try {
    const projectTitle = access.project.title || 'votre projet'
    const senderName = session.user.name || 'Un participant'
    const messagePreview = (content || '').slice(0, 100)
    const link = `/dashboard/projects/${id}/messages`

    await notificationService.createForProject({
      projectId: id,
      type: 'new_message',
      title: `Nouveau message de ${senderName}`,
      body: messagePreview || 'Pièce jointe envoyée',
      link,
      excludeUserId: session.user.id,
    })

    // Send email notifications to project members
    const [p] = await db
      .select({ userId: project.userId, managerId: project.managerId })
      .from(project)
      .where(eq(project.id, id))
      .limit(1)

    if (p) {
      const memberIds = new Set<string>()
      memberIds.add(p.userId)
      if (p.managerId) memberIds.add(p.managerId)
      memberIds.delete(session.user.id)

      const html = await renderNewMessageEmail({
        senderName,
        projectTitle,
        messagePreview: messagePreview || undefined,
        projectLink: link,
      })

      for (const memberId of memberIds) {
        notificationService.sendEmail(memberId, 'new_message', {
          subject: getEmailSubject('new-message'),
          html,
        }).catch(() => {})
      }
    }
  } catch (err) {
    console.error('[notifications] Failed to send new_message notification:', err)
  }

  return NextResponse.json({
    id: msgId,
    content: content || '',
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole,
    channelId,
    attachments,
    createdAt: new Date(),
  })
}
