import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import { OrgForm } from './OrgForm'
import type { UserRole } from '@/types'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const org = profile.organizations as unknown as {
    id: string; name: string; slug: string; logo_url?: string
  } | null

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3829]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and organization details.</p>
      </div>

      <ProfileForm
        userId={user.id}
        initialName={profile.full_name ?? ''}
        initialEmail={profile.email ?? ''}
        role={profile.role as UserRole}
      />

      {org && ['owner', 'admin'].includes(profile.role) && (
        <OrgForm
          orgId={org.id}
          initialName={org.name}
          initialSlug={org.slug}
        />
      )}

      <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-3">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-[#EDE6D8]">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-[#1E3829]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#EDE6D8]">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-[#1E3829] capitalize">{profile.role.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium text-[#1E3829]">
              {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#EDE6D8]">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
