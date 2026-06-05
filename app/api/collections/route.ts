import { NextResponse } from 'next/server'
import { queryMany, queryOne } from '@/lib/db'

export const revalidate = 60

interface NavConfig {
  hiddenCollections: string[]
  customItems: { label: string; href: string }[]
  collectionsOrder: string[]
}

export async function GET() {
  try {
    const [categories, productTypes, navConfigRow] = await Promise.all([
      queryMany<{ slug: string; name: string }>(
        `SELECT p.category AS slug, COALESCE(cat.name, p.category) AS name
         FROM (SELECT DISTINCT category FROM products WHERE active = true AND category IS NOT NULL) p
         LEFT JOIN categories cat ON cat.slug = p.category
         ORDER BY p.category ASC`
      ),
      queryMany<{ category: string; types: string[] }>(
        `SELECT category, array_agg(DISTINCT product_type ORDER BY product_type) as types
         FROM products WHERE active = true AND product_type IS NOT NULL GROUP BY category`
      ),
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'nav_config'`).catch(() => null),
    ])

    const navConfig: NavConfig = navConfigRow?.value
      ? JSON.parse(navConfigRow.value)
      : { hiddenCollections: [], customItems: [], collectionsOrder: [] }

    const typeMap: Record<string, string[]> = {}
    for (const row of productTypes) {
      typeMap[row.category] = row.types ?? []
    }

    let collections = categories
      .filter(c => !navConfig.hiddenCollections.includes(c.slug))
      .map(c => ({ ...c, types: typeMap[c.slug] ?? [] }))

    if (navConfig.collectionsOrder.length > 0) {
      const ordered = navConfig.collectionsOrder
        .map(slug => collections.find(c => c.slug === slug))
        .filter(Boolean) as typeof collections
      const rest = collections.filter(c => !navConfig.collectionsOrder.includes(c.slug))
      collections = [...ordered, ...rest]
    }

    if (navConfig.customItems.length > 0) {
      collections = [...collections, ...navConfig.customItems.map(item => ({
        slug: `_custom_${item.href}`,
        name: item.label,
        types: [],
        href: item.href,
      }))]
    }

    return NextResponse.json({ collections })
  } catch (e) {
    console.error('[/api/collections] error:', e)
    return NextResponse.json({ collections: [] })
  }
}
