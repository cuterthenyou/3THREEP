import { Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TornEdge from '@/components/TornEdge';
import CatalogSection from '@/components/CatalogSection';
import Footer from '@/components/Footer';
import { queryMany, queryOne } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/isAdmin';
import { staticProducts, staticCategories } from '@/lib/staticData';
import { getLevel, getDiscount } from '@/lib/leveling';
import type { ProductCategory, Category } from '@/lib/types';

export const revalidate = 60

export default async function HomePage() {
  const session = await auth();
  const isAdminUser = isAdmin(session?.user?.email);
  console.log('[HOME] session email:', session?.user?.email ?? 'none', '| isAdminUser:', isAdminUser)

  // Скидка залогиненного пользователя — цены в каталоге показываем со скидкой.
  // Берём кэш profiles.discount_percent; если он ещё 0 (новый юзер / до бэкфилла) —
  // считаем от уровня по искрам, чтобы каталог совпадал с личным кабинетом.
  let userDiscount = 0
  let ownedIds: string[] = []
  if (session?.user?.id) {
    const [prof, ownedRows] = await Promise.all([
      queryOne<{ sparks: number; discount_percent: number }>(
        `SELECT sparks, discount_percent FROM profiles WHERE id = $1`, [session.user.id]
      ).catch(() => null),
      queryMany<{ product_id: string }>(
        `SELECT DISTINCT oi.product_id FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.user_id = $1 AND oi.product_id IS NOT NULL`, [session.user.id]
      ).catch(() => [] as { product_id: string }[]),
    ])
    if (prof) {
      userDiscount = prof.discount_percent && prof.discount_percent > 0
        ? prof.discount_percent
        : getDiscount(getLevel(prof.sparks ?? 0))
    }
    ownedIds = ownedRows.map((r) => r.product_id)
  }

  let products = staticProducts;
  let categories = staticCategories;
  let categoryData: Record<string, Category> = {};
  let heroVideoUrl: string | null = null;
  let heroVideoMp4Url: string | null = null;
  let heroPosterUrl: string | null = null;
  let logoIconUrl: string | null = null;
  let logoTextUrl: string | null = null;
  let initialCollections: { slug: string; name: string; types: string[] }[] = [];

  try {
    const [productsData, categoriesData, settingsData] = await Promise.all([
      queryMany(`SELECT * FROM products WHERE active = true ORDER BY created_at DESC`),
      queryMany(`SELECT * FROM categories`),
      queryMany(`SELECT key, value FROM site_settings`).catch(() => [] as Array<{key: string; value: string | null}>),
    ])
    for (const row of settingsData) {
      if (row.key === 'hero_video_url') heroVideoUrl = row.value
      if (row.key === 'hero_video_url_mp4') heroVideoMp4Url = row.value
      if (row.key === 'hero_poster_url') heroPosterUrl = row.value
      if (row.key === 'logo_icon_url') logoIconUrl = row.value
      if (row.key === 'logo_text_url') logoTextUrl = row.value
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
    // Derive initialCollections from already-fetched products + categoryData
    const collSlugs = [...new Set(products.map((p) => p.category as string).filter(Boolean))]
    initialCollections = collSlugs.map(slug => ({
      slug,
      name: categoryData[slug]?.name ?? slug.toUpperCase(),
      types: [...new Set(
        products.filter(p => p.category === slug).map(p => p.product_type as string).filter(Boolean)
      )].sort(),
    }))
  } catch {
    // fallback to static data
  }

  return (
    <main className="min-h-screen">
      <Header isAdminUser={isAdminUser} initialCollections={initialCollections} logoIconUrl={logoIconUrl} logoTextUrl={logoTextUrl} />
      <Hero videoUrl={heroVideoUrl} mp4Url={heroVideoMp4Url} posterUrl={heroPosterUrl} />
      <TornEdge />
      <Suspense fallback={<div id="catalog" />}>
        <CatalogSection products={products} categories={categories} categoryData={categoryData} discount={userDiscount} ownedIds={ownedIds} />
      </Suspense>
      <Footer />
    </main>
  )
}
