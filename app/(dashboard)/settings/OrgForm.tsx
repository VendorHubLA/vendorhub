'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OrgForm({
  orgId,
  initialName,
  initialSlug,
}: {
  orgId: string
  initialName: string
  initialSlug: string
}) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({ name: name.trim() })
        .eq('id', orgId)
      if (error) throw error
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-md border border-[#D6CCBC] bg-white px-3 py-2.5 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A] transition-colors'

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-[#D6CCBC] bg-white p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[#1E3829]">Organization</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">Organization Name</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your company name"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">Slug</label>
          <input
            className={`${inputCls} bg-[#F5F0E8] cursor-not-allowed`}
            value={initialSlug}
            disabled
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {status === 'saved' && <p className="text-xs text-[#2E5A40] font-medium">Organization updated.</p>}
        {status === 'error' && <p className="text-xs text-red-500 font-medium">Save failed. Try again.</p>}
        {status === 'idle' && <span />}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Organization'}
        </button>
      </div>
    </form>
  )
}
