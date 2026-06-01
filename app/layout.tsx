import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Unbounded } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import CartDrawer from '@/components/CartDrawer';
import CookieBanner from '@/components/CookieBanner';
import './globals.css';

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['700', '900'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'THREEP — Custom Streetwear',
  description: 'THREEP — уличная одежда ручной работы. Хлор, ткань, история.',
  openGraph: {
    title: 'THREEP — Custom Streetwear',
    description: 'THREEP — уличная одежда ручной работы.',
    url: 'https://3threep.ru',
    siteName: 'THREEP',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={unbounded.variable}>
      <body className="overflow-x-hidden">
        {/* Hidden SVG filter for grain/noise effects */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter id="grain-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
        </svg>

        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
