'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconPackage,
  IconShirt,
  IconStack2,
  IconPhoto,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconSun,
  IconMoon2,
} from '@tabler/icons-react'
import { toggleTheme } from '@/lib/theme'

const NAV = [
  { href: '/admin',             label: 'Дашборд',   Icon: IconLayoutDashboard, exact: true },
  { href: '/admin/orders',      label: 'Заказы',    Icon: IconPackage },
  { href: '/admin/products',    label: 'Товары',    Icon: IconShirt },
  { href: '/admin/collections', label: 'Коллекции', Icon: IconStack2 },
  { href: '/admin/media',       label: 'Медиа',     Icon: IconPhoto },
]

function NavItems({ pathname, collapsed, onNavigate }: { pathname: string; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col flex-1 py-3 gap-0.5 px-2">
      {NAV.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.6rem' : '0.55rem 0.75rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '0.5rem',
              background: active ? 'var(--accent-2)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark')
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.dataset.theme === 'dark')
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const w = collapsed ? 60 : 220

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 flex-col"
        style={{
          width: w,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border-soft)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center justify-center px-4" style={{ minHeight: 56, borderBottom: '1px solid var(--border-soft)' }}>
          {!collapsed
            ? <img src="/images/logo-text-63.svg" alt="THREEP" className="theme-img h-5 w-auto" />
            : <img src="/images/logo-61.svg" alt="T" className="theme-img h-5 w-auto" />
          }
        </div>

        <NavItems pathname={pathname} collapsed={collapsed} />

        {/* Footer */}
        <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <Link href="/"
            title={collapsed ? 'На сайт' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IconLogout size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>На сайт</span>}
          </Link>
          <button
            onClick={() => { toggleTheme(); setIsDark(d => !d) }}
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', width: '100%', whiteSpace: 'nowrap', opacity: 0.75 }}>
            {isDark ? <IconSun size={16} style={{ flexShrink: 0 }} /> : <IconMoon2 size={16} style={{ flexShrink: 0 }} />}
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>{isDark ? 'Светлая' : 'Тёмная'}</span>}
          </button>
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '100%', whiteSpace: 'nowrap', opacity: 0.6 }}>
            {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.7rem' }}>Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile toggle button ── */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center p-1.5 rounded-lg"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Открыть меню"
      >
        <img src="/images/logo-61.svg" alt="menu" className="theme-img h-6 w-auto" />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'var(--overlay-medium)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ── */}
      <aside
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 flex flex-col"
        style={{
          width: 220,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border-soft)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center justify-center px-4" style={{ minHeight: 56, borderBottom: '1px solid var(--border-soft)' }}>
          <img src="/images/logo-text-63.svg" alt="THREEP" className="theme-img h-5 w-auto" />
        </div>

        <NavItems pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />

        {/* Footer */}
        <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <Link href="/" onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IconLogout size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>На сайт</span>
          </Link>
          <button
            onClick={() => { toggleTheme(); setIsDark(d => !d) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', width: '100%', whiteSpace: 'nowrap', opacity: 0.75 }}>
            {isDark ? <IconSun size={16} style={{ flexShrink: 0 }} /> : <IconMoon2 size={16} style={{ flexShrink: 0 }} />}
            <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>{isDark ? 'Светлая' : 'Тёмная'}</span>
          </button>
        </div>
      </aside>

      {/* Spacer so content doesn't hide under fixed sidebar/bar */}
      <style>{`
        @media (min-width: 768px) {
          .admin-content { margin-left: ${w}px; transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1); }
        }
        @media (max-width: 767px) {
          .admin-content { padding-top: 3.5rem; }
        }
      `}</style>
    </>
  )
}
