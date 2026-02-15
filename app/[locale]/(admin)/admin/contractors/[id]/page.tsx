import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/database'
import { contractor, user, projectContractor, project } from '@/database/schema'
import { ContractorDetail } from './contractor-detail'

export default async function AdminContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [c] = await db
    .select({
      id: contractor.id,
      userId: contractor.userId,
      companyName: contractor.companyName,
      siret: contractor.siret,
      specialties: contractor.specialties,
      serviceArea: contractor.serviceArea,
      description: contractor.description,
      portfolioImages: contractor.portfolioImages,
      certifications: contractor.certifications,
      insuranceExpiry: contractor.insuranceExpiry,
      stripeConnectAccountId: contractor.stripeConnectAccountId,
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
    .where(eq(contractor.id, id))
    .limit(1)

  if (!c) notFound()

  const assignments = await db
    .select({
      id: projectContractor.id,
      projectId: projectContractor.projectId,
      specialty: projectContractor.specialty,
      status: projectContractor.status,
      assignedAt: projectContractor.assignedAt,
      projectTitle: project.title,
      projectStatus: project.status,
    })
    .from(projectContractor)
    .innerJoin(project, eq(projectContractor.projectId, project.id))
    .where(eq(projectContractor.contractorId, id))

  return <ContractorDetail contractor={c} assignments={assignments} />
}
