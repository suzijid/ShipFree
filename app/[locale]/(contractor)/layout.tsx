import { getContractorSession } from '@/lib/auth/require-contractor'
import { ContractorShell } from './components/contractor-shell'

export default async function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { session } = await getContractorSession()

  return (
    <div className='dashboard-light bg-[#f2f0ed] min-h-svh'>
      <ContractorShell user={{ name: session.user.name, email: session.user.email }}>
        {children}
      </ContractorShell>
    </div>
  )
}
