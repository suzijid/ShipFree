import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { DashboardShell } from './components/dashboard-shell'
import { TourProvider } from './components/onboarding/tour-provider'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='dashboard-dark'>
      {/* Background gradient + orbs */}
      <div className='fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f24] to-[#1a1a2e]'>
        <div className='absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/[0.03] blur-[120px]' />
        <div className='absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#4a3f8a]/[0.04] blur-[100px]' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#1a1a3e]/[0.3] blur-[150px]' />
      </div>

      {/* Grain texture overlay */}
      <div className='fixed inset-0 -z-5 opacity-[0.015] pointer-events-none' style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

      <DashboardShell user={{ name: session.user.name, email: session.user.email }}>
        <TourProvider>
          {children}
        </TourProvider>
      </DashboardShell>
    </div>
  )
}
