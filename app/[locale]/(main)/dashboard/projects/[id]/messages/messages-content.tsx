'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { GlassButton } from '../../../../components/glass-primitives'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  createdAt: string
}

interface MessagesContentProps {
  projectId: string
  messages: Message[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  manager: 'Chef de projet',
  admin: 'Administrateur',
  contractor: 'Artisan',
}

export const MessagesContent = ({
  projectId,
  messages: initialMessages,
  currentUserId,
}: MessagesContentProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/project/${projectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, { ...msg, createdAt: msg.createdAt }])
        setNewMessage('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      }
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
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Messages list */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <p className='text-sm text-[#9b9b9b]'>Aucun message pour le moment.</p>
            <p className='text-xs text-[#b5b5b5] mt-1'>
              Envoyez un message pour démarrer la conversation avec votre équipe et vos artisans.
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
                    <span className='text-xs font-medium text-[#3a3a4e]'>{msg.senderName}</span>
                    <span className='text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#f5f3f0] text-[#9b9b9b]'>
                      {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                    </span>
                    <span className='text-[10px] text-[#b5b5b5]'>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isOwn
                        ? 'bg-[#c9a96e]/10 text-[#1a1a2e] rounded-br-md'
                        : 'bg-[#f5f3f0] text-[#3a3a4e] rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t border-[#e8e4df] p-4'>
        <div className='flex items-end gap-3'>
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Votre message...'
            rows={1}
            className='flex-1 resize-none rounded-xl border border-[#e8e4df] bg-white px-4 py-2.5 text-sm text-[#1a1a2e] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30 focus:border-[#c9a96e]/40 transition-all'
          />
          <GlassButton
            variant='gold'
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
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
