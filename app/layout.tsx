import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Unbounded } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import CartDrawer from '@/components/CartDrawer';
import Providers from './providers';
import CookieBanner from '@/components/CookieBanner';
import GlitterCanvas from '@/components/GlitterCanvas';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollRestorer from '@/components/ScrollRestorer';
import ThemeStyles from '@/components/ThemeStyles';
import CustomCursor from '@/components/CustomCursor';
import VisitTracker from '@/components/VisitTracker';
import LoadingScreen from '@/components/LoadingScreen';
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
      {/* Inline theme init — runs before paint to prevent FOUC */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('threep-theme')||'light';document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
        <ThemeStyles />
      </head>
      <body className="overflow-x-hidden">
        <LoadingScreen />
        <CustomCursor />
        <VisitTracker />
        <GlitterCanvas />
        {/* Grain/noise texture overlay — opacity controlled by --grain-opacity CSS var */}
        <div
          aria-hidden="true"
          className="grain-fixed"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: 'var(--grain-size, 256px) var(--grain-size, 256px)',
          }}
        />

        <Providers>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </Providers>
        <ScrollRestorer />
        <ScrollToTop />
        <CookieBanner />
      </body>
    </html>
  );
}
