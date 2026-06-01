import type { ReactNode } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth?callbackUrl=/admin')
  }

  const email = session.user.email ?? null

  if (!isAdmin(email)) {
    const adminEnvHint = process.env.ADMIN_EMAIL
      ? `задан (начинается с "${process.env.ADMIN_EMAIL.slice(0, 4)}...")`
      : '⚠️ НЕ ЗАДАН — установи ADMIN_EMAIL в переменных окружения'

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d0505' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.2)' }}>
          <p className="text-lg uppercase tracking-widest" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>Нет доступа</p>
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>Твой email:</p>
            <p className="text-sm font-mono px-3 py-2 rounded-lg" style={{ color: '#F29774', background: 'rgba(242,151,116,0.1)', wordBreak: 'break-all' }}>{email ?? '(не определён)'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>ADMIN_EMAIL env var:</p>
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#F29774', background: 'rgba(242,151,116,0.08)', fontFamily: "'Involve', sans-serif", fontSize: '0.8rem' }}>{adminEnvHint}</p>
          </div>
          <Link href="/account" className="text-xs uppercase tracking-widest text-center mt-2" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>← В аккаунт</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0505' }}>
      <AdminSidebar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  )
}
