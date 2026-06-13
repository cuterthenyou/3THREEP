'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toggleTheme } from '@/lib/theme'
import ThemedLogo from '@/components/ThemedLogo'
import ThemeIcon from '@/components/ThemeIcon'
import { PALETTES } from '@/lib/palettes'
import s from './AdminSidebar.module.css'

function IcoDash() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="6.5" height="6.5"/>
    <rect x="9.5" y="0" width="6.5" height="6.5"/>
    <rect x="0" y="9.5" width="6.5" height="6.5"/>
    <rect x="9.5" y="9.5" width="6.5" height="6.5"/>
  </svg>
}

function IcoOrders() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" style={{ flexShrink: 0 }}>
    <path d="M1,5 L8,1 L15,5 L15,14 L1,14 Z"/>
    <path d="M1,5 L8,9 L15,5"/>
    <line x1="8" y1="9" x2="8" y2="14"/>
  </svg>
}

function IcoProducts() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M8,0 L11,3 L13,3 L13,6 L11,6 L11,4 L9,4 L9,14 L11,14 L11,16 L5,16 L5,14 L7,14 L7,4 L5,4 L5,6 L3,6 L3,3 L5,3 Z"/>
  </svg>
}

function IcoCols() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="16" height="4"/>
    <rect x="0" y="6" width="16" height="4"/>
    <rect x="0" y="12" width="16" height="4"/>
  </svg>
}

function IcoMedia() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" style={{ flexShrink: 0 }}>
    <rect x="1" y="3" width="14" height="11"/>
    <path d="M1,3 L4,0 L12,0 L15,3"/>
    <circle cx="8" cy="8.5" r="2.5" fill="currentColor" stroke="none"/>
  </svg>
}

function IcoSite() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
    <polygon points="8,0.5 14.5,4 14.5,12 8,15.5 1.5,12 1.5,4"/>
    <polygon points="8,4 11,6 11,10 8,12 5,10 5,6" fill="currentColor" stroke="none"/>
  </svg>
}

function IcoTexts() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <rect x="0" y="1" width="16" height="2.5"/>
    <rect x="0" y="6.5" width="12" height="2.5"/>
    <rect x="0" y="12" width="8" height="2.5"/>
  </svg>
}

function IcoMenu() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <rect x="0" y="1" width="10" height="2.5"/>
    <rect x="0" y="6.5" width="16" height="2.5"/>
    <rect x="0" y="12" width="13" height="2.5"/>
    <polygon points="12,1 16,3.25 12,5.5"/>
  </svg>
}

function IcoEmoji() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ flexShrink: 0 }}>
    <polygon points="8,0.5 15.5,8 8,15.5 0.5,8"/>
    <circle cx="5.5" cy="7" r="1" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none"/>
    <path d="M5.5,10 Q8,12.5 10.5,10" strokeLinecap="round"/>
  </svg>
}

function IcoNewsletter() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ flexShrink: 0 }}>
    <rect x="1" y="3" width="14" height="10" rx="1"/>
    <path d="M1,4 L8,9.5 L15,4"/>
  </svg>
}

function IcoGame() {
  // Нетопырь-мишень
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M8 4 L10 2 L9.5 5 L13 3 L11 6 L15 6 L11.5 8 L14 11 L9.5 9 L8 13 L6.5 9 L2 11 L4.5 8 L1 6 L5 6 L3 3 L6.5 5 L6 2 Z"/>
  </svg>
}

function IcoThemes() {
  // Палитра/капля
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ flexShrink: 0 }}>
    <path d="M8 1 C4 6 2 8 2 11 a6 6 0 0 0 12 0 C14 8 12 6 8 1 Z"/>
  </svg>
}

function IcoExit() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M0,1 L9,1 L9,3 L2,3 L2,13 L9,13 L9,15 L0,15 Z"/>
    <path d="M7,8 L16,8 M11,4 L16,8 L11,12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/>
  </svg>
}

function IcoChevL() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" style={{ flexShrink: 0 }}>
    <path d="M11,2 L5,8 L11,14"/>
  </svg>
}

function IcoChevR() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" style={{ flexShrink: 0 }}>
    <path d="M5,2 L11,8 L5,14"/>
  </svg>
}

