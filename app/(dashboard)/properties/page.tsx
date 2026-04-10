import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, MapPin, Layers } from 'lucide-react'

export const metadata = { title: 'Properties' }

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  if (!['owner', 'asset_manager', 'pm', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const org = profile.org_id

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('org_id', org)
    .order('created_at', { ascending: false })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, property_id, status, budget, spent')
    .eq('org_id', org)

  const canAdd = ['owner', 'asset_manager', 'admin'].includes(profile.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3829]">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            {properties?.length ?? 0} propert{(properties?.length ?? 0) === 1 ? 'y' : 'ies'} in your portfolio
          </p>
        </div>
        {canAdd && (
          <Link
            href="/properties/new"
            className="flex items-center gap-2 rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        )}
      </div>

      {properties?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((prop) => {
            const propProjects = (projects ?? []).filter((p) => p.property_id === prop.id)
            const activeCount = propProjects.filter((p) => p.status === 'active').length
            const totalBudget = propProjects.reduce((s, p) => s + Number(p.budget ?? 0), 0)
            const totalSpent = propProjects.reduce((s, p) => s + Number(p.spent ?? 0), 0)
            const pct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

            return (
              <Link
                key={prop.id}
                href={`/properties/${prop.id}`}
                className="group rounded-xl border border-[#D6CCBC] bg-white p-5 hover:border-[#C4A35A] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[#1E3829] flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-[#C4A35A]" />
                  </div>
                  <span className="text-xs font-medium text-[#6B7280] bg-[#F5F0E8] rounded-full px-2.5 py-1 capitalize">
                    {prop.property_type.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="font-bold text-[#1E3829] group-hover:text-[#2E5A40] transition-colors mb-1">
                  {prop.name}
                </h2>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{prop.city}, {prop.state} {prop.zip}</span>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500">
                    <span className="font-semibold text-[#1E3829]">{propProjects.length}</span> project{propProjects.length !== 1 ? 's' : ''}
                    {activeCount > 0 && (
                      <span className="ml-2 text-[#C4A35A] font-medium">{activeCount} active</span>
                    )}
                  </span>
                  {prop.square_footage && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Layers className="h-3 w-3" />
                      {prop.square_footage.toLocaleString()} sq ft
                    </span>
                  )}
                </div>

                {totalBudget > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>${totalSpent.toLocaleString()} spent</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EDE6D8] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C4A35A] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#D6CCBC] bg-white py-20 text-center">
          <Building2 className="h-10 w-10 text-[#D6CCBC] mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No properties yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-6">Add your first property to start tracking projects and spend.</p>
          {canAdd && (
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
