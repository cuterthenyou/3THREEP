import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { queryMany } from '@/lib/db'
import { ensureNewsletterTables } from '@/lib/newsletter'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!isAdmin(session?.user?.email ?? null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await ensureNewsletterTables()
  const rows = await queryMany(
    `SELECT ns.email, ns.subscribed_at, u.name
     FROM newsletter_subscribers ns
     LEFT JOIN users u ON u.id = ns.user_id
     ORDER BY ns.subscribed_at DESC`
  )

  return NextResponse.json(rows)
}
