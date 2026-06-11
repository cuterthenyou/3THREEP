import { requireAdmin } from '@/lib/adminAuth'
import { query, queryOne } from '@/lib/db'
import { awardOrderXp } from '@/lib/gamification'
import { NextResponse, type NextRequest } from 'next/server'
import type { OrderStatus } from '@/lib/types'

interface NewItem {
  product_id?: string | null
  product_name: string
  product_image?: string | null
  size?: string | null
  color?: string | null
  quantity?: number
  price: number
}

const VALID_STATUSES: OrderStatus[] = ['new', 'paid', 'in_progress', 'shipped', 'delivered', 'cancelled']

// Создание заказа админом — для офлайн-продаж. Заказ оформляется на email; если
// пользователь с таким email уже есть, заказ сразу привязывается + начисляются искры.
// Иначе остаётся «гостевым» (guest_email) и прилетит в ЛК при логине (см. attachGuestOrders).
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    guest_email, guest_name, guest_phone,
    items, delivery_address, comment, status,
  } = body as {
    guest_email?: string; guest_name?: string; guest_phone?: string
    items?: NewItem[]; delivery_address?: string; comment?: string; status?: OrderStatus
  }

  const email = guest_email?.trim()
  if (!email) return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
  if (!items?.length) return NextResponse.json({ error: 'Нужна хотя бы одна позиция' }, { status: 400 })

  const orderStatus: OrderStatus = status && VALID_STATUSES.includes(status) ? status : 'new'
  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)

  // Привязать к существующему пользователю по email (иначе — гостевой заказ)
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`, [email]
  )
  const userId = existing?.id ?? null

  const { rows: [order] } = await query(
    `INSERT INTO orders (user_id, total, delivery_address, comment, status, guest_name, guest_email, guest_phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userId, total, delivery_address?.trim() ?? null, comment?.trim() ?? null, orderStatus,
     guest_name?.trim() ?? null, email, guest_phone?.trim() ?? null]
  )
  if (!order) return NextResponse.json({ error: 'Не удалось создать заказ' }, { status: 500 })

  const values = items.map((_, i) => {
    const b = i * 8
    return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8})`
  }).join(', ')
  const params = items.flatMap(it => [
    order.id, it.product_id ?? null, it.product_name, it.product_image ?? null,
    it.size ?? null, it.color ?? null, it.quantity ?? 1, it.price,
  ])
  await query(
    `INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, quantity, price)
     VALUES ${values}`,
    params
  )

  // Если уже привязан к юзеру — начислить искры (idempotent; сработает только при delivered)
  if (userId) {
    try { await awardOrderXp(order.id) } catch (e) { console.error('[admin create order] awardOrderXp', e) }
  }

  return NextResponse.json({ id: order.id, attached: !!userId })
}
