'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'

interface ProposalData {
  id: string
  amount: string
  description: string | null
  estimatedDuration: string | null
  startDate: Date | null
  status: string
  submittedAt: Date | null
}

export const ContractorProjectDetail = ({
  projectId,
  projectContractorId,
  assignmentStatus,
  existingProposal,
}: {
  projectId: string
  projectContractorId: string
  assignmentStatus: string
  existingProposal: ProposalData | null
}) => {
  const router = useRouter()
  const [amount, setAmount] = useState(existingProposal ? Number(existingProposal.amount) : '')
  const [description, setDescription] = useState(existingProposal?.description ?? '')
  const [duration, setDuration] = useState(existingProposal?.estimatedDuration ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!amount) return
    setLoading(true)
    try {
      const method = existingProposal ? 'PATCH' : 'POST'
      await fetch(`/api/contractor/projects/${projectId}/proposal`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          description: description || undefined,
          estimatedDuration: duration || undefined,
        }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (existingProposal && existingProposal.status === 'accepted') {
    return (
      <GlassCard className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <CheckCircle className='size-6 text-green-600' />
          <h2 className='font-semibold text-[#1a1a2e]'>Devis accepté</h2>
        </div>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-[#9b9b9b]'>Montant</span>
            <span className='font-semibold text-[#1a1a2e]'>
              {Number(existingProposal.amount).toLocaleString('fr-FR')} €
            </span>
          </div>
          {existingProposal.estimatedDuration && (
            <div className='flex justify-between'>
              <span className='text-[#9b9b9b]'>Durée</span>
              <span className='text-[#1a1a2e]'>{existingProposal.estimatedDuration}</span>
            </div>
          )}
          {existingProposal.description && (
            <div className='pt-2'>
              <span className='text-[#9b9b9b]'>Description</span>
              <p className='text-[#1a1a2e] mt-1'>{existingProposal.description}</p>
            </div>
          )}
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className='p-6 space-y-4'>
      <h2 className='font-semibold text-[#1a1a2e]'>
        {existingProposal ? 'Modifier votre devis' : 'Soumettre un devis'}
      </h2>
      {existingProposal && (
        <GlassBadge variant='gold'>
          {existingProposal.status === 'submitted' ? 'En attente de réponse' : existingProposal.status === 'revised' ? 'Révisé' : existingProposal.status}
        </GlassBadge>
      )}
      <div className='space-y-3'>
        <div>
          <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Montant (€) *</label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Ex: 5000'
            className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Durée estimée</label>
          <input
            type='text'
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder='Ex: 3 semaines'
            className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Détaillez votre proposition...'
            rows={4}
            className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm resize-none'
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className='flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors disabled:opacity-50'
        >
          <Send className='size-4' />
          {existingProposal ? 'Mettre à jour' : 'Envoyer le devis'}
        </button>
      </div>
    </GlassCard>
  )
}
