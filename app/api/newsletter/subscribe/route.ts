import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { ensureNewsletterTables } from '@/lib/newsletter'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await ensureNewsletterTables()
  await query(
    `UPDATE users SET newsletter_subscription = true WHERE id = $1`,
    [session.user.id]
  )
  await query(
    `INSERT INTO newsletter_subscribers (email, user_id)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id`,
    [session.user.email, session.user.id]
  )

  return NextResponse.json({ ok: true })
}
