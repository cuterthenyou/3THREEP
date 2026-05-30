import type { Product, ProductCategory } from './types'

const WC_URL = process.env.WC_URL || 'http://3threep.ru'
const WC_KEY = process.env.WC_CONSUMER_KEY || ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET || ''

function buildUrl(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${WC_URL}/index.php`)
  url.searchParams.set('rest_route', `/wc/v3/${endpoint}`)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(buildUrl('products', { per_page: '100', status: 'publish' }), {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    const res = await fetch(buildUrl('products/categories', { per_page: '50', hide_empty: 'true' }), {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
