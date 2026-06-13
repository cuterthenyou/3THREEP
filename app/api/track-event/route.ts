import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

let eventsReady = false

async function ensureEventsTable() {
  if (eventsReady) return
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id         BIGSERIAL PRIMARY KEY,
      session_id TEXT,
      user_id    UUID,
      type       TEXT NOT NULL,
      meta       JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(type, created_at DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)`)
  eventsReady = true
}

const ALLOWED = new Set(['product_view', 'cart_add', 'checkout_start', 'bat_score'])

export async function POST(req: NextRequest) {
  try {
    // Анти-флуд таблицы events: щедрый лимит по IP (легит-трафик — десятки/мин).
    const rl = await rateLimit('track_ip', `ip:${clientIp(req)}`, 240, 60_000)
    if (!rl.ok) return new NextResponse(null, { status: 204 })

    const { type, session_id, meta } = await req.json()
    if (!type || !ALLOWED.has(String(type))) return new NextResponse(null, { status: 204 })

    // user_id is best-effort — cookies ride along with sendBeacon (same-origin)
    let userId: string | null = null
    try {
      const session = await auth()
      userId = session?.user?.id ?? null
    } catch { /* anonymous */ }

    // Device (desktop/mobile) — для раздельных топов игры. Определяем по UA
    // на сервере, чтобы клиент не мог подделать. iPad/планшеты → mobile (тач).
    const ua = req.headers.get('user-agent') || ''
    const device = /Mobi|Android|iPhone|iPad|iPod|Tablet|Touch/i.test(ua) ? 'mobile' : 'desktop'
    const safeMeta = { ...(meta && typeof meta === 'object' ? meta : {}), device }
    await ensureEventsTable()
    await query(
      `INSERT INTO events (session_id, user_id, type, meta) VALUES ($1, $2, $3, $4)`,
      [
        session_id ? String(session_id).slice(0, 100) : null,
        userId,
        String(type).slice(0, 50),
        JSON.stringify(safeMeta).slice(0, 2000),
      ]
    )
  } catch {
    // silent fail
  }
  return new NextResponse(null, { status: 204 })
}
