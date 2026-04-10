import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Layers, FolderKanban, Plus } from 'lucide-react'
import { VHBadge } from '@/components/vh'
import type { PageProps } from '@/types/next'

export const metadata = { title: 'Property' }

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: prop } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!prop) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, budget, spent, start_date, due_date, vendors(company_name)')
    .eq('property_id', id)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  const totalBudget = (projects ?? []).reduce((s, p) => s + Number(p.budget ?? 0), 0)
  const totalSpent = (projects ?? []).reduce((s, p) => s + Number(p.spent ?? 0), 0)
  const activeProjects = (projects ?? []).filter((p) => p.status === 'active').length

  const canAddProject = ['owner', 'asset_manager', 'pm', 'admin'].includes(profile.role)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/properties" className="rounded-md p-1.5 hover:bg-[#EDE6D8] transition-colors">
          <ArrowLeft className="h-4 w-4 text-[#1E3829]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#1E3829] truncate">{prop.name}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{prop.address}, {prop.city}, {prop.state} {prop.zip}</span>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-[#6B7280] bg-[#F5F0E8] rounded-full px-3 py-1 capitalize border border-[#D6CCBC]">
          {prop.property_type.replace('_', ' ')}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Projects" value={projects?.length ?? 0} />
        <StatCard label="Active Projects" value={activeProjects} accent />
        <StatCard label="Total Budget" value={totalBudget > 0 ? `$${(totalBudget / 1000).toFixed(0)}k` : '—'} />
        <StatCard label="Total Spent" value={totalSpent > 0 ? `$${(totalSpent / 1000).toFixed(0)}k` : '—'} />
      </div>

      {/* Property details */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Property Details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 text-sm">
          <MetaItem label="Name" value={prop.name} />
          <MetaItem label="Type" value={prop.property_type.replace('_', ' ')} capitalize />
          {prop.square_footage && (
            <MetaItem label="Square Footage" value={`${prop.square_footage.toLocaleString()} sq ft`} />
          )}
          <MetaItem label="Address" value={prop.address} />
          <MetaItem label="City" value={prop.city} />
          <MetaItem label="State / ZIP" value={`${prop.state} ${prop.zip}`} />
        </dl>
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white">
        <div className="flex items-center justify-between border-b border-[#EDE6D8] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1E3829]">
            Projects <span className="text-gray-400 font-normal ml-1">({projects?.length ?? 0})</span>
          </h2>
          {canAddProject && (
            <Link
              href={`/projects/new?property_id=${prop.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C4A35A] hover:text-[#A8893E] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Link>
          )}
        </div>

        <div className="divide-y divide-[#EDE6D8]">
          {(projects ?? []).map((proj) => {
            const budget = Number(proj.budget ?? 0)
            const spent = Number(proj.spent ?? 0)
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
            const vendor = (proj.vendors as unknown as { company_name: string } | null)?.company_name

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F5F0E8] transition-colors"
              >
                <div className="h-8 w-8 rounded-md bg-[#EDE6D8] flex items-center justify-center shrink-0">
                  <FolderKanban className="h-4 w-4 text-[#2E5A40]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E3829] truncate">{proj.title}</p>
                  {vendor && (
                    <p className="text-xs text-gray-400 truncate">{vendor}</p>
                  )}
                  {budget > 0 && (
                    <div className="mt-1.5">
                      <div className="h-1 rounded-full bg-[#EDE6D8] w-32 overflow-hidden">
                        <div className="h-full rounded-full bg-[#C4A35A]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <VHBadge variant={proj.status as any} />
                  {budget > 0 && (
                    <p className="text-xs text-gray-400 mt-1">${spent.toLocaleString()} / ${budget.toLocaleString()}</p>
                  )}
                </div>
              </Link>
            )
          })}

          {!projects?.length && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">No projects for this property yet.</p>
              {canAddProject && (
                <Link
                  href={`/projects/new?property_id=${prop.id}`}
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#1E3829] hover:text-[#2E5A40] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create first project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[#D6CCBC] bg-white p-4">
      <p className={`text-xl font-bold ${accent ? 'text-[#C4A35A]' : 'text-[#1E3829]'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function MetaItem({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className={`font-medium text-[#1E3829] mt-0.5 ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  )
}
