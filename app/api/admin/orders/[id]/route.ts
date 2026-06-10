import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
import { awardOrderXp, notifyOrderStatus, revokeOrderXp } from '@/lib/gamification'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, tracking_number } = await req.json()

  await query(
    'UPDATE orders SET status = COALESCE($1, status), tracking_number = COALESCE($2, tracking_number) WHERE id = $3',
    [status ?? null, tracking_number ?? null, id]
  )

  // Геймификация — не должна ломать смену статуса (отдельный try/catch).
  if (status) {
    try {
      await notifyOrderStatus(id, status)
      if (status === 'cancelled') await revokeOrderXp(id) // отмена → снимаем искры/скидку
      else await awardOrderXp(id)                          // идемпотентно; начислит только при delivered
    } catch (e) {
      console.error('[gamification] order status hook failed:', e)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Снять искры/скидку за этот заказ до удаления (пересчёт профиля вниз)
  try { await revokeOrderXp(id) } catch (e) { console.error('[gamification] revoke on delete failed:', e) }

  await query('DELETE FROM orders WHERE id = $1', [id])

  return NextResponse.json({ ok: true })
}
