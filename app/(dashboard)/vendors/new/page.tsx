'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X, Plus } from 'lucide-react'

const TRADE_CATEGORIES = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping',
  'Janitorial', 'Security', 'Painting', 'Flooring', 'Elevator',
  'Fire Safety', 'Pest Control', 'General Contractor', 'IT/AV', 'Other',
]

export default function NewVendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [serviceArea, setServiceArea] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
  })

  function toggleTrade(trade: string) {
    setSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    )
  }

  function addServiceArea() {
    const trimmed = serviceArea.trim()
    if (trimmed && !serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed])
      setServiceArea('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!profile) { setError('Profile not found'); setLoading(false); return }

    const { data: vendor, error: err } = await supabase
      .from('vendors')
      .insert({
        org_id: profile.org_id,
        company_name: form.company_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone || null,
        trade_categories: selectedTrades,
        service_areas: serviceAreas,
        status: 'pending',
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }

    // Initialize vendor score record
    await supabase.from('vendor_scores').insert({ vendor_id: vendor.id })

    router.push(`/vendors/${vendor.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">Add Vendor</h1>
        <p className="text-sm text-gray-500 mt-1">Add a vendor to your registry for vetting and project assignment.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#D6CCBC] bg-white p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name" required>
            <input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              required
              className="vh-input"
              placeholder="Acme HVAC Services"
            />
          </Field>
          <Field label="Contact Name" required>
            <input
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              required
              className="vh-input"
              placeholder="John Smith"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="vh-input"
              placeholder="john@acmehvac.com"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="vh-input"
              placeholder="+1 (555) 000-0000"
            />
          </Field>
        </div>

        {/* Trade categories */}
        <Field label="Trade Categories">
          <div className="flex flex-wrap gap-2 mt-1">
            {TRADE_CATEGORIES.map((trade) => (
              <button
                key={trade}
                type="button"
                onClick={() => toggleTrade(trade)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedTrades.includes(trade)
                    ? 'bg-[#1E3829] text-[#C4A35A] border-[#1E3829]'
                    : 'bg-white text-gray-600 border-[#D6CCBC] hover:border-[#C4A35A]'
                }`}
              >
                {trade}
              </button>
            ))}
          </div>
        </Field>

        {/* Service areas */}
        <Field label="Service Areas">
          <div className="flex gap-2 mb-2">
            <input
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
              className="vh-input flex-1"
              placeholder="e.g. Miami, FL or Broward County"
            />
            <button
              type="button"
              onClick={addServiceArea}
              className="rounded-md border border-[#C4A35A] px-3 text-[#C4A35A] hover:bg-[#C4A35A]/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {serviceAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <span
                  key={area}
                  className="flex items-center gap-1 rounded-full bg-[#F5F0E8] px-3 py-1 text-xs text-[#1E3829]"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => setServiceAreas((prev) => prev.filter((a) => a !== area))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-md border border-[#D6CCBC] py-2.5 text-sm font-medium text-gray-600 hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#1E3829] py-2.5 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Adding...' : 'Add Vendor'}
          </button>
        </div>
      </form>

      <style>{`
        .vh-input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #D6CCBC;
          background: #F5F0E8;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1E3829;
          outline: none;
        }
        .vh-input:focus {
          border-color: #C4A35A;
          box-shadow: 0 0 0 1px #C4A35A;
        }
      `}</style>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1E3829] mb-1.5">
        {label}{required && <span className="text-[#C4A35A] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
