import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and, desc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { document, user } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'
import { storage } from '@/lib/storage'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, FILE_CATEGORIES } from '@/config/project'
import { notificationService } from '@/lib/notifications/notification-service'
import { renderDocumentUploadedEmail, getEmailSubject } from '@/components/emails'

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

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const category = formData.get('category') as string | null

  if (!file) {
    return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
  }

  if (!category || !FILE_CATEGORIES.includes(category as typeof FILE_CATEGORIES[number])) {
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 })
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
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

  // Check for existing document with the same name and category for versioning
  const existingDocs = await db
    .select()
    .from(document)
    .where(
      and(
        eq(document.projectId, id),
        eq(document.name, file.name),
        eq(document.category, category)
      )
    )
    .orderBy(desc(document.version))
    .limit(1)

  let version = 1
  let parentDocumentId: string | null = null

  if (existingDocs.length > 0) {
    const existing = existingDocs[0]
    // The parent is the original document (first version)
    parentDocumentId = existing.parentDocumentId || existing.id
    version = (existing.version ?? 1) + 1
  }

  const docId = crypto.randomUUID()
  const key = `projects/${id}/documents/${docId}-${file.name}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { url } = await storage.upload({
    key,
    body: buffer,
    opts: { contentType: file.type },
    bucket: 'public',
  })

  await db.insert(document).values({
    id: docId,
    projectId: id,
    uploadedById: session.user.id,
    name: file.name,
    url,
    mimeType: file.type,
    size: file.size,
    category,
    version,
    parentDocumentId,
  })

  // Fetch uploader name for client state update
  const [uploader] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  // ── Notification trigger ─────────────────────────────────────────
  try {
    const projectTitle = access.project.title || 'votre projet'
    const uploaderName = uploader?.name ?? session.user.name
    const link = `/dashboard/projects/${id}/documents`

    await notificationService.createForProject({
      projectId: id,
      type: 'document_uploaded',
      title: `Nouveau document : ${file.name}`,
      body: `${uploaderName} a ajouté un document dans ${projectTitle}`,
      link,
      excludeUserId: session.user.id,
    })

    // Send email to project members
    const html = await renderDocumentUploadedEmail({
      projectTitle,
      documentName: file.name,
      uploaderName,
      projectLink: link,
    })

    // Get project members for email
    const { project: proj } = access
    const memberIds = new Set<string>()
    memberIds.add(proj.userId)
    if (proj.managerId) memberIds.add(proj.managerId)
    memberIds.delete(session.user.id)

    for (const memberId of memberIds) {
      notificationService.sendEmail(memberId, 'document_uploaded', {
        subject: getEmailSubject('document-uploaded'),
        html,
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[notifications] Failed to send document_uploaded notification:', err)
  }

  return NextResponse.json({
    id: docId,
    name: file.name,
    url,
    mimeType: file.type,
    size: file.size,
    category,
    version,
    parentDocumentId,
    createdAt: new Date(),
    uploadedByName: uploader?.name ?? session.user.name,
  })
}
