import type { ReactNode } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth?callbackUrl=/admin/orders')
  }

  if (!isAdmin(session.user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0505' }}>
        <div className="text-center flex flex-col gap-4 p-8 rounded-xl max-w-sm w-full"
          style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.2)' }}>
          <p className="text-lg uppercase tracking-widest" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
            Нет доступа
          </p>
          <p className="text-sm" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
            Ты вошёл как:
          </p>
          <p className="text-sm font-mono px-3 py-2 rounded" style={{ color: '#F29774', background: 'rgba(242,151,116,0.1)', wordBreak: 'break-all' }}>
            {session.user.email}
          </p>
          <p className="text-xs" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
            Этот email не в списке ADMIN_EMAIL
          </p>
          <Link href="/account" className="text-xs uppercase tracking-widest mt-2"
            style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>
            ← В аккаунт
          </Link>
        </div>
      </div>
    )
  }

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
