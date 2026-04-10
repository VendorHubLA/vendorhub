'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PROPERTY_TYPES = [
  { value: 'commercial',   label: 'Commercial' },
  { value: 'retail',       label: 'Retail' },
  { value: 'industrial',   label: 'Industrial' },
  { value: 'multifamily',  label: 'Multifamily' },
  { value: 'office',       label: 'Office' },
  { value: 'mixed_use',    label: 'Mixed Use' },
  { value: 'warehouse',    label: 'Warehouse' },
  { value: 'other',        label: 'Other' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]

export default function NewPropertyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    property_type: 'commercial',
    square_footage: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.address || !form.city || !form.state || !form.zip) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile) throw new Error('Profile not found')

      const { data: prop, error: insertErr } = await supabase
        .from('properties')
        .insert({
          org_id: profile.org_id,
          name: form.name.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          zip: form.zip.trim(),
          property_type: form.property_type,
          square_footage: form.square_footage ? parseInt(form.square_footage, 10) : null,
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr
      router.push(`/properties/${prop.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-md border border-[#D6CCBC] bg-white px-3 py-2.5 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A] transition-colors placeholder:text-gray-300'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/properties" className="rounded-md p-1.5 hover:bg-[#EDE6D8] transition-colors">
          <ArrowLeft className="h-4 w-4 text-[#1E3829]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3829]">Add Property</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a new property to your portfolio.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#D6CCBC] bg-white p-6 space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">
            Property Name <span className="text-red-400">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="e.g. Riverview Plaza"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">
            Street Address <span className="text-red-400">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="123 Main St"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">
              City <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="City"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">
              State <span className="text-red-400">*</span>
            </label>
            <select
              className={inputCls}
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              required
            >
              <option value="">—</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">
              ZIP <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="90210"
              value={form.zip}
              onChange={(e) => set('zip', e.target.value)}
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">Property Type</label>
            <select
              className={inputCls}
              value={form.property_type}
              onChange={(e) => set('property_type', e.target.value)}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1E3829] mb-1.5">Square Footage</label>
            <input
              type="number"
              className={inputCls}
              placeholder="e.g. 25000"
              value={form.square_footage}
              onChange={(e) => set('square_footage', e.target.value)}
              min={0}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/properties"
            className="rounded-md border border-[#D6CCBC] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#1E3829] px-5 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  )
}
