import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and, or, desc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { document, user } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const access = await getProjectAccess(id, session.user.id)
  if (!access) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  // Get the document
  const [doc] = await db
    .select()
    .from(document)
    .where(and(eq(document.id, docId), eq(document.projectId, id)))
    .limit(1)

  if (!doc) {
    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
  }

  // Find the root document ID
  const rootId = doc.parentDocumentId || doc.id

  // Fetch all versions (root + children)
  const versions = await db
    .select({
      id: document.id,
      name: document.name,
      url: document.url,
      mimeType: document.mimeType,
      size: document.size,
      category: document.category,
      version: document.version,
      parentDocumentId: document.parentDocumentId,
      createdAt: document.createdAt,
      uploadedByName: user.name,
    })
    .from(document)
    .innerJoin(user, eq(document.uploadedById, user.id))
    .where(
      and(
        eq(document.projectId, id),
        or(eq(document.id, rootId), eq(document.parentDocumentId, rootId))
      )
    )
    .orderBy(desc(document.version))

  return NextResponse.json({ versions })
}
