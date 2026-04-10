import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { differenceInDays } from 'date-fns'
import { ShieldCheck, ShieldAlert, ShieldX, Upload } from 'lucide-react'
import { VHComplianceRow } from '@/components/vh/VHComplianceRow'
import type { ComplianceDoc } from '@/types'

export const metadata = { title: 'Compliance' }

function deriveStatus(doc: ComplianceDoc): 'valid' | 'expiring_soon' | 'expired' | 'missing' {
  if (!doc.expiry_date) return doc.status
  const days = differenceInDays(new Date(doc.expiry_date), new Date())
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring_soon'
  return 'valid'
}

export default async function CompliancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: docs } = await supabase
    .from('compliance_docs')
    .select('*, vendors(company_name)')
    .eq('org_id', profile.org_id)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  const allDocs = (docs ?? []) as (ComplianceDoc & { vendors: { company_name: string } })[]

  const expired      = allDocs.filter((d) => deriveStatus(d) === 'expired')
  const expiringSoon = allDocs.filter((d) => deriveStatus(d) === 'expiring_soon')
  const valid        = allDocs.filter((d) => deriveStatus(d) === 'valid')
  const missing      = allDocs.filter((d) => deriveStatus(d) === 'missing')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3829]">Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Track COIs, licenses, W-9s, and bonds across all vendors.</p>
        </div>
        <a
          href="/compliance/upload"
          className="flex items-center gap-2 rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </a>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={ShieldX}     label="Expired"       count={expired.length}      color="text-red-500"     bg="border-red-200" />
        <SummaryCard icon={ShieldAlert} label="Expiring Soon" count={expiringSoon.length}  color="text-amber-500"   bg="border-amber-200" />
        <SummaryCard icon={ShieldCheck} label="Valid"         count={valid.length}         color="text-[#2E5A40]"   bg="border-[#D6CCBC]" />
        <SummaryCard icon={ShieldCheck} label="Total Docs"    count={allDocs.length}       color="text-[#C4A35A]"   bg="border-[#D6CCBC]" />
      </div>

      {/* Expired — highest priority */}
      {expired.length > 0 && (
        <DocSection title="Expired" titleColor="text-red-600" docs={expired} />
      )}

      {/* Expiring soon */}
      {expiringSoon.length > 0 && (
        <DocSection title="Expiring Within 30 Days" titleColor="text-amber-600" docs={expiringSoon} />
      )}

      {/* Valid */}
      {valid.length > 0 && (
        <DocSection title="Valid" titleColor="text-[#2E5A40]" docs={valid} />
      )}

      {/* Missing */}
      {missing.length > 0 && (
        <DocSection title="Missing / Unknown" titleColor="text-gray-500" docs={missing} />
      )}

      {allDocs.length === 0 && (
        <div className="rounded-xl border border-[#D6CCBC] bg-white py-16 text-center">
          <ShieldCheck className="h-10 w-10 text-[#D6CCBC] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No compliance documents on file yet.</p>
          <a href="/compliance/upload" className="mt-3 inline-block text-sm text-[#C4A35A] hover:underline">
            Upload your first document →
          </a>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon, label, count, color, bg,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  count: number
  color: string
  bg: string
}) {
  return (
    <div className={`rounded-xl border bg-white p-4 ${bg}`}>
      <Icon className={`h-5 w-5 mb-2 ${color}`} />
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function DocSection({
  title,
  titleColor,
  docs,
}: {
  title: string
  titleColor: string
  docs: (ComplianceDoc & { vendors: { company_name: string } })[]
}) {
  return (
    <div className="rounded-xl border border-[#D6CCBC] bg-white">
      <div className="border-b border-[#EDE6D8] px-5 py-3">
        <h2 className={`text-sm font-semibold ${titleColor}`}>
          {title} <span className="text-gray-400 font-normal">({docs.length})</span>
        </h2>
      </div>
      <div className="px-5">
        {docs.map((doc) => (
          <div key={doc.id}>
            <p className="text-xs text-gray-400 pt-3 pb-1 font-medium">
              {doc.vendors?.company_name}
            </p>
            <VHComplianceRow doc={doc} />
          </div>
        ))}
      </div>
    </div>
  )
}
