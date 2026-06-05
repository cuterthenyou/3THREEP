'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { toggleTheme } from '@/lib/theme';
import UserButton from './UserButton';
import s from './Header.module.css';

function BrutalSun() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z"/>
    </svg>
  )
}

function BrutalMoon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
      <path d="M8,1 L12,3 L14,7 L12,11 L8,13 L10,10.5 L11,7 L10,3.5 Z"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <rect x="0" y="0" width="6" height="6"/>
      <rect x="8" y="0" width="6" height="6"/>
      <rect x="0" y="8" width="6" height="6"/>
      <rect x="8" y="8" width="6" height="6"/>
    </svg>
  )
}

function IconDiamond() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="6.5,0 13,7 6.5,14 0,7"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="7,0.5 9.5,3 9.5,6 7,8.5 4.5,6 4.5,3"/>
      <path d="M1,14 L3.5,8.5 H10.5 L13,14 Z"/>
    </svg>
  )
}

function IconHex() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="7,0.5 13,3.5 13,10.5 7,13.5 1,10.5 1,3.5"/>
    </svg>
  )
}

interface Props {
  isAdminUser?: boolean;
}

const ADMIN_LINKS = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/collections', label: 'Коллекции' },
  { href: '/admin/media', label: 'Медиа' },
  { href: '/admin/texts', label: 'Тексты' },
  { href: '/admin/site', label: 'Настройки сайта' },
  { href: '/admin/emojis', label: 'Эмодзи' },
];

interface Collection { slug: string; name: string; types?: string[] }

export default function Header({ isAdminUser = false }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [menuUser, setMenuUser] = useState<{ name: string; level: number } | null>(null);
  const menuHistoryPushed = useRef(false);

  function closeMenu() {
    if (menuHistoryPushed.current) {
      menuHistoryPushed.current = false;
      history.back();
    } else {
      setMenuOpen(false);
    }
  }

  // Fetch current user for burger menu display
  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setMenuUser(d.user ?? null))
      .catch(() => {});
  }, []);

  // Eager-load collections on mount so they're ready when menu opens
  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.ok ? r.json() : { collections: [] })
      .then(d => { setCollections(d.collections ?? []); setCollectionsLoading(false); })
      .catch(() => setCollectionsLoading(false));
  }, []);

  // Sync theme icon with current theme
  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.dataset.theme === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Sticky + backdrop-filter on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // iOS-safe scroll lock when menu open
  useEffect(() => {
    if (menuOpen) {
      const y = window.scrollY;
      document.body.style.top = `-${y}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      const top = parseFloat(document.body.style.top || '0');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (top) window.scrollTo(0, -top);
    }
    return () => {
      const top = parseFloat(document.body.style.top || '0');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (top) window.scrollTo(0, -top);
    };
  }, [menuOpen]);

  // History entry for Android back gesture
  useEffect(() => {
    if (!menuOpen) return;
    history.pushState({ menu: true }, '');
    menuHistoryPushed.current = true;
    const onPop = () => { menuHistoryPushed.current = false; setMenuOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  function toggle(section: string) {
    setExpanded(v => v === section ? null : section);
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: scrolled ? 'var(--header-scrolled-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px) saturate(1.4)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
          <Link href="/" aria-label="На главную">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-61.svg" alt="THREEP Logo" className="theme-img h-7 sm:h-9 w-auto flex-shrink-0" />
          </Link>
          {/* Center logo text — hidden on mobile */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-text-63.svg" alt="THREEP" className="theme-img hidden xl:block h-5 sm:h-6 w-auto absolute left-1/2 -translate-x-1/2" />

          {/* Icons — on mobile spread evenly across a fixed width, on desktop tight gap */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={s.themeBadge}
              aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {isDark ? <BrutalSun /> : <BrutalMoon />}
              <span>{isDark ? 'LIGHT' : 'DARK'}</span>
            </button>

            {/* User button */}
            <UserButton />

            {/* Cart icon — always visible */}
            <button onClick={() => setOpen(true)} className={`relative flex items-center justify-center w-9 h-9 rounded-lg ${s.navBtn}`} aria-label="Корзина">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M2,5 L14,5 L12.5,14 L3.5,14 Z"/>
                <path d="M5,5 L5,3 L11,3 L11,5"/>
              </svg>
              {count > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full ${s.cartBadge}`}>{count}</span>
              )}
            </button>

            {/* Burger — all breakpoints */}
            <button
              onClick={menuOpen ? closeMenu : openMenu}
              className={`flex flex-col items-center justify-center w-9 h-9 rounded-lg gap-1.5 ${s.navBtn}`}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <span className={`${s.burgerLine} ${menuOpen ? s.burgerLine1Open : ''}`} />
              <span className={`${s.burgerLine} ${menuOpen ? s.burgerLine2Open : ''}`} />
              <span className={`${s.burgerLine} ${menuOpen ? s.burgerLine3Open : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen overlay */}
      <div
        className={s.overlay}
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          clipPath: menuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
        }}
        onClick={(e) => e.target === e.currentTarget && closeMenu()}
      >
        <button className={s.closeBtn} onClick={closeMenu} aria-label="Закрыть меню">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
        <nav className={s.nav}>

          {/* Burger user info */}
          {menuUser && (
            <div className={s.menuUserInfo}>
              <span className={s.menuUserName}>{menuUser.name}</span>
              <span className={s.menuUserLevel}>LVL {menuUser.level}</span>
            </div>
          )}

          {/* Коллекции — accordion */}
          <div className={s.accordion}>
            <button className={s.navLink} onClick={() => toggle('collections')}>
              <IconGrid /> Коллекции <span className={`${s.arrow} ${expanded === 'collections' ? s.arrowOpen : ''}`}>▸</span>
            </button>
            <div className={`${s.sub} ${expanded === 'collections' ? s.subOpen : ''}`}>
              <Link href="/#catalog" onClick={() => setMenuOpen(false)} className={s.subLink}>— Все</Link>
              {collectionsLoading
                ? <span className={s.subLink} style={{ opacity: 0.3, cursor: 'default' }}>...</span>
                : collections.map(c => (
                  <div key={c.slug}>
                    <Link href={`/#catalog`} onClick={() => setMenuOpen(false)} className={s.subLink}>— {c.name}</Link>
                    {c.types?.map(type => (
                      <Link key={type} href={`/#catalog`} onClick={() => setMenuOpen(false)} className={s.subLinkType}>{type}</Link>
                    ))}
                  </div>
                ))
              }
            </div>
          </div>

          {/* Инфа */}
          <Link href="/info" onClick={() => setMenuOpen(false)} className={s.navLink}>
            <IconDiamond /> Инфа
          </Link>

          {/* Личный кабинет */}
          <Link href="/account" onClick={() => setMenuOpen(false)} className={s.navLink}>
            <IconUser /> Кабинет
          </Link>

          {/* Admin accordion */}
          {isAdminUser && (
            <div className={s.accordion}>
              <div className={s.adminDivider}>Admin</div>
              <button className={`${s.navLink} ${s.navLinkAdmin}`} onClick={() => toggle('admin')}>
                <IconHex /> Панель <span className={`${s.arrow} ${expanded === 'admin' ? s.arrowOpen : ''}`}>▸</span>
              </button>
              <div className={`${s.sub} ${expanded === 'admin' ? s.subOpen : ''}`}>
                {ADMIN_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={s.subLink}>{label}</Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer links */}
        <div className={s.overlayFooter}>
          <Link href="/privacy" onClick={() => setMenuOpen(false)} className={s.footerLink}>Политика конфиденциальности</Link>
        </div>
      </div>
    </>
  );
}
