import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, contractor, projectContractor, projectEvent } from '@/database/schema'

const assignSchema = z.object({
  contractorId: z.string(),
  specialty: z.string(),
})

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const result = await requireAdminApi()
  if (result.error) return result.error

  const { id } = await params
  const body = await req.json()
  const parsed = assignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  // Verify project exists
  const [p] = await db.select({ id: project.id }).from(project).where(eq(project.id, id)).limit(1)
  if (!p) return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })

  // Verify contractor exists and is verified
  const [c] = await db
    .select({ id: contractor.id, isVerified: contractor.isVerified })
    .from(contractor)
    .where(eq(contractor.id, parsed.data.contractorId))
    .limit(1)
  if (!c) return NextResponse.json({ error: 'Artisan non trouvé' }, { status: 404 })
  if (!c.isVerified) return NextResponse.json({ error: 'Artisan non vérifié' }, { status: 400 })

  // Check for duplicate
  const [existing] = await db
    .select({ id: projectContractor.id })
    .from(projectContractor)
    .where(
      and(
        eq(projectContractor.projectId, id),
        eq(projectContractor.contractorId, parsed.data.contractorId)
      )
    )
    .limit(1)
  if (existing) return NextResponse.json({ error: 'Artisan déjà assigné à ce projet' }, { status: 409 })

  const pcId = crypto.randomUUID()
  await db.insert(projectContractor).values({
    id: pcId,
    projectId: id,
    contractorId: parsed.data.contractorId,
    specialty: parsed.data.specialty,
    status: 'invited',
    assignedBy: result.session.user.id,
  })

  // Log event
  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'assignment',
    data: { contractorId: parsed.data.contractorId, specialty: parsed.data.specialty, action: 'assigned' },
  })

  // Update matching status
  await db.update(project).set({ matchingStatus: 'matching' }).where(eq(project.id, id))

  return NextResponse.json({ id: pcId }, { status: 201 })
}
