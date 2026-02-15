import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { requireContractorApi } from '@/lib/auth/require-contractor'
import { db } from '@/database'
import { contractor } from '@/database/schema'
import { CONTRACTOR_SPECIALTIES } from '@/config/project'

export const GET = async () => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  return NextResponse.json(result.contractor)
}

const updateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  siret: z.string().optional(),
  specialties: z.array(z.enum(CONTRACTOR_SPECIALTIES)).min(1).optional(),
  serviceArea: z.array(z.string()).min(1).optional(),
  description: z.string().optional(),
  portfolioImages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  insuranceExpiry: z.string().datetime().optional(),
})

export const PATCH = async (req: Request) => {
  const result = await requireContractorApi()
  if (result.error) return result.error

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.companyName) updates.companyName = parsed.data.companyName
  if (parsed.data.siret !== undefined) updates.siret = parsed.data.siret
  if (parsed.data.specialties) updates.specialties = parsed.data.specialties
  if (parsed.data.serviceArea) updates.serviceArea = parsed.data.serviceArea
  if (parsed.data.description !== undefined) updates.description = parsed.data.description
  if (parsed.data.portfolioImages) updates.portfolioImages = parsed.data.portfolioImages
  if (parsed.data.certifications) updates.certifications = parsed.data.certifications
  if (parsed.data.insuranceExpiry) updates.insuranceExpiry = new Date(parsed.data.insuranceExpiry)

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }

  await db.update(contractor).set(updates).where(eq(contractor.id, result.contractor.id))

  const [updated] = await db
    .select()
    .from(contractor)
    .where(eq(contractor.id, result.contractor.id))
    .limit(1)

  return NextResponse.json(updated)
}
