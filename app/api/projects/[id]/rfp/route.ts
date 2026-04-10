import { createClient } from '@/lib/supabase/server'
import { generateRFP } from '@/lib/ai/copilot'
import { redirect } from 'next/navigation'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('*, properties(name, address, city, state)')
    .eq('id', id)
    .single()

  if (!project) return new Response('Not found', { status: 404 })

  const property = project.properties as any
  const propertyContext = property
    ? `${property.name}, ${property.address}, ${property.city}, ${property.state}`
    : 'Commercial property'

  const rfpText = await generateRFP(project.description ?? project.title, propertyContext)

  // Save to DB
  await supabase.from('rfps').insert({
    project_id: id,
    org_id: project.org_id,
    scope: rfpText,
    deliverables: [],
    ai_generated: true,
  })

  return new Response(rfpText, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
