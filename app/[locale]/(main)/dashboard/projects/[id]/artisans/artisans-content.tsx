'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HardHat,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  LayoutGrid,
  Table2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'

import { GlassCard, GlassBadge, GlassButton } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  CONTRACTOR_SPECIALTY_LABELS,
  CONTRACTOR_ASSIGNMENT_STATUS_LABELS,
  type ContractorSpecialty,
  type ContractorAssignmentStatus,
} from '@/config/project'

interface ContractorWithProposal {
  pcId: string
  specialty: string
  assignmentStatus: string
  contractorId: string
  companyName: string
  rating: string | null
  reviewCount: number
  contractorName: string
  proposal: {
    id: string
    amount: string
    description: string | null
    estimatedDuration: string | null
    startDate: Date | null
    status: string
    submittedAt: Date | null
  } | null
}

// ─── Star Rating Component ─────────────────────────────────────────────────

const StarRating = ({ rating, reviewCount }: { rating: string | null; reviewCount: number }) => {
  if (!rating || reviewCount === 0) {
    return <span className='text-xs text-[#999]'>Aucun avis</span>
  }

  const numRating = parseFloat(rating)
  const fullStars = Math.floor(numRating)
  const hasHalfStar = numRating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className='flex items-center gap-1.5'>
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className='size-3.5 text-[#b8960c] fill-[#b8960c]' />
        ))}
        {hasHalfStar && (
          <div className='relative'>
            <Star className='size-3.5 text-[#e0e0e0]' />
            <div className='absolute inset-0 w-1/2 overflow-hidden'>
              <Star className='size-3.5 text-[#b8960c] fill-[#b8960c]' />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className='size-3.5 text-[#e0e0e0]' />
        ))}
      </div>
      <span className='text-xs text-[#767676]'>
        {numRating.toFixed(1)} ({reviewCount} avis)
      </span>
    </div>
  )
}

// ─── Sort helpers ───────────────────────────────────────────────────────────

type SortColumn = 'companyName' | 'amount' | 'estimatedDuration' | 'startDate' | 'status'
type SortDirection = 'asc' | 'desc'

const SortIcon = ({ column, sortColumn, sortDirection }: { column: SortColumn; sortColumn: SortColumn | null; sortDirection: SortDirection }) => {
  if (sortColumn !== column) return <ArrowUpDown className='size-3 text-[#999]' />
  return sortDirection === 'asc' ? (
    <ArrowUp className='size-3 text-[#202020]' />
  ) : (
    <ArrowDown className='size-3 text-[#202020]' />
  )
}

