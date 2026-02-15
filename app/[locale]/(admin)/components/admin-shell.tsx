'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Activity,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Clock,
  Shield,
  HardHat,
} from 'lucide-react'

import { signOut } from '@/lib/auth/auth-client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AdminShellProps {
  user: { name: string; email: string }
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/projects', icon: FolderKanban, label: 'Projets' },
  { href: '/admin/contractors', icon: HardHat, label: 'Artisans' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/activity', icon: Activity, label: 'Activité' },
] as const

export const AdminShell = ({ user, children }: AdminShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className='flex h-svh'>
      {/* Desktop sidebar */}
      <aside className='hidden md:flex w-14 flex-col items-center bg-white shadow-[1px_0_3px_rgba(0,0,0,0.03)] pt-6 pb-4'>
        <DesktopSidebar user={user} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='absolute inset-0 bg-black/30' onClick={() => setMobileOpen(false)} />
          <aside className='relative z-10 flex w-64 h-full flex-col bg-white shadow-xl'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-[#e8e4df]'>
              <div className='flex items-center gap-2'>
                <span
                  className='font-semibold text-[#1a1a2e]'
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Gradia
                </span>
                <span className='text-[9px] font-bold uppercase tracking-wider bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded'>
                  Admin
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className='p-1.5 rounded-lg hover:bg-[#f5f3f0] text-[#9b9b9b]'>
                <X className='size-5' />
              </button>
            </div>
            <MobileSidebar user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className='flex-1 flex flex-col min-w-0'>
        {/* Top header */}
        <header className='h-14 flex items-center px-4 md:px-6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] shrink-0'>
          <button
            onClick={() => setMobileOpen(true)}
            className='md:hidden p-1.5 rounded-lg hover:bg-[#f5f3f0] text-[#9b9b9b] mr-3'
          >
            <Menu className='size-5' />
          </button>
          <Link href='/admin' className='flex items-center gap-2'>
            <div className='flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] text-white shadow-sm'>
              <Shield className='size-4' />
            </div>
            <span
              className='font-semibold text-[#1a1a2e] hidden sm:inline'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Gradia
            </span>
            <span className='hidden sm:inline text-[9px] font-bold uppercase tracking-wider bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded'>
              Admin
            </span>
          </Link>

          <div className='ml-auto flex items-center gap-2'>
            <ClockPill />
            <Link
              href='/dashboard'
              className='flex items-center gap-1.5 rounded-full border border-[#e8e4df] px-3 py-2 text-[#9b9b9b] hover:bg-[#f5f3f0] transition-colors text-xs'
            >
              <ArrowLeft className='size-3.5' />
              <span className='hidden sm:inline text-[#1a1a2e]'>Retour client</span>
            </Link>
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

const DesktopSidebar = ({ user }: { user: { name: string; email: string } }) => {
  const pathname = usePathname()
  const router = useRouter()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className='flex flex-col items-center gap-1 flex-1'>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname.endsWith('/admin') || pathname.endsWith('/admin/')
            : pathname.includes(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center size-10 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#1a1a2e] text-white shadow-sm'
                  : 'text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e]'
              }`}
            >
              <item.icon className='size-5' />
            </Link>
          )
        })}
      </nav>

      <div className='flex flex-col items-center gap-2 mt-auto'>
        <button
          onClick={handleSignOut}
          className='flex items-center justify-center size-10 rounded-xl text-[#9b9b9b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors'
          title='Se déconnecter'
        >
          <LogOut className='size-5' />
        </button>
        <Avatar className='size-9 rounded-xl'>
          <AvatarFallback className='rounded-xl bg-[#f5f3f0] text-[#1a1a2e] text-xs font-medium border border-[#e8e4df]'>
            {getInitials(user.name || user.email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </>
  )
}

// ─── Mobile sidebar ─────────────────────────────────────────────

const MobileSidebar = ({
  user,
  onNavigate,
}: {
  user: { name: string; email: string }
  onNavigate: () => void
}) => {
  const pathname = usePathname()
  const router = useRouter()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname.endsWith('/admin') || pathname.endsWith('/admin/')
            : pathname.includes(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-[#1a1a2e] text-white font-medium'
                  : 'text-[#6b6b6b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e]'
              }`}
            >
              <item.icon className='size-5' />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <div className='my-2 border-t border-[#e8e4df]' />
        <Link
          href='/dashboard'
          onClick={onNavigate}
          className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#6b6b6b] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-all'
        >
          <ArrowLeft className='size-5' />
          <span>Retour client</span>
        </Link>
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
