import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

// ── Content-Security-Policy ─────────────────────────────────────────────
// Кодовая база тяжела инлайн-стилями (ThemeStyles инжектит <style>, много
// style={}), а JSON-LD/гидрация Next — инлайн <script>, поэтому script/style
// держим на 'unsafe-inline' (nonce потребовал бы переписать пол-сайта). Зато
// жёстко режем frame-ancestors/base-uri/form-action/object-src и фиксируем
// доверенные источники картинок/коннектов. В dev добавляем 'unsafe-eval'
// (нужен HMR/реакт-рефреш), в prod — нет.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://storage.yandexcloud.net https://3threep.ru http://3threep.ru",
  "font-src 'self' data:",
  "connect-src 'self' https://storage.yandexcloud.net",
  "media-src 'self' https://storage.yandexcloud.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // HSTS — только в prod (на localhost http сломал бы доступ)
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '3threep.ru',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/threep-media/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
}

export default nextConfig
