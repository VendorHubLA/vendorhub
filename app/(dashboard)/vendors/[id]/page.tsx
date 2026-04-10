import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react'
import { VHBadge } from '@/components/vh/VHBadge'
import { VHScoreRing } from '@/components/vh/VHScoreRing'
import { VHComplianceRow } from '@/components/vh/VHComplianceRow'
import type { PageProps } from '@/types/next'

export async function generateMetadata({ params }: PageProps<'/vendors/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('vendors').select('company_name').eq('id', id).single()
  return { title: data?.company_name ?? 'Vendor' }
}

export default async function VendorDetailPage({ params }: PageProps<'/vendors/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const [{ data: vendor }, { data: scores }, { data: complianceDocs }, { data: projects }] =
    await Promise.all([
      supabase.from('vendors').select('*').eq('id', id).eq('org_id', profile.org_id).single(),
      supabase.from('vendor_scores').select('*').eq('vendor_id', id).single(),
      supabase.from('compliance_docs').select('*').eq('vendor_id', id).order('doc_type'),
      supabase.from('projects').select('id, title, status, due_date').eq('vendor_id', id).order('created_at', { ascending: false }).limit(5),
    ])

  if (!vendor) notFound()

  const canVet = ['owner', 'asset_manager', 'admin'].includes(profile.role)
  const overallScore = scores?.overall_score ? Math.round(Number(scores.overall_score)) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#1E3829]">{vendor.company_name}</h1>
              <VHBadge variant={vendor.status} />
            </div>
            <p className="text-gray-500 text-sm">{vendor.contact_name}</p>

            <div className="flex flex-wrap gap-4 mt-4">
              <ContactItem icon={Mail} value={vendor.email} href={`mailto:${vendor.email}`} />
              {vendor.phone && <ContactItem icon={Phone} value={vendor.phone} href={`tel:${vendor.phone}`} />}
            </div>

            {vendor.service_areas?.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                {vendor.service_areas.map((area: string) => (
                  <span key={area} className="text-xs text-gray-600">{area}</span>
                ))}
              </div>
            )}

            {vendor.trade_categories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {vendor.trade_categories.map((cat: string) => (
                  <span key={cat} className="rounded-full bg-[#F5F0E8] px-2.5 py-0.5 text-xs font-medium text-[#2E5A40]">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Score + vet button */}
          <div className="flex flex-col items-center gap-3">
            <VHScoreRing score={overallScore} size={80} strokeWidth={6} />
            <p className="text-xs text-gray-400">Performance Score</p>
            {canVet && vendor.status === 'pending' && (
              <form action={`/api/vendors/${vendor.id}/vet`} method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-[#C4A35A] px-3 py-1.5 text-xs font-semibold text-[#1E3829] hover:bg-[#D4B87A] transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Mark as Vetted
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score breakdown */}
        {scores && (
          <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Performance Breakdown</h2>
            <div className="space-y-3">
              <ScoreBar label="Response Time"      value={Number(scores.response_time_score)} />
              <ScoreBar label="Budget Adherence"   value={Number(scores.budget_adherence_score)} />
              <ScoreBar label="Quality"            value={Number(scores.quality_score)} />
              <ScoreBar label="Completion Rate"    value={Number(scores.completion_rate_score)} />
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Based on {scores.total_projects} project{scores.total_projects !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Compliance docs */}
        <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1E3829]">Compliance Documents</h2>
            <a href={`/compliance?vendor=${vendor.id}`} className="text-xs text-[#C4A35A] hover:underline">
              Manage →
            </a>
          </div>
          {complianceDocs?.length ? (
            <div>
              {complianceDocs.map((doc) => (
                <VHComplianceRow key={doc.id} doc={doc as any} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No compliance documents on file.</p>
          )}
        </div>
      </div>

      {/* Recent projects */}
      {projects && projects.length > 0 && (
        <div className="rounded-xl border border-[#D6CCBC] bg-white">
          <div className="flex items-center justify-between border-b border-[#EDE6D8] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1E3829]">Recent Projects</h2>
          </div>
          <div className="divide-y divide-[#EDE6D8]">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#F5F0E8] transition-colors"
              >
                <p className="text-sm font-medium text-[#1E3829]">{project.title}</p>
                <VHBadge variant={project.status as any} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ContactItem({ icon: Icon, value, href }: { icon: React.ComponentType<{className?: string}>; value: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#C4A35A] transition-colors">
      <Icon className="h-3.5 w-3.5" />
      {value}
    </a>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 80 ? '#C4A35A' : pct >= 60 ? '#2E5A40' : pct >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-medium" style={{ color }}>{pct.toFixed(0)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#EDE6D8] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
