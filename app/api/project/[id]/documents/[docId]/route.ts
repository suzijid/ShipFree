import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { document } from '@/database/schema'
import { getProjectAccess } from '@/lib/auth/project-access'
import { storage } from '@/lib/storage'
import { env } from '@/config/env'

export async function DELETE(
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

  // Fetch the document and verify it belongs to this project
  const [doc] = await db
    .select()
    .from(document)
    .where(and(eq(document.id, docId), eq(document.projectId, id)))
    .limit(1)

  if (!doc) {
    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
  }

  // Owner can only delete their own uploads; manager/admin can delete any
  if (access.role === 'owner' && doc.uploadedById !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Delete from R2
  if (env.R2_BUCKET_URL) {
    const key = doc.url.replace(env.R2_BUCKET_URL + '/', '')
    await storage.delete({ key })
  }

  // Delete from DB
  await db.delete(document).where(eq(document.id, docId))

  return NextResponse.json({ success: true })
}
