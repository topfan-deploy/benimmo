'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { formatDate } from '@/lib/utils'

interface Conversation {
  otherUser: { id: string; name: string }
  lastMessage: { id: string; content: string; createdAt: string; senderId: string }
  unreadCount: number
  propertyId: string | null
  propertyTitle: string | null
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: { id: string; name: string }
  receiver: { id: string; name: string }
  property: { id: string; title: string } | null
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session) fetchConversations()
  }, [session])

  useEffect(() => {
    if (!selectedConv) return
    async function fetchMessages() {
      const url = `/api/messages/${selectedConv!.otherUser.id}${selectedConv!.propertyId ? `?propertyId=${selectedConv!.propertyId}` : ''}`
      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch { /* ignore */ }
    }
    fetchMessages()
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConv.otherUser.id,
          content: newMessage,
          propertyId: selectedConv.propertyId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setNewMessage('')
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messagerie</h1>

      <div className="bg-white border rounded-xl overflow-hidden" style={{ height: '600px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const key = `${conv.otherUser.id}_${conv.propertyId || 'none'}`
                const isSelected = selectedConv?.otherUser.id === conv.otherUser.id && selectedConv?.propertyId === conv.propertyId
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-bold">
                          {conv.otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conv.otherUser.name}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.propertyTitle && (
                          <p className="text-xs text-emerald-600 truncate">{conv.propertyTitle}</p>
                        )}
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage.content}</p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Messages Panel */}
          <div className="md:col-span-2 flex flex-col h-full">
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b bg-gray-50">
                  <p className="font-semibold">{selectedConv.otherUser.name}</p>
                  {selectedConv.propertyTitle && (
                    <p className="text-xs text-emerald-600">
                      Re: {selectedConv.propertyTitle}
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === userId
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Tapez votre message..."
                      className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="bg-emerald-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {sending ? '...' : 'Envoyer'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
