import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

import { requireContractorApi } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { projectContractor, proposal } from '@/database/schema'

const proposalSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
  startDate: z.string().datetime().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
})

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  const { id: projectId } = await params
  const body = await req.json()
  const parsed = proposalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  // Find the projectContractor for this contractor on this project
  const [pc] = await db
    .select()
    .from(projectContractor)
    .where(
      and(
        eq(projectContractor.projectId, projectId),
        eq(projectContractor.contractorId, result.contractor.id)
      )
    )
    .limit(1)

  if (!pc) return NextResponse.json({ error: 'Vous n\'êtes pas assigné à ce projet' }, { status: 403 })

  const proposalId = crypto.randomUUID()
  await db.insert(proposal).values({
    id: proposalId,
    projectContractorId: pc.id,
    amount: parsed.data.amount.toString(),
    description: parsed.data.description,
    estimatedDuration: parsed.data.estimatedDuration,
    startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
    attachments: parsed.data.attachments ?? [],
    status: 'submitted',
    submittedAt: new Date(),
  })

  // Update projectContractor status
  await db
    .update(projectContractor)
    .set({ status: 'proposal_sent' })
    .where(eq(projectContractor.id, pc.id))

  return NextResponse.json({ id: proposalId }, { status: 201 })
}

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  const { id: projectId } = await params
  const body = await req.json()
  const parsed = proposalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const [pc] = await db
    .select()
    .from(projectContractor)
    .where(
      and(
        eq(projectContractor.projectId, projectId),
        eq(projectContractor.contractorId, result.contractor.id)
      )
    )
    .limit(1)

  if (!pc) return NextResponse.json({ error: 'Vous n\'êtes pas assigné à ce projet' }, { status: 403 })

  // Find existing proposal
  const [existing] = await db
    .select()
    .from(proposal)
    .where(eq(proposal.projectContractorId, pc.id))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Aucune proposition existante' }, { status: 404 })

  await db
    .update(proposal)
    .set({
      amount: parsed.data.amount.toString(),
      description: parsed.data.description,
      estimatedDuration: parsed.data.estimatedDuration,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      attachments: parsed.data.attachments ?? existing.attachments,
      status: 'revised',
      submittedAt: new Date(),
    })
    .where(eq(proposal.id, existing.id))

  return NextResponse.json({ id: existing.id })
}
