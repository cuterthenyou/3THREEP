import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ user: null })
    const profile = await queryOne<{ name: string | null }>(
      'SELECT name FROM profiles WHERE id = $1',
      [session.user.id]
    )
    const display = profile?.name ?? session.user.email?.split('@')[0] ?? 'user'
    return NextResponse.json({ user: { name: display } })
  } catch {
    return NextResponse.json({ user: null })
  }
}
