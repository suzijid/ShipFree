'use client'

import { createContext, useContext } from 'react'
import type { ProjectModules, ProjectPhase } from '@/config/project'

export interface ProjectData {
  id: string
  title: string
  status: string
  phase: string
  modules: ProjectModules
  services: { architect: string; contractors: string; adminHelp: string }
  aiSummary: Record<string, unknown> | null
  propertyType: string | null
  surface: string | null
  rooms: unknown
  budgetRange: string | null
  style: string | null
  postalCode: string | null
  city: string | null
  paymentStatus: string
  managerName: string | null
  createdAt: string
}

interface ProjectContextValue {
  project: ProjectData
  currentUserId: string
  userRole: 'owner' | 'manager' | 'admin'
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export const useProject = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}

export const useOptionalProject = () => {
  return useContext(ProjectContext)
}

export const ProjectProvider = ({
  children,
  value,
}: {
  children: React.ReactNode
  value: ProjectContextValue
}) => (
  <ProjectContext.Provider value={value}>
    {children}
  </ProjectContext.Provider>
)
