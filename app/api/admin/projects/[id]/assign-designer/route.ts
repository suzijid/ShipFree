import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, contractor, designServiceBooking, projectEvent } from '@/database/schema'

const assignDesignerSchema = z.object({
  bookingId: z.string(),
  designerId: z.string(), // contractor.id (designer profile)
})

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const result = await requireAdminApi()
  if (result.error) return result.error

  const { id } = await params
  const body = await req.json()
  const parsed = assignDesignerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Donn\u00e9es invalides' }, { status: 400 })
  }

  // Verify project exists
  const [p] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.id, id))
    .limit(1)
  if (!p) return NextResponse.json({ error: 'Projet non trouv\u00e9' }, { status: 404 })

  // Verify the booking exists and belongs to this project
  const [booking] = await db
    .select({ id: designServiceBooking.id, status: designServiceBooking.status })
    .from(designServiceBooking)
    .where(eq(designServiceBooking.id, parsed.data.bookingId))
    .limit(1)
  if (!booking) return NextResponse.json({ error: 'R\u00e9servation non trouv\u00e9e' }, { status: 404 })

  // Verify the designer (contractor) exists
  const [c] = await db
    .select({ id: contractor.id })
    .from(contractor)
    .where(eq(contractor.id, parsed.data.designerId))
    .limit(1)
  if (!c) return NextResponse.json({ error: 'Designer non trouv\u00e9' }, { status: 404 })

  // Update the booking with the designer and advance status
  await db
    .update(designServiceBooking)
    .set({
      designerId: parsed.data.designerId,
      status: 'assignation_designer',
    })
    .where(eq(designServiceBooking.id, parsed.data.bookingId))

  // Log event
  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'assignment',
    data: {
      designerId: parsed.data.designerId,
      bookingId: parsed.data.bookingId,
      action: 'designer_assigned',
    },
  })

  return NextResponse.json({ success: true }, { status: 200 })
}
