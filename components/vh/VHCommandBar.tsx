'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function VHCommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // cmd+k to open
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          assistantText += decoder.decode(value)
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: assistantText }
            return updated
          })
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-[#2E5A40] bg-[#2E5A40]/20 px-3 py-1.5 text-sm text-[#C4A35A] hover:bg-[#2E5A40]/40 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Copilot</span>
        <kbd className="hidden sm:inline rounded border border-[#2E5A40] px-1 py-0.5 text-xs text-[#6B7280]">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl mx-4 rounded-xl border border-[#D6CCBC] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#D6CCBC] bg-[#1E3829] px-4 py-3">
          <Sparkles className="h-4 w-4 text-[#C4A35A]" />
          <span className="text-sm font-medium text-[#F5F0E8]">VendorHub Copilot</span>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'text-sm rounded-lg px-3 py-2 max-w-[85%]',
                  msg.role === 'user'
                    ? 'ml-auto bg-[#1E3829] text-[#F5F0E8]'
                    : 'bg-[#F5F0E8] text-[#1E3829] border border-[#D6CCBC]'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[#6B7280] text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-t border-[#D6CCBC]">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything — project status, draft an RFP, flag compliance risks..."
            className="flex-1 bg-transparent text-sm text-[#1E3829] placeholder:text-[#9CA3AF] outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 rounded-md bg-[#C4A35A] px-3 py-1.5 text-xs font-semibold text-[#1E3829] hover:bg-[#D4B87A] disabled:opacity-40 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}
