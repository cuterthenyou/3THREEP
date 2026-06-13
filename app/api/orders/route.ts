import { auth } from '@/lib/auth'
import { query, queryOne, queryMany } from '@/lib/db'
import { sendTelegram, escapeTgHtml } from '@/lib/telegram'
import { getLevel, getDiscount, parseLevelingConfig } from '@/lib/leveling'
import { applyDiscount } from '@/lib/utils'
import { NextResponse, type NextRequest } from 'next/server'

const MAX_QTY_PER_LINE = 50

interface IncomingItem {
  product_id?: string | null
  size?: string | null
  color?: string | null
  quantity?: number | null
}

interface DbProduct {
  id: string
  name: string
  price: number
  images: string[]
  sizes: string[]
  active: boolean
}

// Серверный пересчёт суммы заказа: бэк НЕ доверяет цене/итогу с фронта.
// Цены тянем из БД по product_id, скидку считаем из профиля (sparks + leveling_config,
// округление вниз до кратного 3), позиции и наличие сверяем с БД. Идемпотентность —
// по заголовку Idempotency-Key (дедуп двойного сабмита). Таблицы — migration 12.
export async function POST(req: NextRequest) {
  const session = await auth()

  const body = await req.json()
  const { items, delivery_address, comment, guest_name, guest_email, guest_phone } = body as {
    items?: IncomingItem[]
    delivery_address?: string
    comment?: string | null
    guest_name?: string
    guest_email?: string
    guest_phone?: string
  }

  if (!items?.length || !delivery_address?.trim()) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const isGuest = !session?.user?.id
  if (isGuest && !guest_email?.trim()) {
    return NextResponse.json({ error: 'Email обязателен для гостевого заказа' }, { status: 400 })
  }

  // ── Идемпотентность: повторный POST с тем же ключом вернёт уже созданный заказ ──
  const idempotencyKey = req.headers.get('idempotency-key')?.trim() || null
  if (idempotencyKey) {
    try {
      const existing = await queryOne<{ order_id: string }>(
        'SELECT order_id FROM order_idempotency WHERE key = $1', [idempotencyKey]
      )
      if (existing?.order_id) {
        return NextResponse.json({ id: existing.order_id, isGuest, deduped: true })
      }
    } catch { /* таблицы ещё нет — fail-open, создадим заказ как обычно */ }
  }

  // ── Тянем актуальные товары из БД (источник истины по цене/наличию/размерам) ──
  const ids = [...new Set(items.map(i => i.product_id).filter(Boolean))] as string[]
  if (!ids.length) {
    return NextResponse.json({ error: 'В заказе нет валидных товаров' }, { status: 422 })
  }
  const dbProducts = await queryMany<DbProduct>(
    'SELECT id, name, price, images, sizes, active FROM products WHERE id = ANY($1)', [ids]
  )
  const byId = new Map(dbProducts.map(p => [p.id, p]))

  // ── Скидка считается на сервере из профиля (только для залогиненных) ──
  let discountPct = 0
  if (!isGuest) {
    const [profile, cfgRow] = await Promise.all([
      queryOne<{ sparks: number | null; discount_percent: number | null }>(
        'SELECT sparks, discount_percent FROM profiles WHERE id = $1', [session!.user.id]
      ),
      queryOne<{ value: string }>(
        `SELECT value FROM site_settings WHERE key = 'leveling_config'`
      ).catch(() => null),
    ])
    const cfg = parseLevelingConfig(cfgRow?.value)
    const level = getLevel(profile?.sparks ?? 0, cfg)
    discountPct = profile?.discount_percent && profile.discount_percent > 0
      ? profile.discount_percent
      : getDiscount(level, cfg)
  }

  // ── Пересобираем позиции на сервере: имя/картинка/цена — из БД, не из тела ──
  type ResolvedItem = { product: DbProduct; size: string | null; color: string | null; quantity: number; unitPrice: number }
  const resolved: ResolvedItem[] = []
  for (const it of items) {
    const product = it.product_id ? byId.get(it.product_id) : undefined
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Товар недоступен или снят с продажи' }, { status: 422 })
    }
    const quantity = Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.floor(Number(it.quantity) || 1)))
    // Размер сверяем с БД, если у товара есть фиксированный список размеров.
    const size = it.size ?? null
    if (product.sizes?.length && size && !product.sizes.includes(size)) {
      return NextResponse.json({ error: `Размер «${size}» недоступен для «${product.name}»` }, { status: 422 })
    }
    const unitPrice = applyDiscount(product.price, discountPct) // округление вниз до кратного 3
    resolved.push({ product, size, color: it.color ?? null, quantity, unitPrice })
  }

  const total = resolved.reduce((s, r) => s + r.unitPrice * r.quantity, 0)
  if (total <= 0) {
    return NextResponse.json({ error: 'Сумма заказа некорректна' }, { status: 422 })
  }

  // ── Создаём заказ с серверной суммой ──
  let order: Record<string, unknown> | undefined
  if (isGuest) {
    const { rows: [newOrder] } = await query(
      `INSERT INTO orders (user_id, total, delivery_address, comment, status, guest_name, guest_email, guest_phone)
       VALUES (NULL, $1, $2, $3, 'new', $4, $5, $6) RETURNING *`,
      [total, delivery_address.trim(), comment?.trim() || null, guest_name?.trim() ?? null, guest_email!.trim(), guest_phone?.trim() ?? null]
    )
    order = newOrder
  } else {
    const { rows: [newOrder] } = await query(
      `INSERT INTO orders (user_id, total, delivery_address, comment, status)
       VALUES ($1, $2, $3, $4, 'new') RETURNING *`,
      [session!.user.id, total, delivery_address.trim(), comment?.trim() || null]
    )
    order = newOrder
  }

  if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  // ── Позиции заказа (снапшот цены — серверной, со скидкой) ──
  const itemValues = resolved.map((_, i) => {
    const b = i * 8
    return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8})`
  }).join(', ')
  const itemParams = resolved.flatMap(r => [
    order!.id,
    r.product.id,
    r.product.name,
    r.product.images?.[0] ?? null,
    r.size,
    r.color,
    r.quantity,
    r.unitPrice,
  ])
  await query(
    `INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, quantity, price)
     VALUES ${itemValues}`,
    itemParams
  )

  // ── Фиксируем идемпотентность (best-effort) ──
  if (idempotencyKey) {
    query(
      'INSERT INTO order_idempotency (key, order_id) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [idempotencyKey, order.id]
    ).catch(() => {})
  }

  const totalFormatted = Number(order.total).toLocaleString('ru-RU')
  const whoLabel = isGuest ? `Гость: ${escapeTgHtml(guest_email)}` : `Пользователь`
  sendTelegram(
    `🛒 <b>Новый заказ!</b>\n\n` +
    `Заказ: <code>#${String(order.id).slice(0, 8)}</code>\n` +
    `${whoLabel}\n` +
    `Сумма: ${totalFormatted} ₽\n` +
    `Адрес: ${escapeTgHtml(order.delivery_address) || '—'}\n\n` +
    `👉 https://3threep.ru/admin/orders/${order.id}`
  ).catch(() => {})

  return NextResponse.json({ id: order.id, isGuest, total })
}
