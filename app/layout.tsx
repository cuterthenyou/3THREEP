import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { CartProvider } from '@/lib/cart'
import CartDrawer from '@/components/CartDrawer'
import './globals.css'

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
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="overflow-x-hidden">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
