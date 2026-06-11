import Link from 'next/link';
import { queryOne } from '@/lib/db'
import MarqueeTicker from './MarqueeTicker'
import s from './Footer.module.css'

const TICKER_DEFAULTS = [
  'THREEP — ЭТО СОСТОЯНИЕ ДУШИ',
  'НОВАЯ ДРОПА УЖЕ БЛИЗКО',
  'STREETWEAR ДЛЯ ТЕХ КТО ЧУВСТВУЕТ А НЕ ПРОСТО НОСИТ',
  'СДЕЛАНО ПОД ВЛИЯНИЕМ АТМОСФЕРЫ',
  'КАЖДАЯ ВЕЩЬ — ЭТО ИСТОРИЯ',
  'UNDERGROUND. ЭКСПЕРИМЕНТАЛЬНО. ЖИВО.',
  'ЕСЛИ ВИДИШЬ ЭТО — ТЫ УЖЕ ЧАСТЬ THREEP',
]

export type FooterContent = {
  contact_heading: string
  contact_subtext: string
  vk_direct_url: string
  tg_url: string
  follow_heading: string
  follow_subtext: string
  vk_community_url: string
  tiktok_url: string
  instagram_url: string
  tg_community_url: string
  meta_disclaimer: string
  copyright: string
}

export const FOOTER_DEFAULTS: FooterContent = {
  contact_heading: 'Пиши ёпта',
  contact_subtext: 'Хочешь заказать, есть вопрос или просто хочешь поговорить — пиши напрямую',
  vk_direct_url: 'https://vk.me/3threep_shop',
  tg_url: 'http://t.me/arasuka333',
  follow_heading: 'Смотри чё творим',
  follow_subtext: 'Следи за нами — там самое свежее',
  vk_community_url: 'https://vk.com/3threep_shop',
  tiktok_url: 'https://www.tiktok.com/@3threep.shop',
  instagram_url: 'https://www.instagram.com/3threep.shop/',
  tg_community_url: 'https://t.me/threep_shop',
  meta_disclaimer: '*Meta Platforms признана экстремистской организацией в РФ',
  copyright: '© 2026 THREEP. All rights reserved. Custom streetwear for the bold.',
}

const VKIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.712-1.033-1.01-1.49-.865-1.49.314v1.405c0 .38-.12.608-1.13.608-1.73 0-3.627-.89-4.966-2.55-2.017-2.44-2.564-4.277-2.564-4.654 0-.196.072-.38.374-.38h1.744c.282 0 .39.135.5.457.547 1.586 1.461 2.967 1.838 2.967.14 0 .207-.065.207-.42V9.742c-.043-.75-.447-.812-.447-1.08 0-.13.107-.26.282-.26h2.746c.233 0 .315.124.315.392v3.54c0 .23.103.313.166.313.14 0 .257-.083.515-.342 1.59-1.77 2.724-4.5 2.724-4.5.078-.196.24-.382.521-.382h1.744c.524 0 .638.27.524.52-.438 1.01-2.93 5.01-2.93 5.01-.116.196-.158.285 0 .502.116.163.494.502.747.805.494.588.878 1.082 1.022 1.43.19.446-.042.67-.512.67z" />
  </svg>
)

const TGIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.918 14.04l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.898.546z" />
  </svg>
)

const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
)

const IGIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className={`w-11 h-11 flex items-center justify-center ${s.socialBtn}`}>
      {children}
    </a>
  )
}

export default async function Footer() {
  let content = FOOTER_DEFAULTS
  let tickerTexts: string[] = TICKER_DEFAULTS
  try {
    const [footerRow, tickerRow] = await Promise.all([
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'footer_content'`),
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'ticker_texts'`),
    ])
    if (footerRow?.value) content = { ...FOOTER_DEFAULTS, ...JSON.parse(footerRow.value) }
    if (tickerRow?.value) tickerTexts = JSON.parse(tickerRow.value)
  } catch { /* table may not exist yet */ }

  return (
    <footer className="py-10 sm:py-14" id="footer">

      <div className="px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

            {/* Card 1 — contact us */}
            <div className={`flex-1 flex flex-col items-center justify-center gap-5 px-5 py-8 sm:px-8 sm:py-10 rounded-[10px] ${s.card}`}>
              <h2 className={s.heading}>{content.contact_heading}</h2>
              <p className={`text-center ${s.subtitle}`}>
                {content.contact_subtext}
              </p>
              <div className="flex items-center gap-3">
                <SocialBtn href={content.vk_direct_url} label="VK"><VKIcon /></SocialBtn>
                <SocialBtn href={content.tg_url} label="Telegram"><TGIcon /></SocialBtn>
              </div>
            </div>

            {/* Card 2 — follow us */}
            <div className={`flex-1 flex flex-col items-center justify-center gap-5 px-5 py-8 sm:px-8 sm:py-10 rounded-[10px] ${s.card}`}>
              <h2 className={s.heading}>{content.follow_heading}</h2>
              <p className={`text-center ${s.subtitle}`}>
                {content.follow_subtext}
              </p>
              <div className="flex items-center gap-3">
                <SocialBtn href={content.vk_community_url} label="VK сообщество"><VKIcon /></SocialBtn>
                <SocialBtn href={content.tiktok_url} label="TikTok"><TikTokIcon /></SocialBtn>
                <SocialBtn href={content.instagram_url} label="Instagram*"><IGIcon /></SocialBtn>
                <SocialBtn href={content.tg_community_url} label="Telegram канал"><TGIcon /></SocialBtn>
              </div>
              <p className={`text-center ${s.disclaimer}`}>
                {content.meta_disclaimer}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Marquee ticker — full viewport width */}
      <div className="mt-6">
        <MarqueeTicker texts={tickerTexts} />
      </div>

      {/* Copyright + legal */}
      <div className="px-6 sm:px-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
          <p className={`text-center ${s.copyright}`}>
            {content.copyright}
          </p>
          <Link href="/privacy" className={s.privacyLink}>
            Политика конфиденциальности
          </Link>
        </div>
      </div>

    </footer>
  )
}
