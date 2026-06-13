import type { MetadataRoute } from 'next'

const BASE = 'https://3threep.ru'

// Публичные индексируемые страницы. Каталог и карточки товара живут на главной
// (модалки, не отдельные URL), поэтому отдельных product-URL в карте нет.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/',         priority: 1.0, freq: 'weekly' },
    { path: '/info',     priority: 0.6, freq: 'monthly' },
    { path: '/privacy',  priority: 0.3, freq: 'yearly' },
    // /contacts и /delivery — 307-редиректы на /info, в карту не включаем.
  ]
  return pages.map(p => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }))
}
