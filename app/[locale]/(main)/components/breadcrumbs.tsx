'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useOptionalProject } from './project-context'

const TAB_LABELS: Record<string, string> = {
  overview: 'Vue d\'ensemble',
  messages: 'Messages',
  documents: 'Documents',
  finances: 'Finances',
  artisans: 'Artisans',
  'design-services': 'Design',
}

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const projectCtx = useOptionalProject()

  // Only show on project pages
  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)(?:\/([^/]+))?/)
  if (!projectMatch) return null

  const currentTab = projectMatch[2] || 'overview'
  const tabLabel = TAB_LABELS[currentTab] || currentTab

  const projectTitle = projectCtx?.project.title || 'Projet'

  return (
    <nav aria-label="Fil d'Ariane" className='hidden md:flex items-center gap-1.5 text-xs'>
      <Link href='/dashboard' className='text-[#767676] hover:text-[#202020] transition-colors'>
        Gradia
      </Link>
      <span className='text-[#767676]'>/</span>
      <Link href='/dashboard' className='text-[#767676] hover:text-[#202020] transition-colors'>
        Mes projets
      </Link>
      <span className='text-[#767676]'>/</span>
      <span className='text-[#767676] max-w-[160px] truncate'>
        {projectTitle}
      </span>
      <span className='text-[#767676]'>/</span>
      <span className='text-[#202020] font-medium'>
        {tabLabel}
      </span>
    </nav>
  )
}
