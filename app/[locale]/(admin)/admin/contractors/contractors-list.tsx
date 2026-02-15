'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

import { GlassCard, GlassBadge, GlassInput } from '@/app/[locale]/(main)/components/glass-primitives'
import { CONTRACTOR_SPECIALTY_LABELS, type ContractorSpecialty } from '@/config/project'

interface ContractorRow {
  id: string
  companyName: string
  siret: string | null
  specialties: string[]
  serviceArea: string[]
  stripeConnectStatus: string
  isVerified: boolean
  verifiedAt: Date | null
  rating: string | null
  reviewCount: number
  createdAt: Date
  userName: string
  userEmail: string
  userPhone: string | null
}

const CONNECT_STATUS_BADGE: Record<string, 'default' | 'gold' | 'success' | 'warning'> = {
  not_started: 'default',
  onboarding: 'warning',
  active: 'success',
  restricted: 'warning',
}

const CONNECT_STATUS_LABEL: Record<string, string> = {
  not_started: 'Non configuré',
  onboarding: 'En cours',
  active: 'Actif',
  restricted: 'Restreint',
}

export const ContractorsList = ({ contractors }: { contractors: ContractorRow[] }) => {
  const [search, setSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return contractors.filter((c) => {
      const matchSearch =
        !search ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.userName.toLowerCase().includes(search.toLowerCase()) ||
        c.userEmail.toLowerCase().includes(search.toLowerCase())
      const matchVerified =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && c.isVerified) ||
        (verifiedFilter === 'unverified' && !c.isVerified)
      return matchSearch && matchVerified
    })
  }, [contractors, search, verifiedFilter])

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
          {contractors.length} artisan{contractors.length !== 1 ? 's' : ''} inscrit{contractors.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9b9b9b]' />
          <GlassInput
            placeholder='Rechercher par nom, entreprise, email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
        >
          <option value='all'>Tous</option>
          <option value='verified'>Vérifiés</option>
          <option value='unverified'>Non vérifiés</option>
        </select>
      </div>

      <GlassCard className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#e8e4df]'>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Entreprise</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Contact</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Spécialités</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Vérifié</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden lg:table-cell'>Stripe</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Note</th>
                <th className='w-10' />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-12 text-[#9b9b9b]'>
                    Aucun artisan trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className='border-b border-[#f5f3f0] last:border-0 hover:bg-[#faf9f7] transition-colors'>
                    <td className='px-4 py-3'>
                      <Link href={`/admin/contractors/${c.id}`} className='font-medium text-[#1a1a2e] hover:text-[#c9a96e]'>
                        {c.companyName}
                      </Link>
                      {c.siret && <p className='text-xs text-[#9b9b9b]'>SIRET: {c.siret}</p>}
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-[#1a1a2e]'>{c.userName}</p>
                      <p className='text-xs text-[#9b9b9b]'>{c.userEmail}</p>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <div className='flex flex-wrap gap-1'>
                        {(c.specialties as string[]).slice(0, 3).map((s) => (
                          <span key={s} className='text-xs bg-[#f5f3f0] text-[#6b6b6b] px-2 py-0.5 rounded-full'>
                            {CONTRACTOR_SPECIALTY_LABELS[s as ContractorSpecialty] ?? s}
                          </span>
                        ))}
                        {(c.specialties as string[]).length > 3 && (
                          <span className='text-xs text-[#9b9b9b]'>+{(c.specialties as string[]).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      {c.isVerified ? (
                        <CheckCircle className='size-5 text-green-600' />
                      ) : (
                        <XCircle className='size-5 text-[#9b9b9b]' />
                      )}
                    </td>
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <GlassBadge variant={CONNECT_STATUS_BADGE[c.stripeConnectStatus] ?? 'default'}>
                        {CONNECT_STATUS_LABEL[c.stripeConnectStatus] ?? c.stripeConnectStatus}
                      </GlassBadge>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {c.rating ? `${c.rating}/5 (${c.reviewCount})` : '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <Link href={`/admin/contractors/${c.id}`} className='text-[#9b9b9b] hover:text-[#c9a96e]'>
                        <ArrowRight className='size-4' />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
