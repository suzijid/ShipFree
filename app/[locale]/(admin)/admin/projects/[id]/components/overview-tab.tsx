'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin, Ruler, FileText } from 'lucide-react'

import { GlassCard, GlassButton, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS,
  PROJECT_PHASES,
  SERVICE_LABELS,
  BUDGET_RANGE_LABELS,
  PROPERTY_TYPE_LABELS,
  type ProjectStatus,
  type ProjectPhase,
  type PropertyType,
  type BudgetRange,
} from '@/config/project'

interface OverviewTabProps {
  project: {
    id: string
    title: string
    status: string
    phase: string
    city: string | null
    budgetRange: string | null
    services: { architect: string; contractors: string; adminHelp: string }
    aiSummary: unknown
    surface: string | null
    propertyType: string | null
    address: string | null
    postalCode: string | null
  }
  client: { id: string; name: string; email: string; phone: string | null }
  manager: { id: string; name: string; email: string } | null
  managers: { id: string; name: string; email: string; role: string }[]
}

export const OverviewTab = ({ project, client, manager, managers }: OverviewTabProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAssign = async (managerId: string) => {
    setLoading('assign')
    await fetch(`/api/admin/projects/${project.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId }),
    })
    setLoading(null)
    router.refresh()
  }

  const handleStatusChange = async (status: string) => {
    setLoading('status')
    await fetch(`/api/admin/projects/${project.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    router.refresh()
  }

  const handlePhaseChange = async (phase: string) => {
    setLoading('phase')
    await fetch(`/api/admin/projects/${project.id}/phase`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase }),
    })
    setLoading(null)
    router.refresh()
  }

  const summary = project.aiSummary as Record<string, unknown> | null

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      {/* Client info */}
      <GlassCard className='p-5'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2'>
          <User className='size-4' /> Client
        </h3>
        <div className='space-y-2 text-sm'>
          <p><span className='text-[#9b9b9b]'>Nom :</span> {client.name}</p>
          <p><span className='text-[#9b9b9b]'>Email :</span> {client.email}</p>
          {client.phone && <p><span className='text-[#9b9b9b]'>Tél :</span> {client.phone}</p>}
        </div>
      </GlassCard>

      {/* Property info */}
      <GlassCard className='p-5'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2'>
          <MapPin className='size-4' /> Propriété
        </h3>
        <div className='space-y-2 text-sm'>
          {project.propertyType && (
            <p><span className='text-[#9b9b9b]'>Type :</span> {PROPERTY_TYPE_LABELS[project.propertyType as PropertyType] ?? project.propertyType}</p>
          )}
          {project.surface && (
            <p><span className='text-[#9b9b9b]'>Surface :</span> {project.surface} m²</p>
          )}
          {project.address && (
            <p><span className='text-[#9b9b9b]'>Adresse :</span> {project.address}</p>
          )}
          {(project.postalCode || project.city) && (
            <p><span className='text-[#9b9b9b]'>Ville :</span> {[project.postalCode, project.city].filter(Boolean).join(' ')}</p>
          )}
          {project.budgetRange && (
            <p><span className='text-[#9b9b9b]'>Budget :</span> {BUDGET_RANGE_LABELS[project.budgetRange as BudgetRange] ?? project.budgetRange}</p>
          )}
        </div>
      </GlassCard>

      {/* Services & Modules */}
      <GlassCard className='p-5'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4'>Services & Modules</h3>
        <div className='space-y-3'>
          <div>
            <p className='text-xs text-[#9b9b9b] mb-1.5'>Services demandés</p>
            <div className='flex flex-wrap gap-1.5'>
              {Object.entries(project.services).map(([key, val]) => (
                <GlassBadge
                  key={key}
                  variant={val === 'yes' ? 'success' : val === 'maybe' ? 'warning' : 'default'}
                >
                  {SERVICE_LABELS[key as keyof typeof SERVICE_LABELS]} ({val})
                </GlassBadge>
              ))}
            </div>
          </div>

        </div>
      </GlassCard>

      {/* AI Summary */}
      {summary && (
        <GlassCard className='p-5'>
          <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2'>
            <FileText className='size-4' /> Résumé IA
          </h3>
          <div className='space-y-2 text-sm'>
            {summary.workDescription && (
              <p className='text-[#6b6b6b]'>{summary.workDescription as string}</p>
            )}
            {summary.structuredSummary && (
              <p className='text-[#6b6b6b] whitespace-pre-wrap'>{summary.structuredSummary as string}</p>
            )}
            {summary.constraints && Array.isArray(summary.constraints) && (summary.constraints as string[]).length > 0 && (
              <div>
                <p className='text-xs text-[#9b9b9b] mb-1'>Contraintes</p>
                <ul className='list-disc list-inside text-[#6b6b6b] text-xs space-y-0.5'>
                  {(summary.constraints as string[]).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Admin actions */}
      <GlassCard className='p-5 md:col-span-2'>
        <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4'>Actions admin</h3>
        <div className='grid sm:grid-cols-3 gap-4'>
          {/* Assign manager */}
          <div>
            <label className='text-xs text-[#9b9b9b] block mb-1.5'>Manager assigné</label>
            <select
              value={manager?.id ?? ''}
              onChange={(e) => e.target.value && handleAssign(e.target.value)}
              disabled={loading === 'assign'}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2 text-sm text-[#1a1a2e] disabled:opacity-50'
            >
              <option value=''>Non assigné</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Change status */}
          <div>
            <label className='text-xs text-[#9b9b9b] block mb-1.5'>Statut</label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading === 'status'}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2 text-sm text-[#1a1a2e] disabled:opacity-50'
            >
              {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Change phase */}
          <div>
            <label className='text-xs text-[#9b9b9b] block mb-1.5'>Phase</label>
            <select
              value={project.phase}
              onChange={(e) => handlePhaseChange(e.target.value)}
              disabled={loading === 'phase'}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2 text-sm text-[#1a1a2e] disabled:opacity-50'
            >
              {Object.entries(PROJECT_PHASE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
