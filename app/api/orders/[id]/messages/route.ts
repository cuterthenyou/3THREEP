import { auth } from '@/lib/auth'
import { query, queryMany, queryOne } from '@/lib/db'
import { sendTelegram, escapeTgHtml } from '@/lib/telegram'
import { filterProfanity } from '@/lib/profanity'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await queryOne(
    'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
    [id, session.user.id]
  )
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messages = await queryMany(
    'SELECT * FROM messages WHERE order_id = $1 ORDER BY created_at ASC',
    [id]
  )
  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Анти-спам чата заказа (защищает БД и телеграм-уведомления).
  const rl = await rateLimit('order_msg', `user:${session.user.id}`, 20, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Слишком часто, подожди немного' }, { status: 429 })

  const order = await queryOne(
    'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
    [id, session.user.id]
  )
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  const clean = String(text).trim().slice(0, 2000) // кап длины сообщения
  const filtered = filterProfanity(clean)

  const { rows } = await query(
    'INSERT INTO messages (order_id, sender_id, is_admin, text) VALUES ($1, $2, false, $3) RETURNING *',
    [id, session.user.id, filtered]
  )

  sendTelegram(
    `💬 <b>Новое сообщение по заказу</b>\n\n` +
    `Заказ: <code>#${String(id).slice(0, 8)}</code>\n` +
    `Текст: ${escapeTgHtml(clean.slice(0, 200))}\n\n` +
    `👉 https://3threep.ru/admin/orders/${id}`
  ).catch(() => {})

  return NextResponse.json(rows[0])
}
