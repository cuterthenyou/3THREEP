import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({ id: undefined }))

  try {
    if (id) {
      await query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`, [id, session.user.id])
    } else {
      await query(`UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`, [session.user.id])
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[notifications] read failed:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
