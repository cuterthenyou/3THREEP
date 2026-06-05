import { Suspense } from 'react';
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
      <div style={{ position: 'relative', marginTop: '-100px', zIndex: 2, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 100 }}>
          <path
            d="M0,100 L0,58 L38,28 L72,52 L100,12 L138,44 L168,8 L200,38 L230,16 L265,50 L295,14 L325,42 L355,6 L388,40 L418,18 L450,52 L480,10 L512,44 L542,20 L572,56 L604,8 L638,42 L668,16 L700,50 L730,12 L762,46 L792,22 L822,58 L854,10 L888,44 L918,20 L950,52 L980,14 L1012,48 L1042,8 L1075,42 L1105,18 L1138,54 L1168,12 L1200,46 L1232,20 L1262,50 L1295,8 L1325,40 L1358,18 L1390,48 L1440,22 L1440,100 Z"
            fill="var(--bg)"
          />
        </svg>
      </div>
      <Suspense fallback={<div id="catalog" />}>
        <CatalogSection products={products} categories={categories} categoryData={categoryData} />
      </Suspense>
      <Footer />
    </main>
  )
}
