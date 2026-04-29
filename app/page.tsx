import Header from '@/components/Header'
import Hero from '@/components/Hero'
import CatalogSection from '@/components/CatalogSection'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { staticProducts, staticCategories } from '@/lib/staticData'
import type { ProductCategory, Category } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  let products = staticProducts
  let categories = staticCategories
  let categoryData: Record<string, Category> = {}

  try {
    const supabase = await createClient()
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ])

    const inactiveCatSlugs = new Set(
      (categoriesRes.data ?? [])
        .filter((c: Category) => c.active === false)
        .map((c: Category) => c.slug)
    )

    if (productsRes.data && productsRes.data.length > 0) {
      products = productsRes.data.filter(p => !inactiveCatSlugs.has(p.category))
      const slugs = [...new Set(products.map((p) => p.category as string))]
      categories = [
        { name: 'Все', slug: 'all' },
        ...slugs.map((s): ProductCategory => ({ slug: s, name: s.toUpperCase() })),
      ]
    }

    if (categoriesRes.data) {
      categoryData = Object.fromEntries(categoriesRes.data.map((c: Category) => [c.slug, c]))
      if (categories.length > 1) {
        categories = [
          { name: 'Все', slug: 'all' },
          ...categories.slice(1)
            .filter(c => categoryData[c.slug]?.active !== false)
            .map(c => ({
              slug: c.slug,
              name: categoryData[c.slug]?.name ?? c.name,
            })),
        ]
      }
    }
  } catch {
    // fallback to static data
  }

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CatalogSection products={products} categories={categories} categoryData={categoryData} />
      <Footer />
    </main>
  )
}
