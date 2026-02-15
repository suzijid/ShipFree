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
  Palette,
  HardHat,
  Wrench,
  Sparkles,
  ArrowLeft,
  Bell,
  Menu,
  X,
  Clock,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { signOut } from '@/lib/auth/auth-client'
import { useOptionalProject } from './project-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DashboardShellProps {
  user: { name: string; email: string }
  children: React.ReactNode
}

export const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className='flex h-svh'>
      {/* Desktop sidebar — collapsible */}
      <aside
        className={`hidden md:flex flex-col bg-white shadow-[1px_0_3px_rgba(0,0,0,0.03)] pt-6 pb-4 px-3 transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        <DesktopSidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='absolute inset-0 bg-black/30' onClick={() => setMobileOpen(false)} />
          <aside className='relative z-10 flex w-64 h-full flex-col bg-white shadow-xl'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-[#e8e4df]'>
              <Link href='/dashboard' className='flex items-center gap-2'>
                <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-sm'>
                  <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
                </div>
                <span
                  className='font-semibold text-[#1a1a2e]'
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Gradia
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className='p-1.5 rounded-lg hover:bg-[#f5f3f0] text-[#9b9b9b]'>
                <X className='size-5' />
              </button>
            </div>
            <MobileSidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className='flex-1 flex flex-col min-w-0'>
        {/* Top header — white, h-14 */}
        <header className='h-14 flex items-center px-4 md:px-6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] shrink-0'>
          <button
            onClick={() => setMobileOpen(true)}
            className='md:hidden p-1.5 rounded-lg hover:bg-[#f5f3f0] text-[#9b9b9b] mr-3'
          >
            <Menu className='size-5' />
          </button>
          <Link href='/dashboard' className='flex items-center gap-2 md:hidden'>
            <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-sm'>
              <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
            </div>
            <span
              className='font-semibold text-[#1a1a2e] hidden sm:inline'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Gradia
            </span>
          </Link>

          <div className='ml-auto flex items-center gap-2'>
            <ClockPill />
            <div className='flex items-center gap-1.5 rounded-full border border-[#e8e4df] px-3 py-2 text-[#9b9b9b] hover:bg-[#f5f3f0] transition-colors cursor-pointer'>
              <Bell className='size-3.5' />
              <span className='hidden sm:inline text-xs font-medium text-[#1a1a2e]'>Notifications</span>
              <span className='size-2 rounded-full bg-[#c9a96e]' />
            </div>
          </div>
        </header>

        <main className='flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Clock pill ─────────────────────────────────────────────────

const ClockPill = () => {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <div className='hidden sm:flex items-center gap-1.5 rounded-full border border-[#e8e4df] px-3 py-2 text-[#9b9b9b]'>
      <Clock className='size-3.5' />
      <span className='text-xs font-medium text-[#1a1a2e]'>{time}</span>
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
          <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-sm shrink-0'>
            <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
          </div>
          {!collapsed && (
            <span
              className='font-semibold text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Gradia
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className='p-1.5 rounded-lg text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors'
            title='Réduire le menu'
          >
            <ChevronsLeft className='size-4' />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className='flex items-center justify-center p-1.5 rounded-lg text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors mb-4 mx-auto'
          title='Agrandir le menu'
        >
          <ChevronsRight className='size-4' />
        </button>
      )}

      <nav className='flex flex-col gap-1 flex-1'>
        {isProjectPage && projectCtx ? (
          <>
            <NavItem href={`/dashboard/projects/${activeProjectId}/overview`} icon={LayoutDashboard} label='Vue d&apos;ensemble' pathname={pathname} collapsed={collapsed} />
            <NavItem href={`/dashboard/projects/${activeProjectId}/messages`} icon={MessageSquare} label='Messages' pathname={pathname} collapsed={collapsed} />
            <NavItem href={`/dashboard/projects/${activeProjectId}/documents`} icon={FileText} label='Documents' pathname={pathname} collapsed={collapsed} />
            {(projectCtx.project.modules.wallet || projectCtx.project.paymentStatus === 'paid') && (
              <NavItem href={`/dashboard/projects/${activeProjectId}/finances`} icon={Wallet} label='Finances' pathname={pathname} collapsed={collapsed} />
            )}
            {projectCtx.project.modules.design && (
              <NavItem href={`/dashboard/projects/${activeProjectId}/conception`} icon={Palette} label='Conception' pathname={pathname} collapsed={collapsed} />
            )}
            <NavItem href={`/dashboard/projects/${activeProjectId}/artisans`} icon={Wrench} label='Artisans' pathname={pathname} collapsed={collapsed} />
            <NavItem href={`/dashboard/projects/${activeProjectId}/design-services`} icon={Sparkles} label='Design' pathname={pathname} collapsed={collapsed} />
            {projectCtx.project.modules.works && (
              <NavItem href={`/dashboard/projects/${activeProjectId}/travaux`} icon={HardHat} label='Travaux' pathname={pathname} collapsed={collapsed} />
            )}
            <div className='my-2 w-full border-t border-[#e8e4df]' />
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
      <div className='border-t border-[#e8e4df] pt-3 mt-auto'>
        <div className={`flex items-center gap-3 py-2 ${collapsed ? 'justify-center' : 'px-3'}`}>
          <Avatar className='size-8 rounded-xl shrink-0'>
            <AvatarFallback className='rounded-xl bg-[#f5f3f0] text-[#1a1a2e] text-xs font-medium border border-[#e8e4df]'>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-[#1a1a2e] truncate'>{user.name}</p>
                <p className='text-xs text-[#9b9b9b] truncate'>{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className='p-1.5 rounded-lg text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors'
                title='Se déconnecter'
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
}: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  pathname: string
  exact?: boolean
  collapsed?: boolean
}) => {
  const hrefSegment = href.split('/').slice(-1)[0]
  const isActive = exact
    ? pathname.endsWith('/dashboard') || pathname.endsWith('/dashboard/')
    : pathname.includes(`/${hrefSegment}`)

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-xl py-2.5 text-sm transition-all ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3'
      } ${
        isActive
          ? 'bg-[#1a1a2e] text-white font-medium'
          : 'text-[#6b6b6b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e]'
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
            {(projectCtx.project.modules.wallet || projectCtx.project.paymentStatus === 'paid') && (
              <MobileNavItem href={`/dashboard/projects/${activeProjectId}/finances`} icon={Wallet} label='Finances' pathname={pathname} onNavigate={onNavigate} />
            )}
            {projectCtx.project.modules.design && (
              <MobileNavItem href={`/dashboard/projects/${activeProjectId}/conception`} icon={Palette} label='Conception' pathname={pathname} onNavigate={onNavigate} />
            )}
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/artisans`} icon={Wrench} label='Artisans' pathname={pathname} onNavigate={onNavigate} />
            <MobileNavItem href={`/dashboard/projects/${activeProjectId}/design-services`} icon={Sparkles} label='Design' pathname={pathname} onNavigate={onNavigate} />
            {projectCtx.project.modules.works && (
              <MobileNavItem href={`/dashboard/projects/${activeProjectId}/travaux`} icon={HardHat} label='Travaux' pathname={pathname} onNavigate={onNavigate} />
            )}
            <div className='my-2 border-t border-[#e8e4df]' />
            <MobileNavItem href='/dashboard' icon={ArrowLeft} label='Retour aux projets' pathname='' onNavigate={onNavigate} />
          </>
        ) : (
          <>
            <MobileNavItem href='/dashboard' icon={FolderKanban} label='Mes projets' pathname={pathname} onNavigate={onNavigate} exact />
            <MobileNavItem href='/questionnaire' icon={Plus} label='Nouveau projet' pathname={pathname} onNavigate={onNavigate} />
          </>
        )}
      </nav>

      <div className='border-t border-[#e8e4df] p-3'>
        <div className='flex items-center gap-3 px-3 py-2'>
          <Avatar className='size-8 rounded-xl'>
            <AvatarFallback className='rounded-xl bg-[#f5f3f0] text-[#1a1a2e] text-xs font-medium border border-[#e8e4df]'>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-[#1a1a2e] truncate'>{user.name}</p>
            <p className='text-xs text-[#9b9b9b] truncate'>{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className='p-1.5 rounded-lg text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors'
            title='Se déconnecter'
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
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
        isActive
          ? 'bg-[#1a1a2e] text-white font-medium'
          : 'text-[#6b6b6b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e]'
      }`}
    >
      <Icon className='size-5' />
      <span>{label}</span>
    </Link>
  )
}
