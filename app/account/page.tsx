import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountClient from './AccountClient'
import { queryOne, queryMany } from '@/lib/db'

export default async function AccountPage() {
  const session = await auth()
  console.log('[ACCOUNT] session exists:', !!session, '| user id:', session?.user?.id ?? 'none', '| email:', session?.user?.email ?? 'none')

  if (!session?.user) {
    console.log('[ACCOUNT] no session → redirect to auth')
    redirect('/auth?callbackUrl=/account')
  }

  const user = {
    id: session.user.id,
    email: session.user.email ?? '',
  }

  const [profile, orders] = await Promise.all([
    queryOne(`SELECT * FROM profiles WHERE id = $1`, [user.id]),
    queryMany(
      `SELECT o.*,
        COALESCE(
          json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS order_items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user.id]
    ),
  ])

  return (
    <AccountClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      orders={orders}
    />
  )
}
