import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
import RouteTransition from '@/components/RouteTransition';
import GameMount from '@/components/GameMount';
import TripCursorTrail from '@/components/TripCursorTrail';
import TripDesync from '@/components/TripDesync';
import TripFlash from '@/components/TripFlash';
import './globals.css';

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
    <html lang="ru" data-theme="dark">
      {/* Inline theme init — runs before paint to prevent FOUC */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('threep-theme')||'dark';document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
        {/* Warm the asset-host connection (logos/images/video on S3) so collection
            SVGs and product images don't wait on a cold DNS+TLS handshake */}
        <link rel="preconnect" href="https://storage.yandexcloud.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://storage.yandexcloud.net" />
        {/* Preload brand fonts — biggest first-paint win (text/buttons paint instantly) */}
        <link rel="preload" as="font" type="font/ttf" href="/fonts/ONDER-REGULAR.TTF" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/ttf" href="/fonts/Involve-VF.ttf" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/ttf" href="/fonts/DeutschGothic-RAMA.ttf" crossOrigin="anonymous" />
        <ThemeStyles />
      </head>
      <body className="overflow-x-hidden">
        <LoadingScreen />
        <CustomCursor />
        <VisitTracker />
        <GlitterCanvas />
        {/* TRIP theme — psychedelic layers (visible only in [data-theme="trip"]).
            Все слои fixed + анимируют только transform/opacity (без filter на body).
            #trip-warp-filter — жидкое искажение (feTurbulence + feDisplacementMap),
            применяется ТОЛЬКО к trip-слоям (.trip-fx / .trip-warp), не к контенту. */}
        <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <filter id="trip-warp-filter" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves={2} seed={7} result="warpNoise">
              <animate attributeName="baseFrequency" dur="18s" values="0.006 0.011;0.013 0.006;0.006 0.011" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warpNoise" xChannelSelector="R" yChannelSelector="G" scale={24}>
              <animate attributeName="scale" dur="9s" values="14;36;14" repeatCount="indefinite" />
            </feDisplacementMap>
          </filter>
        </svg>
        <div aria-hidden="true" className="trip-fx" />
        <div aria-hidden="true" className="trip-warp" />
        <div aria-hidden="true" className="trip-breathe" />
        <div aria-hidden="true" className="trip-blobs"><span /><span /><span /></div>
        <TripCursorTrail />
        <TripDesync />
        <TripFlash />
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
        <RouteTransition />
        <GameMount />
        <CookieBanner />
      </body>
    </html>
  );
}
