import { requireAdmin } from '@/lib/adminAuth'
import { query, queryOne } from '@/lib/db'
import { createNotification } from '@/lib/gamification'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const { rows } = await query(
    'INSERT INTO messages (order_id, sender_id, is_admin, text) VALUES ($1, $2, true, $3) RETURNING *',
    [id, admin.id, text.trim()]
  )

  // Уведомить владельца заказа о новом сообщении (не ломать ответ при ошибке)
  try {
    const order = await queryOne<{ user_id: string | null }>('SELECT user_id FROM orders WHERE id = $1', [id])
    if (order?.user_id) {
      await createNotification(
        order.user_id,
        'chat_message',
        `Новое сообщение по заказу #${id.slice(0, 8)}`,
        text.trim().slice(0, 80),
        `/account/orders/${id}`
      )
    }
  } catch (e) {
    console.error('[notifications] chat hook failed:', e)
  }

  return NextResponse.json(rows[0])
}
