'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Star, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
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

  const canRespond = userRole === 'owner' || userRole === 'admin'

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
        <h1
          className='text-2xl font-bold text-[#1a1a2e] mb-6'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Artisans
        </h1>
        <GlassCard className='p-12 text-center'>
          <HardHat className='size-12 mx-auto text-[#9b9b9b] mb-4' />
          <h2 className='text-lg font-semibold text-[#1a1a2e] mb-2'>
            Artisans en cours de sélection
          </h2>
          <p className='text-sm text-[#9b9b9b] max-w-md mx-auto'>
            Notre équipe sélectionne les meilleurs artisans pour votre projet.
            Vous serez notifié dès qu&apos;un artisan aura soumis un devis.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Artisans
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>
          {contractors.length} artisan{contractors.length !== 1 ? 's' : ''} sur votre projet
        </p>
      </div>

      <div className='grid gap-4'>
        {contractors.map((c) => (
          <GlassCard key={c.pcId} className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center size-12 rounded-xl bg-[#f5f3f0]'>
                  <HardHat className='size-6 text-[#c9a96e]' />
                </div>
                <div>
                  <h3 className='font-semibold text-[#1a1a2e]'>{c.companyName}</h3>
                  <p className='text-sm text-[#9b9b9b]'>
                    {c.contractorName} &middot; {CONTRACTOR_SPECIALTY_LABELS[c.specialty as ContractorSpecialty] ?? c.specialty}
                  </p>
                  {c.rating && (
                    <div className='flex items-center gap-1 mt-0.5'>
                      <Star className='size-3.5 text-[#c9a96e] fill-[#c9a96e]' />
                      <span className='text-xs text-[#6b6b6b]'>{c.rating}/5 ({c.reviewCount} avis)</span>
                    </div>
                  )}
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
              <div className='bg-[#faf9f7] rounded-xl p-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <FileText className='size-4 text-[#c9a96e]' />
                  <span className='text-sm font-medium text-[#1a1a2e]'>Proposition</span>
                </div>
                <div className='grid sm:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <p className='text-[#9b9b9b]'>Montant</p>
                    <p className='font-semibold text-[#1a1a2e]'>
                      {Number(c.proposal.amount).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  {c.proposal.estimatedDuration && (
                    <div>
                      <p className='text-[#9b9b9b]'>Durée estimée</p>
                      <p className='font-medium text-[#1a1a2e]'>{c.proposal.estimatedDuration}</p>
                    </div>
                  )}
                  {c.proposal.startDate && (
                    <div>
                      <p className='text-[#9b9b9b]'>Début prévu</p>
                      <p className='font-medium text-[#1a1a2e]'>
                        {new Date(c.proposal.startDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
                {c.proposal.description && (
                  <p className='text-sm text-[#6b6b6b]'>{c.proposal.description}</p>
                )}

                {canRespond && c.proposal.status === 'submitted' && (
                  <div className='flex gap-2 pt-2'>
                    <button
                      onClick={() => handleAccept(c.proposal!.id)}
                      disabled={loading === c.proposal.id}
                      className='flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors disabled:opacity-50'
                    >
                      <CheckCircle className='size-4' />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleReject(c.proposal!.id)}
                      disabled={loading === c.proposal.id}
                      className='flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e8e4df] text-[#6b6b6b] text-sm font-medium hover:bg-[#f5f3f0] transition-colors disabled:opacity-50'
                    >
                      <XCircle className='size-4' />
                      Refuser
                    </button>
                  </div>
                )}

                {c.proposal.status === 'accepted' && (
                  <div className='flex items-center gap-2 pt-2 text-sm text-green-600'>
                    <CheckCircle className='size-4' />
                    Devis accepté
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-[#faf9f7] rounded-xl p-4 flex items-center gap-3 text-sm text-[#9b9b9b]'>
                <Clock className='size-4' />
                En attente du devis
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
