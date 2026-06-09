import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

const MAX_SHOWCASE = 6

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, showcased } = await req.json().catch(() => ({}))
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  // Тогглить можно только разблокированную ачивку
  const owned = await queryOne(
    `SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_key = $2`,
    [session.user.id, key]
  )
  if (!owned) return NextResponse.json({ error: 'Not unlocked' }, { status: 400 })

  if (showcased) {
    const cnt = await queryOne<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM user_achievements WHERE user_id = $1 AND showcased = true`,
      [session.user.id]
    )
    if ((cnt?.n ?? 0) >= MAX_SHOWCASE) {
      return NextResponse.json({ error: 'limit', max: MAX_SHOWCASE }, { status: 409 })
    }
  }

  await query(
    `UPDATE user_achievements SET showcased = $3 WHERE user_id = $1 AND achievement_key = $2`,
    [session.user.id, key, !!showcased]
  )
  return NextResponse.json({ ok: true })
}
