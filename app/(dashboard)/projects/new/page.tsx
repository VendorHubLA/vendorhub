'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, X } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([])
  const [milestones, setMilestones] = useState([{ title: '', amount: '', due_date: '' }])

  const [form, setForm] = useState({
    title: '', description: '', property_id: '', vendor_id: '',
    budget: '', start_date: '', due_date: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile) return
      const [{ data: props }, { data: vends }] = await Promise.all([
        supabase.from('properties').select('id, name').eq('org_id', profile.org_id).order('name'),
        supabase.from('vendors').select('id, company_name').eq('org_id', profile.org_id).eq('status', 'vetted').order('company_name'),
      ])
      setProperties(props ?? [])
      setVendors(vends ?? [])
    }
    load()
  }, [])

  function addMilestone() {
    setMilestones((prev) => [...prev, { title: '', amount: '', due_date: '' }])
  }

  function updateMilestone(i: number, field: string, value: string) {
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  function removeMilestone(i: number) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase.from('profiles').select('org_id, id').eq('id', user.id).single()
    if (!profile) { setError('Profile not found'); setLoading(false); return }

    const { data: project, error: err } = await supabase
      .from('projects')
      .insert({
        org_id: profile.org_id,
        property_id: form.property_id,
        vendor_id: form.vendor_id || null,
        title: form.title,
        description: form.description || null,
        budget: form.budget ? Number(form.budget) : null,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        status: 'draft',
        created_by: profile.id,
      })
      .select().single()

    if (err) { setError(err.message); setLoading(false); return }

    // Create milestones
    const validMilestones = milestones.filter((m) => m.title.trim())
    if (validMilestones.length) {
      await supabase.from('milestones').insert(
        validMilestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          amount: m.amount ? Number(m.amount) : null,
          due_date: m.due_date || null,
          status: 'pending',
        }))
      )
    }

    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">New Project</h1>
        <p className="text-sm text-gray-500 mt-1">Create a project and assign it to a property and vendor.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <Section title="Project Details">
          <Field label="Project Title" required>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              required className="vh-input" placeholder="Roof replacement — Building A" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="vh-input resize-none" placeholder="Scope overview..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Property" required>
              <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                required className="vh-input">
                <option value="">Select property...</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Assigned Vendor">
              <select value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                className="vh-input">
                <option value="">Select vendor...</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.company_name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Budget ($)">
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="vh-input" placeholder="50000" />
            </Field>
            <Field label="Start Date">
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="vh-input" />
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="vh-input" />
            </Field>
          </div>
        </Section>

        {/* Milestones */}
        <Section title="Milestones">
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    className="vh-input col-span-1" placeholder="Milestone name" />
                  <input type="number" value={m.amount} onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                    className="vh-input" placeholder="Amount ($)" />
                  <input type="date" value={m.due_date} onChange={(e) => updateMilestone(i, 'due_date', e.target.value)}
                    className="vh-input" />
                </div>
                <button type="button" onClick={() => removeMilestone(i)}
                  className="mt-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMilestone}
            className="flex items-center gap-1.5 text-xs text-[#C4A35A] hover:underline mt-2">
            <Plus className="h-3.5 w-3.5" />
            Add milestone
          </button>
        </Section>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 rounded-md border border-[#D6CCBC] py-2.5 text-sm font-medium text-gray-600 hover:bg-[#F5F0E8] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#1E3829] py-2.5 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-50 transition-colors">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>

      <style>{`
        .vh-input { width:100%; border-radius:0.375rem; border:1px solid #D6CCBC; background:#F5F0E8; padding:0.5rem 0.75rem; font-size:0.875rem; color:#1E3829; outline:none; }
        .vh-input:focus { border-color:#C4A35A; box-shadow:0 0 0 1px #C4A35A; }
      `}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#D6CCBC] bg-white p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[#1E3829]">{title}</h2>
      {children}
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
