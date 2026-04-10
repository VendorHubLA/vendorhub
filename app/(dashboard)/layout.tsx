import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VHSidebar } from '@/components/vh/VHSidebar'
import { VHCommandBar } from '@/components/vh/VHCommandBar'
import type { UserRole } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, organizations(name)')
    .eq('id', user.id)
    .single()

  const role = (profile?.role ?? 'pm') as UserRole
  const orgName = (profile?.organizations as unknown as { name: string } | null)?.name

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">
      <VHSidebar role={role} orgName={orgName} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-[#D6CCBC] bg-white px-6">
          <div />
          <VHCommandBar />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
