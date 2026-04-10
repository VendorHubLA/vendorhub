'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2 } from 'lucide-react'

const DOC_TYPES = [
  { value: 'coi',     label: 'Certificate of Insurance (COI)' },
  { value: 'license', label: 'Business License' },
  { value: 'w9',      label: 'W-9 Form' },
  { value: 'bond',    label: 'Surety Bond' },
  { value: 'other',   label: 'Other' },
]

export default function UploadComplianceDoc() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ vendor_id: '', doc_type: 'coi', expiry_date: '' })

  useEffect(() => {
    async function loadVendors() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile) return
      const { data } = await supabase.from('vendors').select('id, company_name').eq('org_id', profile.org_id).order('company_name')
      setVendors(data ?? [])
    }
    loadVendors()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile) { setError('Profile not found'); setLoading(false); return }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${profile.org_id}/${form.vendor_id}/${form.doc_type}_${Date.now()}.${fileExt}`

    const { error: uploadErr } = await supabase.storage
      .from('compliance-docs')
      .upload(filePath, file)

    if (uploadErr) { setError(uploadErr.message); setLoading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance-docs')
      .getPublicUrl(filePath)

    // Save record
    const { error: dbErr } = await supabase.from('compliance_docs').insert({
      vendor_id: form.vendor_id,
      org_id: profile.org_id,
      doc_type: form.doc_type,
      file_name: file.name,
      file_url: publicUrl,
      expiry_date: form.expiry_date || null,
      status: 'valid',
    })

    if (dbErr) { setError(dbErr.message); setLoading(false); return }

    router.push('/compliance')
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">Upload Compliance Document</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a COI, license, W-9, or bond for a vendor.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#D6CCBC] bg-white p-6 space-y-5">
        {/* Vendor select */}
        <div>
          <label className="block text-xs font-medium text-[#1E3829] mb-1.5">
            Vendor <span className="text-[#C4A35A]">*</span>
          </label>
          <select
            value={form.vendor_id}
            onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
            required
            className="w-full rounded-md border border-[#D6CCBC] bg-[#F5F0E8] px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A]"
          >
            <option value="">Select a vendor...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.company_name}</option>
            ))}
          </select>
        </div>

        {/* Doc type */}
        <div>
          <label className="block text-xs font-medium text-[#1E3829] mb-1.5">
            Document Type <span className="text-[#C4A35A]">*</span>
          </label>
          <select
            value={form.doc_type}
            onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
            className="w-full rounded-md border border-[#D6CCBC] bg-[#F5F0E8] px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A]"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Expiry date */}
        <div>
          <label className="block text-xs font-medium text-[#1E3829] mb-1.5">Expiry Date</label>
          <input
            type="date"
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            className="w-full rounded-md border border-[#D6CCBC] bg-[#F5F0E8] px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A]"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-xs font-medium text-[#1E3829] mb-1.5">
            File <span className="text-[#C4A35A]">*</span>
          </label>
          <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#D6CCBC] bg-[#F5F0E8] p-8 cursor-pointer hover:border-[#C4A35A] transition-colors">
            <Upload className="h-6 w-6 text-[#C4A35A]" />
            <span className="text-sm text-gray-600">
              {file ? file.name : 'Click to upload PDF or image'}
            </span>
            <span className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

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
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  )
}
