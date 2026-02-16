import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import {
  FolderKanban,
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { project } from '@/database/schema'
import {
  PROJECT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  MATCHING_STATUS_LABELS,
  type ProjectStatus,
  type PropertyType,
  type MatchingStatus,
} from '@/config/project'
import { GlassCard } from '../components/glass-primitives'
import { ProjectCreator } from './project-creator'

const STATUS_VARIANT: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-[#8a8a96]',
  pending_assignment: 'bg-amber-100 text-amber-700',
  active: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-[#8a8a96]',
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) return null

  const projects = await db
    .select()
    .from(project)
    .where(eq(project.userId, session.user.id))
    .orderBy(desc(project.createdAt))

  if (projects.length === 1) {
    redirect(`/${locale}/dashboard/projects/${projects[0].id}/overview`)
  }

  const activeCount = projects.filter(
    (p) => p.status === 'active' || p.status === 'in_progress',
  ).length
  const draftCount = projects.filter(
    (p) => p.status === 'draft' || p.status === 'pending_assignment',
  ).length
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length)
      : 0
  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.totalBudget ? parseFloat(String(p.totalBudget)) : 0),
    0,
  )

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <ProjectCreator />

      {/* Heading */}
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Dashboard
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>Vue d&apos;ensemble de vos projets</p>
      </div>

      {/* KPI Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Building2 className='size-4 text-[#c9a96e]' />
            <span className='text-xs text-[#9b9b9b]'>Projets actifs</span>
          </div>
          <p className='text-xl font-bold text-[#1a1a2e]'>{activeCount}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Clock className='size-4 text-blue-500' />
            <span className='text-xs text-[#9b9b9b]'>En attente</span>
          </div>
          <p className='text-xl font-bold text-[#1a1a2e]'>{draftCount}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='size-4 text-emerald-500' />
            <span className='text-xs text-[#9b9b9b]'>Avancement</span>
          </div>
          <p className='text-xl font-bold text-[#1a1a2e]'>{avgProgress}%</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Wallet className='size-4 text-purple-500' />
            <span className='text-xs text-[#9b9b9b]'>Budget total</span>
          </div>
          <p className='text-xl font-bold text-[#1a1a2e]'>{formatBudget(totalBudget)}</p>
        </GlassCard>
      </div>

      {/* 2-col grid */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Mes projets */}
        <GlassCard className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2
                className='font-semibold text-[#1a1a2e] text-lg'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Mes projets
              </h2>
              <p className='text-xs text-[#9b9b9b] mt-0.5'>
                {projects.length} projet{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href='/questionnaire'
              className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(201,169,110,0.25)] hover:shadow-[0_8px_24px_rgba(201,169,110,0.35)] hover:brightness-110 transition-all active:scale-[0.98]'
            >
              <Plus className='size-4' />
              Nouveau
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center text-center py-12'>
              <div className='rounded-2xl bg-[#c9a96e]/10 p-5 mb-5'>
                <Sparkles className='size-10 text-[#c9a96e]' />
              </div>
              <h2
                className='text-xl font-semibold text-[#1a1a2e] mb-2'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Commencez votre premier projet
              </h2>
              <p className='text-sm text-[#9b9b9b] max-w-md mb-8'>
                Remplissez notre questionnaire en quelques minutes et recevez les propositions
                des meilleurs artisans vérifiés pour votre rénovation.
              </p>
              <Link href='/questionnaire'>
                <button className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-6 py-3 text-base font-medium text-white shadow-[0_4px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_8px_32px_rgba(201,169,110,0.4)] hover:brightness-110 transition-all active:scale-[0.98]'>
                  <Plus className='size-5' />
                  Démarrer un projet
                </button>
              </Link>
            </div>
          ) : (
            <div className='space-y-1'>
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}/overview`}
                  className='group flex items-start gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-[#f5f3f0]'
                >
                  <div className='rounded-xl bg-[#f5f3f0] border border-[#e8e4df] p-2.5 group-hover:bg-[#c9a96e]/10 group-hover:border-[#c9a96e]/20 transition-colors'>
                    <FolderKanban className='size-5 text-[#9b9b9b] group-hover:text-[#c9a96e] transition-colors' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='font-semibold text-[#1a1a2e] truncate'>{p.title}</h3>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[p.status as ProjectStatus] || 'bg-gray-100 text-[#9b9b9b]'}`}
                      >
                        {PROJECT_STATUS_LABELS[p.status as ProjectStatus] || p.status}
                      </span>
                    </div>
                    <div className='flex items-center gap-4 mt-2 text-xs text-[#9b9b9b]'>
                      {p.propertyType && (
                        <span>
                          {PROPERTY_TYPE_LABELS[p.propertyType as PropertyType] || p.propertyType}
                        </span>
                      )}
                      {p.city && (
                        <span className='flex items-center gap-1'>
                          <MapPin className='size-3' />
                          {p.postalCode} {p.city}
                        </span>
                      )}
                      {p.matchingStatus && p.matchingStatus !== 'open' && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          p.matchingStatus === 'matching' ? 'bg-amber-50 text-amber-600' :
                          p.matchingStatus === 'matched' ? 'bg-emerald-50 text-emerald-600' :
                          p.matchingStatus === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          p.matchingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {MATCHING_STATUS_LABELS[p.matchingStatus as MatchingStatus] || p.matchingStatus}
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
                  <ArrowRight className='size-4 text-transparent group-hover:text-[#9b9b9b] transition-all mt-1' />
                </Link>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Activité récente */}
        <GlassCard className='p-5'>
          <h2
            className='font-semibold text-[#1a1a2e] text-lg mb-1'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Activité récente
          </h2>
          <p className='text-xs text-[#9b9b9b] mb-4'>Dernières mises à jour</p>

          {projects.length === 0 ? (
            <p className='text-sm text-[#9b9b9b] py-4'>Pas encore d&apos;activité.</p>
          ) : (
            <div className='space-y-0'>
              {projects.slice(0, 5).map((p, idx) => (
                <div key={p.id}>
                  {idx > 0 && <div className='border-t border-[#e8e4df]' />}
                  <div className='flex items-center justify-between py-3'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <span className='size-2 rounded-full bg-[#c9a96e] shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-[#1a1a2e] truncate'>{p.title}</p>
                        <p className='text-xs text-[#9b9b9b]'>
                          {new Date(p.updatedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/projects/${p.id}/overview`}
                      className='shrink-0 text-xs rounded-full border border-[#e8e4df] px-2.5 py-1 text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors'
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatBudget = (amount: number) => {
  if (amount === 0) return '0 €'
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M€`
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k€`
  return `${Math.round(amount)} €`
}
