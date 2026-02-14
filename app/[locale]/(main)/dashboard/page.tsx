import Link from 'next/link'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
import { FolderKanban, Plus, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { project } from '@/database/schema'
import {
  PROJECT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type ProjectStatus,
  type PropertyType,
} from '@/config/project'
import { ProjectCreator } from './project-creator'

const STATUS_VARIANT: Record<ProjectStatus, string> = {
  draft: 'bg-white/10 text-white/50',
  pending_assignment: 'bg-amber-500/15 text-amber-400',
  active: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-white/10 text-white/30',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) return null

  const projects = await db
    .select()
    .from(project)
    .where(eq(project.userId, session.user.id))
    .orderBy(desc(project.createdAt))

  return (
    <div className='flex-1 overflow-y-auto p-6 md:p-8'>
      {/* Auto-create project from questionnaire if needed */}
      <ProjectCreator />

      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1
              className='text-2xl font-bold text-white/95'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Mes projets
            </h1>
            <p className='text-sm text-white/40 mt-1'>
              {projects.length > 0
                ? `${projects.length} projet${projects.length > 1 ? 's' : ''}`
                : 'Aucun projet pour le moment'}
            </p>
          </div>
          <Link href='/questionnaire'>
            <button className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-4 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)] hover:brightness-110 transition-all active:scale-[0.98]'>
              <Plus className='size-4' />
              Nouveau projet
            </button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-16 text-center'>
            <div className='rounded-2xl bg-[#c9a96e]/10 p-5 mb-5'>
              <Sparkles className='size-10 text-[#c9a96e]' />
            </div>
            <h2
              className='text-xl font-semibold text-white/90 mb-2'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Commencez votre premier projet
            </h2>
            <p className='text-sm text-white/40 max-w-md mb-8'>
              Remplissez notre questionnaire en quelques minutes et recevez une fiche projet
              personnalisée pour votre rénovation.
            </p>
            <Link href='/questionnaire'>
              <button className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-6 py-3 text-base font-medium text-white shadow-[0_4px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_8px_32px_rgba(201,169,110,0.4)] hover:brightness-110 transition-all active:scale-[0.98]'>
                <Plus className='size-5' />
                Démarrer un projet
              </button>
            </Link>
          </div>
        ) : (
          <div className='grid gap-3'>
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className='group flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm'
              >
                <div className='rounded-xl bg-white/5 p-2.5 group-hover:bg-[#c9a96e]/10 transition-colors'>
                  <FolderKanban className='size-5 text-white/40 group-hover:text-[#c9a96e] transition-colors' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-3'>
                    <h3 className='font-semibold text-white/90 truncate'>{p.title}</h3>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[p.status as ProjectStatus] || 'bg-white/10 text-white/50'}`}>
                      {PROJECT_STATUS_LABELS[p.status as ProjectStatus] || p.status}
                    </span>
                  </div>
                  <div className='flex items-center gap-4 mt-2 text-xs text-white/30'>
                    {p.propertyType && (
                      <span>{PROPERTY_TYPE_LABELS[p.propertyType as PropertyType] || p.propertyType}</span>
                    )}
                    {p.city && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='size-3' />
                        {p.postalCode} {p.city}
                      </span>
                    )}
                    <span className='flex items-center gap-1'>
                      <Calendar className='size-3' />
                      {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight className='size-4 text-white/15 opacity-0 group-hover:opacity-100 group-hover:text-white/40 transition-all mt-1' />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
