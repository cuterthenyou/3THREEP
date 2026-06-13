import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { filterProfanity } from '@/lib/profanity'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  const trimmed = (name ?? '').trim()

  if (!trimmed || trimmed.length < 2 || trimmed.length > 20) {
    return NextResponse.json({ error: 'Никнейм: 2–20 символов' }, { status: 400 })
  }

  // Ник виден публично (лидерборд) → чистим мат, как в чате заказов.
  const clean = filterProfanity(trimmed)

  await query('UPDATE profiles SET name = $1 WHERE id = $2', [clean, session.user.id])
  return NextResponse.json({ ok: true })
}
