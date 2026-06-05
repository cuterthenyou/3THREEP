import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, url } = await req.json()
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'name and url required' }, { status: 400 })
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  const { rows: [emoji] } = await query(
    `INSERT INTO custom_emojis (name, url) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url
     RETURNING *`,
    [slug, url.trim()]
  )
  return NextResponse.json(emoji)
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await query('DELETE FROM custom_emojis WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
