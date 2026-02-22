'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Check,
  ExternalLink,
  Download,
  Clock,
  Loader2,
  CalendarCheck,
  UserCheck,
  FileText,
  PenTool,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  FileIcon,
  Eye,
  User,
} from 'lucide-react'
import NextImage from 'next/image'
import { GlassCard, GlassButton, GlassBadge } from '../../../../components/glass-primitives'
import { DESIGN_SERVICE_PRICING, type DesignServicePricingKey } from '@/config/payments'
import {
  DESIGN_BOOKING_WORKFLOW_STEPS,
  DESIGN_BOOKING_WORKFLOW_LABELS,
  DESIGN_BOOKING_WORKFLOW_DESCRIPTIONS,
  STATUS_TO_WORKFLOW_STEP,
  type DesignBookingWorkflowStep,
} from '@/config/project'
import { cn } from '@/lib/utils'

type Deliverable = { name: string; url: string; type: string }

type Booking = {
  id: string
  type: string
  status: string
  amount: string
  stripePaymentId: string | null
  scheduledAt: Date | null
  deliveredAt: Date | null
  deliverables: Deliverable[] | null
  createdAt: Date
  designerName: string | null
  designerImage: string | null
  designerCompany: string | null
}

const PACKAGES: { key: DesignServicePricingKey; features: string[] }[] = [
  {
    key: 'consultation',
    features: [
      'Appel vid\u00e9o 1h avec un designer',
      'Conseils personnalis\u00e9s',
      'Palette de couleurs',
      'Liste de recommandations',
    ],
  },
  {
    key: '2d_plans',
    features: [
      'Plans 2D de votre projet',
      'Am\u00e9nagement optimis\u00e9',
      'Implantation technique',
      'Cotes et dimensions',
    ],
  },
  {
    key: '3d_renders',
    features: [
      'Rendus 3D photor\u00e9alistes',
      'Visualisation avant/apr\u00e8s',
      '3 angles de vue minimum',
      'Choix mat\u00e9riaux et finitions',
    ],
  },
  {
    key: 'full_package',
    features: [
      'Consultation + Plans 2D + Rendus 3D',
      'Shopping list compl\u00e8te',
      'Suivi avec le designer',
      'R\u00e9visions illimit\u00e9es',
    ],
  },
]

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'gold' | 'success' | 'warning' }> = {
  pending: { label: 'En attente de paiement', variant: 'warning' },
  scheduled: { label: 'Planifi\u00e9', variant: 'gold' },
  assignation_designer: { label: 'Assignation designer', variant: 'gold' },
  brief: { label: 'Brief cr\u00e9atif', variant: 'gold' },
  esquisse: { label: 'Esquisse', variant: 'gold' },
  revisions: { label: 'R\u00e9visions', variant: 'gold' },
  in_progress: { label: 'En cours', variant: 'gold' },
  delivered: { label: 'Livr\u00e9', variant: 'success' },
  livraison: { label: 'Livr\u00e9', variant: 'success' },
  cancelled: { label: 'Annul\u00e9', variant: 'default' },
}

// ─── Workflow step icons ──────────────────────────────────────────────────

const STEP_ICONS: Record<DesignBookingWorkflowStep, typeof Sparkles> = {
  booking: CalendarCheck,
  assignation_designer: UserCheck,
  brief: FileText,
  esquisse: PenTool,
  revisions: RefreshCw,
  livraison: Package,
}

// ─── Workflow Stepper ─────────────────────────────────────────────────────

