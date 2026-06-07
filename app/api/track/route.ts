import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { path, session_id } = await req.json()
    if (!path || !session_id) return new NextResponse(null, { status: 204 })
    await query(
      'INSERT INTO page_views (path, session_id) VALUES ($1, $2)',
      [String(path).slice(0, 500), String(session_id).slice(0, 100)]
    )
  } catch {
    // Table may not exist yet — silent fail
  }
  return new NextResponse(null, { status: 204 })
}
