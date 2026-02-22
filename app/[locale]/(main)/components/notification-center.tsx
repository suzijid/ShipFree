'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  MessageSquare,
  FileText,
  Wallet,
  ArrowRightLeft,
  Upload,
  CalendarCheck,
  CheckCheck,
  Info,
  X,
  Check,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  userId: string
  projectId: string | null
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: string
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────

const NOTIFICATION_ICONS: Record<string, typeof MessageSquare> = {
  new_message: MessageSquare,
  new_proposal: FileText,
  payment_due: Wallet,
  phase_changed: ArrowRightLeft,
  document_uploaded: Upload,
  booking_update: CalendarCheck,
  milestone_validated: CheckCheck,
  system: Info,
}

const getRelativeTime = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays < 7) return `il y a ${diffDays}j`
  return then.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── Component ─────────────────────────────────────────────────────────────

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Poll unread count every 30 seconds
  const { data: countData } = useQuery<NotificationsResponse>({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=1')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    refetchInterval: 30000,
  })

  // Fetch notifications when popover opens
  const { data: notifData, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['notifications-list'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=15')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: open,
  })

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (payload: { id: string } | { all: true }) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] })
    },
  })

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const unreadCount = countData?.unreadCount ?? 0
  const notifications = notifData?.notifications ?? []

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      markReadMutation.mutate({ id: notif.id })
    }
    if (notif.link) {
      setOpen(false)
      router.push(notif.link)
    }
  }

  const handleMarkAllRead = () => {
    markReadMutation.mutate({ all: true })
  }

  return (
    <div className='relative'>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className='flex items-center gap-1.5 border border-[#e0e0e0] px-3 py-2 text-[#767676] hover:bg-[#f5f5f5] transition-colors'
        aria-label='Notifications'
        aria-expanded={open}
        aria-haspopup='true'
      >
        <Bell className='size-3.5' />
        <span className='hidden sm:inline text-xs text-[#202020] uppercase tracking-[0.1em]'>
          Notifications
        </span>
        {unreadCount > 0 && (
          <span className='flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium bg-red-500 text-white rounded-full leading-none'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className='absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-32px)] bg-white border border-[#e0e0e0] shadow-lg z-50'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]'>
              <h3 className='text-sm font-medium text-[#202020] uppercase tracking-[0.05em]'>
                Notifications
              </h3>
              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className='text-xs text-[#767676] hover:text-[#202020] transition-colors flex items-center gap-1'
                    disabled={markReadMutation.isPending}
                  >
                    <Check className='size-3' />
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className='p-1 text-[#767676] hover:text-[#202020] transition-colors'
                  aria-label='Fermer'
                >
                  <X className='size-4' />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className='max-h-[400px] overflow-y-auto'>
              {isLoading ? (
                <div className='px-4 py-8 text-center text-sm text-[#999]'>
                  Chargement...
                </div>
              ) : notifications.length === 0 ? (
                <div className='px-4 py-8 text-center text-sm text-[#999]'>
                  Aucune notification
                </div>
              ) : (
                <ul className='divide-y divide-[#f0f0f0]'>
                  {notifications.map((notif) => {
                    const Icon = NOTIFICATION_ICONS[notif.type] || Info
                    return (
                      <li key={notif.id}>
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#fafafa] transition-colors ${
                            !notif.read ? 'bg-[#fdfdf5]' : ''
                          }`}
                        >
                          <div className={`mt-0.5 p-1.5 shrink-0 ${
                            !notif.read ? 'text-[#202020]' : 'text-[#999]'
                          }`}>
                            <Icon className='size-4' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2'>
                              <p className={`text-sm leading-tight truncate ${
                                !notif.read ? 'font-medium text-[#202020]' : 'text-[#666]'
                              }`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className='size-2 rounded-full bg-[#b8960c] shrink-0 mt-1.5' />
                              )}
                            </div>
                            <p className='text-xs text-[#999] mt-0.5 line-clamp-2'>
                              {notif.body}
                            </p>
                            <p className='text-[11px] text-[#ccc] mt-1'>
                              {getRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className='border-t border-[#e0e0e0] px-4 py-2'>
                <button
                  onClick={handleMarkAllRead}
                  className='w-full text-center text-xs text-[#767676] hover:text-[#202020] py-1.5 transition-colors uppercase tracking-[0.05em]'
                >
                  Marquer tout comme lu
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
