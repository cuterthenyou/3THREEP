import { requireAdmin } from '@/lib/adminAuth'
import { query } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    name, description = '', price, images = [], sizes = [],
    colors = [], stock = 0, active = true, category = 'general', product_type = null,
  } = body

  const { rows: [product] } = await query(
    `INSERT INTO products (name, description, price, images, sizes, colors, stock, active, category, product_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [name, description, price, images, sizes, colors, stock, active, category, product_type]
  )

  return NextResponse.json(product)
}
