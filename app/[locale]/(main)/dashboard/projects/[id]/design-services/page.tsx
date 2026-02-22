import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { designServiceBooking, contractor, user } from '@/database/schema'
import { DesignServicesContent } from './design-services-content'

export default async function DesignServicesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const { id } = await params
  const access = await getProjectAccess(id, session.user.id)
  if (!access) redirect('/dashboard')

  const bookingsRaw = await db
    .select({
      id: designServiceBooking.id,
      type: designServiceBooking.type,
      status: designServiceBooking.status,
      amount: designServiceBooking.amount,
      stripePaymentId: designServiceBooking.stripePaymentId,
      scheduledAt: designServiceBooking.scheduledAt,
      deliveredAt: designServiceBooking.deliveredAt,
      deliverables: designServiceBooking.deliverables,
      createdAt: designServiceBooking.createdAt,
      designerId: designServiceBooking.designerId,
    })
    .from(designServiceBooking)
    .where(eq(designServiceBooking.projectId, id))

  // Fetch designer info for bookings that have a designerId
  const designerIds = [...new Set(bookingsRaw.filter((b) => b.designerId).map((b) => b.designerId!))]
  const designerMap = new Map<string, { name: string; image: string | null; companyName: string }>()

  if (designerIds.length > 0) {
    for (const dId of designerIds) {
      const [result] = await db
        .select({
          name: user.name,
          image: user.image,
          companyName: contractor.companyName,
        })
        .from(contractor)
        .innerJoin(user, eq(contractor.userId, user.id))
        .where(eq(contractor.id, dId))
        .limit(1)
      if (result) {
        designerMap.set(dId, result)
      }
    }
  }

  const bookings = bookingsRaw.map((b) => {
    const designer = b.designerId ? designerMap.get(b.designerId) : null
    return {
      id: b.id,
      type: b.type,
      status: b.status,
      amount: b.amount,
      stripePaymentId: b.stripePaymentId,
      scheduledAt: b.scheduledAt,
      deliveredAt: b.deliveredAt,
      deliverables: b.deliverables,
      createdAt: b.createdAt,
      designerName: designer?.name ?? null,
      designerImage: designer?.image ?? null,
      designerCompany: designer?.companyName ?? null,
    }
  })

  return (
    <DesignServicesContent
      projectId={id}
      bookings={bookings}
    />
  )
}
