'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { toggleTheme } from '@/lib/theme';
import UserButton from './UserButton';
import ThemedLogo from './ThemedLogo';
import { PALETTES } from '@/lib/palettes';
import NotificationBell from './NotificationBell';
import ThemeIcon from './ThemeIcon';
import s from './Header.module.css';

function IconGear() {
  // Брутальная зубчатая шестерёнка (залитые зубья + вырез по центру)
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ shapeRendering: 'geometricPrecision' }}>
      <path d="M13.4 2l.5 2.5 2 .8 2.2-1.2 1.8 1.8-1.2 2.2.8 2 2.5.5v2.6l-2.5.5-.8 2 1.2 2.2-1.8 1.8-2.2-1.2-2 .8-.5 2.5h-2.6l-.5-2.5-2-.8-2.2 1.2L2.6 17l1.2-2.2-.8-2L0.5 12.3V9.7l2.5-.5.8-2L2.6 5l1.8-1.8 2.2 1.2 2-.8.5-2.5z"/>
      <circle cx="11.8" cy="11" r="3.1" fill="var(--bg)" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <rect x="0" y="0" width="6" height="6"/>
      <rect x="8" y="0" width="6" height="6"/>
      <rect x="0" y="8" width="6" height="6"/>
      <rect x="8" y="8" width="6" height="6"/>
    </svg>
  )
}

function IconDiamond() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 13 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="6.5,0 13,7 6.5,14 0,7"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="7,0.5 9.5,3 9.5,6 7,8.5 4.5,6 4.5,3"/>
      <path d="M1,14 L3.5,8.5 H10.5 L13,14 Z"/>
    </svg>
  )
}

function IconHex() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.55, flexShrink: 0 }}>
      <polygon points="7,0.5 13,3.5 13,10.5 7,13.5 1,10.5 1,3.5"/>
    </svg>
  )
}

interface CustomItem { label: string; href: string }

interface Props {
  isAdminUser?: boolean;
  initialCollections?: Collection[];
  customItems?: CustomItem[];
  logoIconUrl?: string | null;
  logoTextUrl?: string | null;
  menuFooterText?: string | null;
}

const ADMIN_LINKS = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/collections', label: 'Коллекции' },
  { href: '/admin/menu', label: 'Меню' },
  { href: '/admin/media', label: 'Медиа' },
  { href: '/admin/site', label: 'Настройки сайта' },
  { href: '/admin/themes', label: 'Темы' },
  { href: '/admin/game', label: 'Игра' },
  { href: '/admin/texts', label: 'Тексты' },
  { href: '/admin/emojis', label: 'Эмодзи' },
  { href: '/admin/newsletter', label: 'Рассылка' },
];

interface Collection { slug: string; name: string; types?: string[]; href?: string }

