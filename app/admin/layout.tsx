import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0d0505' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-6 px-6 py-3"
        style={{ background: '#1a0808', borderBottom: '1px solid rgba(242,151,116,0.15)' }}
      >
        <span
          className="text-sm uppercase tracking-widest"
          style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
        >
          THREEP / Admin
        </span>
        <div className="flex gap-4 ml-4">
          {[
            { href: '/admin/orders', label: 'Заказы' },
            { href: '/admin/products', label: 'Товары' },
            { href: '/admin/collections', label: 'Коллекции' },
            { href: '/admin/media', label: 'Медиа' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ color: '#F29774', opacity: 0.6, fontFamily: "'ONDER', sans-serif" }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="ml-auto text-xs uppercase tracking-widest"
          style={{ color: '#F29774', opacity: 0.4, fontFamily: "'ONDER', sans-serif" }}
        >
          На сайт →
        </Link>
      </nav>
      <div className="pt-14">
        {children}
      </div>
    </div>
  )
}
