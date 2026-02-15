'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Check, ExternalLink, Download, Clock, Loader2 } from 'lucide-react'
import { GlassCard, GlassButton, GlassBadge } from '../../../../components/glass-primitives'
import { DESIGN_SERVICE_PRICING, type DesignServicePricingKey } from '@/config/payments'

type Booking = {
  id: string
  type: string
  status: string
  amount: string
  stripePaymentId: string | null
  scheduledAt: Date | null
  deliveredAt: Date | null
  deliverables: { name: string; url: string; type: string }[] | null
  createdAt: Date
}

const PACKAGES: { key: DesignServicePricingKey; features: string[] }[] = [
  {
    key: 'consultation',
    features: [
      'Appel vidéo 1h avec un designer',
      'Conseils personnalisés',
      'Palette de couleurs',
      'Liste de recommandations',
    ],
  },
  {
    key: '2d_plans',
    features: [
      'Plans 2D de votre projet',
      'Aménagement optimisé',
      'Implantation technique',
      'Cotes et dimensions',
    ],
  },
  {
    key: '3d_renders',
    features: [
      'Rendus 3D photoréalistes',
      'Visualisation avant/après',
      '3 angles de vue minimum',
      'Choix matériaux et finitions',
    ],
  },
  {
    key: 'full_package',
    features: [
      'Consultation + Plans 2D + Rendus 3D',
      'Shopping list complète',
      'Suivi avec le designer',
      'Révisions illimitées',
    ],
  },
]

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'gold' | 'success' | 'warning' }> = {
  pending: { label: 'En attente de paiement', variant: 'warning' },
  scheduled: { label: 'Planifié', variant: 'gold' },
  in_progress: { label: 'En cours', variant: 'gold' },
  delivered: { label: 'Livré', variant: 'success' },
  cancelled: { label: 'Annulé', variant: 'default' },
}

export const DesignServicesContent = ({
  projectId,
  bookings,
}: {
  projectId: string
  bookings: Booking[]
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleBook = async (type: DesignServicePricingKey) => {
    setLoading(type)
    try {
      const res = await fetch('/api/design-services/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, type }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // Silently fail — user will see no redirect
    } finally {
      setLoading(null)
    }
  }

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled')
  const bookedTypes = new Set(activeBookings.map((b) => b.type))

  return (
    <div className='p-4 md:p-6 space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold text-[#1a1a2e]'>Services Design</h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          Faites appel à nos designers pour visualiser votre projet avant les travaux.
        </p>
      </div>

      {/* Existing bookings */}
      {activeBookings.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-sm font-medium text-[#1a1a2e]'>Vos réservations</h2>
          <div className='grid gap-4'>
            {activeBookings.map((booking) => {
              const pricing = DESIGN_SERVICE_PRICING[booking.type as DesignServicePricingKey]
              const statusInfo = STATUS_LABELS[booking.status] ?? STATUS_LABELS.pending
              return (
                <GlassCard key={booking.id} className='p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='size-4 text-[#c9a96e]' />
                        <span className='text-sm font-medium text-[#1a1a2e]'>
                          {pricing?.label ?? booking.type}
                        </span>
                      </div>
                      <p className='text-xs text-[#9b9b9b]'>
                        {booking.amount} EUR
                      </p>
                    </div>
                    <GlassBadge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </GlassBadge>
                  </div>

                  {booking.scheduledAt && (
                    <div className='flex items-center gap-2 mt-3 text-xs text-[#6b6b6b]'>
                      <Clock className='size-3.5' />
                      Prévu le {new Date(booking.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}

                  {/* Deliverables */}
                  {booking.status === 'delivered' && booking.deliverables && booking.deliverables.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      <p className='text-xs font-medium text-[#1a1a2e]'>Livrables</p>
                      <div className='space-y-1'>
                        {booking.deliverables.map((d, i) => (
                          <a
                            key={i}
                            href={d.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 rounded-lg bg-[#f5f3f0] px-3 py-2 text-xs text-[#1a1a2e] hover:bg-[#ebe8e4] transition-colors'
                          >
                            <Download className='size-3.5 text-[#c9a96e]' />
                            <span className='flex-1 truncate'>{d.name}</span>
                            <ExternalLink className='size-3 text-[#9b9b9b]' />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Available packages */}
      <div className='space-y-4'>
        <h2 className='text-sm font-medium text-[#1a1a2e]'>
          {activeBookings.length > 0 ? 'Autres services disponibles' : 'Choisissez un service'}
        </h2>
        <div className='grid md:grid-cols-2 gap-4'>
          {PACKAGES.map((pkg) => {
            const pricing = DESIGN_SERVICE_PRICING[pkg.key]
            const isBooked = bookedTypes.has(pkg.key)
            const isFullPackageBooked = bookedTypes.has('full_package')
            const disabled = isBooked || (isFullPackageBooked && pkg.key !== 'full_package')

            return (
              <GlassCard
                key={pkg.key}
                className={`p-6 flex flex-col ${pkg.key === 'full_package' ? 'ring-2 ring-[#c9a96e]/30' : ''}`}
              >
                {pkg.key === 'full_package' && (
                  <GlassBadge variant='gold' className='self-start mb-3'>
                    Meilleure offre
                  </GlassBadge>
                )}

                <div className='flex items-baseline justify-between mb-3'>
                  <h3 className='text-base font-semibold text-[#1a1a2e]'>{pricing.label}</h3>
                  <span className='text-lg font-bold text-[#1a1a2e]'>
                    {(pricing.amount / 100).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <ul className='space-y-2 flex-1 mb-5'>
                  {pkg.features.map((f, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm text-[#6b6b6b]'>
                      <Check className='size-4 text-[#c9a96e] mt-0.5 shrink-0' />
                      {f}
                    </li>
                  ))}
                </ul>

                <GlassButton
                  variant={pkg.key === 'full_package' ? 'gold' : 'ghost'}
                  className='w-full'
                  disabled={disabled || loading === pkg.key}
                  onClick={() => handleBook(pkg.key)}
                >
                  {loading === pkg.key ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : isBooked ? (
                    'Déjà réservé'
                  ) : (
                    'Réserver'
                  )}
                </GlassButton>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