export default function Header({ isAdminUser = false, initialCollections, customItems: initialCustomItems, logoIconUrl: initialLogoIconUrl, logoTextUrl: initialLogoTextUrl, menuFooterText }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>(initialCollections ?? []);
  const [customItems, setCustomItems] = useState<CustomItem[]>(initialCustomItems ?? []);
  const [collectionsLoading, setCollectionsLoading] = useState(!initialCollections);
  const [theme, setTheme] = useState<string>('dark');
  const [tripDrunk, setTripDrunk] = useState(1);
  const [logoIconUrl, setLogoIconUrl] = useState<string | null>(initialLogoIconUrl ?? null);
  const [logoTextUrl, setLogoTextUrl] = useState<string | null>(initialLogoTextUrl ?? null);
  const [heroSpeed, setHeroSpeed] = useState<number | null>(null);
  const [aimSens, setAimSens] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const menuHistoryPushed = useRef(false);

  function closeMenu() {
    if (menuHistoryPushed.current) {
      menuHistoryPushed.current = false;
      history.back();
    } else {
      setMenuOpen(false);
    }
  }

  // Load collections — skip fetch if SSR already provided them.
  // /api/collections appends custom items as pseudo-collections (slug `_custom_*`);
  // split them out so they render as top-level menu items, not inside «Коллекции».
  useEffect(() => {
    if (initialCollections && initialCollections.length > 0) return;
    fetch('/api/collections')
      .then(r => r.ok ? r.json() : { collections: [] })
      .then(d => {
        const all: Collection[] = d.collections ?? [];
        const real = all.filter(c => !String(c.slug).startsWith('_custom_'));
        const custom = all
          .filter(c => String(c.slug).startsWith('_custom_'))
          .map(c => ({ label: c.name, href: c.href ?? '#' }));
        setCollections(real);
        if (custom.length) setCustomItems(custom);
        setCollectionsLoading(false);
      })
      .catch(() => setCollectionsLoading(false));
  }, [initialCollections]);

  // Sync theme icon + name with current theme (incl. trip)
  useEffect(() => {
    const read = () => {
      const t = document.documentElement.dataset.theme ?? 'dark';
      setTheme(t);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Trip «пьяность» (GTA-эффект): пользовательский множитель силы trip-эффектов
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('trip-drunk') ?? '');
    const v = isNaN(stored) ? 1 : stored;
    setTripDrunk(v);
    document.documentElement.style.setProperty('--trip-drunk', String(v));
  }, []);

  function setDrunk(v: number) {
    setTripDrunk(v);
    localStorage.setItem('trip-drunk', String(v));
    document.documentElement.style.setProperty('--trip-drunk', String(v));
  }

  // Sticky styling + direction-aware hide/reveal.
  // Прятать шапку начинаем ТОЛЬКО после конца hero-секции (граница — начало каталога);
  // пока в пределах hero — шапка всегда видна. На страницах без hero — порог небольшой.
  useEffect(() => {
    let lastY = window.scrollY;
    const heroEnd = () => {
      const catalog = document.getElementById('catalog');
      return catalog ? catalog.offsetTop - 80 : 140;
    };
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y > lastY + 5 && y > heroEnd()) setHidden(true);  // scroll down ПОСЛЕ hero → hide
      else if (y < lastY - 5) setHidden(false);             // scroll up → reveal
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Never hide the bar while the menu is open
  useEffect(() => { if (menuOpen) setHidden(false); }, [menuOpen]);

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

  // Open menu when navigated to /#menu (e.g. from the info page "В МЕНЮ" button)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#menu') {
      history.replaceState(null, '', window.location.pathname);
      openMenu();
    }
  }, [openMenu]);

  function toggle(section: string) {
    setExpanded(v => v === section ? null : section);
  }

  // Hero video playback speed — cycles through adequate values, persisted +
  // broadcast to the Hero component via a custom event.
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('hero-speed') ?? '');
    if (!isNaN(stored)) { setHeroSpeed(stored); return; }
    // fall back to the admin default exposed on --hero-speed
    const def = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-speed'));
    setHeroSpeed(isNaN(def) ? 1 : def);
  }, []);

  function setSpeed(v: number) {
    setHeroSpeed(v);
    localStorage.setItem('hero-speed', String(v));
    window.dispatchEvent(new CustomEvent('threep-hero-speed', { detail: v }));
  }

  // Чувствительность прицела (скорость следования кастом-курсора в игре)
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('threep-aim-sens') ?? '');
    if (!isNaN(stored)) setAimSens(stored);
  }, []);
  function setAim(v: number) {
    setAimSens(v);
    localStorage.setItem('threep-aim-sens', String(v));
    window.dispatchEvent(new CustomEvent('threep-aim-sens', { detail: v }));
  }

  // Show speed control only on the home page (where the hero video lives)
  const [onHome, setOnHome] = useState(false);
  useEffect(() => { setOnHome(window.location.pathname === '/'); }, []);

  // Close settings popover on outside click / Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSettingsOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [settingsOpen]);

  const fmtSpeed = (v: number) => `${v}×`.replace('.', ',');

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 ${s.headerBase} ${scrolled ? s.headerScrolled : s.headerTop} ${hidden ? s.headerHidden : ''}`}
      >
        {/* backdrop-filter blur на самом <header> (см. Header.module.css). */}
        <div className={`flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 ${s.headerRow}`}>
          <Link href="/" aria-label="На главную">
            {logoIconUrl ? (
              <ThemedLogo src={logoIconUrl} alt="THREEP Logo" className="h-7 sm:h-9" defaultRatio={1} />
            ) : (
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.1em', color: 'var(--accent)' }}>3P</span>
            )}
          </Link>
          {/* Center logo text — hidden on mobile */}
          {logoTextUrl && (
            <ThemedLogo src={logoTextUrl} alt="THREEP" className="hidden xl:block h-5 sm:h-6 absolute left-1/2 -translate-x-1/2" defaultRatio={5} />
          )}

          {/* Icons — on mobile spread evenly across a fixed width, on desktop tight gap */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Settings gear — тема + скорость видео в одном поповере (антизахламление) */}
            <div ref={settingsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(v => !v)}
                className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.navBtn}`}
                aria-label="Настройки"
                aria-expanded={settingsOpen}
              >
                <IconGear />
              </button>

              {settingsOpen && (
                <div className={s.settingsPanel}>
                  {/* Тема — на кнопке РЕАЛЬНО включённая тема (LIGHT/DARK/TRIP) */}
                  <div className={s.settingsRow}>
                    <span className={s.settingsLabel}>Тема</span>
                    <button onClick={toggleTheme} className={s.settingsToggle} aria-label="Сменить тему">
                      <ThemeIcon theme={theme} size={12} />
                      <span>{(PALETTES.find(p => p.key === theme)?.label) ?? theme.toUpperCase()}</span>
                    </button>
                  </div>

                  {/* Trip «пьяность» (GTA-эффект) — только в trip-теме */}
                  {theme === 'trip' && (
                    <div className={s.settingsRow}>
                      <span className={s.settingsLabel}>Пьяность (trip) · {tripDrunk.toFixed(1)}×</span>
                      <input
                        type="range" min={0} max={2} step={0.1} value={tripDrunk}
                        onChange={e => setDrunk(parseFloat(e.target.value))}
                        className={s.settingsRange}
                        aria-label="Сила пьяного эффекта"
                      />
                    </div>
                  )}

                  {/* Скорость видео — ползунок 0.1–2.5, только на главной */}
                  {onHome && heroSpeed != null && (
                    <div className={s.settingsRow}>
                      <span className={s.settingsLabel}>Скорость видео · {fmtSpeed(heroSpeed)}</span>
                      <input
                        type="range" min={0.1} max={2.5} step={0.05} value={heroSpeed}
                        onChange={e => setSpeed(parseFloat(e.target.value))}
                        className={s.settingsRange}
                        aria-label="Скорость видео в шапке"
                      />
                    </div>
                  )}

                  {/* Чувствительность прицела (для игры) */}
                  <div className={s.settingsRow}>
                    <span className={s.settingsLabel}>Чувствительность прицела · {aimSens.toFixed(2)}×</span>
                    <input
                      type="range" min={0.05} max={10} step={0.05} value={aimSens}
                      onChange={e => setAim(parseFloat(e.target.value))}
                      className={s.settingsRange}
                      aria-label="Чувствительность прицела для игры"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />

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
          <div className={s.navInner}>

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
                      <Link href={c.href ?? `/?category=${encodeURIComponent(c.slug)}`} onClick={() => setMenuOpen(false)} className={s.subLink}>— {c.name}</Link>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Кастомные пункты меню (из админки) — верхнеуровневые */}
            {customItems.map((item, i) => {
              const external = /^https?:\/\//i.test(item.href);
              return external ? (
                <a key={`ci-${i}`} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className={s.navLink}>
                  <IconDiamond /> {item.label}
                </a>
              ) : (
                <Link key={`ci-${i}`} href={item.href} onClick={() => setMenuOpen(false)} className={s.navLink}>
                  <IconDiamond /> {item.label}
                </Link>
              );
            })}

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
              <div className={s.navDivider}>
                <span className={s.navDividerLabel}>✦ ✦ ✦</span>
              </div>
            )}
            {isAdminUser && (
              <div className={s.accordion}>
                <button className={s.navLink} onClick={() => toggle('admin')}>
                  <IconHex /> Панель <span className={`${s.arrow} ${expanded === 'admin' ? s.arrowOpen : ''}`}>▸</span>
                </button>
                <div className={`${s.sub} ${expanded === 'admin' ? s.subOpen : ''}`}>
                  {ADMIN_LINKS.map(({ href, label }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={s.subLink}>{label}</Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </nav>

        {/* Footer links */}
        <div className={s.overlayFooter}>
          <span className={s.menuBrand}>{menuFooterText ?? '333 · РУССКО-НАРОДНЫЙ · СДЕЛАНО ХЛОРКОЙ'}</span>
          <Link href="/privacy" onClick={() => setMenuOpen(false)} className={s.footerLink}>Политика конфиденциальности</Link>
        </div>
      </div>
    </>
  );
}
