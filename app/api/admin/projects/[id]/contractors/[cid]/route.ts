import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { projectContractor, projectEvent } from '@/database/schema'

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; cid: string }> }
) => {
  const result = await requireAdminApi()
  if (result.error) return result.error

  const { id, cid } = await params

  const [existing] = await db
    .select({ id: projectContractor.id, contractorId: projectContractor.contractorId })
    .from(projectContractor)
    .where(
      and(
        eq(projectContractor.projectId, id),
        eq(projectContractor.id, cid)
      )
    )
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Assignation non trouvée' }, { status: 404 })

  await db.delete(projectContractor).where(eq(projectContractor.id, cid))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'assignment',
    data: { contractorId: existing.contractorId, action: 'removed' },
  })

  return NextResponse.json({ success: true })
}
