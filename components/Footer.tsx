import Link from 'next/link';
import { queryOne } from '@/lib/db'
import s from './Footer.module.css'

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
  meta_disclaimer: '*Meta Platforms признана экстремистской организацией в РФ',
  copyright: '© 2024 THREEP. All rights reserved. Custom streetwear for the bold.',
}

const VKIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0,3 L4,3 L7,10 L10,3 L14,3 L10,11.5 L14,16 L10,16 L7,10.5 L4,16 L0,16 L4,11.5 Z"/>
  </svg>
)

const TGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <polygon points="0,9 16,1 13,16 8,12 5,15 5,11 14,3 4,10"/>
  </svg>
)

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <rect x="5" y="2" width="3" height="10"/>
    <polygon points="8,2 15,0 15,5 8,5"/>
    <circle cx="4" cy="13" r="3.5"/>
  </svg>
)

const IGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="1" width="14" height="14"/>
    <circle cx="8" cy="8" r="3.5"/>
    <rect x="11" y="2.5" width="1.5" height="1.5" fill="currentColor" stroke="none"/>
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
  try {
    const row = await queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'footer_content'`)
    if (row?.value) content = { ...FOOTER_DEFAULTS, ...JSON.parse(row.value) }
  } catch { /* table may not exist yet */ }

  return (
    <footer className="py-10 sm:py-14 px-6 sm:px-8" id="footer">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

          {/* Card 1 — contact us */}
          <div className={`flex-1 flex flex-col items-center justify-center gap-5 px-8 py-10 rounded-[10px] ${s.card}`}>
            <h2 className={s.heading}>{content.contact_heading}</h2>
            <p className={`text-xs text-center ${s.subtitle}`}>
              {content.contact_subtext}
            </p>
            <div className="flex items-center gap-3">
              <SocialBtn href={content.vk_direct_url} label="VK"><VKIcon /></SocialBtn>
              <SocialBtn href={content.tg_url} label="Telegram"><TGIcon /></SocialBtn>
            </div>
          </div>

          {/* Card 2 — follow us */}
          <div className={`flex-1 flex flex-col items-center justify-center gap-5 px-8 py-10 rounded-[10px] ${s.card}`}>
            <h2 className={s.heading}>{content.follow_heading}</h2>
            <p className={`text-xs text-center ${s.subtitle}`}>
              {content.follow_subtext}
            </p>
            <div className="flex items-center gap-3">
              <SocialBtn href={content.vk_community_url} label="VK сообщество"><VKIcon /></SocialBtn>
              <SocialBtn href={content.tiktok_url} label="TikTok"><TikTokIcon /></SocialBtn>
              <SocialBtn href={content.instagram_url} label="Instagram*"><IGIcon /></SocialBtn>
            </div>
            <p className={`text-xs text-center ${s.disclaimer}`}>
              {content.meta_disclaimer}
            </p>
          </div>

        </div>

        {/* Copyright + legal */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className={`text-sm text-center ${s.copyright}`}>
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
