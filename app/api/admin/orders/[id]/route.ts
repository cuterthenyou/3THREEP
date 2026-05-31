import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, tracking_number } = await req.json()

  await query(
    'UPDATE orders SET status = COALESCE($1, status), tracking_number = COALESCE($2, tracking_number) WHERE id = $3',
    [status ?? null, tracking_number ?? null, id]
  )

  return NextResponse.json({ ok: true })
}
