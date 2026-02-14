'use client'

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
  ArrowLeft,
  PanelLeftIcon,
} from 'lucide-react'

import { signOut } from '@/lib/auth/auth-client'
import { useOptionalProject } from './project-context'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DashboardShellProps {
  user: { name: string; email: string }
  children: React.ReactNode
}

export const DashboardShell = ({ user, children }: DashboardShellProps) => {
  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <SidebarInset className='!bg-transparent !shadow-none !rounded-none'>
        <div className='flex-1 flex flex-col h-svh overflow-hidden'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const DashboardSidebar = ({ user }: { user: { name: string; email: string } }) => {
  const pathname = usePathname()
  const router = useRouter()
  const projectCtx = useOptionalProject()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Extract project ID from pathname
  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)/)
  const activeProjectId = projectMatch?.[1]

  const isProjectPage = !!activeProjectId

  return (
    <Sidebar variant='sidebar' collapsible='icon'>
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' render={<Link href='/dashboard' />}>
              <div className='flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] text-white shadow-[0_2px_8px_rgba(201,169,110,0.3)]'>
                <span className='text-sm font-bold' style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>G</span>
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span
                  className='truncate font-semibold text-white/95'
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Gradia
                </span>
                <span className='truncate text-xs text-white/40'>Espace client</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className='!bg-white/[0.06]' />

      <SidebarContent data-tour='sidebar-nav'>
        {isProjectPage && projectCtx ? (
          /* ─── Project-specific navigation ─── */
          <>
            <SidebarGroup>
              <SidebarGroupLabel className='!text-white/30 uppercase text-[10px] tracking-widest'>
                {projectCtx.project.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <ProjectNavItem
                    href={`/dashboard/projects/${activeProjectId}/overview`}
                    icon={LayoutDashboard}
                    label='Vue d&apos;ensemble'
                    pathname={pathname}
                  />
                  <ProjectNavItem
                    href={`/dashboard/projects/${activeProjectId}/messages`}
                    icon={MessageSquare}
                    label='Messages'
                    pathname={pathname}
                  />
                  <ProjectNavItem
                    href={`/dashboard/projects/${activeProjectId}/documents`}
                    icon={FileText}
                    label='Documents'
                    pathname={pathname}
                  />
                  {(projectCtx.project.modules.wallet || projectCtx.project.paymentStatus === 'paid') && (
                    <ProjectNavItem
                      href={`/dashboard/projects/${activeProjectId}/finances`}
                      icon={Wallet}
                      label='Finances'
                      pathname={pathname}
                    />
                  )}
                  {projectCtx.project.modules.design && (
                    <ProjectNavItem
                      href={`/dashboard/projects/${activeProjectId}/conception`}
                      icon={Palette}
                      label='Conception'
                      pathname={pathname}
                    />
                  )}
                  {projectCtx.project.modules.works && (
                    <ProjectNavItem
                      href={`/dashboard/projects/${activeProjectId}/travaux`}
                      icon={HardHat}
                      label='Travaux'
                      pathname={pathname}
                    />
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className='!bg-white/[0.06]' />

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip='Retour aux projets'
                      render={<Link href='/dashboard' />}
                      className='!text-white/40 hover:!text-white/70'
                    >
                      <ArrowLeft className='size-4' />
                      <span>Retour aux projets</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          /* ─── Default navigation ─── */
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.endsWith('/dashboard') || pathname.endsWith('/dashboard/')}
                    tooltip='Mes projets'
                    render={<Link href='/dashboard' />}
                  >
                    <FolderKanban className='size-4' />
                    <span>Mes projets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.includes('/questionnaire')}
                    tooltip='Nouveau projet'
                    render={<Link href='/questionnaire' />}
                  >
                    <Plus className='size-4' />
                    <span>Nouveau projet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sidebar trigger (collapse/expand) */}
      <div className='px-2 pb-1'>
        <SidebarCollapseButton />
      </div>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className='flex items-center gap-2 px-2 py-1.5'>
              <Avatar className='size-8 rounded-xl'>
                <AvatarFallback className='rounded-xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 text-[#c9a96e] text-xs font-medium border border-white/[0.08]'>
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate text-xs font-semibold text-white/90'>{user.name}</span>
                <span className='truncate text-xs text-white/30'>{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className='ml-auto rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white/60 transition-colors group-data-[collapsible=icon]:hidden'
                title='Se déconnecter'
              >
                <LogOut className='size-4' />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

const ProjectNavItem = ({
  href,
  icon: Icon,
  label,
  pathname,
  badge,
}: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  pathname: string
  badge?: number
}) => {
  // Check if this nav item is active
  const hrefPath = href.split('/').slice(-1)[0]
  const isActive = pathname.includes(`/${hrefPath}`)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={label}
        render={<Link href={href} />}
        className={isActive ? '!bg-white/10 !border-l-2 !border-[#c9a96e] !rounded-l-none' : ''}
      >
        <Icon className='size-4' />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge && badge > 0 && (
        <SidebarMenuBadge className='!bg-[#c9a96e]/15 !text-[#c9a96e]'>
          {badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

const SidebarCollapseButton = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      className='flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-white/25 hover:bg-white/5 hover:text-white/40 transition-colors group-data-[collapsible=icon]:justify-center'
    >
      <PanelLeftIcon className='size-4' />
      <span className='group-data-[collapsible=icon]:hidden'>Réduire</span>
    </button>
  )
}
