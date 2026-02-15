import { getContractorSession } from '@/lib/auth/require-contractor'
import { StripeSetupContent } from './stripe-setup-content'

export default async function StripeSetupPage() {
  const { contractor } = await getContractorSession()

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Configuration Stripe
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          Connectez votre compte bancaire pour recevoir les paiements
        </p>
      </div>

      <StripeSetupContent
        stripeConnectStatus={contractor.stripeConnectStatus}
        hasAccountId={!!contractor.stripeConnectAccountId}
      />
    </div>
  )
}