const NAV = [
  { href: '/admin',             label: 'Дашборд',   Icon: IcoDash,     exact: true },
  { href: '/admin/orders',      label: 'Заказы',    Icon: IcoOrders },
  { href: '/admin/products',    label: 'Товары',    Icon: IcoProducts },
  { href: '/admin/collections', label: 'Коллекции', Icon: IcoCols },
  { href: '/admin/menu',        label: 'Меню',      Icon: IcoMenu },
  { href: '/admin/media',       label: 'Медиа',     Icon: IcoMedia },
  { href: '/admin/site',        label: 'Сайт',      Icon: IcoSite },
  { href: '/admin/themes',      label: 'Темы',      Icon: IcoThemes },
  { href: '/admin/game',        label: 'Игра',      Icon: IcoGame },
  { href: '/admin/texts',       label: 'Тексты',    Icon: IcoTexts },
  { href: '/admin/emojis',      label: 'Emoji',     Icon: IcoEmoji },
  { href: '/admin/newsletter',  label: 'Рассылка',  Icon: IcoNewsletter },
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
            className={s.navLink}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.6rem' : '0.55rem 0.75rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '3px',
              background: active ? 'var(--accent-2)' : undefined,
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Icon />
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
  const [theme, setTheme] = useState('dark')
  const [logoIconUrl, setLogoIconUrl] = useState<string | null>(null)
  const [logoTextUrl, setLogoTextUrl] = useState<string | null>(null)

  // Синхронизируем иконку+название кнопки с РЕАЛЬНОЙ темой (вкл. trip и доп-палитры),
  // а не только light/dark — иначе при цикле тем кнопка застревала на солнце/луне.
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme ?? 'dark')
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const themeLabel = PALETTES.find(p => p.key === theme)?.label ?? theme.toUpperCase()

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.ok ? r.json() : {})
      .then((d: Record<string, string | null>) => {
        if (d.logo_icon_url) setLogoIconUrl(d.logo_icon_url)
        if (d.logo_text_url) setLogoTextUrl(d.logo_text_url)
      })
      .catch(() => {})
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
            ? (logoTextUrl
                ? <ThemedLogo src={logoTextUrl} alt="THREEP" className="h-5" defaultRatio={5} />
                : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '0.15em', color: 'var(--accent)' }}>THREEP</span>)
            : (logoIconUrl
                ? <ThemedLogo src={logoIconUrl} alt="T" className="h-5" defaultRatio={1} />
                : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--accent)' }}>3P</span>)
          }
        </div>

        <NavItems pathname={pathname} collapsed={collapsed} />

        {/* Footer */}
        <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <Link href="/"
            title={collapsed ? 'На сайт' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '3px', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IcoExit />
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>На сайт</span>}
          </Link>
          <button
            onClick={toggleTheme}
            title={`Тема: ${themeLabel} — сменить`}
            className={s.sidebarBtnAccent}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '3px', cursor: 'pointer', color: 'var(--accent)', width: '100%', whiteSpace: 'nowrap' }}>
            <ThemeIcon theme={theme} size={14} />
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>{themeLabel}</span>}
          </button>
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
            className={s.sidebarBtnMuted}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '3px', cursor: 'pointer', color: 'var(--text-muted)', width: '100%', whiteSpace: 'nowrap' }}>
            {collapsed ? <IcoChevR /> : <IcoChevL />}
            {!collapsed && <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.7rem' }}>Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile toggle button ── */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center p-1.5"
        style={{ borderRadius: '2px', background: 'var(--bg-2)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Открыть меню"
      >
        {logoIconUrl
          ? <ThemedLogo src={logoIconUrl} alt="menu" className="h-6" defaultRatio={1} />
          : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--accent)' }}>3P</span>
        }
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
          {logoTextUrl
            ? <ThemedLogo src={logoTextUrl} alt="THREEP" className="h-5" defaultRatio={5} />
            : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '0.15em', color: 'var(--accent)' }}>THREEP</span>
          }
        </div>

        <NavItems pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />

        {/* Footer */}
        <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <Link href="/" onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: '3px', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IcoExit />
            <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>На сайт</span>
          </Link>
          <button
            onClick={toggleTheme}
            title={`Тема: ${themeLabel} — сменить`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: '3px', background: 'var(--bg-subtle)', border: '1px solid var(--accent)', boxShadow: '2px 2px 0 var(--accent)', cursor: 'pointer', color: 'var(--accent)', width: '100%', whiteSpace: 'nowrap' }}>
            <ThemeIcon theme={theme} size={14} />
            <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.75rem' }}>{themeLabel}</span>
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
