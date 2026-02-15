'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'

import { GlassCard, GlassBadge, GlassInput } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  type ProjectStatus,
  type ProjectPhase,
} from '@/config/project'

interface ProjectRow {
  id: string
  title: string
  status: string
  phase: string
  city: string | null
  budgetRange: string | null
  createdAt: Date
  clientName: string
  clientEmail: string
  managerName: string | null
}

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'gold' | 'success' | 'warning'> = {
  draft: 'default',
  pending_assignment: 'warning',
  active: 'gold',
  in_progress: 'gold',
  completed: 'success',
  cancelled: 'default',
}

export const ProjectsList = ({ projects }: { projects: ProjectRow[] }) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
        (p.city && p.city.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchPhase = phaseFilter === 'all' || p.phase === phaseFilter
      return matchSearch && matchStatus && matchPhase
    })
  }, [projects, search, statusFilter, phaseFilter])

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Projets
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>{projects.length} projet{projects.length !== 1 ? 's' : ''} au total</p>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9b9b9b]' />
          <GlassInput
            placeholder='Rechercher par titre, client, ville...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
        >
          <option value='all'>Tous les statuts</option>
          {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
        >
          <option value='all'>Toutes les phases</option>
          {Object.entries(PROJECT_PHASE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <GlassCard className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#e8e4df]'>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Titre</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Client</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Manager</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Statut</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden lg:table-cell'>Phase</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden lg:table-cell'>Ville</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Date</th>
                <th className='w-10' />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-12 text-[#9b9b9b]'>
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className='border-b border-[#f5f3f0] last:border-0 hover:bg-[#faf9f7] transition-colors'>
                    <td className='px-4 py-3'>
                      <Link href={`/admin/projects/${p.id}`} className='font-medium text-[#1a1a2e] hover:text-[#c9a96e]'>
                        {p.title}
                      </Link>
                    </td>
                    <td className='px-4 py-3'>
                      <div>
                        <p className='text-[#1a1a2e]'>{p.clientName}</p>
                        <p className='text-xs text-[#9b9b9b]'>{p.clientEmail}</p>
                      </div>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {p.managerName ?? <span className='italic'>Non assigné</span>}
                    </td>
                    <td className='px-4 py-3'>
                      <GlassBadge variant={STATUS_BADGE_VARIANT[p.status] ?? 'default'}>
                        {PROJECT_STATUS_LABELS[p.status as ProjectStatus] ?? p.status}
                      </GlassBadge>
                    </td>
                    <td className='px-4 py-3 hidden lg:table-cell text-[#9b9b9b]'>
                      {PROJECT_PHASE_LABELS[p.phase as ProjectPhase] ?? p.phase}
                    </td>
                    <td className='px-4 py-3 hidden lg:table-cell text-[#9b9b9b]'>
                      {p.city ?? '—'}
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className='px-4 py-3'>
                      <Link href={`/admin/projects/${p.id}`} className='text-[#9b9b9b] hover:text-[#c9a96e]'>
                        <ArrowRight className='size-4' />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
