'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { GlassCard } from '@/app/[locale]/(main)/components/glass-primitives'

// ── Types ─────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  'new_message',
  'new_proposal',
  'payment_due',
  'phase_changed',
  'document_uploaded',
  'booking_update',
  'milestone_validated',
  'system',
] as const

const CHANNELS = ['in_app', 'email', 'push', 'sms'] as const

const TYPE_LABELS: Record<string, string> = {
  new_message: 'Nouveau message',
  new_proposal: 'Nouveau devis',
  payment_due: 'Paiement en attente',
  phase_changed: 'Changement de phase',
  document_uploaded: 'Document ajouté',
  booking_update: 'Mise à jour réservation',
  milestone_validated: 'Jalon validé',
  system: 'Système',
}

const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
  sms: 'SMS',
}

interface Preference {
  id: string
  userId: string
  channel: string
  notificationType: string
  enabled: boolean
}

// ── Default values ────────────────────────────────────────────────────────

const getDefaultEnabled = (channel: string): boolean => {
  return channel === 'in_app' || channel === 'email'
}

// ── Toggle component ──────────────────────────────────────────────────────

const Toggle = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) => (
  <button
    type='button'
    role='switch'
    aria-checked={enabled}
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center transition-colors ${
      enabled ? 'bg-[#202020]' : 'bg-[#e0e0e0]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 bg-white transition-transform ${
        enabled ? 'translate-x-4' : 'translate-x-0.5'
      }`}
    />
  </button>
)

// ── Page ──────────────────────────────────────────────────────────────────

export default function NotificationPreferencesPage() {
  const queryClient = useQueryClient()

  // Fetch preferences
  const { data, isLoading } = useQuery<{ preferences: Preference[] }>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/preferences')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Mutation
  const mutation = useMutation({
    mutationFn: async (params: {
      channel: string
      notificationType: string
      enabled: boolean
    }) => {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })

  const preferences = data?.preferences ?? []

  // Build a lookup: `{channel}_{type}` -> boolean
  const prefMap = new Map<string, boolean>()
  for (const p of preferences) {
    prefMap.set(`${p.channel}_${p.notificationType}`, p.enabled)
  }

  const isEnabled = (channel: string, type: string): boolean => {
    const key = `${channel}_${type}`
    if (prefMap.has(key)) return prefMap.get(key)!
    // Check 'all' for this channel
    const allKey = `${channel}_all`
    if (prefMap.has(allKey)) return prefMap.get(allKey)!
    return getDefaultEnabled(channel)
  }

  const handleToggle = (channel: string, type: string, enabled: boolean) => {
    mutation.mutate({ channel, notificationType: type, enabled })
  }

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='mb-8'
      >
        <Link
          href='/dashboard'
          className='inline-flex items-center gap-1.5 text-xs text-[#767676] hover:text-[#202020] transition-colors mb-4 uppercase tracking-[0.1em]'
        >
          <ArrowLeft className='size-3.5' />
          Retour
        </Link>

        <div className='flex items-center gap-3'>
          <div className='p-2 bg-[#f5f5f5]'>
            <Bell className='size-5 text-[#202020]' />
          </div>
          <div>
            <h1 className='text-lg font-medium text-[#202020]'>
              Préférences de notification
            </h1>
            <p className='text-sm text-[#999]'>
              Choisissez comment vous souhaitez être notifié pour chaque type d&apos;événement.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preferences grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className='overflow-hidden'>
          {isLoading ? (
            <div className='p-8 text-center text-sm text-[#999]'>Chargement...</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-[#e0e0e0]'>
                    <th className='text-left px-4 py-3 text-xs font-medium text-[#999] uppercase tracking-[0.05em]'>
                      Type
                    </th>
                    {CHANNELS.map((ch) => (
                      <th
                        key={ch}
                        className='text-center px-4 py-3 text-xs font-medium text-[#999] uppercase tracking-[0.05em] min-w-[80px]'
                      >
                        {CHANNEL_LABELS[ch]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_TYPES.map((type, idx) => (
                    <tr
                      key={type}
                      className={idx < NOTIFICATION_TYPES.length - 1 ? 'border-b border-[#f0f0f0]' : ''}
                    >
                      <td className='px-4 py-3 text-sm text-[#202020]'>
                        {TYPE_LABELS[type]}
                      </td>
                      {CHANNELS.map((ch) => (
                        <td key={ch} className='px-4 py-3 text-center'>
                          <Toggle
                            enabled={isEnabled(ch, type)}
                            onChange={(val) => handleToggle(ch, type, val)}
                            disabled={mutation.isPending}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Info */}
        <p className='mt-4 text-xs text-[#999]'>
          Les notifications Push et SMS nécessitent une configuration supplémentaire.
          Contactez le support pour activer ces canaux.
        </p>
      </motion.div>
    </div>
  )
}
