import { queryMany } from '@/lib/db'
import Link from 'next/link'
import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#F29774',
  paid: '#7EC8A4',
  in_progress: '#F2C46D',
  shipped: '#74B3F2',
  delivered: '#A8E6A3',
  cancelled: '#E08080',
}

function formatPrice(p: number) {
  return p.toLocaleString('ru-RU') + ' ₽'
}

export const revalidate = 0

export default async function AdminOrdersPage() {
  const orders = await queryMany(
    `SELECT o.*,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'size', oi.size,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS order_items,
      json_build_object('email', p.email, 'name', p.name) AS profiles
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN profiles p ON p.id = o.user_id
     GROUP BY o.id, p.email, p.name
     ORDER BY o.created_at DESC`
  )

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl uppercase tracking-widest"
          style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
        >
          Заказы ({orders.length})
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {!orders.length && (
          <p style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
            Заказов пока нет
          </p>
        )}
        {orders.map((order) => {
          const profile = order.profiles as Record<string, unknown> | null
          const items = (order.order_items as Record<string, unknown>[]) ?? []

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-opacity hover:opacity-90"
              style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.15)', textDecoration: 'none' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}
                  >
                    #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full uppercase tracking-widest"
                    style={{
                      background: STATUS_COLORS[order.status as OrderStatus] + '22',
                      color: STATUS_COLORS[order.status as OrderStatus],
                      fontFamily: "'ONDER', sans-serif",
                      fontSize: '0.6rem',
                      border: `1px solid ${STATUS_COLORS[order.status as OrderStatus]}55`,
                    }}
                  >
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                  <span className="text-xs" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="mt-1 flex flex-col gap-0.5">
                  {items.map((item) => (
                    <span key={String(item.id)} className="text-sm" style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
                      {String(item.product_name)}{item.size ? ` / ${item.size}` : ''} × {Number(item.quantity)}
                    </span>
                  ))}
                </div>
                {profile && (
                  <p className="text-xs mt-1" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                    {String(profile.name || profile.email || '')}
                  </p>
                )}
              </div>
              <p
                className="text-lg flex-shrink-0"
                style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
              >
                {formatPrice(order.total)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
