'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Mail, Phone, Building2, MapPin, Shield } from 'lucide-react'

import { GlassCard, GlassBadge } from '@/app/[locale]/(main)/components/glass-primitives'
import {
  CONTRACTOR_SPECIALTY_LABELS,
  CONTRACTOR_ASSIGNMENT_STATUS_LABELS,
  type ContractorSpecialty,
  type ContractorAssignmentStatus,
} from '@/config/project'

interface ContractorData {
  id: string
  userId: string
  companyName: string
  siret: string | null
  specialties: string[]
  serviceArea: string[]
  description: string | null
  portfolioImages: string[] | null
  certifications: string[] | null
  insuranceExpiry: Date | null
  stripeConnectAccountId: string | null
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

interface AssignmentRow {
  id: string
  projectId: string
  specialty: string
  status: string
  assignedAt: Date
  projectTitle: string
  projectStatus: string
}

export const ContractorDetail = ({
  contractor: c,
  assignments,
}: {
  contractor: ContractorData
  assignments: AssignmentRow[]
}) => {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)

  const handleToggleVerify = async () => {
    setToggling(true)
    try {
      await fetch(`/api/admin/contractors/${c.id}/verify`, { method: 'PATCH' })
      router.refresh()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/admin/contractors'
          className='flex items-center justify-center size-10 rounded-xl border border-[#e8e4df] text-[#9b9b9b] hover:bg-[#f5f3f0] transition-colors'
        >
          <ArrowLeft className='size-5' />
        </Link>
        <div className='flex-1'>
          <h1
            className='text-2xl font-bold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {c.companyName}
          </h1>
          <p className='text-sm text-[#9b9b9b]'>
            Inscrit le {new Date(c.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <button
          onClick={handleToggleVerify}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            c.isVerified
              ? 'bg-[#f5f3f0] text-[#6b6b6b] hover:bg-[#e8e4df]'
              : 'bg-[#1a1a2e] text-white hover:bg-[#2d2d4e]'
          }`}
        >
          <Shield className='size-4' />
          {c.isVerified ? 'Retirer la vérification' : 'Vérifier cet artisan'}
        </button>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Info card */}
        <GlassCard className='p-6 space-y-4'>
          <h2 className='font-semibold text-[#1a1a2e]'>Informations</h2>
          <div className='space-y-3'>
            <div className='flex items-center gap-3 text-sm'>
              <Building2 className='size-4 text-[#9b9b9b]' />
              <span className='text-[#1a1a2e]'>{c.companyName}</span>
              {c.siret && <span className='text-[#9b9b9b]'>SIRET: {c.siret}</span>}
            </div>
            <div className='flex items-center gap-3 text-sm'>
              <Mail className='size-4 text-[#9b9b9b]' />
              <span className='text-[#1a1a2e]'>{c.userEmail}</span>
            </div>
            {c.userPhone && (
              <div className='flex items-center gap-3 text-sm'>
                <Phone className='size-4 text-[#9b9b9b]' />
                <span className='text-[#1a1a2e]'>{c.userPhone}</span>
              </div>
            )}
            <div className='flex items-center gap-3 text-sm'>
              <MapPin className='size-4 text-[#9b9b9b]' />
              <span className='text-[#1a1a2e]'>
                {(c.serviceArea as string[]).join(', ') || 'Non renseigné'}
              </span>
            </div>
            <div className='flex items-center gap-3 text-sm'>
              {c.isVerified ? (
                <CheckCircle className='size-4 text-green-600' />
              ) : (
                <XCircle className='size-4 text-[#9b9b9b]' />
              )}
              <span className='text-[#1a1a2e]'>
                {c.isVerified
                  ? `Vérifié le ${new Date(c.verifiedAt!).toLocaleDateString('fr-FR')}`
                  : 'Non vérifié'}
              </span>
            </div>
          </div>
          {c.description && (
            <div>
              <h3 className='text-sm font-medium text-[#9b9b9b] mb-1'>Description</h3>
              <p className='text-sm text-[#1a1a2e]'>{c.description}</p>
            </div>
          )}
        </GlassCard>

        {/* Specialties & Stripe */}
        <GlassCard className='p-6 space-y-4'>
          <h2 className='font-semibold text-[#1a1a2e]'>Spécialités & Paiements</h2>
          <div>
            <h3 className='text-sm font-medium text-[#9b9b9b] mb-2'>Spécialités</h3>
            <div className='flex flex-wrap gap-2'>
              {(c.specialties as string[]).map((s) => (
                <GlassBadge key={s} variant='gold'>
                  {CONTRACTOR_SPECIALTY_LABELS[s as ContractorSpecialty] ?? s}
                </GlassBadge>
              ))}
            </div>
          </div>
          <div>
            <h3 className='text-sm font-medium text-[#9b9b9b] mb-2'>Stripe Connect</h3>
            <GlassBadge variant={c.stripeConnectStatus === 'active' ? 'success' : 'default'}>
              {c.stripeConnectStatus === 'active' ? 'Actif' : c.stripeConnectStatus === 'onboarding' ? 'En cours' : 'Non configuré'}
            </GlassBadge>
            {c.stripeConnectAccountId && (
              <p className='text-xs text-[#9b9b9b] mt-1'>ID: {c.stripeConnectAccountId}</p>
            )}
          </div>
          {c.rating && (
            <div>
              <h3 className='text-sm font-medium text-[#9b9b9b] mb-1'>Note</h3>
              <p className='text-sm text-[#1a1a2e]'>{c.rating}/5 ({c.reviewCount} avis)</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Assignments */}
      <GlassCard className='overflow-hidden'>
        <div className='p-4 border-b border-[#e8e4df]'>
          <h2 className='font-semibold text-[#1a1a2e]'>Projets assignés ({assignments.length})</h2>
        </div>
        {assignments.length === 0 ? (
          <div className='p-8 text-center text-[#9b9b9b]'>
            Aucun projet assigné
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-[#e8e4df]'>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Projet</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Spécialité</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Statut</th>
                  <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className='border-b border-[#f5f3f0] last:border-0 hover:bg-[#faf9f7] transition-colors'>
                    <td className='px-4 py-3'>
                      <Link href={`/admin/projects/${a.projectId}`} className='font-medium text-[#1a1a2e] hover:text-[#c9a96e]'>
                        {a.projectTitle}
                      </Link>
                    </td>
                    <td className='px-4 py-3 text-[#6b6b6b]'>
                      {CONTRACTOR_SPECIALTY_LABELS[a.specialty as ContractorSpecialty] ?? a.specialty}
                    </td>
                    <td className='px-4 py-3'>
                      <GlassBadge variant={a.status === 'accepted' || a.status === 'active' ? 'success' : a.status === 'rejected' ? 'warning' : 'default'}>
                        {CONTRACTOR_ASSIGNMENT_STATUS_LABELS[a.status as ContractorAssignmentStatus] ?? a.status}
                      </GlassBadge>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {new Date(a.assignedAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