const PROPOSAL_STATUS_ORDER: Record<string, number> = {
  submitted: 0,
  revised: 1,
  accepted: 2,
  rejected: 3,
  draft: 4,
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const ArtisansContent = ({
  projectId,
  contractors,
  userRole,
}: {
  projectId: string
  contractors: ContractorWithProposal[]
  userRole: string
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const canRespond = userRole === 'owner' || userRole === 'admin'

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedContractors = useMemo(() => {
    if (!sortColumn) return contractors

    return [...contractors].sort((a, b) => {
      let cmp = 0

      switch (sortColumn) {
        case 'companyName':
          cmp = a.companyName.localeCompare(b.companyName, 'fr')
          break
        case 'amount': {
          const amtA = a.proposal ? parseFloat(a.proposal.amount) : Infinity
          const amtB = b.proposal ? parseFloat(b.proposal.amount) : Infinity
          cmp = amtA - amtB
          break
        }
        case 'estimatedDuration': {
          const durA = a.proposal?.estimatedDuration ?? ''
          const durB = b.proposal?.estimatedDuration ?? ''
          cmp = durA.localeCompare(durB, 'fr')
          break
        }
        case 'startDate': {
          const dA = a.proposal?.startDate ? new Date(a.proposal.startDate).getTime() : Infinity
          const dB = b.proposal?.startDate ? new Date(b.proposal.startDate).getTime() : Infinity
          cmp = dA - dB
          break
        }
        case 'status': {
          const sA = PROPOSAL_STATUS_ORDER[a.proposal?.status ?? ''] ?? 99
          const sB = PROPOSAL_STATUS_ORDER[b.proposal?.status ?? ''] ?? 99
          cmp = sA - sB
          break
        }
      }

      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [contractors, sortColumn, sortDirection])

  const handleAccept = async (proposalId: string) => {
    setLoading(proposalId)
    try {
      await fetch(`/api/project/${projectId}/proposals/${proposalId}/accept`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (proposalId: string) => {
    setLoading(proposalId)
    try {
      await fetch(`/api/project/${projectId}/proposals/${proposalId}/reject`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  if (contractors.length === 0) {
    return (
      <div className='p-4 md:p-6'>
        <h1 className='text-2xl font-bold text-[#202020] mb-6'>
          Artisans
        </h1>
        <GlassCard className='p-12 text-center'>
          <HardHat className='size-12 mx-auto text-[#999] mb-4' />
          <h2 className='text-lg font-semibold text-[#202020] mb-2'>
            Artisans en cours de s&eacute;lection
          </h2>
          <p className='text-sm text-[#999] max-w-md mx-auto'>
            Notre &eacute;quipe s&eacute;lectionne les meilleurs artisans pour votre projet.
            Vous serez notifi&eacute; d&egrave;s qu&apos;un artisan aura soumis un devis.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className='p-4 md:p-6 space-y-6'>
      {/* Header with view toggle */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[#202020]'>
            Artisans
          </h1>
          <p className='text-sm text-[#999] mt-1'>
            {contractors.length} artisan{contractors.length !== 1 ? 's' : ''} sur votre projet
          </p>
        </div>

        {/* View toggle */}
        <div className='flex items-center gap-1 bg-[#f5f5f5] p-1'>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-[#202020] shadow-sm'
                : 'text-[#999] hover:text-[#666]'
            }`}
            aria-label='Vue cartes'
          >
            <LayoutGrid className='size-3.5' />
            Cartes
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-[#202020] shadow-sm'
                : 'text-[#999] hover:text-[#666]'
            }`}
            aria-label='Vue tableau'
          >
            <Table2 className='size-3.5' />
            Tableau
          </button>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {viewMode === 'cards' ? (
          <motion.div
            key='cards'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className='grid gap-4'
          >
            {sortedContractors.map((c) => (
              <GlassCard key={c.pcId} className='p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center size-12 rounded-none bg-[#f5f5f5]'>
                      <HardHat className='size-6 text-[#202020]' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-[#202020]'>{c.companyName}</h3>
                      <p className='text-sm text-[#999]'>
                        {c.contractorName} &middot; {CONTRACTOR_SPECIALTY_LABELS[c.specialty as ContractorSpecialty] ?? c.specialty}
                      </p>
                      <div className='mt-1'>
                        <StarRating rating={c.rating} reviewCount={c.reviewCount} />
                      </div>
                    </div>
                  </div>
                  <GlassBadge
                    variant={
                      c.assignmentStatus === 'accepted' || c.assignmentStatus === 'active' ? 'success'
                        : c.assignmentStatus === 'proposal_sent' ? 'gold'
                        : c.assignmentStatus === 'rejected' ? 'warning'
                        : 'default'
                    }
                  >
                    {CONTRACTOR_ASSIGNMENT_STATUS_LABELS[c.assignmentStatus as ContractorAssignmentStatus] ?? c.assignmentStatus}
                  </GlassBadge>
                </div>

                {c.proposal ? (
                  <div className='bg-[#f5f5f5] rounded-none p-4 space-y-3'>
                    <div className='flex items-center gap-2'>
                      <FileText className='size-4 text-[#202020]' />
                      <span className='text-sm font-medium text-[#202020]'>Proposition</span>
                    </div>
                    <div className='grid sm:grid-cols-3 gap-4 text-sm'>
                      <div>
                        <p className='text-[#999]'>Montant</p>
                        <p className='font-semibold text-[#202020]'>
                          {Number(c.proposal.amount).toLocaleString('fr-FR')} &euro;
                        </p>
                      </div>
                      {c.proposal.estimatedDuration && (
                        <div>
                          <p className='text-[#999]'>Dur&eacute;e estim&eacute;e</p>
                          <p className='font-medium text-[#202020]'>{c.proposal.estimatedDuration}</p>
                        </div>
                      )}
                      {c.proposal.startDate && (
                        <div>
                          <p className='text-[#999]'>D&eacute;but pr&eacute;vu</p>
                          <p className='font-medium text-[#202020]'>
                            {new Date(c.proposal.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                    {c.proposal.description && (
                      <p className='text-sm text-[#666]'>{c.proposal.description}</p>
                    )}

                    {canRespond && c.proposal.status === 'submitted' && (
                      <div className='flex gap-2 pt-2'>
                        <button
                          onClick={() => handleAccept(c.proposal!.id)}
                          disabled={loading === c.proposal.id}
                          className='flex items-center gap-2 px-4 py-2 rounded-none bg-[#202020] text-white text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50'
                        >
                          <CheckCircle className='size-4' />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleReject(c.proposal!.id)}
                          disabled={loading === c.proposal.id}
                          className='flex items-center gap-2 px-4 py-2 rounded-none border border-[#e0e0e0] text-[#666] text-sm font-medium hover:bg-[#f5f5f5] transition-colors disabled:opacity-50'
                        >
                          <XCircle className='size-4' />
                          Refuser
                        </button>
                      </div>
                    )}

                    {c.proposal.status === 'accepted' && (
                      <div className='flex items-center gap-2 pt-2 text-sm text-green-600'>
                        <CheckCircle className='size-4' />
                        Devis accept&eacute;
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='bg-[#f5f5f5] rounded-none p-4 flex items-center gap-3 text-sm text-[#999]'>
                    <Clock className='size-4' />
                    En attente du devis
                  </div>
                )}
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key='table'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className='overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[#e0e0e0]'>
                      <th className='text-left py-3 px-4'>
                        <button
                          onClick={() => handleSort('companyName')}
                          className='flex items-center gap-1.5 text-xs font-semibold text-[#999] uppercase tracking-wider hover:text-[#202020] transition-colors'
                        >
                          Artisan
                          <SortIcon column='companyName' sortColumn={sortColumn} sortDirection={sortDirection} />
                        </button>
                      </th>
                      <th className='text-left py-3 px-4'>
                        <button
                          onClick={() => handleSort('amount')}
                          className='flex items-center gap-1.5 text-xs font-semibold text-[#999] uppercase tracking-wider hover:text-[#202020] transition-colors'
                        >
                          Montant
                          <SortIcon column='amount' sortColumn={sortColumn} sortDirection={sortDirection} />
                        </button>
                      </th>
                      <th className='text-left py-3 px-4'>
                        <button
                          onClick={() => handleSort('estimatedDuration')}
                          className='flex items-center gap-1.5 text-xs font-semibold text-[#999] uppercase tracking-wider hover:text-[#202020] transition-colors'
                        >
                          Dur&eacute;e estim&eacute;e
                          <SortIcon column='estimatedDuration' sortColumn={sortColumn} sortDirection={sortDirection} />
                        </button>
                      </th>
                      <th className='text-left py-3 px-4'>
                        <button
                          onClick={() => handleSort('startDate')}
                          className='flex items-center gap-1.5 text-xs font-semibold text-[#999] uppercase tracking-wider hover:text-[#202020] transition-colors'
                        >
                          Date d&eacute;but
                          <SortIcon column='startDate' sortColumn={sortColumn} sortDirection={sortDirection} />
                        </button>
                      </th>
                      <th className='text-left py-3 px-4'>
                        <button
                          onClick={() => handleSort('status')}
                          className='flex items-center gap-1.5 text-xs font-semibold text-[#999] uppercase tracking-wider hover:text-[#202020] transition-colors'
                        >
                          Statut
                          <SortIcon column='status' sortColumn={sortColumn} sortDirection={sortDirection} />
                        </button>
                      </th>
                      {canRespond && <th className='py-3 px-4' />}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedContractors.map((c, idx) => {
                      const proposalStatusLabel = c.proposal
                        ? c.proposal.status === 'submitted' ? 'Soumis'
                        : c.proposal.status === 'accepted' ? 'Accept\u00e9'
                        : c.proposal.status === 'rejected' ? 'Refus\u00e9'
                        : c.proposal.status === 'revised' ? 'R\u00e9vis\u00e9'
                        : c.proposal.status === 'draft' ? 'Brouillon'
                        : c.proposal.status
                        : null

                      const proposalStatusVariant = c.proposal
                        ? c.proposal.status === 'accepted' ? 'success' as const
                        : c.proposal.status === 'submitted' ? 'gold' as const
                        : c.proposal.status === 'rejected' ? 'warning' as const
                        : 'default' as const
                        : 'default' as const

                      return (
                        <tr
                          key={c.pcId}
                          className={`border-b border-[#e0e0e0] last:border-0 hover:bg-[#fafafa] transition-colors ${
                            idx % 2 === 1 ? 'bg-[#fafafa]' : ''
                          }`}
                        >
                          {/* Artisan */}
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex items-center justify-center size-8 rounded-none bg-[#f5f5f5] shrink-0'>
                                <HardHat className='size-4 text-[#202020]' />
                              </div>
                              <div className='min-w-0'>
                                <p className='font-medium text-[#202020] truncate'>{c.companyName}</p>
                                <p className='text-xs text-[#999] truncate'>
                                  {CONTRACTOR_SPECIALTY_LABELS[c.specialty as ContractorSpecialty] ?? c.specialty}
                                </p>
                                <div className='mt-0.5'>
                                  <StarRating rating={c.rating} reviewCount={c.reviewCount} />
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Montant */}
                          <td className='py-3 px-4'>
                            {c.proposal ? (
                              <span className='font-semibold text-[#202020]'>
                                {Number(c.proposal.amount).toLocaleString('fr-FR')} &euro;
                              </span>
                            ) : (
                              <span className='text-[#999]'>&mdash;</span>
                            )}
                          </td>

                          {/* Dur&eacute;e */}
                          <td className='py-3 px-4'>
                            {c.proposal?.estimatedDuration ? (
                              <span className='text-[#333]'>{c.proposal.estimatedDuration}</span>
                            ) : (
                              <span className='text-[#999]'>&mdash;</span>
                            )}
                          </td>

                          {/* Date d&eacute;but */}
                          <td className='py-3 px-4'>
                            {c.proposal?.startDate ? (
                              <span className='text-[#333]'>
                                {new Date(c.proposal.startDate).toLocaleDateString('fr-FR')}
                              </span>
                            ) : (
                              <span className='text-[#999]'>&mdash;</span>
                            )}
                          </td>

                          {/* Statut */}
                          <td className='py-3 px-4'>
                            {c.proposal ? (
                              <GlassBadge variant={proposalStatusVariant}>
                                {proposalStatusLabel}
                              </GlassBadge>
                            ) : (
                              <GlassBadge variant='default'>En attente</GlassBadge>
                            )}
                          </td>

                          {/* Actions */}
                          {canRespond && (
                            <td className='py-3 px-4'>
                              {c.proposal?.status === 'submitted' && (
                                <div className='flex gap-1.5'>
                                  <button
                                    onClick={() => handleAccept(c.proposal!.id)}
                                    disabled={loading === c.proposal!.id}
                                    className='p-1.5 rounded-none bg-[#202020] text-white hover:bg-[#333] transition-colors disabled:opacity-50'
                                    title='Accepter'
                                  >
                                    <CheckCircle className='size-3.5' />
                                  </button>
                                  <button
                                    onClick={() => handleReject(c.proposal!.id)}
                                    disabled={loading === c.proposal!.id}
                                    className='p-1.5 rounded-none border border-[#e0e0e0] text-[#666] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50'
                                    title='Refuser'
                                  >
                                    <XCircle className='size-3.5' />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
