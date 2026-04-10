import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Building2, DollarSign, Users, ShieldAlert } from 'lucide-react'
import { PortfolioCharts } from '@/components/vh/PortfolioCharts'

export const metadata = { title: 'Portfolio Intelligence' }

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  if (!['owner', 'asset_manager', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const org = profile.org_id

  const [
    { data: properties, count: propCount },
    { data: projects },
    { data: vendors },
    { data: compliance },
    { data: milestones },
  ] = await Promise.all([
    supabase.from('properties').select('id, name, city, state', { count: 'exact' }).eq('org_id', org),
    supabase.from('projects').select('id, status, budget, spent, created_at, properties(name)').eq('org_id', org),
    supabase.from('vendors').select('id, status, company_name, vendor_scores(overall_score)').eq('org_id', org),
    supabase.from('compliance_docs').select('id, status, expiry_date, doc_type').eq('org_id', org),
    supabase.from('milestones').select('id, status, amount, project_id').eq('status', 'approved'),
  ])

  // Compute stats
  const totalBudget    = (projects ?? []).reduce((s, p) => s + Number(p.budget ?? 0), 0)
  const totalSpent     = (projects ?? []).reduce((s, p) => s + Number(p.spent ?? 0), 0)
  const activeProjects = (projects ?? []).filter((p) => p.status === 'active').length
  const vettedVendors  = (vendors ?? []).filter((v) => v.status === 'vetted').length
  const complianceAlerts = (compliance ?? []).filter((d) => {
    if (!d.expiry_date) return d.status === 'expired' || d.status === 'missing'
    const days = Math.floor((new Date(d.expiry_date).getTime() - Date.now()) / 86400000)
    return days < 30
  }).length
  const totalMilestonePaid = (milestones ?? []).reduce((s, m) => s + Number(m.amount ?? 0), 0)

  // Spend by property
  const spendByProperty = (projects ?? []).reduce((acc: Record<string, number>, p) => {
    const name = (p.properties as any)?.name ?? 'Unknown'
    acc[name] = (acc[name] ?? 0) + Number(p.spent ?? 0)
    return acc
  }, {})
  const spendByPropertyData = Object.entries(spendByProperty)
    .map(([name, spent]) => ({ name: name.length > 18 ? name.slice(0, 16) + '…' : name, spent }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8)

  // Projects by status
  const statusCounts = (projects ?? []).reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})
  const projectStatusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Top vendors by score
  const topVendors = (vendors ?? [])
    .filter((v) => v.vendor_scores)
    .map((v) => ({
      name: v.company_name.length > 20 ? v.company_name.slice(0, 18) + '…' : v.company_name,
      score: Math.round(Number((v.vendor_scores as any)?.overall_score ?? 0)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">Portfolio Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">Portfolio-level performance, spend, and risk overview.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPI icon={Building2}    label="Properties"       value={propCount ?? 0}                          />
        <KPI icon={BarChart3}    label="Active Projects"  value={activeProjects}         accent           />
        <KPI icon={DollarSign}   label="Total Budget"     value={`$${(totalBudget/1000).toFixed(0)}k`}    />
        <KPI icon={TrendingUp}   label="Total Spent"      value={`$${(totalSpent/1000).toFixed(0)}k`}     />
        <KPI icon={Users}        label="Vetted Vendors"   value={vettedVendors}                            />
        <KPI icon={ShieldAlert}  label="Compliance Alerts" value={complianceAlerts} alert={complianceAlerts > 0} />
      </div>

      {/* Charts */}
      <PortfolioCharts
        spendByProperty={spendByPropertyData}
        projectStatusData={projectStatusData}
        topVendors={topVendors}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        totalMilestonePaid={totalMilestonePaid}
      />

      {/* Property table */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white">
        <div className="border-b border-[#EDE6D8] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1E3829]">Properties</h2>
        </div>
        <div className="divide-y divide-[#EDE6D8]">
          {(properties ?? []).map((prop) => {
            const propProjects = (projects ?? []).filter((p) => (p.properties as any)?.name === prop.name)
            const propSpend = propProjects.reduce((s, p) => s + Number(p.spent ?? 0), 0)
            const propBudget = propProjects.reduce((s, p) => s + Number(p.budget ?? 0), 0)
            return (
              <div key={prop.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1E3829]">{prop.name}</p>
                  <p className="text-xs text-gray-400">{prop.city}, {prop.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#C4A35A]">
                    ${propSpend.toLocaleString()} <span className="text-xs text-gray-400">spent</span>
                  </p>
                  {propBudget > 0 && (
                    <p className="text-xs text-gray-400">of ${propBudget.toLocaleString()}</p>
                  )}
                </div>
              </div>
            )
          })}
          {!properties?.length && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No properties yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({
  icon: Icon, label, value, accent, alert,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent?: boolean
  alert?: boolean
}) {
  return (
    <div className={`rounded-xl border bg-white p-4 ${alert ? 'border-red-200' : 'border-[#D6CCBC]'}`}>
      <Icon className={`h-4 w-4 mb-2 ${alert ? 'text-red-500' : accent ? 'text-[#C4A35A]' : 'text-[#2E5A40]'}`} />
      <p className={`text-xl font-bold ${alert ? 'text-red-600' : accent ? 'text-[#C4A35A]' : 'text-[#1E3829]'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
