import { requireAdmin } from '@/lib/adminAuth'
import { query, queryMany } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  try {
    const rows = await queryMany('SELECT key, value FROM site_settings')
    const settings: Record<string, string | null> = {}
    for (const row of rows) settings[row.key] = row.value
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  await query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value ?? null]
  )

  revalidatePath('/')
  revalidatePath('/account')
  return NextResponse.json({ ok: true })
}
