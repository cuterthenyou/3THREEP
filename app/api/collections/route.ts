import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export const revalidate = 60

export async function GET() {
  try {
    const [categories, productTypes] = await Promise.all([
      queryMany<{ slug: string; name: string }>(
        `SELECT slug, name FROM categories WHERE active = true ORDER BY created_at ASC`
      ),
      queryMany<{ category: string; types: string[] }>(
        `SELECT category, array_agg(DISTINCT product_type ORDER BY product_type) as types
         FROM products WHERE active = true AND product_type IS NOT NULL GROUP BY category`
      ),
    ])

    // Fallback: if categories table has no rows, derive slugs from products directly
    const effectiveCategories = categories.length > 0
      ? categories
      : await queryMany<{ slug: string; name: string }>(
          `SELECT DISTINCT category AS slug, category AS name
           FROM products WHERE active = true AND category IS NOT NULL
           ORDER BY category ASC`
        )

    const typeMap: Record<string, string[]> = {}
    for (const row of productTypes) {
      typeMap[row.category] = row.types ?? []
    }

    return NextResponse.json({
      collections: effectiveCategories.map(c => ({ ...c, types: typeMap[c.slug] ?? [] })),
    })
  } catch {
    return NextResponse.json({ collections: [] })
  }
}
