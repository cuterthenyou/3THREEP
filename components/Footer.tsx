import Link from 'next/link';
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className="py-10 sm:py-14 px-6 sm:px-8" id="footer">
      <div className="max-w-6xl mx-auto">

        {/* Two cards — mobile: contacts first (flex-col-reverse), desktop: image left, contacts right */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6">

          {/* Left card — image placeholder */}
          <div
            className={`flex-[3] min-h-[180px] sm:min-h-[265px] rounded-[10px] overflow-hidden ${s.card}`}
          >
            {/* TODO: replace with actual image */}
          </div>

          {/* Right card — contacts */}
          <div
            className={`flex-[2] flex flex-col items-center justify-center gap-6 px-8 py-10 rounded-[10px] ${s.card}`}
          >
            <h2
              className={s.heading}
            >
              Пиши ёпта
            </h2>

            <div className="flex items-center gap-3">
              <a
                href="https://t.me/threep_shop"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 flex items-center justify-center rounded-[6px] transition-opacity hover:opacity-75 ${s.socialBtn}`}
                aria-label="Telegram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#A9342A">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.918 14.04l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.898.546z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@3threep.shop"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 flex items-center justify-center rounded-[6px] transition-opacity hover:opacity-75 ${s.socialBtn}`}
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#A9342A">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/3threep.shop/"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 flex items-center justify-center rounded-[6px] transition-opacity hover:opacity-75 ${s.socialBtn}`}
                aria-label="Instagram*"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#A9342A">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <p
              className={`text-xs text-center max-w-xs ${s.disclaimer}`}
            >
              *Решением суда деятельность Meta Platforms и её социальных сетей признана экстремистской
            </p>
          </div>
        </div>

        {/* Copyright + legal links */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className={`text-sm text-center ${s.copyright}`}>
            © 2024 THREEP. All rights reserved. Custom streetwear for the bold.
          </p>
          <Link
            href="/privacy"
            className={s.privacyLink}
          >
            Политика конфиденциальности
          </Link>
        </div>

      </div>
    </footer>
  )
}
