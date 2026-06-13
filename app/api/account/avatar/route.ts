import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { uploadToYandex } from '@/lib/upload-to-yandex'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Только растровые картинки (sharp нормализует их в webp). SVG/прочее НЕ принимаем:
// иначе uploadToYandex отдал бы сырой буфер с пользовательским content-type
// (потенциальный хостинг произвольного контента на storage-домене).
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_AVATAR_BYTES = 8 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Анти-абуз загрузок.
  const rl = await rateLimit('avatar_upload', `user:${session.user.id}`, 10, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Слишком часто, подожди немного' }, { status: 429 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Только JPG, PNG или WEBP' }, { status: 415 })
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: 'Файл слишком большой (макс 8 МБ)' }, { status: 413 })
  }

  try {
    // Расширение фиксируем сами (sharp всё равно отдаёт webp) — не доверяем имени файла.
    const customFileName = `${session.user.id}.webp`
    const result = await uploadToYandex('avatars', file, customFileName)

    await query('UPDATE profiles SET avatar_url = $1 WHERE id = $2', [result.url, session.user.id])

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
