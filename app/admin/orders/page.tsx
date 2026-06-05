import { queryMany } from '@/lib/db'
import { Suspense } from 'react'
import OrdersClient from './OrdersClient'

export const revalidate = 0

export default async function AdminOrdersPage() {
  const orders = await queryMany(
    `SELECT o.*,
      COALESCE(
        json_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'size', oi.size,
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
     GROUP BY o.id, p.email, p.name
     ORDER BY o.created_at DESC`
  )

  return (
    <Suspense>
      <OrdersClient orders={orders as Parameters<typeof OrdersClient>[0]['orders']} />
    </Suspense>
  )
}
