'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import {
  FolderKanban,
  MessageSquare,
  FileText,
  Wallet,
  Palette,
  HardHat,
} from 'lucide-react'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'

import { OverviewTab } from './overview-tab'
import { MessagesTab } from './messages-tab'
import { DocumentsTab } from './documents-tab'
import { FinancesTab } from './finances-tab'

interface ProjectTabsProps {
  project: {
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
    managerName: string | null
    createdAt: Date
  }
  actions: {
    id: string
    label: string
    phase: string
    completed: boolean
    isCustom: boolean
  }[]
  validations: {
    id: string
    label: string
    phase: string
    validatedAt: Date | null
  }[]
  messages: {
    id: string
    content: string
    senderId: string
    senderName: string
    senderRole: string
    createdAt: Date
  }[]
  documents: {
    id: string
    name: string
    url: string
    mimeType: string | null
    size: number | null
    category: string
    createdAt: Date
    uploadedByName: string
  }[]
  payments: {
    id: string
    label: string
    amount: string
    dueDate: Date
    status: string
    invoiceUrl: string | null
    paidAt: Date | null
  }[]
  currentUserId: string
  userRole?: 'owner' | 'manager' | 'admin'
}

export const ProjectTabs = ({
  project,
  actions,
  validations,
  messages,
  documents,
  payments,
  currentUserId,
  userRole,
}: ProjectTabsProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Projet', icon: FolderKanban },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'finances', label: 'Finances', icon: Wallet },
    { id: 'conception', label: 'Conception', icon: Palette },
    { id: 'travaux', label: 'Travaux', icon: HardHat },
  ], [])

  const tabParam = searchParams.get('tab')
  const activeTab = tabs.some((t) => t.id === tabParam) ? tabParam! : 'overview'

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      if (typeof value !== 'string') return
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', value)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList variant='underline' className='w-full border-b border-[#e8e4df] px-0'>
        {tabs.map((tab) => (
          <TabsTab
            key={tab.id}
            value={tab.id}
            className='gap-2 px-4 py-3 text-sm'
          >
            <tab.icon className='size-4' />
            {tab.label}
          </TabsTab>
        ))}
      </TabsList>

      <TabsPanel value='overview' className='pt-6'>
        <OverviewTab
          project={project}
          actions={actions}
          validations={validations}
          userRole={userRole}
        />
      </TabsPanel>

      <TabsPanel value='messages' className='pt-6'>
        <MessagesTab
          projectId={project.id}
          messages={messages}
          currentUserId={currentUserId}
        />
      </TabsPanel>

      <TabsPanel value='documents' className='pt-6'>
        <DocumentsTab
          projectId={project.id}
          documents={documents}
        />
      </TabsPanel>

      <TabsPanel value='finances' className='pt-6'>
        <FinancesTab payments={payments} />
      </TabsPanel>

      <TabsPanel value='conception' className='pt-6'>
        <div className='rounded-xl border border-[#e8e4df] bg-white p-8 text-center'>
          <Palette className='size-8 text-[#c9a96e] mx-auto mb-3' />
          <h3 className='font-semibold text-[#1a1a2e] mb-1' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
            Conception
          </h3>
          <p className='text-sm text-muted-foreground'>
            Le suivi de conception sera disponible une fois la phase lancée par votre chef de projet.
          </p>
        </div>
      </TabsPanel>

      <TabsPanel value='travaux' className='pt-6'>
        <div className='rounded-xl border border-[#e8e4df] bg-white p-8 text-center'>
          <HardHat className='size-8 text-[#c9a96e] mx-auto mb-3' />
          <h3 className='font-semibold text-[#1a1a2e] mb-1' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
            Suivi travaux
          </h3>
          <p className='text-sm text-muted-foreground'>
            Le suivi de chantier sera disponible une fois les travaux démarrés.
          </p>
        </div>
      </TabsPanel>
    </Tabs>
  )
}
