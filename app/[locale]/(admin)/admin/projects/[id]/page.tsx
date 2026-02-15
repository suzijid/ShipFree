import { eq, desc, asc } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { db } from '@/database'
import { project, user, projectValidation, paymentSchedule, projectEvent, projectContractor, contractor } from '@/database/schema'
import { ProjectDetail } from './project-detail'

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [p] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!p) redirect('/admin/projects')

  // Run remaining queries in parallel
  const [client, manager, managers, validations, schedules, events, assignedContractors, allContractors] = await Promise.all([
    // Client info
    db.select({ id: user.id, name: user.name, email: user.email, phone: user.phone })
      .from(user)
      .where(eq(user.id, p.userId))
      .limit(1)
      .then((r) => r[0]),

    // Manager info
    p.managerId
      ? db.select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .where(eq(user.id, p.managerId))
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),

    // All managers/admins for assignment
    db.select({ id: user.id, name: user.name, email: user.email, role: user.role })
      .from(user)
      .where(eq(user.role, 'admin'))
      .then(async (admins) => {
        const mgrs = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role })
          .from(user)
          .where(eq(user.role, 'manager'))
        return [...admins, ...mgrs]
      }),

    // Validations
    db.select().from(projectValidation)
      .where(eq(projectValidation.projectId, id))
      .orderBy(asc(projectValidation.createdAt)),

    // Payment schedules
    db.select().from(paymentSchedule)
      .where(eq(paymentSchedule.projectId, id))
      .orderBy(asc(paymentSchedule.dueDate)),

    // Events
    db.select().from(projectEvent)
      .where(eq(projectEvent.projectId, id))
      .orderBy(desc(projectEvent.createdAt))
      .limit(50),

    // Assigned contractors for this project
    db.select({
      id: projectContractor.id,
      contractorId: projectContractor.contractorId,
      specialty: projectContractor.specialty,
      status: projectContractor.status,
      assignedAt: projectContractor.assignedAt,
      companyName: contractor.companyName,
      userName: user.name,
    })
      .from(projectContractor)
      .innerJoin(contractor, eq(projectContractor.contractorId, contractor.id))
      .innerJoin(user, eq(contractor.userId, user.id))
      .where(eq(projectContractor.projectId, id)),

    // All contractors for the picker
    db.select({
      id: contractor.id,
      companyName: contractor.companyName,
      userName: user.name,
      specialties: contractor.specialties,
      isVerified: contractor.isVerified,
    })
      .from(contractor)
      .innerJoin(user, eq(contractor.userId, user.id)),
  ])

  return (
    <ProjectDetail
      project={p}
      client={client!}
      manager={manager}
      managers={managers}
      validations={validations}
      schedules={schedules}
      events={events}
      assignedContractors={assignedContractors.map(c => ({
        ...c,
        assignedAt: c.assignedAt.toISOString(),
      }))}
      availableContractors={allContractors}
    />
  )
}
