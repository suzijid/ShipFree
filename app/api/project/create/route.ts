import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { project, projectAction, projectValidation, messageChannel } from '@/database/schema'
import {
  ACTION_TEMPLATES,
  VALIDATION_TEMPLATES,
  DEFAULT_CHANNELS,
  PROPERTY_TYPE_LABELS,
  type ProjectServices,
  type ProjectPhase,
  type PropertyType,
} from '@/config/project'

const RENOVATION_LABELS: Record<string, string> = {
  complete: 'Rénovation complète',
  partielle: 'Rénovation partielle',
  extension: 'Extension',
  amenagement: 'Aménagement',
  decoration: 'Décoration',
}

const questionnaireSchema = z.object({
  propertyType: z.string().min(1),
  ownershipStatus: z.enum(['owner', 'buying', 'tenant']).optional().default('owner'),
  renovationType: z.string().min(1),
  surface: z.string(),
  rooms: z.union([
    z.record(z.string(), z.number()),
    z.array(z.string()),
  ]).default({}),
  workDescription: z.string().min(10),
  constraints: z.array(z.string()),
  style: z.string(),
  budgetRange: z.string().min(1),
  urgency: z.string().min(1),
  postalCode: z.string().min(4),
  city: z.string().min(1),
  // New marketplace fields
  designLevel: z.enum(['full', 'moderate', 'none', 'undecided']).optional().default('undecided'),
  involvementLevel: z.enum(['very', 'moderate', 'low', 'undecided']).optional().default('undecided'),
  topPriority: z.enum(['speed', 'quality', 'price']).optional(),
  // Legacy services field (backward compat with old localStorage data)
  services: z.object({
    architect: z.enum(['yes', 'no', 'maybe']).default('no'),
    contractors: z.enum(['yes', 'no', 'maybe']).default('no'),
    adminHelp: z.enum(['yes', 'no', 'maybe']).default('no'),
  }).optional(),
})

/** Map designLevel to architect service choice */
const designLevelToArchitect = (level: string): 'yes' | 'no' | 'maybe' => {
  switch (level) {
    case 'full': return 'yes'
    case 'moderate': return 'yes'
    case 'undecided': return 'maybe'
    default: return 'no'
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = questionnaireSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data

    // Map to services — either from legacy field or from new designLevel
    const services: ProjectServices = input.services
      ? input.services
      : {
          architect: designLevelToArchitect(input.designLevel),
          contractors: 'yes', // marketplace core — always on
          adminHelp: 'yes',   // marketplace core — always on
        }

    // Auto-generate title from questionnaire
    const propertyLabel = PROPERTY_TYPE_LABELS[input.propertyType as PropertyType] || input.propertyType
    const renovationLabel = RENOVATION_LABELS[input.renovationType] || input.renovationType
    const title = `${renovationLabel} — ${propertyLabel} à ${input.city}`

    // Determine which phases are relevant based on services
    const activePhases: ProjectPhase[] = ['cadrage']
    if (services.architect === 'yes') activePhases.push('conception')
    activePhases.push('devis')
    if (services.contractors === 'yes') activePhases.push('travaux', 'livraison')

    // Create project — store questionnaire data directly in aiSummary
    const projectId = crypto.randomUUID()

    await db.insert(project).values({
      id: projectId,
      userId: session.user.id,
      title,
      status: 'draft',
      phase: 'cadrage',
      modules: {
        design: services.architect === 'yes' || services.architect === 'maybe',
        works: services.contractors === 'yes' || services.contractors === 'maybe',
        wallet: services.adminHelp === 'yes' || services.adminHelp === 'maybe',
      },
      services,
      aiSummary: {
        propertyType: input.propertyType,
        surface: input.surface ? parseFloat(input.surface) : null,
        rooms: input.rooms,
        renovationType: input.renovationType,
        workDescription: input.workDescription,
        constraints: input.constraints,
        style: input.style,
        budgetRange: input.budgetRange,
        urgency: input.urgency,
        additionalNotes: '',
        ownershipStatus: input.ownershipStatus,
        designLevel: input.designLevel,
        involvementLevel: input.involvementLevel,
        topPriority: input.topPriority,
        postalCode: input.postalCode,
        city: input.city,
      },
      propertyType: input.propertyType,
      surface: input.surface || null,
      rooms: input.rooms,
      budgetRange: input.budgetRange,
      style: input.style,
      postalCode: input.postalCode,
      city: input.city,
    })

    // Seed initial actions for active phases
    const actionsToInsert = ACTION_TEMPLATES
      .filter((a) => activePhases.includes(a.phase))
      .map((a) => ({
        id: crypto.randomUUID(),
        projectId,
        label: a.label,
        phase: a.phase,
        completed: false,
        isCustom: false,
      }))

    if (actionsToInsert.length > 0) {
      await db.insert(projectAction).values(actionsToInsert)
    }

    // Seed validation milestones for active phases
    const validationsToInsert = VALIDATION_TEMPLATES
      .filter((v) => activePhases.includes(v.phase))
      .map((v) => ({
        id: crypto.randomUUID(),
        projectId,
        label: v.label,
        phase: v.phase,
      }))

    if (validationsToInsert.length > 0) {
      await db.insert(projectValidation).values(validationsToInsert)
    }

    // Seed default message channels
    const channelsToInsert = DEFAULT_CHANNELS.map((ch) => ({
      id: crypto.randomUUID(),
      projectId,
      name: ch.name,
      label: ch.label,
      order: ch.order,
    }))

    await db.insert(messageChannel).values(channelsToInsert)

    return NextResponse.json({ projectId, title })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}
