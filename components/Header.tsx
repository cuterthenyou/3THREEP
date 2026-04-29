'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import s from './Header.module.css'

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const { count, setOpen } = useCart()

  useEffect(() => {
    const header = headerRef.current
    const footer = document.querySelector('footer')
    if (!header || !footer) return

    header.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out'

    const handleScroll = () => {
      const footerRect = footer.getBoundingClientRect()
      const footerVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0

      if (footerVisible) {
        header.style.transform = 'translateY(-100%)'
      } else {
        header.style.transform = 'translateY(0)'
        if (window.scrollY > 50) {
          header.style.backgroundColor = '#A9342A'
        } else {
          header.style.backgroundColor = 'transparent'
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center justify-between px-8 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-61.svg"
          alt="THREEP Logo"
          className="h-8 sm:h-12 w-auto"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-text-63.svg"
          alt="THREEP"
          className="h-4 sm:h-8 w-auto absolute left-1/2 -translate-x-1/2"
        />
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`}
            aria-label="Личный кабинет"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-80 ${s.navBtn}`}
            aria-label="Корзина"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  )
}
