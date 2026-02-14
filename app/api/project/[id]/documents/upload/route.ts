import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { document, user } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'
import { storage } from '@/lib/storage'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, FILE_CATEGORIES } from '@/config/project'
import { eq } from 'drizzle-orm'

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
  })

  // Fetch uploader name for client state update
  const [uploader] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return NextResponse.json({
    id: docId,
    name: file.name,
    url,
    mimeType: file.type,
    size: file.size,
    category,
    createdAt: new Date(),
    uploadedByName: uploader?.name ?? session.user.name,
  })
}
