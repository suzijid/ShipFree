import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { contractor } from '@/database/schema'

export const PATCH = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const result = await requireAdminApi()
  if (result.error) return result.error

  const { id } = await params

  const [existing] = await db
    .select({ id: contractor.id, isVerified: contractor.isVerified })
    .from(contractor)
    .where(eq(contractor.id, id))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: 'Artisan non trouvé' }, { status: 404 })
  }

  const newVerified = !existing.isVerified

  await db
    .update(contractor)
    .set({
      isVerified: newVerified,
      verifiedAt: newVerified ? new Date() : null,
    })
    .where(eq(contractor.id, id))

  return NextResponse.json({ isVerified: newVerified })
}
