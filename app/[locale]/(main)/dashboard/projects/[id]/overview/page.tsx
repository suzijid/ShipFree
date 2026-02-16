import { headers } from 'next/headers'
import { eq, asc, desc } from 'drizzle-orm'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { projectAction, projectValidation, document, user, projectEvent, paymentSchedule, projectContractor, contractor, proposal, designServiceBooking } from '@/database/schema'
import { OverviewContent } from './overview-content'

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [actions, validations, documents, events, payments, contractors, designBookings] = await Promise.all([
    db
      .select()
      .from(projectAction)
      .where(eq(projectAction.projectId, id))
      .orderBy(asc(projectAction.createdAt)),
    db
      .select()
      .from(projectValidation)
      .where(eq(projectValidation.projectId, id))
      .orderBy(asc(projectValidation.createdAt)),
    db
      .select({
        id: document.id,
        name: document.name,
        url: document.url,
        mimeType: document.mimeType,
        size: document.size,
        category: document.category,
        createdAt: document.createdAt,
        uploadedByName: user.name,
      })
      .from(document)
      .leftJoin(user, eq(document.uploadedById, user.id))
      .where(eq(document.projectId, id))
      .orderBy(desc(document.createdAt))
      .limit(5),
    db
      .select()
      .from(projectEvent)
      .where(eq(projectEvent.projectId, id))
      .orderBy(desc(projectEvent.createdAt))
      .limit(10),
    db
      .select()
      .from(paymentSchedule)
      .where(eq(paymentSchedule.projectId, id))
      .orderBy(asc(paymentSchedule.dueDate)),
    // Marketplace: fetch assigned contractors with their proposals
    db
      .select({
        pcId: projectContractor.id,
        specialty: projectContractor.specialty,
        assignmentStatus: projectContractor.status,
        contractorId: contractor.id,
        companyName: contractor.companyName,
        contractorName: user.name,
        rating: contractor.rating,
        proposalId: proposal.id,
        proposalAmount: proposal.amount,
        proposalStatus: proposal.status,
      })
      .from(projectContractor)
      .innerJoin(contractor, eq(projectContractor.contractorId, contractor.id))
      .innerJoin(user, eq(contractor.userId, user.id))
      .leftJoin(proposal, eq(proposal.projectContractorId, projectContractor.id))
      .where(eq(projectContractor.projectId, id)),
    // Marketplace: design service bookings
    db
      .select()
      .from(designServiceBooking)
      .where(eq(designServiceBooking.projectId, id)),
  ])

  return (
    <OverviewContent
      userName={session.user.name ?? ''}
      userEmail={session.user.email ?? ''}
      actions={actions.map((a) => ({
        id: a.id,
        label: a.label,
        phase: a.phase,
        completed: a.completed,
      }))}
      validations={validations.map((v) => ({
        id: v.id,
        label: v.label,
        phase: v.phase,
        validatedAt: v.validatedAt?.toISOString() ?? null,
      }))}
      documents={documents.map((d) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        mimeType: d.mimeType,
        size: d.size,
        category: d.category,
        createdAt: d.createdAt.toISOString(),
        uploadedByName: d.uploadedByName ?? 'Inconnu',
      }))}
      events={events.map((e) => ({
        id: e.id,
        type: e.type,
        data: e.data as Record<string, unknown> | null,
        createdAt: e.createdAt.toISOString(),
      }))}
      payments={payments.map((p) => ({
        id: p.id,
        label: p.label,
        amount: p.amount,
        dueDate: p.dueDate.toISOString(),
        status: p.status,
        paidAt: p.paidAt?.toISOString() ?? null,
      }))}
      contractors={contractors.map((c) => ({
        pcId: c.pcId,
        specialty: c.specialty,
        assignmentStatus: c.assignmentStatus,
        companyName: c.companyName,
        contractorName: c.contractorName,
        rating: c.rating,
        proposalAmount: c.proposalAmount,
        proposalStatus: c.proposalStatus,
      }))}
      designBookings={designBookings.map((b) => ({
        id: b.id,
        type: b.type,
        status: b.status,
        amount: b.amount,
        deliveredAt: b.deliveredAt?.toISOString() ?? null,
      }))}
    />
  )
}
