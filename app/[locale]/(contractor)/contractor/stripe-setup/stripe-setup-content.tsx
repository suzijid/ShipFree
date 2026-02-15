'use client'

import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'

export const StripeSetupContent = ({
  stripeConnectStatus,
  hasAccountId,
}: {
  stripeConnectStatus: string
  hasAccountId: boolean
}) => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(stripeConnectStatus)

  useEffect(() => {
    if (hasAccountId) {
      fetch('/api/contractor/stripe-connect/status')
        .then(r => r.json())
        .then(data => setStatus(data.status))
    }
  }, [hasAccountId])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contractor/stripe-connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    const res = await fetch('/api/contractor/stripe-connect/status')
    const data = await res.json()
    setStatus(data.status)
  }

  if (status === 'active') {
    return (
      <GlassCard className='p-8 text-center'>
        <CheckCircle className='size-16 text-green-600 mx-auto mb-4' />
        <h2 className='text-xl font-semibold text-[#1a1a2e] mb-2'>
          Compte Stripe connecté
        </h2>
        <p className='text-sm text-[#9b9b9b] mb-4'>
          Votre compte est actif. Vous pouvez recevoir des paiements.
        </p>
        <GlassBadge variant='success'>Actif</GlassBadge>
      </GlassCard>
    )
  }

  return (
    <GlassCard className='p-8'>
      <div className='max-w-md mx-auto text-center space-y-6'>
        <div className='flex items-center justify-center size-16 rounded-2xl bg-[#f5f3f0] mx-auto'>
          <CreditCard className='size-8 text-[#c9a96e]' />
        </div>
        <div>
          <h2 className='text-xl font-semibold text-[#1a1a2e] mb-2'>
            {hasAccountId ? 'Finalisez votre configuration' : 'Connectez votre compte bancaire'}
          </h2>
          <p className='text-sm text-[#9b9b9b]'>
            Stripe Connect vous permet de recevoir les paiements directement sur votre compte bancaire de manière sécurisée.
          </p>
        </div>

        {status === 'onboarding' && (
          <div className='flex items-center justify-center gap-2'>
            <GlassBadge variant='warning'>Configuration en cours</GlassBadge>
            <button onClick={handleRefresh} className='p-1.5 rounded-lg hover:bg-[#f5f3f0]'>
              <RefreshCw className='size-4 text-[#9b9b9b]' />
            </button>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className='flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors disabled:opacity-50'
        >
          <ExternalLink className='size-4' />
          {hasAccountId ? 'Continuer la configuration' : 'Connecter avec Stripe'}
        </button>

        <p className='text-xs text-[#9b9b9b]'>
          Vous serez redirigé vers Stripe pour configurer votre compte en toute sécurité.
        </p>
      </div>
    </GlassCard>
  )
}
