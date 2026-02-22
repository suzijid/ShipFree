import { headers } from 'next/headers'
import { eq, asc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { document, user } from '@/database/schema'
import { DocumentsContent } from './documents-content'

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const docs = await db
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
    .where(eq(document.projectId, id))
    .orderBy(asc(document.createdAt))

  return (
    <DocumentsContent
      projectId={id}
      documents={docs.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      }))}
    />
  )
}
