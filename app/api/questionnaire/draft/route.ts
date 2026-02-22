import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { questionnaireDraft } from '@/database/schema'

// ─── GET: Retrieve draft by userId or sessionId ──────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const sessionId = req.nextUrl.searchParams.get('sessionId')

    // Authenticated user — look up by userId
    if (session?.user) {
      const [draft] = await db
        .select()
        .from(questionnaireDraft)
        .where(eq(questionnaireDraft.userId, session.user.id))
        .limit(1)

      if (draft) {
        return NextResponse.json({ draft })
      }
    }

    // Anonymous user — look up by sessionId
    if (sessionId) {
      const [draft] = await db
        .select()
        .from(questionnaireDraft)
        .where(eq(questionnaireDraft.sessionId, sessionId))
        .limit(1)

      if (draft) {
        return NextResponse.json({ draft })
      }
    }

    return NextResponse.json({ draft: null })
  } catch (error) {
    console.error('Error fetching questionnaire draft:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du brouillon' },
      { status: 500 }
    )
  }
}

// ─── POST: Save/update draft (upsert) ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const body = await req.json()

    const { sessionId, currentStep, data } = body as {
      sessionId?: string
      currentStep: number
      data: Record<string, unknown>
    }

    if (!data || typeof currentStep !== 'number') {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    const userId = session?.user?.id ?? null

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'userId ou sessionId requis' },
        { status: 400 }
      )
    }

    // Check for existing draft
    let existingDraft = null
    if (userId) {
      const [found] = await db
        .select()
        .from(questionnaireDraft)
        .where(eq(questionnaireDraft.userId, userId))
        .limit(1)
      existingDraft = found ?? null
    } else if (sessionId) {
      const [found] = await db
        .select()
        .from(questionnaireDraft)
        .where(eq(questionnaireDraft.sessionId, sessionId))
        .limit(1)
      existingDraft = found ?? null
    }

    if (existingDraft) {
      // Update existing draft
      await db
        .update(questionnaireDraft)
        .set({
          currentStep,
          data,
          ...(userId && !existingDraft.userId ? { userId } : {}),
          updatedAt: new Date(),
        })
        .where(eq(questionnaireDraft.id, existingDraft.id))

      return NextResponse.json({ success: true, id: existingDraft.id })
    }

    // Create new draft
    const id = crypto.randomUUID()
    await db.insert(questionnaireDraft).values({
      id,
      userId,
      sessionId: sessionId ?? null,
      currentStep,
      data,
    })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error saving questionnaire draft:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du brouillon' },
      { status: 500 }
    )
  }
}

// ─── DELETE: Remove draft (after successful project creation) ─────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const sessionId = req.nextUrl.searchParams.get('sessionId')

    if (session?.user) {
      await db
        .delete(questionnaireDraft)
        .where(eq(questionnaireDraft.userId, session.user.id))
    } else if (sessionId) {
      await db
        .delete(questionnaireDraft)
        .where(eq(questionnaireDraft.sessionId, sessionId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting questionnaire draft:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du brouillon' },
      { status: 500 }
    )
  }
}
