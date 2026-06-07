import { requireAdmin } from '@/lib/adminAuth'
import { query, queryMany } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const rows = await queryMany('SELECT id, name, url FROM custom_fonts ORDER BY id')
    return NextResponse.json({ fonts: rows })
  } catch {
    return NextResponse.json({ fonts: [] })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, url } = await req.json()
  if (!name || !url) return NextResponse.json({ error: 'Missing name or url' }, { status: 400 })

  const safeName = name.trim().slice(0, 64)
  await query(
    `INSERT INTO custom_fonts (name, url) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url`,
    [safeName, url]
  )

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, url } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await query('DELETE FROM custom_fonts WHERE id = $1', [id])

  // Remove font file from /public/fonts/ if it's a local path
  if (url && url.startsWith('/fonts/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', url)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch { /* ignore */ }
  }

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
