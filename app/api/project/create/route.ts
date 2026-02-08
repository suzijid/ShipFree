import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { project } from '@/database/schema'
import { generateProjectSheet, type QuestionnaireInput } from '@/lib/ai/project-summary'

const questionnaireSchema = z.object({
  propertyType: z.string().min(1),
  renovationType: z.string().min(1),
  surface: z.string(),
  rooms: z.array(z.string()),
  workDescription: z.string().min(10),
  constraints: z.array(z.string()),
  style: z.string(),
  budgetRange: z.string().min(1),
  urgency: z.string().min(1),
  postalCode: z.string().min(4),
  city: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Parse and validate body
    const body = await req.json()
    const parsed = questionnaireSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input: QuestionnaireInput = parsed.data

    // Generate AI project sheet
    const sheet = await generateProjectSheet(input)

    // Create project in database
    const projectId = crypto.randomUUID()

    await db.insert(project).values({
      id: projectId,
      userId: session.user.id,
      title: sheet.title,
      status: 'draft',
      aiSummary: {
        ...sheet.summary,
        structuredSummary: sheet.structuredSummary,
      },
      propertyType: input.propertyType,
      surface: input.surface || null,
      rooms: input.rooms,
      budgetRange: input.budgetRange,
      style: input.style,
      postalCode: input.postalCode,
      city: input.city,
    })

    return NextResponse.json({
      projectId,
      title: sheet.title,
      structuredSummary: sheet.structuredSummary,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}
