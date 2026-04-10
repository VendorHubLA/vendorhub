import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2, FolderKanban, Users, ShieldCheck } from 'lucide-react'
import { VHBadge } from '@/components/vh/VHBadge'

export const metadata = { title: 'Dashboard' }

async function getStats(orgId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const [properties, projects, vendors, compliance] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('projects').select('id, status', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('vendors').select('id, status', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('compliance_docs').select('id, status').eq('org_id', orgId),
  ])

  const activeProjects = projects.data?.filter((p) => p.status === 'active').length ?? 0
  const vettedVendors = vendors.data?.filter((v) => v.status === 'vetted').length ?? 0
  const expiringDocs = compliance.data?.filter(
    (d) => d.status === 'expiring_soon' || d.status === 'expired'
  ).length ?? 0

  return {
    properties: properties.count ?? 0,
    activeProjects,
    vettedVendors,
    expiringDocs,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const stats = await getStats(profile.org_id, supabase)

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, title, status, due_date, properties(name)')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">
          Welcome back{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what needs your attention today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Building2}  label="Properties"      value={stats.properties}    />
        <StatCard icon={FolderKanban} label="Active Projects" value={stats.activeProjects} accent />
        <StatCard icon={Users}      label="Vetted Vendors"  value={stats.vettedVendors} />
        <StatCard
          icon={ShieldCheck}
          label="Compliance Alerts"
          value={stats.expiringDocs}
          alert={stats.expiringDocs > 0}
        />
      </div>

      {/* Recent projects */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white">
        <div className="flex items-center justify-between border-b border-[#EDE6D8] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1E3829]">Recent Projects</h2>
          <a href="/projects" className="text-xs text-[#C4A35A] hover:underline">View all</a>
        </div>
        <div className="divide-y divide-[#EDE6D8]">
          {recentProjects?.length ? recentProjects.map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-[#F5F0E8] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[#1E3829]">{project.title}</p>
                <p className="text-xs text-gray-500">
                  {(project.properties as unknown as { name: string } | null)?.name}
                  {project.due_date && ` · Due ${new Date(project.due_date).toLocaleDateString()}`}
                </p>
              </div>
              <VHBadge variant={project.status as any} />
            </a>
          )) : (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              No projects yet.{' '}
              <a href="/projects" className="text-[#C4A35A] hover:underline">Create one →</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent?: boolean
  alert?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 bg-white ${alert ? 'border-red-200' : 'border-[#D6CCBC]'}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`h-5 w-5 ${alert ? 'text-red-500' : accent ? 'text-[#C4A35A]' : 'text-[#2E5A40]'}`} />
      </div>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : accent ? 'text-[#C4A35A]' : 'text-[#1E3829]'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
