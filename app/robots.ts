import type { MetadataRoute } from 'next'

const BASE = 'https://3threep.ru'

// Публичные страницы индексируем; приватное/служебное (ЛК, чекаут, вход, админка,
// API, подтверждение заказа) закрываем от краулеров.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/api', '/checkout', '/auth', '/order-confirmation'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
