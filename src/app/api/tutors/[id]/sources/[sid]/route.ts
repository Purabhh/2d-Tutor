import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params
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

  // Get source to check for storage files
  const { data: source } = await supabase
    .from('sources')
    .select('storage_path')
    .eq('id', sid)
    .eq('tutor_id', id)
    .single()

  if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 })

  // Delete storage file if exists
  if (source.storage_path) {
    await supabase.storage.from('sources').remove([source.storage_path])
  }

  // Delete source (cascades to chunks)
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', sid)
    .eq('tutor_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
