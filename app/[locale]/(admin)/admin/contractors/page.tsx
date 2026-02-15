import { desc, eq } from 'drizzle-orm'

import { db } from '@/database'
import { contractor, user } from '@/database/schema'
import { ContractorsList } from './contractors-list'

export default async function AdminContractorsPage() {
  const contractors = await db
    .select({
      id: contractor.id,
      companyName: contractor.companyName,
      siret: contractor.siret,
      specialties: contractor.specialties,
      serviceArea: contractor.serviceArea,
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

  return <ContractorsList contractors={contractors} />
}
