import { auth } from '@/lib/auth'
import { queryMany, queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ authed: false, items: [], unread: 0 })

  try {
    const [items, countRow] = await Promise.all([
      queryMany(
        `SELECT id, type, title, body, link, read, created_at
         FROM notifications WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 30`,
        [session.user.id]
      ),
      queryOne<{ unread: number }>(
        `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND read = false`,
        [session.user.id]
      ),
    ])
    return NextResponse.json({ authed: true, items, unread: countRow?.unread ?? 0 })
  } catch (e) {
    console.error('[notifications] GET failed:', e)
    return NextResponse.json({ authed: true, items: [], unread: 0 })
  }
}
