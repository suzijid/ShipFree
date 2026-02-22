'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  type ProjectStatus,
  type ProjectPhase,
} from '@/config/project'
import { OverviewTab } from './components/overview-tab'
import { MilestonesTab } from './components/milestones-tab'
import { FinancesTab } from './components/finances-tab'
import { ActivityTab } from './components/activity-tab'
import { ArtisansTab } from './components/artisans-tab'

interface ProjectDetailProps {
  project: Record<string, unknown> & {
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
    createdAt: Date
  }
  client: { id: string; name: string; email: string; phone: string | null }
  manager: { id: string; name: string; email: string } | null
  managers: { id: string; name: string; email: string; role: string }[]
  validations: {
    id: string
    label: string
    phase: string
    validatedAt: Date | null
    validatedBy: string | null
    createdAt: Date
  }[]
  schedules: {
    id: string
    label: string
    amount: string
    dueDate: Date
    status: string
    paidAt: Date | null
    createdAt: Date
  }[]
  events: {
    id: string
    type: string
    data: unknown
    createdAt: Date
  }[]
  assignedContractors: {
    id: string
    contractorId: string
    specialty: string
    status: string
    assignedAt: string
    companyName: string
    userName: string
  }[]
  availableContractors: {
    id: string
    companyName: string
    userName: string
    specialties: string[]
    isVerified: boolean
  }[]
}

const TABS = [
  { key: 'overview', label: 'Vue d\'ensemble' },
  { key: 'artisans', label: 'Artisans' },
  { key: 'milestones', label: 'Jalons' },
  { key: 'finances', label: 'Finances' },
  { key: 'activity', label: 'Activité' },
] as const

type TabKey = (typeof TABS)[number]['key']

export const ProjectDetail = ({
  project,
  client,
  manager,
  managers,
  validations,
  schedules,
  events,
  assignedContractors,
  availableContractors,
}: ProjectDetailProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className='p-4 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-start gap-4'>
        <Link
          href='/admin/projects'
          className='mt-1 p-1.5 rounded-lg hover:bg-white text-[#9b9b9b] hover:text-[#1a1a2e] transition-colors'
        >
          <ArrowLeft className='size-5' />
        </Link>
        <div className='flex-1 min-w-0'>
          <h1
            className='text-2xl font-bold text-[#1a1a2e] truncate'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {project.title}
          </h1>
          <div className='flex items-center gap-2 mt-1'>
            <GlassBadge variant='gold'>
              {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
            </GlassBadge>
            <GlassBadge>
              {PROJECT_PHASE_LABELS[project.phase as ProjectPhase] ?? project.phase}
            </GlassBadge>
            {project.city && <span className='text-sm text-[#9b9b9b]'>{project.city}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 border-b border-[#e8e4df]'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-[#1a1a2e]'
                : 'text-[#9b9b9b] hover:text-[#1a1a2e]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a96e]' />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab
          project={project}
          client={client}
          manager={manager}
          managers={managers}
        />
      )}
      {activeTab === 'artisans' && (
        <ArtisansTab
          projectId={project.id}
          assigned={assignedContractors}
          available={availableContractors}
        />
      )}
      {activeTab === 'milestones' && (
        <MilestonesTab
          projectId={project.id}
          validations={validations}
        />
      )}
      {activeTab === 'finances' && (
        <FinancesTab
          projectId={project.id}
          schedules={schedules}
        />
      )}
      {activeTab === 'activity' && (
        <ActivityTab
          projectId={project.id}
          events={events}
        />
      )}
    </div>
  )
}
