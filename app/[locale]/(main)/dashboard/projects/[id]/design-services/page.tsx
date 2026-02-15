import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { getProjectAccess } from '@/lib/auth/project-access'
import { db } from '@/database'
import { designServiceBooking } from '@/database/schema'
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

  const bookings = await db
    .select()
    .from(designServiceBooking)
    .where(eq(designServiceBooking.projectId, id))

  return (
    <DesignServicesContent
      projectId={id}
      bookings={bookings}
    />
  )
}
