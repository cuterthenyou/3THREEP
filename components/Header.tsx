'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import s from './Header.module.css';

interface Props {
  isAdminUser?: boolean;
}

const ADMIN_LINKS = [
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/collections', label: 'Коллекции' },
  { href: '/admin/media', label: 'Медиа' },
];

export default function Header({ isAdminUser = false }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const { count, setOpen } = useCart();
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const footer = document.querySelector('footer');
    if (!header || !footer) return;

    header.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out';

    const handleScroll = () => {
      const footerRect = footer.getBoundingClientRect();
      const footerVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;

      if (footerVisible) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
        if (window.scrollY > 50) {
          header.style.backgroundColor = '#A9342A';
        } else {
          header.style.backgroundColor = 'transparent';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!adminOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center justify-between px-8 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-61.svg" alt="THREEP Logo" className="h-8 sm:h-12 w-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-text-63.svg"
          alt="THREEP"
          className="h-4 sm:h-8 w-auto absolute left-1/2 -translate-x-1/2"
        />
        <div className="flex items-center gap-3">
          {isAdminUser && (
            <div ref={adminRef} className="relative">
              <button
                onClick={() => setAdminOpen((v) => !v)}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`}
                aria-label="Панель администратора"
                title="Панель администратора"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              </button>

              {adminOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden"
                  style={{
                    background: '#1a0808',
                    border: '1px solid rgba(242,151,116,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  <div
                    className="px-3 py-2 text-xs uppercase tracking-widest"
                    style={{
                      color: '#F29774',
                      opacity: 0.4,
                      fontFamily: "'ONDER', sans-serif",
                      borderBottom: '1px solid rgba(242,151,116,0.1)',
                    }}
                  >
                    Admin
                  </div>
                  {ADMIN_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(242,151,116,0.08)]"
                      style={{
                        color: '#F29774',
                        fontFamily: "'Involve', sans-serif",
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link
            href="/account"
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`}
            aria-label="Личный кабинет"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          <button
            onClick={() => setOpen(true)}
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`}
            aria-label="Корзина"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full ${s.cartBadge}`}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
