import { getAdminSession } from '@/lib/auth/require-admin'
import { AdminShell } from './components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  return (
    <div className='dashboard-light bg-[#f2f0ed] min-h-svh'>
      <AdminShell user={{ name: session.user.name, email: session.user.email }}>
        {children}
      </AdminShell>
    </div>
  )
}
