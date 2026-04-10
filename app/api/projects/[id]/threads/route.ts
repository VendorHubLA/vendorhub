import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data } = await supabase
    .from('project_threads')
    .select('*, profiles(full_name, role)')
    .eq('project_id', id)
    .order('created_at')

  return Response.json(data ?? [])
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { body } = await req.json()
  if (!body?.trim()) return new Response('Body required', { status: 400 })

  const { data, error } = await supabase
    .from('project_threads')
    .insert({ project_id: id, author_id: user.id, body: body.trim() })
    .select('*, profiles(full_name, role)')
    .single()

  if (error) return new Response(error.message, { status: 500 })

  return Response.json(data, { status: 201 })
}
