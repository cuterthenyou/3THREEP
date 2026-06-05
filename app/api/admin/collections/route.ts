import { requireAdmin } from '@/lib/adminAuth'
import { query, queryMany } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await queryMany('SELECT * FROM categories ORDER BY name')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    slug, name, texture_url = null, logo_top_url = null, logo_bottom_url = null,
    texture_url_2 = null, texture_url_3 = null, active = true, modal_bg_url = null,
    description = null,
  } = body

  const { rows: [category] } = await query(
    `INSERT INTO categories (slug, name, texture_url, logo_top_url, logo_bottom_url, texture_url_2, texture_url_3, active, modal_bg_url, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       texture_url = EXCLUDED.texture_url,
       logo_top_url = EXCLUDED.logo_top_url,
       logo_bottom_url = EXCLUDED.logo_bottom_url,
       texture_url_2 = EXCLUDED.texture_url_2,
       texture_url_3 = EXCLUDED.texture_url_3,
       active = EXCLUDED.active,
       modal_bg_url = EXCLUDED.modal_bg_url,
       description = EXCLUDED.description
     RETURNING *`,
    [slug, name, texture_url, logo_top_url, logo_bottom_url, texture_url_2, texture_url_3, active, modal_bg_url, description]
  )

  revalidatePath('/')
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await req.json()
  await query('DELETE FROM categories WHERE slug = $1', [slug])
  return NextResponse.json({ ok: true })
}
