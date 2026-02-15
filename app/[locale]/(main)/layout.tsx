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
    <div className='dashboard-light bg-[#f2f0ed] min-h-svh'>
      <DashboardShell user={{ name: session.user.name, email: session.user.email }}>
        <TourProvider>
          {children}
        </TourProvider>
      </DashboardShell>
    </div>
  )
}
