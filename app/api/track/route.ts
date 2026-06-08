import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

let pageViewsReady = false

async function ensurePageViewsTable() {
  if (pageViewsReady) return
  await query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      path       TEXT NOT NULL,
      session_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id)`)
  pageViewsReady = true
}

export async function POST(req: NextRequest) {
  try {
    const { path, session_id } = await req.json()
    if (!path || !session_id) return new NextResponse(null, { status: 204 })
    await ensurePageViewsTable()
    await query(
      'INSERT INTO page_views (path, session_id) VALUES ($1, $2)',
      [String(path).slice(0, 500), String(session_id).slice(0, 100)]
    )
  } catch {
    // silent fail
  }
  return new NextResponse(null, { status: 204 })
}
