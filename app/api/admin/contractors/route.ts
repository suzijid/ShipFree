import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { contractor, user } from '@/database/schema'

export const GET = async () => {
  const result = await requireAdminApi()
  if (result.error) return result.error

  const contractors = await db
    .select({
      id: contractor.id,
      userId: contractor.userId,
      companyName: contractor.companyName,
      siret: contractor.siret,
      specialties: contractor.specialties,
      serviceArea: contractor.serviceArea,
      description: contractor.description,
      stripeConnectStatus: contractor.stripeConnectStatus,
      isVerified: contractor.isVerified,
      verifiedAt: contractor.verifiedAt,
      rating: contractor.rating,
      reviewCount: contractor.reviewCount,
      createdAt: contractor.createdAt,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    })
    .from(contractor)
    .innerJoin(user, eq(contractor.userId, user.id))
    .orderBy(desc(contractor.createdAt))

  return NextResponse.json(contractors)
}
