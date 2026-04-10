import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Building2, User, Calendar, DollarSign, Sparkles } from 'lucide-react'
import { VHBadge } from '@/components/vh/VHBadge'
import { VHTimeline } from '@/components/vh/VHTimeline'
import { ProjectThread } from '@/components/vh/ProjectThread'
import type { PageProps } from '@/types/next'
import type { Milestone } from '@/types'

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('title').eq('id', id).single()
  return { title: data?.title ?? 'Project' }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role, id, full_name').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const [{ data: project }, { data: milestones }, { data: threads }] = await Promise.all([
    supabase.from('projects')
      .select('*, properties(name, address, city, state), vendors(company_name, email)')
      .eq('id', id).eq('org_id', profile.org_id).single(),
    supabase.from('milestones').select('*').eq('project_id', id).order('created_at'),
    supabase.from('project_threads')
      .select('*, profiles(full_name, role)')
      .eq('project_id', id).order('created_at'),
  ])

  if (!project) notFound()

  const budgetPct = project.budget && project.spent
    ? Math.min(100, Math.round((Number(project.spent) / Number(project.budget)) * 100))
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#1E3829]">{project.title}</h1>
              <VHBadge variant={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1 max-w-xl">{project.description}</p>
            )}
          </div>
          <a
            href={`/api/projects/${id}/rfp`}
            className="flex items-center gap-1.5 rounded-md border border-[#C4A35A] px-3 py-1.5 text-xs font-semibold text-[#C4A35A] hover:bg-[#C4A35A]/10 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Draft RFP with AI
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetaItem icon={Building2} label="Property" value={(project.properties as any)?.name} />
          <MetaItem icon={User}      label="Vendor"   value={(project.vendors as any)?.company_name ?? 'Unassigned'} />
          <MetaItem icon={Calendar}  label="Due"      value={project.due_date ? new Date(project.due_date).toLocaleDateString() : '—'} />
          <MetaItem icon={DollarSign} label="Budget"  value={project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'} />
        </div>

        {/* Budget progress */}
        {budgetPct !== null && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Budget used</span>
              <span className="text-xs font-medium text-[#1E3829]">
                ${Number(project.spent).toLocaleString()} of ${Number(project.budget).toLocaleString()} ({budgetPct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#EDE6D8] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${budgetPct}%`, backgroundColor: budgetPct > 90 ? '#EF4444' : '#C4A35A' }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Communication thread */}
        <div className="rounded-xl border border-[#D6CCBC] bg-white overflow-hidden">
          <div className="border-b border-[#EDE6D8] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1E3829]">Project Thread</h2>
          </div>
          <ProjectThread
            projectId={id}
            threads={(threads ?? []) as any}
            currentUserId={user.id}
            currentUserName={profile.full_name ?? 'You'}
          />
        </div>

        {/* Milestone timeline */}
        <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1E3829]">Milestones</h2>
            <span className="text-xs text-gray-400">
              {(milestones ?? []).filter((m) => m.status === 'approved').length} / {milestones?.length ?? 0} done
            </span>
          </div>
          {milestones?.length ? (
            <VHTimeline milestones={milestones as Milestone[]} />
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">No milestones yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ComponentType<{className?: string}>; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-[#C4A35A] mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-[#1E3829]">{value ?? '—'}</p>
      </div>
    </div>
  )
}
