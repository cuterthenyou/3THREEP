'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { toggleTheme } from '@/lib/theme';
import { IconSun, IconMoon2 } from '@tabler/icons-react';
import s from './Header.module.css';

interface Props {
  isAdminUser?: boolean;
}

const ADMIN_LINKS = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/media', label: 'Медиа' },
];

interface Collection { slug: string; name: string }

export default function Header({ isAdminUser = false }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDark, setIsDark] = useState(false);
  const collectionsLoaded = useRef(false);
  const menuHistoryPushed = useRef(false);

  function closeMenu() {
    if (menuHistoryPushed.current) {
      menuHistoryPushed.current = false;
      history.back();
    } else {
      setMenuOpen(false);
    }
  }

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
    const header = headerRef.current;
    const footer = document.querySelector('footer');
    if (!header || !footer) return;
    header.style.transition = 'transform 0.3s ease, backdrop-filter 0.3s ease';

    const onScroll = () => {
      const footerVisible = footer.getBoundingClientRect().top < window.innerHeight;
      if (footerVisible) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
        setScrolled(window.scrollY > 50);
      }
    };
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

  // Load collections lazily on first open
  const openMenu = useCallback(() => {
    setMenuOpen(true);
    if (!collectionsLoaded.current) {
      collectionsLoaded.current = true;
      fetch('/api/collections')
        .then(r => r.ok ? r.json() : { collections: [] })
        .then(d => setCollections(d.collections ?? []))
        .catch(() => {});
    }
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
            <img src="/images/logo-61.svg" alt="THREEP Logo" className="theme-img h-8 sm:h-12 w-auto flex-shrink-0" />
          </Link>
          {/* Center logo text — hidden on mobile */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-text-63.svg" alt="THREEP" className="theme-img hidden sm:block h-8 w-auto absolute left-1/2 -translate-x-1/2" />

          {/* Icons — on mobile spread evenly across a fixed width, on desktop tight gap */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Theme toggle — pill badge */}
            <button
              onClick={toggleTheme}
              className={s.themeBadge}
              aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {isDark ? <IconSun size={12} /> : <IconMoon2 size={12} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Cart icon — always visible */}
            <button onClick={() => setOpen(true)} className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`} aria-label="Корзина">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
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

          {/* Коллекции — accordion */}
          <div className={s.accordion}>
            <button className={s.navLink} onClick={() => toggle('collections')}>
              Коллекции <span className={`${s.arrow} ${expanded === 'collections' ? s.arrowOpen : ''}`}>▸</span>
            </button>
            <div className={`${s.sub} ${expanded === 'collections' ? s.subOpen : ''}`}>
              {collections.length === 0
                ? <Link href="/#catalog" onClick={() => setMenuOpen(false)} className={s.subLink}>Все коллекции</Link>
                : collections.map(c => (
                    <Link key={c.slug} href={`/?collection=${c.slug}`} onClick={() => setMenuOpen(false)} className={s.subLink}>{c.name}</Link>
                  ))
              }
            </div>
          </div>

          {/* Инфа */}
          <Link href="/info" onClick={() => setMenuOpen(false)} className={s.navLink}>Инфа</Link>

          {/* Личный кабинет */}
          <Link href="/account" onClick={() => setMenuOpen(false)} className={s.navLink}>Личный кабинет</Link>

          {/* Admin accordion */}
          {isAdminUser && (
            <div className={s.accordion}>
              <div className={s.adminDivider}>Admin</div>
              <button className={`${s.navLink} ${s.navLinkSmall}`} onClick={() => toggle('admin')}>
                Панель управления <span className={`${s.arrow} ${expanded === 'admin' ? s.arrowOpen : ''}`}>▸</span>
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
