'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, HardHat } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  CONTRACTOR_SPECIALTY_LABELS,
  CONTRACTOR_ASSIGNMENT_STATUS_LABELS,
  CONTRACTOR_SPECIALTIES,
  type ContractorSpecialty,
  type ContractorAssignmentStatus,
} from '@/config/project'

interface AssignedContractor {
  id: string
  contractorId: string
  specialty: string
  status: string
  assignedAt: string
  companyName: string
  userName: string
}

interface AvailableContractor {
  id: string
  companyName: string
  userName: string
  specialties: string[]
  isVerified: boolean
}

export const ArtisansTab = ({
  projectId,
  assigned,
  available,
}: {
  projectId: string
  assigned: AssignedContractor[]
  available: AvailableContractor[]
}) => {
  const router = useRouter()
  const [showPicker, setShowPicker] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAssign = async () => {
    if (!selectedContractor || !selectedSpecialty) return
    setLoading(true)
    try {
      await fetch(`/api/admin/projects/${projectId}/assign-contractor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId: selectedContractor, specialty: selectedSpecialty }),
      })
      setShowPicker(false)
      setSelectedContractor('')
      setSelectedSpecialty('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (pcId: string) => {
    setLoading(true)
    try {
      await fetch(`/api/admin/projects/${projectId}/contractors/${pcId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  // Filter out already assigned contractors
  const assignedIds = new Set(assigned.map(a => a.contractorId))
  const unassigned = available.filter(c => !assignedIds.has(c.id) && c.isVerified)

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-[#1a1a2e]'>Artisans assignés ({assigned.length})</h3>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className='flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors'
        >
          <Plus className='size-4' />
          Assigner
        </button>
      </div>

      {showPicker && (
        <GlassCard className='p-4 space-y-3'>
          <div className='grid sm:grid-cols-3 gap-3'>
            <select
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
              className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
            >
              <option value=''>Sélectionner un artisan</option>
              {unassigned.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.userName})
                </option>
              ))}
            </select>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
            >
              <option value=''>Spécialité sur ce projet</option>
              {CONTRACTOR_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {CONTRACTOR_SPECIALTY_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={loading || !selectedContractor || !selectedSpecialty}
              className='px-4 py-2.5 rounded-xl bg-[#c9a96e] text-white text-sm font-medium hover:bg-[#b8944f] transition-colors disabled:opacity-50'
            >
              Confirmer
            </button>
          </div>
        </GlassCard>
      )}

      {assigned.length === 0 ? (
        <GlassCard className='p-8 text-center'>
          <HardHat className='size-8 mx-auto text-[#9b9b9b] mb-2' />
          <p className='text-[#9b9b9b]'>Aucun artisan assigné</p>
        </GlassCard>
      ) : (
        <div className='space-y-2'>
          {assigned.map((a) => (
            <GlassCard key={a.id} className='p-4 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center size-10 rounded-xl bg-[#f5f3f0]'>
                  <HardHat className='size-5 text-[#c9a96e]' />
                </div>
                <div>
                  <p className='font-medium text-[#1a1a2e]'>{a.companyName}</p>
                  <p className='text-xs text-[#9b9b9b]'>
                    {a.userName} &middot; {CONTRACTOR_SPECIALTY_LABELS[a.specialty as ContractorSpecialty] ?? a.specialty}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <GlassBadge
                  variant={
                    a.status === 'accepted' || a.status === 'active' ? 'success'
                      : a.status === 'rejected' ? 'warning'
                      : a.status === 'proposal_sent' ? 'gold'
                      : 'default'
                  }
                >
                  {CONTRACTOR_ASSIGNMENT_STATUS_LABELS[a.status as ContractorAssignmentStatus] ?? a.status}
                </GlassBadge>
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={loading}
                  className='p-1.5 rounded-lg text-[#9b9b9b] hover:text-red-500 hover:bg-red-50 transition-colors'
                  title='Retirer'
                >
                  <Trash2 className='size-4' />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
