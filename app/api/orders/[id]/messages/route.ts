import { auth } from '@/lib/auth'
import { query, queryMany, queryOne } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await queryOne(
    'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
    [id, session.user.id]
  )
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messages = await queryMany(
    'SELECT * FROM messages WHERE order_id = $1 ORDER BY created_at ASC',
    [id]
  )
  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await queryOne(
    'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
    [id, session.user.id]
  )
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const { rows } = await query(
    'INSERT INTO messages (order_id, sender_id, is_admin, text) VALUES ($1, $2, false, $3) RETURNING *',
    [id, session.user.id, text.trim()]
  )
  return NextResponse.json(rows[0])
}
