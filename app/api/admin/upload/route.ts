import { requireAdmin } from '@/lib/adminAuth'
import { NextResponse, type NextRequest } from 'next/server'
import { uploadToYandex } from '@/lib/upload-to-yandex'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const MAX_VIDEO_SIZE = 200 * 1024 * 1024
  if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { error: 'Видео слишком большое. Максимум 200MB. Сожми видео перед загрузкой.' },
      { status: 413 }
    )
  }

  try {
    const folderParam = formData.get('folder') as string | null
    const validFolders = ['products', 'assets', 'avatars']
    const folder = (folderParam && validFolders.includes(folderParam) ? folderParam : 'products') as 'products' | 'assets' | 'avatars'
    const result = await uploadToYandex(folder, file)
    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
