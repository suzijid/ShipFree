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
  draft: 'bg-[#f5f5f5] text-[#999]',
  pending_assignment: 'bg-amber-100 text-amber-700',
  active: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-[#f5f5f5] text-[#999]',
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
        <h1 className='uppercase tracking-[0.2em] text-[15px] font-normal text-[#202020]'>
          Dashboard
        </h1>
        <p className='text-sm text-[#999] mt-1'>Vue d&apos;ensemble de vos projets</p>
      </div>

      {/* KPI Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Building2 className='size-4 text-[#202020]' />
            <span className='text-[11px] text-[#999] uppercase tracking-[0.1em]'>Projets actifs</span>
          </div>
          <p className='text-xl font-bold text-[#202020]'>{activeCount}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Clock className='size-4 text-[#666]' />
            <span className='text-[11px] text-[#999] uppercase tracking-[0.1em]'>En attente</span>
          </div>
          <p className='text-xl font-bold text-[#202020]'>{draftCount}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='size-4 text-emerald-500' />
            <span className='text-[11px] text-[#999] uppercase tracking-[0.1em]'>Avancement</span>
          </div>
          <p className='text-xl font-bold text-[#202020]'>{avgProgress}%</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Wallet className='size-4 text-[#666]' />
            <span className='text-[11px] text-[#999] uppercase tracking-[0.1em]'>Budget total</span>
          </div>
          <p className='text-xl font-bold text-[#202020]'>{formatBudget(totalBudget)}</p>
        </GlassCard>
      </div>

      {/* 2-col grid */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Mes projets */}
        <GlassCard className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020]'>
                Mes projets
              </h2>
              <p className='text-xs text-[#999] mt-0.5'>
                {projects.length} projet{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href='/questionnaire'
              className='inline-flex items-center gap-2 bg-[#202020] px-4 py-2.5 text-[13px] font-normal text-white uppercase tracking-[0.1em] hover:bg-[#333] transition-colors'
            >
              <Plus className='size-4' />
              Nouveau
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center text-center py-12'>
              <div className='border border-[#e0e0e0] p-5 mb-5'>
                <Sparkles className='size-10 text-[#999]' />
              </div>
              <h2 className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020] mb-2'>
                Commencez votre premier projet
              </h2>
              <p className='text-sm text-[#999] max-w-md mb-8'>
                Remplissez notre questionnaire en quelques minutes et recevez les propositions
                des meilleurs artisans vérifiés pour votre rénovation.
              </p>
              <Link href='/questionnaire'>
                <button className='inline-flex items-center gap-2 bg-[#202020] px-6 py-3 text-[13px] font-normal text-white uppercase tracking-[0.1em] hover:bg-[#333] transition-colors'>
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
                  className='group flex items-start gap-4 p-3 transition-colors hover:bg-[#f5f5f5]'
                >
                  <div className='border border-[#e0e0e0] p-2.5 group-hover:border-[#202020] transition-colors'>
                    <FolderKanban className='size-5 text-[#999] group-hover:text-[#202020] transition-colors' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='font-medium text-[#202020] truncate'>{p.title}</h3>
                      <span
                        className={`shrink-0 inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[p.status as ProjectStatus] || 'bg-[#f5f5f5] text-[#999]'}`}
                      >
                        {PROJECT_STATUS_LABELS[p.status as ProjectStatus] || p.status}
                      </span>
                    </div>
                    <div className='flex items-center gap-4 mt-2 text-xs text-[#999]'>
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
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium ${
                          p.matchingStatus === 'matching' ? 'bg-amber-50 text-amber-600' :
                          p.matchingStatus === 'matched' ? 'bg-emerald-50 text-emerald-600' :
                          p.matchingStatus === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          p.matchingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-[#f5f5f5] text-[#999]'
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
                  <ArrowRight className='size-4 text-transparent group-hover:text-[#999] transition-all mt-1' />
                </Link>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Activité récente */}
        <GlassCard className='p-5'>
          <h2 className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020] mb-1'>
            Activité récente
          </h2>
          <p className='text-xs text-[#999] mb-4'>Dernières mises à jour</p>

          {projects.length === 0 ? (
            <p className='text-sm text-[#999] py-4'>Pas encore d&apos;activité.</p>
          ) : (
            <div className='space-y-0'>
              {projects.slice(0, 5).map((p, idx) => (
                <div key={p.id}>
                  {idx > 0 && <div className='border-t border-[#e0e0e0]' />}
                  <div className='flex items-center justify-between py-3'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <span className='size-2 rounded-full bg-[#202020] shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-[#202020] truncate'>{p.title}</p>
                        <p className='text-xs text-[#999]'>
                          {new Date(p.updatedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/projects/${p.id}/overview`}
                      className='shrink-0 text-xs border border-[#e0e0e0] px-2.5 py-1 text-[#999] hover:bg-[#f5f5f5] hover:text-[#202020] transition-colors uppercase tracking-[0.05em]'
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
