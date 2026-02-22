'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Paperclip, X, FileText, Download, Lock, Hash } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { GlassButton } from '../../../../components/glass-primitives'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  channelId: string | null
  attachments: Attachment[] | null
  createdAt: string
}

interface Channel {
  id: string
  name: string
  label: string
  type: string
  contractorId: string | null
  order: number
}

interface MessagesContentProps {
  projectId: string
  channels: Channel[]
  currentUserId: string
  currentUserName?: string
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  manager: 'Chef de projet',
  admin: 'Administrateur',
  contractor: 'Artisan',
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

// ─── Helper: format file size ───────────────────────────────────────────────

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ─── Attachment display ─────────────────────────────────────────────────────

const MessageAttachment = ({ attachment }: { attachment: Attachment }) => {
  const isImage = attachment.type.startsWith('image/')

  if (isImage) {
    return (
      <a href={attachment.url} target='_blank' rel='noopener noreferrer' className='block mt-2'>
        <Image
          src={attachment.url}
          alt={attachment.name}
          width={280}
          height={200}
          className='max-w-[280px] max-h-[200px] object-cover rounded-none border border-[#e0e0e0]'
          unoptimized
        />
        <span className='text-[10px] text-[#999] mt-0.5 block'>{attachment.name}</span>
      </a>
    )
  }

  return (
    <a
      href={attachment.url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 mt-2 px-3 py-2 border border-[#e0e0e0] bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors group'
    >
      <FileText className='size-4 text-[#999] shrink-0' />
      <div className='flex-1 min-w-0'>
        <p className='text-xs font-medium text-[#333] truncate'>{attachment.name}</p>
        <p className='text-[10px] text-[#bbb]'>{formatFileSize(attachment.size)}</p>
      </div>
      <Download className='size-3.5 text-[#bbb] group-hover:text-[#666] shrink-0' />
    </a>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export const MessagesContent = ({
  projectId,
  channels,
  currentUserId,
}: MessagesContentProps) => {
  const queryClient = useQueryClient()

  // Find the general channel as default
  const publicChannels = channels.filter((ch) => ch.type === 'public')
  const privateChannels = channels.filter((ch) => ch.type === 'private_contractor')
  const defaultChannel = publicChannels.find((ch) => ch.name === 'general') || publicChannels[0]

  const [activeChannelId, setActiveChannelId] = useState<string>(defaultChannel?.id || '')
  const [newMessage, setNewMessage] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTypingSentRef = useRef<number>(0)

  // Also fetch channels dynamically (for private contractor channels auto-created)
  const { data: dynamicChannels } = useQuery({
    queryKey: ['channels', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/channels`)
      if (!res.ok) return { channels }
      return res.json() as Promise<{ channels: Channel[] }>
    },
    refetchInterval: 30000,
  })

  const allChannels = dynamicChannels?.channels || channels
  const allPublicChannels = allChannels.filter((ch) => ch.type === 'public')
  const allPrivateChannels = allChannels.filter((ch) => ch.type === 'private_contractor')

  // 3.3 - Fetch messages with React Query polling
  const { data: messages = [], dataUpdatedAt } = useQuery({
    queryKey: ['messages', projectId, activeChannelId],
    queryFn: async () => {
      const url = activeChannelId
        ? `/api/project/${projectId}/messages?channelId=${activeChannelId}`
        : `/api/project/${projectId}/messages`
      const res = await fetch(url)
      if (!res.ok) return []
      const data = await res.json()
      return data.map((m: Message) => ({
        ...m,
        createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt).toISOString(),
      })) as Message[]
    },
    refetchInterval: 15000,
  })

  // 3.2 - Typing indicator polling
  const { data: typingData } = useQuery({
    queryKey: ['typing', projectId, activeChannelId],
    queryFn: async () => {
      const res = await fetch(
        `/api/project/${projectId}/messages/typing?channelId=${activeChannelId || 'default'}`
      )
      if (!res.ok) return { typing: [] }
      return res.json() as Promise<{ typing: { userId: string; name: string }[] }>
    },
    refetchInterval: 3000,
  })

  const typingUsers = typingData?.typing || []

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, dataUpdatedAt])

  // 3.2 - Send typing indicator (debounced)
  const sendTypingIndicator = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingSentRef.current < 2000) return
    lastTypingSentRef.current = now
    fetch(`/api/project/${projectId}/messages/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: activeChannelId || 'default' }),
    }).catch(() => {})
  }, [projectId, activeChannelId])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ content, file }: { content: string; file: File | null }) => {
      if (file) {
        const formData = new FormData()
        formData.append('content', content)
        formData.append('file', file)
        if (activeChannelId) formData.append('channelId', activeChannelId)

        const res = await fetch(`/api/project/${projectId}/messages`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erreur lors de l\'envoi')
        }
        return res.json()
      } else {
        const res = await fetch(`/api/project/${projectId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, channelId: activeChannelId || null }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erreur lors de l\'envoi')
        }
        return res.json()
      }
    },
    onSuccess: (msg) => {
      // Add the new message to cache immediately
      queryClient.setQueryData(
        ['messages', projectId, activeChannelId],
        (old: Message[] | undefined) => {
          const newMsg = { ...msg, createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : new Date(msg.createdAt).toISOString() }
          return [...(old || []), newMsg]
        }
      )
    },
  })

  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content && !pendingFile) return
    if (sending) return

    setSending(true)
    setUploadError(null)
    try {
      await sendMutation.mutateAsync({ content, file: pendingFile })
      setNewMessage('')
      setPendingFile(null)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    sendTypingIndicator()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Fichier trop volumineux. Taille maximale : 10 Mo')
      return
    }

    setUploadError(null)
    setPendingFile(file)
    e.target.value = ''
  }

  const activeChannel = allChannels.find((ch) => ch.id === activeChannelId)

  return (
    <div className='flex flex-col h-full'>
      {/* Channel tabs */}
      <div className='border-b border-[#e0e0e0] px-4 pt-3'>
        {/* Public channels */}
        <div className='flex items-center gap-1 overflow-x-auto pb-2'>
          {allPublicChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannelId(ch.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-none px-3 py-1.5 text-sm transition-all ${
                activeChannelId === ch.id
                  ? 'bg-[#202020]/5 text-[#202020] font-medium'
                  : 'text-[#999] hover:bg-[#f5f5f5] hover:text-[#666]'
              }`}
            >
              <Hash className='size-3' />
              {ch.label}
            </button>
          ))}
        </div>

        {/* Private channels */}
        {allPrivateChannels.length > 0 && (
          <div className='flex items-center gap-1 overflow-x-auto pb-2 mt-1'>
            <span className='text-[10px] uppercase tracking-wider text-[#bbb] mr-1 shrink-0'>
              Privé
            </span>
            {allPrivateChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-none px-3 py-1.5 text-sm transition-all ${
                  activeChannelId === ch.id
                    ? 'bg-[#202020]/5 text-[#202020] font-medium'
                    : 'text-[#999] hover:bg-[#f5f5f5] hover:text-[#666]'
                }`}
              >
                <Lock className='size-3' />
                {ch.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages list */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <p className='text-sm text-[#999]'>Aucun message pour le moment.</p>
            <p className='text-xs text-[#bbb] mt-1'>
              Envoyez un message pour démarrer la conversation
              {activeChannel ? ` dans ${activeChannel.label}` : ''}.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.senderId === currentUserId
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className='text-xs font-medium text-[#333]'>{msg.senderName}</span>
                    <span className='text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#f5f5f5] text-[#999]'>
                      {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                    </span>
                    <span className='text-[10px] text-[#bbb]'>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {msg.content && (
                    <div
                      className={`rounded-none px-4 py-2.5 text-sm ${
                        isOwn
                          ? 'bg-[#f5f5f5] text-[#202020]'
                          : 'bg-[#f5f5f5] text-[#333]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={isOwn ? 'flex flex-col items-end' : ''}>
                      {msg.attachments.map((att, ai) => (
                        <MessageAttachment key={ai} attachment={att} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className='px-4 py-1'>
          <p className='text-xs text-[#999] italic'>
            {typingUsers.map((u) => u.name).join(', ')} est en train d&apos;écrire...
          </p>
        </div>
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <div className='px-4 pt-2'>
          <div className='flex items-center gap-2 bg-[#f5f5f5] px-3 py-2 text-sm'>
            <Paperclip className='size-3.5 text-[#999]' />
            <span className='text-xs text-[#333] truncate flex-1'>{pendingFile.name}</span>
            <span className='text-[10px] text-[#bbb]'>{formatFileSize(pendingFile.size)}</span>
            <button
              onClick={() => setPendingFile(null)}
              className='p-0.5 text-[#999] hover:text-[#333] transition-colors'
            >
              <X className='size-3.5' />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className='px-4 pt-1'>
          <div className='flex items-center justify-between bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-600'>
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className='text-red-400 hover:text-red-600 ml-2'>
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='border-t border-[#e0e0e0] p-4'>
        <div className='flex items-end gap-3'>
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className='shrink-0 p-2.5 text-[#999] hover:text-[#333] hover:bg-[#f5f5f5] transition-all'
            title='Joindre un fichier'
          >
            <Paperclip className='size-4' />
          </button>
          <input
            ref={fileInputRef}
            type='file'
            className='hidden'
            accept='.pdf,.jpg,.jpeg,.png,.webp'
            onChange={handleFileSelect}
          />

          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Votre message...'
            rows={1}
            className='flex-1 resize-none rounded-none border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#202020] placeholder:text-[#999] focus:outline-none focus:ring-0 focus:border-[#202020] transition-all'
          />
          <GlassButton
            variant='gold'
            onClick={handleSend}
            disabled={(!newMessage.trim() && !pendingFile) || sending}
            className='shrink-0 !px-3 !py-2.5'
          >
            {sending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
          </GlassButton>
        </div>
      </div>
    </div>
  )
}
