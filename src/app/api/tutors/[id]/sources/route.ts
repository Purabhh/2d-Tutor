import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify tutor belongs to user
  const { data: tutor } = await supabase
    .from('tutors')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!tutor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('tutor_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify tutor belongs to user
  const { data: tutor } = await supabase
    .from('tutors')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!tutor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const url = formData.get('url') as string | null
  const text = formData.get('text') as string | null
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  let storagePath: string | null = null
  let originalUrl: string | null = url

  // Upload file to Supabase Storage if present
  if (file) {
    const filePath = `${user.id}/${id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('sources')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    storagePath = filePath
  }

  const { data, error } = await supabase
    .from('sources')
    .insert({
      tutor_id: id,
      name: name || file?.name || url || 'Untitled',
      type: type as 'pdf' | 'youtube' | 'webpage' | 'text' | 'image',
      storage_path: storagePath,
      original_url: originalUrl,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return source data — ingestion will be triggered separately
  return NextResponse.json(data, { status: 201 })
}
