import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  poweredByHeader: false,
  compress: true,
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
    minimumCacheTTL: 3600,
  },
}

export default nextConfig
