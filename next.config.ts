import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '3threep.ru',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wfgzofrtiinageegztux.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: false,
  },
}

export default nextConfig
