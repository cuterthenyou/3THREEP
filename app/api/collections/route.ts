import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export const revalidate = 60

export async function GET() {
  try {
    const [categories, productTypes] = await Promise.all([
      // Join products with categories so ALL categories with active products show up,
      // regardless of category.active flag. Name falls back to slug if not in categories table.
      queryMany<{ slug: string; name: string }>(
        `SELECT p.category AS slug, COALESCE(cat.name, p.category) AS name
         FROM (SELECT DISTINCT category FROM products WHERE active = true AND category IS NOT NULL) p
         LEFT JOIN categories cat ON cat.slug = p.category
         ORDER BY cat.created_at ASC NULLS LAST, p.category ASC`
      ),
      queryMany<{ category: string; types: string[] }>(
        `SELECT category, array_agg(DISTINCT product_type ORDER BY product_type) as types
         FROM products WHERE active = true AND product_type IS NOT NULL GROUP BY category`
      ),
    ])

    const typeMap: Record<string, string[]> = {}
    for (const row of productTypes) {
      typeMap[row.category] = row.types ?? []
    }

    return NextResponse.json({
      collections: categories.map(c => ({ ...c, types: typeMap[c.slug] ?? [] })),
    })
  } catch {
    return NextResponse.json({ collections: [] })
  }
}
