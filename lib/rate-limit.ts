// ════════════════════════════════════════════════════════════════════
// Rate-limit — фиксированное окно поверх таблицы rate_limits (migration 12).
// Один атомарный UPSERT: если окно истекло — счётчик сбрасывается, иначе +1.
// FAIL-OPEN: при любой ошибке БД пропускаем (доступность важнее, чтобы кривая
// миграция/недоступность БД не заблокировала вход всем). Логируем.
// ════════════════════════════════════════════════════════════════════

import { query } from './db'

let ready = false
async function ensureTable() {
  if (ready) return
  await query(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      bucket        TEXT NOT NULL,
      identifier    TEXT NOT NULL,
      window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
      count         INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, identifier)
    )
  `)
  ready = true
}

export interface RateLimitResult {
  ok: boolean
  /** сколько попыток ещё осталось в текущем окне (>=0) */
  remaining: number
  /** через сколько мс окно откроется снова (приблизительно) */
  retryAfterMs: number
}

/**
 * Проверить и инкрементировать лимит для (bucket, identifier).
 * @param limit    максимум попыток в окне
 * @param windowMs длительность окна, мс
 */
export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  try {
    await ensureTable()
    // Атомарно: вставка либо (если окно ещё живо) +1, иначе сброс к 1.
    const { rows } = await query<{ count: number; window_start: string }>(
      `INSERT INTO rate_limits (bucket, identifier, window_start, count)
       VALUES ($1, $2, now(), 1)
       ON CONFLICT (bucket, identifier) DO UPDATE SET
         count = CASE
           WHEN rate_limits.window_start < now() - ($3::bigint * interval '1 millisecond')
           THEN 1 ELSE rate_limits.count + 1 END,
         window_start = CASE
           WHEN rate_limits.window_start < now() - ($3::bigint * interval '1 millisecond')
           THEN now() ELSE rate_limits.window_start END
       RETURNING count, window_start`,
      [bucket, identifier, windowMs],
    )
    const row = rows[0]
    const count = row?.count ?? 1
    const windowStart = row ? new Date(row.window_start).getTime() : Date.now()
    const retryAfterMs = Math.max(0, windowStart + windowMs - Date.now())
    return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterMs }
  } catch (err) {
    console.error('[rate-limit] fail-open:', err)
    return { ok: true, remaining: limit, retryAfterMs: 0 }
  }
}

/** Достаём клиентский IP из заголовков прокси (Amvera/Vercel). */
export function clientIp(req: { headers: Headers }): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}
