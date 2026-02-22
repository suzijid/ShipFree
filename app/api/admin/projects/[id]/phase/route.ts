import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireAdminApi } from '@/lib/auth/require-admin'
import { db } from '@/database'
import { project, projectEvent } from '@/database/schema'
import { PROJECT_PHASES, PROJECT_PHASE_LABELS, type ProjectPhase } from '@/config/project'
import { notificationService } from '@/lib/notifications/notification-service'
import { renderPhaseChangedEmail, getEmailSubject } from '@/components/emails'

const phaseSchema = z.object({
  phase: z.enum(PROJECT_PHASES),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const parsed = phaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Phase invalide' }, { status: 400 })
  }

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = { phase: parsed.data.phase }

  // When moving to 'termine', set warranty expiry to 1 year from now
  if (parsed.data.phase === 'termine' && p.phase !== 'termine') {
    const warrantyDate = new Date()
    warrantyDate.setFullYear(warrantyDate.getFullYear() + 1)
    updatePayload.warrantyExpiresAt = warrantyDate
  }

  await db.update(project).set(updatePayload).where(eq(project.id, id))

  await db.insert(projectEvent).values({
    id: crypto.randomUUID(),
    projectId: id,
    type: 'phase_change',
    data: { from: p.phase, to: parsed.data.phase, changedBy: session.user.id },
  })

  // ── Notification trigger ─────────────────────────────────────────
  try {
    const phaseName = PROJECT_PHASE_LABELS[parsed.data.phase as ProjectPhase] || parsed.data.phase
    const link = `/dashboard/projects/${id}/overview`

    await notificationService.createForProject({
      projectId: id,
      type: 'phase_changed',
      title: `Phase mise à jour : ${phaseName}`,
      body: `Le projet ${p.title} passe en phase ${phaseName}`,
      link,
    })

    // Send email to project owner and manager
    const memberIds = new Set<string>()
    memberIds.add(p.userId)
    if (p.managerId) memberIds.add(p.managerId)

    const html = await renderPhaseChangedEmail({
      projectTitle: p.title,
      phaseName,
      projectLink: link,
    })

    for (const memberId of memberIds) {
      notificationService.sendEmail(memberId, 'phase_changed', {
        subject: getEmailSubject('phase-changed'),
        html,
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[notifications] Failed to send phase_changed notification:', err)
  }

  return NextResponse.json({ success: true })
}
