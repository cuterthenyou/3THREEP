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
    `UPDATE users SET newsletter_subscription = false WHERE id = $1`,
    [session.user.id]
  )
  await query(
    `DELETE FROM newsletter_subscribers WHERE email = $1`,
    [session.user.email]
  )

  return NextResponse.json({ ok: true })
}
