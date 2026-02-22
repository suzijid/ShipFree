'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FolderKanban,
  Plus,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Wallet,
  Wrench,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  PenTool,
  HardHat,
  Settings,
  Bell,
} from 'lucide-react'

import { signOut } from '@/lib/auth/auth-client'
import { useOptionalProject } from './project-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PROJECT_PHASE_LABELS, type ProjectPhase } from '@/config/project'
import { Breadcrumbs } from './breadcrumbs'
import { NotificationCenter } from './notification-center'

interface DashboardShellProps {
  user: { name: string; email: string }
  children: React.ReactNode
}

export const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('gradia_sidebar_seen') === 'true'
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('gradia_sidebar_seen')) {
      setCollapsed(false)
      localStorage.setItem('gradia_sidebar_seen', 'true')
    }
  }, [])

  // PWA: register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <div className='flex h-svh'>
      {/* Desktop sidebar — collapsible */}
      <aside
        data-tour='sidebar-nav'
        className={`hidden md:flex flex-col bg-white border-r border-[#e0e0e0] pt-6 pb-4 px-3 transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        <DesktopSidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='absolute inset-0 bg-black/30' onClick={() => setMobileOpen(false)} />
          <aside className='relative z-10 flex w-64 h-full flex-col bg-white border-r border-[#e0e0e0]'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]'>
              <Link href='/dashboard' className='flex items-center gap-2'>
                <span className='text-[22px] font-bold text-[#b8960c] leading-none'>G</span>
                <span className='text-[12px] font-light tracking-[0.3em] text-[#202020] uppercase'>
                  Gradia
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className='p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#767676] hover:text-[#202020] transition-colors' aria-label='Fermer le menu'>
                <X className='size-5' />
              </button>
            </div>
            <MobileSidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className='flex-1 flex flex-col min-w-0'>
        {/* Top header */}
        <header className='h-14 flex items-center px-4 md:px-6 bg-white border-b border-[#e0e0e0] shrink-0'>
          <button
            onClick={() => setMobileOpen(true)}
            className='md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#767676] hover:text-[#202020] mr-3 transition-colors'
            aria-label='Ouvrir le menu'
          >
            <Menu className='size-5' />
          </button>
          <Link href='/dashboard' className='flex items-center gap-2 md:hidden'>
            <span className='text-[22px] font-bold text-[#b8960c] leading-none'>G</span>
            <span className='text-[12px] font-light tracking-[0.3em] text-[#202020] uppercase hidden sm:inline'>
              Gradia
            </span>
          </Link>

          <Breadcrumbs />

          <div className='ml-auto flex items-center gap-2'>
            <ProjectStatusPill />
            <NotificationCenter />
          </div>
        </header>

        <main className='flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Project Status Pill ─────────────────────────────────────────

const ProjectStatusPill = () => {
  const projectCtx = useOptionalProject()

  if (!projectCtx) return null

  const phase = projectCtx.project.phase as ProjectPhase
  const label = PROJECT_PHASE_LABELS[phase]

  if (!label) return null

  return (
    <div className='hidden sm:flex items-center gap-1.5 border border-[#e0e0e0] px-3 py-2 text-[#767676]'>
      <span className='size-1.5 rounded-full bg-[#202020]' />
      <span className='text-xs text-[#202020]'>Phase : {label}</span>
    </div>
  )
}

// ─── Desktop sidebar ────────────────────────────────────────────

const DesktopSidebar = ({
  user,
  collapsed,
  onToggle,
}: {
  user: { name: string; email: string }
  collapsed: boolean
  onToggle: () => void
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const projectCtx = useOptionalProject()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)/)
  const activeProjectId = projectMatch?.[1]
  const isProjectPage = !!activeProjectId

  return (
    <>
      {/* Logo + collapse toggle */}
      <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'justify-between px-3'}`}>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <span className='text-[22px] font-bold text-[#b8960c] leading-none shrink-0'>G</span>
          {!collapsed && (
            <span className='text-[12px] font-light tracking-[0.3em] text-[#202020] uppercase'>
              Gradia
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className='p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#767676] hover:text-[#202020] transition-colors'
            title='Réduire le menu'
            aria-label='Réduire le menu'
          >
            <ChevronsLeft className='size-4' />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className='flex items-center justify-center p-2 min-h-[44px] min-w-[44px] text-[#767676] hover:text-[#202020] transition-colors mb-4 mx-auto'
          title='Agrandir le menu'
          aria-label='Agrandir le menu'
        >
          <ChevronsRight className='size-4' />
        </button>
      )}

      <nav className='flex flex-col gap-1 flex-1'>
        {isProjectPage && projectCtx ? (
          <>
            <NavItem href={`/dashboard/projects/${activeProjectId}/overview`} icon={LayoutDashboard} label='Vue d&apos;ensemble' pathname={pathname} collapsed={collapsed} tourId='overview-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/messages`} icon={MessageSquare} label='Messages' pathname={pathname} collapsed={collapsed} tourId='messages-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/documents`} icon={FileText} label='Documents' pathname={pathname} collapsed={collapsed} tourId='documents-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/finances`} icon={Wallet} label='Finances' pathname={pathname} collapsed={collapsed} tourId='finances-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/artisans`} icon={Wrench} label='Artisans' pathname={pathname} collapsed={collapsed} tourId='artisans-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/design-services`} icon={Sparkles} label='Design' pathname={pathname} collapsed={collapsed} tourId='design-nav' />
            <NavItem href={`/dashboard/projects/${activeProjectId}/conception`} icon={PenTool} label='Conception' pathname={pathname} collapsed={collapsed} />
            <NavItem href={`/dashboard/projects/${activeProjectId}/travaux`} icon={HardHat} label='Travaux' pathname={pathname} collapsed={collapsed} />
            <div className='my-2 w-full border-t border-[#e0e0e0]' />
            <NavItem href='/dashboard/settings/notifications' icon={Bell} label='Notifications' pathname={pathname} collapsed={collapsed} />
            <NavItem href='/dashboard' icon={ArrowLeft} label='Retour aux projets' pathname='' collapsed={collapsed} />
          </>
        ) : (
          <>
            <NavItem href='/dashboard' icon={FolderKanban} label='Mes projets' pathname={pathname} exact collapsed={collapsed} />
            <NavItem href='/questionnaire' icon={Plus} label='Nouveau projet' pathname={pathname} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* User footer */}
      <div className='border-t border-[#e0e0e0] pt-3 mt-auto'>
        <div className={`flex items-center gap-3 py-2 ${collapsed ? 'justify-center' : 'px-3'}`}>
          <Avatar className='size-8 shrink-0'>
            <AvatarFallback className='bg-[#f5f5f5] text-[#202020] text-xs font-medium border border-[#e0e0e0]'>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-[#202020] truncate'>{user.name}</p>
                <p className='text-xs text-[#999] truncate'>{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className='p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#767676] hover:text-[#202020] transition-colors'
                title='Se déconnecter'
                aria-label='Se déconnecter'
              >
                <LogOut className='size-4' />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Desktop nav item (icon + label) ────────────────────────────

const NavItem = ({
  href,
  icon: Icon,
  label,
  pathname,
  exact = false,
  collapsed = false,
  tourId,
}: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  pathname: string
  exact?: boolean
  collapsed?: boolean
  tourId?: string
}) => {
  const hrefSegment = href.split('/').slice(-1)[0]
  const isActive = exact
    ? pathname.endsWith('/dashboard') || pathname.endsWith('/dashboard/')
    : pathname.includes(`/${hrefSegment}`)

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      data-tour={tourId}
      className={`flex items-center min-h-[44px] py-2.5 text-sm transition-colors ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3'
      } ${
        isActive
          ? 'bg-[#202020] text-white'
          : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#202020]'
      }`}
    >
      <Icon className='size-5 shrink-0' />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

// ─── Mobile sidebar content ─────────────────────────────────────

const MobileSidebarContent = ({
  user,
  onNavigate,
}: {
  user: { name: string; email: string }
  onNavigate: () => void
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const projectCtx = useOptionalProject()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)/)
  const activeProjectId = projectMatch?.[1]
  const isProjectPage = !!activeProjectId

  return (
    <>
      <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {isProjectPage && projectCtx ? (
          <>
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/overview`} icon={LayoutDashboard} label='Vue d&apos;ensemble' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/messages`} icon={MessageSquare} label='Messages' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/documents`} icon={FileText} label='Documents' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/finances`} icon={Wallet} label='Finances' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/artisans`} icon={Wrench} label='Artisans' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/design-services`} icon={Sparkles} label='Design' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/conception`} icon={PenTool} label='Conception' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/travaux`} icon={HardHat} label='Travaux' pathname={pathname} onNavigate={onNavigate} />
            <div className='my-2 border-t border-[#e0e0e0]' />
            <MobileNavItem href='/dashboard/settings/notifications' icon={Bell} label='Notifications' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href='/dashboard' icon={ArrowLeft} label='Retour aux projets' pathname='' onNavigate={onNavigate} />
          </>
        ) : (
          <>
            <MobileNavItem href='/dashboard' icon={FolderKanban} label='Mes projets' pathname={pathname} onNavigate={onNavigate} exact />
            <MobileNavItem href='/questionnaire' icon={Plus} label='Nouveau projet' pathname={pathname} onNavigate={onNavigate} />
          </>
        )}
      </nav>

      <div className='border-t border-[#e0e0e0] p-3'>
        <div className='flex items-center gap-3 px-3 py-2'>
          <Avatar className='size-8'>
            <AvatarFallback className='bg-[#f5f5f5] text-[#202020] text-xs font-medium border border-[#e0e0e0]'>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-[#202020] truncate'>{user.name}</p>
            <p className='text-xs text-[#999] truncate'>{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className='p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#767676] hover:text-[#202020] transition-colors'
            title='Se déconnecter'
            aria-label='Se déconnecter'
          >
            <LogOut className='size-4' />
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Mobile nav item ────────────────────────────────────────────

const MobileNavItem = ({
  href,
  icon: Icon,
  label,
  pathname,
  onNavigate,
  exact = false,
}: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  pathname: string
  onNavigate: () => void
  exact?: boolean
}) => {
  const hrefSegment = href.split('/').slice(-1)[0]
  const isActive = exact
    ? pathname.endsWith('/dashboard') || pathname.endsWith('/dashboard/')
    : pathname.includes(`/${hrefSegment}`)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 min-h-[44px] py-2.5 text-sm transition-colors ${
        isActive
          ? 'bg-[#202020] text-white'
          : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#202020]'
      }`}
    >
      <Icon className='size-5' />
      <span>{label}</span>
    </Link>
  )
}
