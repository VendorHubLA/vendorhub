import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, org_id').eq('id', user.id).single()

  if (!profile || !['owner', 'asset_manager', 'admin'].includes(profile.role)) {
    return new Response('Forbidden', { status: 403 })
  }

  await supabase
    .from('vendors')
    .update({ status: 'vetted' })
    .eq('id', id)
    .eq('org_id', profile.org_id)

  redirect(`/vendors/${id}`)
}
