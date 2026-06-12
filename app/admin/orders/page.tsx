import { queryMany } from '@/lib/db'
import { Suspense } from 'react'
import OrdersClient from './OrdersClient'

export const revalidate = 0

export default async function AdminOrdersPage() {
  const productsData = await queryMany(
    `SELECT id, name, price, sizes, images FROM products WHERE active = true ORDER BY name ASC`
  ).catch(() => [])
  const products = (productsData as Array<{ id: string; name: string; price: number; sizes: string[] | null; images: string[] | null }>).map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    image: Array.isArray(p.images) && p.images.length ? p.images[0] : null,
  }))

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
      <OrdersClient orders={orders as Parameters<typeof OrdersClient>[0]['orders']} products={products} />
    </Suspense>
  )
}
