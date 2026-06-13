import { requireAdmin } from '@/lib/adminAuth'
import { query, queryMany } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

// Список всех ачивок (для редактора текстов медалей в админке).
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const rows = await queryMany(
      `SELECT key, title, description, medal_key, condition_type, threshold, sort_order, active
       FROM achievements ORDER BY sort_order, key`
    )
    return NextResponse.json({ achievements: rows })
  } catch {
    return NextResponse.json({ achievements: [] })
  }
}

// Обновить заголовок/описание медали (текст для ЛК). Ключ/условие не трогаем.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, title, description } = await req.json()
  if (!key || typeof key !== 'string') return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  if (!title || !String(title).trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  await query(
    `UPDATE achievements SET title = $2, description = $3 WHERE key = $1`,
    [key, String(title).trim(), description != null ? String(description).trim() : null]
  )

  revalidatePath('/account')
  return NextResponse.json({ ok: true })
}
