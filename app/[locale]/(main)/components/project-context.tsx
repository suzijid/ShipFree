'use client'

import { createContext, useContext } from 'react'

export interface ProjectData {
  id: string
  title: string
  status: string
  phase: string
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
  matchingStatus: string
  managerName: string | null
  contractorCount: number
  proposalCount: number
  acceptedProposalCount: number
  createdAt: string
}

interface ProjectContextValue {
  project: ProjectData
  currentUserId: string
  userRole: 'owner' | 'manager' | 'admin' | 'contractor'
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
