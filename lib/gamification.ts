// ════════════════════════════════════════════════════════════════════
// Серверная логика геймификации: начисление искр за заказ, пересчёт
// уровня/скидки, выдача ачивок, генерация уведомлений.
// Всё идемпотентно. Любая ошибка здесь НЕ должна ломать вызывающий поток
// (вызывать через try/catch). См. .claude/skills/threep-backend.
// ════════════════════════════════════════════════════════════════════
import { query, queryOne } from '@/lib/db'
import {
  getLevel,
  getDiscount,
  sparksForOrder,
  parseLevelingConfig,
  type LevelingConfig,
} from '@/lib/leveling'
import type { NotificationType } from '@/lib/types'

/**
 * Статус, при котором начисляем искры. Только 'delivered' — анти-чит:
 * заказ реально доставлен и его уже нельзя отменить/вернуть, поэтому
 * скидку нельзя накрутить оплатой-с-последующей-отменой.
 */
export const XP_AWARD_STATUSES = ['delivered'] as const

async function loadLevelingConfig(): Promise<LevelingConfig> {
  const row = await queryOne<{ value: string | null }>(
    `SELECT value FROM site_settings WHERE key = 'leveling_config'`
  )
  return parseLevelingConfig(row?.value)
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string | null,
  link?: string | null
): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, body ?? null, link ?? null]
  )
}

/** Выдать ачивку (один раз). Возвращает true, если выдана впервые. */
export async function awardAchievement(userId: string, key: string): Promise<boolean> {
  const ins = await queryOne<{ achievement_key: string }>(
    `INSERT INTO user_achievements (user_id, achievement_key) VALUES ($1, $2)
     ON CONFLICT DO NOTHING RETURNING achievement_key`,
    [userId, key]
  )
  if (!ins) return false
  const a = await queryOne<{ title: string }>(
    `SELECT title FROM achievements WHERE key = $1`,
    [key]
  )
  await createNotification(userId, 'achievement', `Ачивка: ${a?.title ?? key}`, null, '/account')
  return true
}

/** Пересчитать кэш профиля (sparks/level/discount) из журнала xp_events. */
async function recomputeProfile(userId: string, cfg: LevelingConfig) {
  const prev = await queryOne<{ level: number }>(`SELECT level FROM profiles WHERE id = $1`, [userId])
  const sum = await queryOne<{ sparks: number }>(
    `SELECT COALESCE(SUM(amount), 0)::int AS sparks FROM xp_events WHERE user_id = $1`,
    [userId]
  )
  const sparks = sum?.sparks ?? 0
  const level = getLevel(sparks, cfg)
  const discount = getDiscount(level, cfg)
  await query(
    `UPDATE profiles SET sparks = $1, level = $2, discount_percent = $3 WHERE id = $4`,
    [sparks, level, discount, userId]
  )
  return { sparks, level, discount, prevLevel: prev?.level ?? 1 }
}

/**
 * Начислить искры за заказ (идемпотентно). Вызывать при переходе заказа в
 * оплаченный статус. Дедупликация по (source='order', ref_id=orderId).
 */
export async function awardOrderXp(orderId: string): Promise<void> {
  const order = await queryOne<{ user_id: string | null; status: string; units: number }>(
    `SELECT o.user_id, o.status, COALESCE(SUM(oi.quantity), 0)::int AS units
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1 GROUP BY o.id`,
    [orderId]
  )
  if (!order || !order.user_id) return
  if (!XP_AWARD_STATUSES.includes(order.status as (typeof XP_AWARD_STATUSES)[number])) return

  const cfg = await loadLevelingConfig()
  const amount = sparksForOrder(order.units, cfg)

  const inserted = await queryOne<{ id: string }>(
    `INSERT INTO xp_events (user_id, source, ref_id, amount) VALUES ($1, 'order', $2, $3)
     ON CONFLICT (source, ref_id) WHERE ref_id IS NOT NULL DO NOTHING RETURNING id`,
    [order.user_id, orderId, amount]
  )
  if (!inserted) return // уже начисляли за этот заказ

  const r = await recomputeProfile(order.user_id, cfg)
  if (r.level > r.prevLevel) {
    await createNotification(
      order.user_id,
      'level_up',
      `Новый уровень — ${r.level}`,
      `Твоя скидка теперь ${r.discount}%`,
      '/account'
    )
  }

  // Ачивки, привязанные к покупке
  await awardAchievement(order.user_id, 'first_purchase')
  if (order.units >= 3) await awardAchievement(order.user_id, 'multi_buy')
}

/** Уведомление о смене статуса заказа (для колокольчика, Фаза 6). */
export async function notifyOrderStatus(orderId: string, status: string): Promise<void> {
  const order = await queryOne<{ user_id: string | null }>(
    `SELECT user_id FROM orders WHERE id = $1`,
    [orderId]
  )
  if (!order?.user_id) return
  const labels: Record<string, string> = {
    new: 'Новый',
    paid: 'Оплачен',
    in_progress: 'В работе',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  await createNotification(
    order.user_id,
    'order_status',
    `Заказ #${orderId.slice(0, 8)} — ${labels[status] ?? status}`,
    null,
    `/account/orders/${orderId}`
  )
}
