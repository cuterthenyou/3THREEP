import { queryOne, queryMany } from '@/lib/db'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import OrderAdminClient from './OrderAdminClient'

export const revalidate = 0

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()

  const [order, messages] = await Promise.all([
    queryOne(
      `SELECT o.*,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', oi.id,
              'product_name', oi.product_name,
              'size', oi.size,
              'color', oi.color,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS order_items,
        CASE WHEN o.user_id IS NOT NULL THEN json_build_object('email', p.email, 'name', p.name) END AS profiles
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN profiles p ON p.id = o.user_id
       WHERE o.id = $1
       GROUP BY o.id, p.email, p.name`,
      [id]
    ),
    queryMany(
      'SELECT * FROM messages WHERE order_id = $1 ORDER BY created_at ASC',
      [id]
    ),
  ])

  if (!order) notFound()

  return <OrderAdminClient order={order} messages={messages} adminId={admin!.id} />
}
