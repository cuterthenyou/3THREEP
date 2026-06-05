import Header from '@/components/Header';
import Hero from '@/components/Hero';
// import HeroTransition from '@/components/HeroTransition'; // disabled — needs redesign
import CatalogSection from '@/components/CatalogSection';
import Footer from '@/components/Footer';
import { queryMany } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/isAdmin';
import { staticProducts, staticCategories } from '@/lib/staticData';
import type { ProductCategory, Category } from '@/lib/types';

export const revalidate = 60

export default async function HomePage() {
  const session = await auth();
  const isAdminUser = isAdmin(session?.user?.email);
  console.log('[HOME] session email:', session?.user?.email ?? 'none', '| isAdminUser:', isAdminUser)

  let products = staticProducts;
  let categories = staticCategories;
  let categoryData: Record<string, Category> = {};
  let heroVideoUrl: string | null = null;

  try {
    const [productsData, categoriesData, settingsData] = await Promise.all([
      queryMany(`SELECT * FROM products WHERE active = true ORDER BY created_at DESC`),
      queryMany(`SELECT * FROM categories`),
      queryMany(`SELECT key, value FROM site_settings`).catch(() => [] as Array<{key: string; value: string | null}>),
    ])
    for (const row of settingsData) {
      if (row.key === 'hero_video_url') heroVideoUrl = row.value
    }

    const inactiveCatSlugs = new Set(
      categoriesData
        .filter((c: Category) => c.active === false)
        .map((c: Category) => c.slug)
    )

    if (productsData.length > 0) {
      products = productsData.filter(p => !inactiveCatSlugs.has(p.category))
      const slugs = [...new Set(products.map((p) => p.category as string))]
      categories = [
        { name: 'Все', slug: 'all' },
        ...slugs.map((s): ProductCategory => ({ slug: s, name: s.toUpperCase() })),
      ]
    }

    if (categoriesData.length > 0) {
      categoryData = Object.fromEntries(categoriesData.map((c: Category) => [c.slug, c]))
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
      <Header isAdminUser={isAdminUser} />
      <Hero videoUrl={heroVideoUrl} />
      <div style={{ position: 'relative', marginTop: '-80px', zIndex: 2, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 80 }}>
          <path
            d="M0,80 L0,54 Q40,36 90,50 Q150,65 220,38 Q290,14 370,42 Q440,62 520,30 Q600,4 680,32 Q755,55 840,22 Q920,0 1000,28 Q1080,52 1160,24 Q1240,3 1310,30 Q1370,50 1440,34 L1440,80 Z"
            fill="var(--bg)"
          />
        </svg>
      </div>
      <CatalogSection products={products} categories={categories} categoryData={categoryData} />
      <Footer />
    </main>
  )
}
