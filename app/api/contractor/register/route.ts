import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user, contractor } from '@/database/schema'
import { CONTRACTOR_SPECIALTIES } from '@/config/project'

const registerSchema = z.object({
  companyName: z.string().min(2).max(200),
  siret: z.string().optional(),
  specialties: z.array(z.enum(CONTRACTOR_SPECIALTIES)).min(1),
  serviceArea: z.array(z.string()).min(1),
  description: z.string().optional(),
})

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  // Check if already a contractor
  const [existing] = await db
    .select({ id: contractor.id })
    .from(contractor)
    .where(eq(contractor.userId, session.user.id))
    .limit(1)

  if (existing) {
    return NextResponse.json({ error: 'Un profil artisan existe déjà' }, { status: 409 })
  }

  const id = crypto.randomUUID()

  await db.insert(contractor).values({
    id,
    userId: session.user.id,
    companyName: parsed.data.companyName,
    siret: parsed.data.siret,
    specialties: parsed.data.specialties,
    serviceArea: parsed.data.serviceArea,
    description: parsed.data.description,
  })

  // Update user role
  await db.update(user).set({ role: 'contractor' }).where(eq(user.id, session.user.id))

  return NextResponse.json({ id }, { status: 201 })
}
