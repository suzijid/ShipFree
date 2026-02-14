'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  createdAt: Date
}

interface MessagesTabProps {
  projectId: string
  messages: Message[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  manager: 'Chef de projet',
  admin: 'Administrateur',
}

const ROLE_COLORS: Record<string, string> = {
  client: 'bg-blue-100 text-blue-700',
  manager: 'bg-[#c9a96e]/15 text-[#c9a96e]',
  admin: 'bg-purple-100 text-purple-700',
}

export const MessagesTab = ({ projectId, messages: initialMessages, currentUserId }: MessagesTabProps) => {
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
        setMessages((prev) => [...prev, msg])
        setNewMessage('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
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
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className='rounded-xl border border-[#e8e4df] bg-white flex flex-col' style={{ height: '500px' }}>
      {/* Messages list */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <p className='text-sm text-muted-foreground'>
              Aucun message pour le moment.
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Envoyez un message pour démarrer la conversation avec votre chef de projet.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className='text-xs font-medium text-[#1a1a2e]'>
                      {msg.senderName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[msg.senderRole] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-xl px-4 py-2.5 text-sm ${
                      isOwn
                        ? 'bg-[#1a1a2e] text-white rounded-br-sm'
                        : 'bg-[#f5f5f3] text-[#4a4a4a] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t border-[#e8e4df] p-3'>
        <div className='flex items-end gap-2'>
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Votre message...'
            rows={1}
            className='flex-1 resize-none rounded-lg border border-[#e8e4df] bg-[#fafaf8] px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30 focus:border-[#c9a96e]'
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className='bg-[#1a1a2e] text-white hover:bg-[#16213e] shrink-0'
            size='sm'
          >
            {sending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
