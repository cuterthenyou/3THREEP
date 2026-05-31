import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { queryOne, queryMany } from '@/lib/db'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) redirect('/auth?next=/account')

  const order = await queryOne(
    `SELECT o.*,
      COALESCE(
        json_agg(oi.* ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS order_items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1 AND o.user_id = $2
     GROUP BY o.id`,
    [id, session.user.id]
  )

  if (!order) notFound()

  const messages = await queryMany(
    'SELECT * FROM messages WHERE order_id = $1 ORDER BY created_at ASC',
    [id]
  )

  return (
    <OrderDetailClient
      order={order}
      messages={messages}
      userId={session.user.id}
    />
  )
}
