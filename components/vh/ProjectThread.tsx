'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  body: string
  author_id: string
  created_at: string
  profiles?: { full_name: string; role: string } | null
}

interface ProjectThreadProps {
  projectId: string
  threads: Message[]
  currentUserId: string
  currentUserName: string
}

export function ProjectThread({ projectId, threads: initial, currentUserId, currentUserName }: ProjectThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initial)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`project-thread-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_threads', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const { data: msg } = await supabase
            .from('project_threads')
            .select('*, profiles(full_name, role)')
            .eq('id', payload.new.id)
            .single()
          if (msg) setMessages((prev) => [...prev, msg as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)

    const body = input.trim()
    setInput('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('project_threads').insert({
      project_id: projectId,
      author_id: user.id,
      body,
    })

    setSending(false)
  }

  return (
    <div className="flex flex-col h-[520px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.author_id === currentUserId
          const name = msg.profiles?.full_name ?? currentUserName
          const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

          return (
            <div key={msg.id} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
              {/* Avatar */}
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isMe ? 'bg-[#C4A35A] text-[#1E3829]' : 'bg-[#2E5A40] text-[#F5F0E8]'
              )}>
                {initials}
              </div>

              <div className={cn('max-w-[75%]', isMe && 'items-end flex flex-col')}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#1E3829]">{isMe ? 'You' : name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className={cn(
                  'rounded-xl px-4 py-2.5 text-sm',
                  isMe
                    ? 'bg-[#1E3829] text-[#F5F0E8] rounded-tr-none'
                    : 'bg-[#F5F0E8] text-[#1E3829] border border-[#D6CCBC] rounded-tl-none'
                )}>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-[#EDE6D8] px-4 py-3 flex items-center gap-3">
        <button type="button" className="text-gray-400 hover:text-[#C4A35A] transition-colors">
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message to the project team..."
          className="flex-1 bg-transparent text-sm text-[#1E3829] placeholder:text-gray-400 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1E3829] text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-40 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
