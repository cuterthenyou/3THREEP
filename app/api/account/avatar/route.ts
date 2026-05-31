import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { uploadToYandex } from '@/lib/upload-to-yandex'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const customFileName = `${session.user.id}.${ext}`
    const result = await uploadToYandex('avatars', file, customFileName)

    await query('UPDATE profiles SET avatar_url = $1 WHERE id = $2', [result.url, session.user.id])

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
