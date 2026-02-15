import { eq, count, sql, desc } from 'drizzle-orm'

import { db } from '@/database'
import { project, projectEvent, projectValidation, paymentSchedule, user } from '@/database/schema'
import { DashboardContent } from './dashboard-content'

export default async function AdminDashboardPage() {
  // Run all queries in parallel
  const [
    totalProjects,
    statusCounts,
    phaseCounts,
    revenueResult,
    overdueMilestones,
    recentEvents,
  ] = await Promise.all([
    // Total projects
    db.select({ count: count() }).from(project),

    // Count per status
    db
      .select({ status: project.status, count: count() })
      .from(project)
      .groupBy(project.status),

    // Count per phase
    db
      .select({ phase: project.phase, count: count() })
      .from(project)
      .groupBy(project.phase),

    // Total revenue (paid payment schedule entries)
    db
      .select({ total: sql<string>`COALESCE(SUM(${paymentSchedule.amount}), 0)` })
      .from(paymentSchedule)
      .where(eq(paymentSchedule.status, 'paid')),

    // Overdue milestones (not validated)
    db
      .select({ count: count() })
      .from(projectValidation)
      .where(sql`${projectValidation.validatedAt} IS NULL`),

    // Recent events with project title
    db
      .select({
        id: projectEvent.id,
        type: projectEvent.type,
        data: projectEvent.data,
        createdAt: projectEvent.createdAt,
        projectId: projectEvent.projectId,
        projectTitle: project.title,
      })
      .from(projectEvent)
      .innerJoin(project, eq(projectEvent.projectId, project.id))
      .orderBy(desc(projectEvent.createdAt))
      .limit(20),
  ])

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s.count]))
  const phaseMap = Object.fromEntries(phaseCounts.map((p) => [p.phase, p.count]))

  return (
    <DashboardContent
      kpis={{
        total: totalProjects[0]?.count ?? 0,
        active: (statusMap['active'] ?? 0) + (statusMap['in_progress'] ?? 0),
        pending: statusMap['pending_assignment'] ?? 0,
        revenue: parseFloat(revenueResult[0]?.total ?? '0'),
        overdueMilestones: overdueMilestones[0]?.count ?? 0,
      }}
      phaseDistribution={phaseMap}
      recentEvents={recentEvents}
    />
  )
}
