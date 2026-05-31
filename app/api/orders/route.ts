import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { sendTelegram } from '@/lib/telegram'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { items, total, delivery_address, comment } = body

  if (!items?.length || !total || !delivery_address) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { rows: [order] } = await query(
    `INSERT INTO orders (user_id, total, delivery_address, comment, status)
     VALUES ($1, $2, $3, $4, 'new') RETURNING *`,
    [session.user.id, total, delivery_address, comment ?? null]
  )

  if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  const itemValues = items.map((_: unknown, i: number) => {
    const base = i * 8
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
  }).join(', ')

  const itemParams = items.flatMap((item: Record<string, unknown>) => [
    order.id,
    item.product_id ?? null,
    item.product_name,
    item.product_image ?? null,
    item.size ?? null,
    item.color ?? null,
    item.quantity ?? 1,
    item.price,
  ])

  await query(
    `INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, quantity, price)
     VALUES ${itemValues}`,
    itemParams
  )

  const total = Number(order.total).toLocaleString('ru-RU')
  sendTelegram(
    `🛒 <b>Новый заказ!</b>\n\n` +
    `Заказ: <code>#${String(order.id).slice(0, 8)}</code>\n` +
    `Сумма: ${total} ₽\n` +
    `Адрес: ${order.delivery_address || '—'}\n\n` +
    `👉 https://3threep.ru/admin/orders/${order.id}`
  ).catch(() => {})

  return NextResponse.json({ id: order.id })
}
