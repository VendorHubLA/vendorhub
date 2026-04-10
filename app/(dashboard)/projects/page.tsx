import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, FolderKanban } from 'lucide-react'
import { VHBadge } from '@/components/vh/VHBadge'
import type { Project, ProjectStatus } from '@/types'

export const metadata = { title: 'Projects' }

const STATUS_ORDER: ProjectStatus[] = ['active', 'draft', 'on_hold', 'completed', 'cancelled']

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, properties(name, city, state), vendors(company_name)')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  const canCreate = ['owner', 'asset_manager', 'pm', 'admin'].includes(profile.role)

  // Group by status
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = (projects ?? []).filter((p) => p.status === status)
    return acc
  }, {} as Record<ProjectStatus, typeof projects>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3829]">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects?.length ?? 0} total projects</p>
        </div>
        {canCreate && (
          <a
            href="/projects/new"
            className="flex items-center gap-2 rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </a>
        )}
      </div>

      {projects?.length === 0 && (
        <div className="rounded-xl border border-[#D6CCBC] bg-white py-16 text-center">
          <FolderKanban className="h-10 w-10 text-[#D6CCBC] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No projects yet.</p>
          {canCreate && (
            <a href="/projects/new" className="mt-3 inline-block text-sm text-[#C4A35A] hover:underline">
              Create your first project →
            </a>
          )}
        </div>
      )}

      {STATUS_ORDER.map((status) => {
        const group = grouped[status] ?? []
        if (!group.length) return null
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <VHBadge variant={status} />
              <span className="text-xs text-gray-400">{group.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  const budgetPct = project.budget && project.spent
    ? Math.min(100, Math.round((project.spent / project.budget) * 100))
    : null

  return (
    <a
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-[#D6CCBC] bg-white p-5 hover:border-[#C4A35A] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-[#1E3829] text-sm leading-snug">{project.title}</h3>
        <VHBadge variant={project.status} />
      </div>

      <p className="text-xs text-gray-500 mb-1">
        {project.properties?.name}
        {project.properties?.city && ` · ${project.properties.city}, ${project.properties.state}`}
      </p>

      {project.vendors?.company_name && (
        <p className="text-xs text-[#2E5A40] mb-3">{project.vendors.company_name}</p>
      )}

      {project.due_date && (
        <p className="text-xs text-gray-400 mb-3">
          Due {new Date(project.due_date).toLocaleDateString()}
        </p>
      )}

      {/* Budget bar */}
      {project.budget && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Budget</span>
            <span className="text-xs font-medium text-[#1E3829]">
              ${Number(project.spent ?? 0).toLocaleString()} / ${Number(project.budget).toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#EDE6D8] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${budgetPct}%`,
                backgroundColor: (budgetPct ?? 0) > 90 ? '#EF4444' : '#C4A35A',
              }}
            />
          </div>
        </div>
      )}
    </a>
  )
}
