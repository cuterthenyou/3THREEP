import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const fields = Object.entries(body)
  if (!fields.length) return NextResponse.json({ ok: true })

  const setClauses = fields.map(([key], i) => `"${key}" = $${i + 1}`).join(', ')
  const values = fields.map(([, v]) => v)

  await query(`UPDATE products SET ${setClauses} WHERE id = $${fields.length + 1}`, [...values, id])

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await query('DELETE FROM products WHERE id = $1', [id])

  return NextResponse.json({ ok: true })
}
