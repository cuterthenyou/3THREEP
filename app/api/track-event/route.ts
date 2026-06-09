import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth'

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
    const { type, session_id, meta } = await req.json()
    if (!type || !ALLOWED.has(String(type))) return new NextResponse(null, { status: 204 })

    // user_id is best-effort — cookies ride along with sendBeacon (same-origin)
    let userId: string | null = null
    try {
      const session = await auth()
      userId = session?.user?.id ?? null
    } catch { /* anonymous */ }

    const safeMeta = meta && typeof meta === 'object' ? meta : {}
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
