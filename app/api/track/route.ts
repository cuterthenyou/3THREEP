import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rate-limit'

let pageViewsReady = false

async function ensurePageViewsTable() {
  if (pageViewsReady) return
  await query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      path       TEXT NOT NULL,
      session_id TEXT NOT NULL,
      referrer   TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS referrer TEXT`)
  await query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS user_agent TEXT`)
  await query(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id)`)
  pageViewsReady = true
}

export async function POST(req: NextRequest) {
  try {
    // Анти-флуд таблицы page_views по IP.
    const rl = await rateLimit('pageview_ip', `ip:${clientIp(req)}`, 240, 60_000)
    if (!rl.ok) return new NextResponse(null, { status: 204 })

    const { path, session_id, referrer } = await req.json()
    if (!path || !session_id) return new NextResponse(null, { status: 204 })
    const ua = req.headers.get('user-agent') ?? null
    await ensurePageViewsTable()
    await query(
      'INSERT INTO page_views (path, session_id, referrer, user_agent) VALUES ($1, $2, $3, $4)',
      [
        String(path).slice(0, 500),
        String(session_id).slice(0, 100),
        referrer ? String(referrer).slice(0, 500) : null,
        ua ? ua.slice(0, 400) : null,
      ]
    )
  } catch {
    // silent fail
  }
  return new NextResponse(null, { status: 204 })
}
