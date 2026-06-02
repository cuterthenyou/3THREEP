import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ user: null })

    const [profile, orderCount] = await Promise.all([
      queryOne<{ name: string | null }>('SELECT name FROM profiles WHERE id = $1', [session.user.id]),
      queryOne<{ cnt: string }>('SELECT COUNT(*) as cnt FROM orders WHERE user_id = $1', [session.user.id]),
    ])

    const display = profile?.name ?? session.user.email?.split('@')[0] ?? 'user'
    const level = Math.max(1, Math.ceil(Number(orderCount?.cnt ?? 0) / 2))

    return NextResponse.json({ user: { name: display, level } })
  } catch {
    return NextResponse.json({ user: null })
  }
}