const WorkflowStepper = ({ currentStatus }: { currentStatus: string }) => {
  const currentStep = STATUS_TO_WORKFLOW_STEP[currentStatus] ?? 'booking'
  const currentStepIndex = DESIGN_BOOKING_WORKFLOW_STEPS.indexOf(currentStep)

  return (
    <div className='glass-card rounded-none p-5'>
      {/* Desktop horizontal stepper */}
      <div className='hidden md:flex items-start'>
        {DESIGN_BOOKING_WORKFLOW_STEPS.map((step, i) => {
          const isCompleted = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          const isFuture = i > currentStepIndex
          const StepIcon = STEP_ICONS[step]

          return (
            <div key={step} className='flex items-start flex-1 min-w-0'>
              <div className='flex flex-col items-center min-w-0'>
                {/* Circle */}
                <div
                  className={cn(
                    'relative flex items-center justify-center size-10 rounded-full shrink-0 transition-all',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-[#202020] text-white',
                    isFuture && 'bg-[#e0e0e0] text-[#999]',
                  )}
                >
                  {isCompleted ? (
                    <Check className='size-5' />
                  ) : (
                    <StepIcon className='size-4' />
                  )}
                  {isCurrent && (
                    <span className='absolute inset-0 rounded-full animate-ping bg-[#202020]/30' />
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center leading-tight max-w-[100px]',
                    isCompleted && 'text-emerald-600',
                    isCurrent && 'text-[#202020] font-semibold',
                    isFuture && 'text-[#999]',
                  )}
                >
                  {DESIGN_BOOKING_WORKFLOW_LABELS[step]}
                </span>
                {isCurrent && (
                  <span className='mt-1 text-[11px] text-[#999] text-center max-w-[120px] leading-snug'>
                    {DESIGN_BOOKING_WORKFLOW_DESCRIPTIONS[step]}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {i < DESIGN_BOOKING_WORKFLOW_STEPS.length - 1 && (
                <div className='flex-1 flex items-center mt-5 px-2'>
                  <div
                    className={cn(
                      'h-0.5 w-full',
                      isCompleted ? 'bg-emerald-500' : 'border-t-2 border-dashed border-[#e0e0e0]',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile vertical stepper */}
      <div className='flex flex-col md:hidden'>
        {DESIGN_BOOKING_WORKFLOW_STEPS.map((step, i) => {
          const isCompleted = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          const isFuture = i > currentStepIndex
          const StepIcon = STEP_ICONS[step]

          return (
            <div key={step} className='flex gap-3'>
              <div className='flex flex-col items-center'>
                <div
                  className={cn(
                    'relative flex items-center justify-center size-8 rounded-full shrink-0',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-[#202020] text-white',
                    isFuture && 'bg-[#e0e0e0] text-[#999]',
                  )}
                >
                  {isCompleted ? (
                    <Check className='size-4' />
                  ) : (
                    <StepIcon className='size-3.5' />
                  )}
                </div>
                {i < DESIGN_BOOKING_WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 my-1',
                      isCompleted ? 'bg-emerald-500' : 'border-l-2 border-dashed border-[#e0e0e0]',
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-4', i === DESIGN_BOOKING_WORKFLOW_STEPS.length - 1 && 'pb-0')}>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-emerald-600',
                    isCurrent && 'text-[#202020] font-semibold',
                    isFuture && 'text-[#999]',
                  )}
                >
                  {DESIGN_BOOKING_WORKFLOW_LABELS[step]}
                </span>
                {isCurrent && (
                  <p className='text-xs text-[#999] mt-0.5 leading-snug'>
                    {DESIGN_BOOKING_WORKFLOW_DESCRIPTIONS[step]}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Designer Assignment Display ──────────────────────────────────────────

const DesignerCard = ({ booking }: { booking: Booking }) => {
  if (!booking.designerName) {
    return (
      <div className='flex items-center gap-3 rounded-none bg-[#f5f5f5] px-4 py-3'>
        <div className='size-10 rounded-full bg-[#e0e0e0] flex items-center justify-center'>
          <User className='size-5 text-[#999]' />
        </div>
        <div>
          <p className='text-sm font-medium text-[#999]'>En attente d&apos;assignation</p>
          <p className='text-xs text-[#999]'>
            Un designer sera assign&eacute; prochainement
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-3 rounded-none bg-[#f5f5f5] px-4 py-3'>
      {booking.designerImage ? (
        <NextImage
          src={booking.designerImage}
          alt={booking.designerName}
          width={40}
          height={40}
          className='size-10 rounded-full object-cover'
          unoptimized
        />
      ) : (
        <div className='size-10 rounded-full bg-[#202020] flex items-center justify-center text-white text-sm font-bold'>
          {booking.designerName.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className='text-sm font-medium text-[#202020]'>{booking.designerName}</p>
        {booking.designerCompany && (
          <p className='text-xs text-[#767676]'>{booking.designerCompany}</p>
        )}
        <p className='text-xs text-emerald-600 flex items-center gap-1 mt-0.5'>
          <UserCheck className='size-3' />
          Designer assign&eacute;
        </p>
      </div>
    </div>
  )
}

// ─── Lightbox ──────────────────────────────────────────────────────────────

const Lightbox = ({
  deliverables,
  initialIndex,
  onClose,
}: {
  deliverables: Deliverable[]
  initialIndex: number
  onClose: () => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const current = deliverables[currentIndex]

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : deliverables.length - 1))
  }, [deliverables.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i < deliverables.length - 1 ? i + 1 : 0))
  }, [deliverables.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, handlePrev, handleNext])

  const isImage = current.type.startsWith('image/')
  const isPdf = current.type === 'application/pdf'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10'
        aria-label='Fermer'
      >
        <X className='size-6' />
      </button>

      {/* Counter */}
      <div className='absolute top-4 left-4 text-white/60 text-sm'>
        {currentIndex + 1} / {deliverables.length}
      </div>

      {/* Prev/Next */}
      {deliverables.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev() }}
            className='absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors'
            aria-label='Pr\u00e9c\u00e9dent'
          >
            <ChevronLeft className='size-8' />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext() }}
            className='absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors'
            aria-label='Suivant'
          >
            <ChevronRight className='size-8' />
          </button>
        </>
      )}

      {/* Content */}
      <div
        className='max-w-[90vw] max-h-[85vh] flex flex-col items-center'
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <NextImage
            src={current.url}
            alt={current.name}
            width={1200}
            height={800}
            className='max-w-full max-h-[80vh] object-contain'
            unoptimized
          />
        )}
        {isPdf && (
          <iframe
            src={current.url}
            className='w-[80vw] h-[80vh] bg-white'
            title={current.name}
          />
        )}
        {!isImage && !isPdf && (
          <div className='flex flex-col items-center gap-4 text-white'>
            <FileIcon className='size-16 text-white/40' />
            <p className='text-lg'>{current.name}</p>
            <a
              href={current.url}
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-white text-[#202020] text-sm font-medium hover:bg-[#f5f5f5] transition-colors'
            >
              Ouvrir le fichier
            </a>
          </div>
        )}
        <p className='mt-3 text-white/60 text-sm'>{current.name}</p>
      </div>
    </motion.div>
  )
}

// ─── Deliverables Gallery ──────────────────────────────────────────────────

const DeliverablesGallery = ({ deliverables }: { deliverables: Deliverable[] }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (deliverables.length === 0) return null

  const handleDownloadAll = () => {
    deliverables.forEach((d) => {
      const link = document.createElement('a')
      link.href = d.url
      link.download = d.name
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const isImage = (type: string) => type.startsWith('image/')
  const isPdf = (type: string) => type === 'application/pdf'

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium text-[#202020]'>Livrables</h3>
        <GlassButton
          variant='ghost'
          size='sm'
          onClick={handleDownloadAll}
        >
          <Download className='size-3.5' />
          Tout t&eacute;l&eacute;charger
        </GlassButton>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
        {deliverables.map((d, i) => {
          const isImg = isImage(d.type)
          const isPdfFile = isPdf(d.type)

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (isPdfFile) {
                  window.open(d.url, '_blank', 'noopener,noreferrer')
                } else {
                  setLightboxIndex(i)
                }
              }}
              className='group relative aspect-square rounded-none bg-[#f5f5f5] border border-[#e0e0e0] overflow-hidden hover:border-[#202020] transition-colors text-left'
            >
              {isImg ? (
                <>
                  <NextImage
                    src={d.url}
                    alt={d.name}
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
                    unoptimized
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center'>
                    <Eye className='size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                </>
              ) : isPdfFile ? (
                <div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
                  <FileText className='size-8 text-[#999] group-hover:text-[#202020] transition-colors' />
                  <span className='text-[10px] text-[#999] uppercase font-medium'>PDF</span>
                </div>
              ) : (
                <div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
                  <FileIcon className='size-8 text-[#999] group-hover:text-[#202020] transition-colors' />
                  <span className='text-[10px] text-[#999] uppercase font-medium'>
                    {d.type.split('/').pop() ?? 'Fichier'}
                  </span>
                </div>
              )}

              {/* Name overlay */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5'>
                <p className='text-[10px] text-white truncate'>{d.name}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            deliverables={deliverables}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

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
      // Silently fail -- user will see no redirect
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
        <h1 className='text-xl font-semibold text-[#202020]'>Services Design</h1>
        <p className='text-sm text-[#999] mt-1'>
          Faites appel &agrave; nos designers pour visualiser votre projet avant les travaux.
        </p>
      </div>

      {/* Existing bookings with workflow stepper */}
      {activeBookings.length > 0 && (
        <div className='space-y-6'>
          <h2 className='text-sm font-medium text-[#202020]'>Vos r&eacute;servations</h2>
          <div className='space-y-6'>
            {activeBookings.map((booking) => {
              const pricing = DESIGN_SERVICE_PRICING[booking.type as DesignServicePricingKey]
              const statusInfo = STATUS_LABELS[booking.status] ?? STATUS_LABELS.pending
              const allDeliverables = [
                ...(booking.deliverables ?? []),
              ]

              return (
                <GlassCard key={booking.id} className='p-5 space-y-5'>
                  {/* Booking header */}
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='size-4 text-[#202020]' />
                        <span className='text-sm font-medium text-[#202020]'>
                          {pricing?.label ?? booking.type}
                        </span>
                      </div>
                      <p className='text-xs text-[#999]'>
                        {booking.amount} EUR
                      </p>
                    </div>
                    <GlassBadge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </GlassBadge>
                  </div>

                  {/* Workflow stepper */}
                  {booking.status !== 'pending' && (
                    <WorkflowStepper currentStatus={booking.status} />
                  )}

                  {/* Designer assignment */}
                  <DesignerCard booking={booking} />

                  {booking.scheduledAt && (
                    <div className='flex items-center gap-2 text-xs text-[#666]'>
                      <Clock className='size-3.5' />
                      Pr&eacute;vu le {new Date(booking.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}

                  {/* Deliverables gallery */}
                  {allDeliverables.length > 0 && (
                    <DeliverablesGallery deliverables={allDeliverables} />
                  )}
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Available packages */}
      <div className='space-y-4'>
        <h2 className='text-sm font-medium text-[#202020]'>
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
                className={`p-6 flex flex-col ${pkg.key === 'full_package' ? 'ring-1 ring-[#202020]' : ''}`}
              >
                {pkg.key === 'full_package' && (
                  <GlassBadge variant='gold' className='self-start mb-3'>
                    Meilleure offre
                  </GlassBadge>
                )}

                <div className='flex items-baseline justify-between mb-3'>
                  <h3 className='text-base font-semibold text-[#202020]'>{pricing.label}</h3>
                  <span className='text-lg font-bold text-[#202020]'>
                    {(pricing.amount / 100).toLocaleString('fr-FR')} &euro;
                  </span>
                </div>

                <ul className='space-y-2 flex-1 mb-5'>
                  {pkg.features.map((f, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm text-[#666]'>
                      <Check className='size-4 text-[#202020] mt-0.5 shrink-0' />
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
                    'D\u00e9j\u00e0 r\u00e9serv\u00e9'
                  ) : (
                    'R\u00e9server'
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
