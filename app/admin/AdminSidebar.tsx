'use client'

import { useState } from 'react'
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
} from '@tabler/icons-react'

const NAV = [
  { href: '/admin',             label: 'Дашборд',   Icon: IconLayoutDashboard, exact: true },
  { href: '/admin/orders',      label: 'Заказы',    Icon: IconPackage },
  { href: '/admin/products',    label: 'Товары',    Icon: IconShirt },
  { href: '/admin/collections', label: 'Коллекции', Icon: IconStack2 },
  { href: '/admin/media',       label: 'Медиа',     Icon: IconPhoto },
]

const accent = '#F29774'
const bg = '#1a0808'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const w = collapsed ? 60 : 220

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 flex-col"
        style={{
          width: w,
          background: bg,
          borderRight: '1px solid rgba(242,151,116,0.12)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center px-4" style={{ minHeight: 56, borderBottom: '1px solid rgba(242,151,116,0.1)' }}>
          {!collapsed
            ? <span style={{ color: accent, fontFamily: "'ONDER', sans-serif", fontSize: '0.7rem', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>THREEP / ADMIN</span>
            : <span style={{ color: accent, fontFamily: "'ONDER', sans-serif", fontSize: '0.7rem' }}>T</span>
          }
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 py-3 gap-0.5 px-2">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.6rem' : '0.55rem 0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '0.5rem',
                  background: active ? 'rgba(242,151,116,0.15)' : 'transparent',
                  color: active ? accent : 'rgba(242,151,116,0.48)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontFamily: "'Involve', sans-serif", fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(242,151,116,0.1)' }}>
          <Link href="/"
            title={collapsed ? 'На сайт' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '0.5rem', color: 'rgba(242,151,116,0.38)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IconLogout size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontFamily: "'Involve', sans-serif", fontSize: '0.75rem' }}>На сайт</span>}
          </Link>
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(242,151,116,0.3)', width: '100%', whiteSpace: 'nowrap' }}>
            {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            {!collapsed && <span style={{ fontFamily: "'Involve', sans-serif", fontSize: '0.7rem' }}>Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <nav
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-3 py-2 overflow-x-auto"
        style={{ background: bg, borderBottom: '1px solid rgba(242,151,116,0.12)' }}
      >
        <span style={{ color: accent, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.15em', flexShrink: 0 }}>ADMIN</span>
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '0.5rem', padding: '0.35rem 0.5rem', flexShrink: 0, background: active ? 'rgba(242,151,116,0.15)' : 'transparent', color: active ? accent : 'rgba(242,151,116,0.42)', textDecoration: 'none' }}>
              <Icon size={13} />
              <span style={{ fontFamily: "'Involve', sans-serif", fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{label}</span>
            </Link>
          )
        })}
        <Link href="/" style={{ marginLeft: 'auto', flexShrink: 0, color: 'rgba(242,151,116,0.3)', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem', textDecoration: 'none', letterSpacing: '0.1em' }}>← Сайт</Link>
      </nav>

      {/* Spacer so content doesn't hide under fixed sidebar/bar */}
      <style>{`
        @media (min-width: 768px) {
          .admin-content { margin-left: ${w}px; transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1); }
        }
        @media (max-width: 767px) {
          .admin-content { padding-top: 3rem; }
        }
      `}</style>
    </>
  )
}
