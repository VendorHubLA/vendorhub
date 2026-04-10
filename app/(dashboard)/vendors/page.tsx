import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { VHBadge } from '@/components/vh/VHBadge'
import { VHScoreRing } from '@/components/vh/VHScoreRing'
import type { Vendor, VendorScore } from '@/types'

export const metadata = { title: 'Vendors' }

type VendorWithScore = Vendor & { vendor_scores: VendorScore | null }

export default async function VendorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*, vendor_scores(*)')
    .eq('org_id', profile.org_id)
    .order('company_name')

  const canManage = ['owner', 'asset_manager', 'pm', 'admin'].includes(profile.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3829]">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">
            {vendors?.length ?? 0} vendor{vendors?.length !== 1 ? 's' : ''} in your registry
          </p>
        </div>
        {canManage && (
          <a
            href="/vendors/new"
            className="flex items-center gap-2 rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </a>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search vendors by name, trade, or service area..."
            className="w-full rounded-md border border-[#D6CCBC] bg-white pl-9 pr-4 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A]"
          />
        </div>
        <select className="rounded-md border border-[#D6CCBC] bg-white px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A]">
          <option value="">All Status</option>
          <option value="vetted">Vetted</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Vendor grid */}
      {vendors?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(vendors as VendorWithScore[]).map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#D6CCBC] bg-white py-16 text-center">
          <p className="text-gray-400 text-sm">No vendors yet.</p>
          {canManage && (
            <a href="/vendors/new" className="mt-3 inline-block text-sm text-[#C4A35A] hover:underline">
              Add your first vendor →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function VendorCard({ vendor }: { vendor: VendorWithScore }) {
  const score = vendor.vendor_scores?.overall_score ?? null
  const scoreNum = score ? Math.round(Number(score)) : 0

  return (
    <a
      href={`/vendors/${vendor.id}`}
      className="block rounded-xl border border-[#D6CCBC] bg-white p-5 hover:border-[#C4A35A] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1E3829] truncate group-hover:text-[#2E5A40]">
            {vendor.company_name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{vendor.contact_name}</p>
        </div>
        {score !== null ? (
          <VHScoreRing score={scoreNum} size={48} strokeWidth={4} />
        ) : (
          <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#D6CCBC] flex items-center justify-center">
            <span className="text-xs text-gray-400">—</span>
          </div>
        )}
      </div>

      {/* Trade categories */}
      {vendor.trade_categories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {vendor.trade_categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-[#F5F0E8] px-2 py-0.5 text-xs text-[#2E5A40] font-medium"
            >
              {cat}
            </span>
          ))}
          {vendor.trade_categories.length > 3 && (
            <span className="text-xs text-gray-400">+{vendor.trade_categories.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <VHBadge variant={vendor.status} />
        {vendor.vendor_scores?.total_projects ? (
          <span className="text-xs text-gray-400">
            {vendor.vendor_scores.total_projects} project{vendor.vendor_scores.total_projects !== 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
    </a>
  )
}
