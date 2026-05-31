import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
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
  return NextResponse.json(rows[0])
}
