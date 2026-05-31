import type { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/isAdmin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth?callbackUrl=/admin/orders');
  }

  const email = session.user.email ?? null;
  console.log('[ADMIN] session email:', email, '| ADMIN_EMAIL env:', process.env.ADMIN_EMAIL ?? 'NOT SET', '| isAdmin:', isAdmin(email))

  if (!isAdmin(email)) {
    const adminEnvHint = process.env.ADMIN_EMAIL
      ? `задан (начинается с "${process.env.ADMIN_EMAIL.slice(0, 4)}...")`
      : '⚠️ НЕ ЗАДАН — установи ADMIN_EMAIL в переменных окружения на Amvera';

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#0d0505' }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: 'rgba(242,151,116,0.06)',
            border: '1px solid rgba(242,151,116,0.2)',
          }}
        >
          <p
            className="text-lg uppercase tracking-widest"
            style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
          >
            Нет доступа
          </p>

          <div className="flex flex-col gap-1">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}
            >
              Твой email:
            </p>
            <p
              className="text-sm font-mono px-3 py-2 rounded-lg"
              style={{
                color: '#F29774',
                background: 'rgba(242,151,116,0.1)',
                wordBreak: 'break-all',
              }}
            >
              {email ?? '(не определён)'}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}
            >
              ADMIN_EMAIL env var:
            </p>
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{
                color: '#F29774',
                background: 'rgba(242,151,116,0.08)',
                fontFamily: "'Involve', sans-serif",
                fontSize: '0.8rem',
              }}
            >
              {adminEnvHint}
            </p>
          </div>

          <p
            className="text-xs"
            style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}
          >
            Убедись что твой email точно совпадает с ADMIN_EMAIL на Amvera. Можно также проверить{' '}
            <code>/api/admin/debug</code> в браузере.
          </p>

          <Link
            href="/account"
            className="text-xs uppercase tracking-widest text-center mt-2"
            style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}
          >
            ← В аккаунт
          </Link>
        </div>
      </div>
    );
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
      <div className="pt-14">{children}</div>
    </div>
  );
}
