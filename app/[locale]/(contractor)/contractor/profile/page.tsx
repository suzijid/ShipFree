import { getContractorSession } from '@/lib/auth/require-contractor'
import { ContractorProfileForm } from './profile-form'

export default async function ContractorProfilePage() {
  const { contractor } = await getContractorSession()

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Mon profil
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          Gérez les informations de votre entreprise
        </p>
      </div>

      <ContractorProfileForm contractor={contractor} />
    </div>
  )
}
