import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadToYandex } from '@/lib/upload-to-yandex'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const customFileName = `${user.id}.${ext}`
    
    const result = await uploadToYandex('avatars', file, customFileName)

    const admin = await createAdminClient()
    const { error: updateError } = await admin
      .from('profiles')
      .update({ avatar_url: result.url })
      .eq('id', user.id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
