'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import { CONTRACTOR_SPECIALTY_LABELS, CONTRACTOR_SPECIALTIES, type ContractorSpecialty } from '@/config/project'

interface ContractorData {
  id: string
  companyName: string
  siret: string | null
  specialties: string[]
  serviceArea: string[]
  description: string | null
  isVerified: boolean
  stripeConnectStatus: string
}

export const ContractorProfileForm = ({ contractor: c }: { contractor: ContractorData }) => {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(c.companyName)
  const [siret, setSiret] = useState(c.siret ?? '')
  const [description, setDescription] = useState(c.description ?? '')
  const [specialties, setSpecialties] = useState<string[]>(c.specialties as string[])
  const [serviceArea, setServiceArea] = useState((c.serviceArea as string[]).join(', '))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleSpecialty = (s: string) => {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      await fetch('/api/contractor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          siret: siret || undefined,
          description: description || undefined,
          specialties,
          serviceArea: serviceArea.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      setSaved(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      <GlassCard className='p-6 space-y-4'>
        <h2 className='font-semibold text-[#1a1a2e]'>Informations entreprise</h2>
        <div className='space-y-3'>
          <div>
            <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Nom de l&apos;entreprise *</label>
            <input
              type='text'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>SIRET</label>
            <input
              type='text'
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Zone d&apos;intervention (départements, séparés par virgule)</label>
            <input
              type='text'
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder='75, 92, 93, 94'
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='text-sm font-medium text-[#1a1a2e] mb-1 block'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm resize-none'
            />
          </div>
        </div>
      </GlassCard>

      <div className='space-y-6'>
        <GlassCard className='p-6 space-y-4'>
          <h2 className='font-semibold text-[#1a1a2e]'>Spécialités</h2>
          <div className='flex flex-wrap gap-2'>
            {CONTRACTOR_SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  specialties.includes(s)
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-[#f5f3f0] text-[#6b6b6b] hover:bg-[#e8e4df]'
                }`}
              >
                {CONTRACTOR_SPECIALTY_LABELS[s]}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className='p-6 space-y-3'>
          <h2 className='font-semibold text-[#1a1a2e]'>Statut</h2>
          <div className='flex items-center gap-3'>
            <span className='text-sm text-[#9b9b9b]'>Vérification :</span>
            <GlassBadge variant={c.isVerified ? 'success' : 'default'}>
              {c.isVerified ? 'Vérifié' : 'En attente'}
            </GlassBadge>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-sm text-[#9b9b9b]'>Stripe Connect :</span>
            <GlassBadge variant={c.stripeConnectStatus === 'active' ? 'success' : 'default'}>
              {c.stripeConnectStatus === 'active' ? 'Actif' : c.stripeConnectStatus === 'onboarding' ? 'En cours' : 'Non configuré'}
            </GlassBadge>
          </div>
        </GlassCard>

        <button
          onClick={handleSave}
          disabled={loading || !companyName || specialties.length === 0}
          className='flex items-center gap-2 w-full justify-center px-4 py-3 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors disabled:opacity-50'
        >
          {saved ? <CheckCircle className='size-4' /> : <Save className='size-4' />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
