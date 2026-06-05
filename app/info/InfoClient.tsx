'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconBrandVk,
  IconBrandTelegram,
  IconMail,
  IconBrandTiktok,
  IconBrandInstagram,
} from '@tabler/icons-react'

export type InfoContent = {
  tab1_label: string
  tab2_label: string
  tab3_label: string
  delivery_intro: string
  payment_heading: string
  payment_text: string
  delivery_heading: string
  delivery_text: string
  delivery_note: string
  write_heading: string
  vk_label: string
  vk_url: string
  vk_handle: string
  tg_label: string
  tg_url: string
  tg_handle: string
  mail_label: string
  mail_email: string
  follow_heading: string
  vk_community_url: string
  vk_community_handle: string
  tiktok_url: string
  tiktok_handle: string
  instagram_url: string
  instagram_handle: string
  contacts_meta_disclaimer: string
  location_heading: string
  location_text: string
  what_heading: string
  what_text: string
  what_subtext: string
  how_heading: string
  how_text: string
}

export const INFO_DEFAULTS: InfoContent = {
  tab1_label: 'Отгрузка',
  tab2_label: 'Связь',
  tab3_label: 'Суть',
  delivery_intro: 'После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.',
  payment_heading: 'Оплата',
  payment_text: 'Перевод на карту — СБП, Tinkoff, Сбер.',
  delivery_heading: 'Доставка',
  delivery_text: 'СДЭК, Почта России, Boxberry — по всей России.',
  delivery_note: 'Срок обработки 1–3 рабочих дня. Стоимость согласовывается в чате заказа.',
  write_heading: 'Написать нам',
  vk_label: 'VK',
  vk_url: 'https://vk.me/3threep_shop',
  vk_handle: 'vk.me/3threep_shop',
  tg_label: 'TG',
  tg_url: 'http://t.me/arasuka333',
  tg_handle: '@arasuka333',
  mail_label: 'MAIL',
  mail_email: '3threep.work@gmail.com',
  follow_heading: 'Следить за нами',
  vk_community_url: 'https://vk.com/3threep_shop',
  vk_community_handle: 'vk.com/3threep_shop',
  tiktok_url: 'https://www.tiktok.com/@3threep.shop',
  tiktok_handle: '@3threep.shop',
  instagram_url: 'https://www.instagram.com/3threep.shop/',
  instagram_handle: '@3threep.shop',
  contacts_meta_disclaimer: '* Meta признана экстремистской организацией в РФ',
  location_heading: 'Где мы',
  location_text: 'Пермь, Россия. Made in Russia.',
  what_heading: 'Что мы',
  what_text: 'THREEP — экспериментальный уличный бренд. Атмосфера, визуальный язык, смешанная эстетика.',
  what_subtext: 'Не мода — ощущение.',
  how_heading: 'Как мы делаем',
  how_text: 'Каждая вещь — это ручная работа. Хлор, ткань, история. Нет двух одинаковых.',
}

type TabId = 'delivery' | 'contacts' | 'about'

function SocialRow({
  href,
  icon,
  handle,
  last = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  handle: string
  last?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.7rem 0',
        borderBottom: last ? 'none' : '1px solid var(--border)',
        textDecoration: 'none',
        color: 'var(--accent)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span style={{ color: 'var(--accent)', opacity: 0.75, flexShrink: 0, display: 'flex' }}>{icon}</span>
      <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.88rem' }}>{handle}</span>
    </a>
  )
}

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.7rem', letterSpacing: '0.16em', opacity: 0.65, marginBottom: '0.6rem', textTransform: 'uppercase', color: 'var(--accent)' }}>{label}</p>
      {children}
    </div>
  )
}

export default function InfoClient({ content }: { content: InfoContent }) {
  const c = content
  const tabs: { id: TabId; label: string }[] = [
    { id: 'delivery', label: c.tab1_label },
    { id: 'contacts', label: c.tab2_label },
    { id: 'about',    label: c.tab3_label },
  ]
  const [tab, setTab] = useState<TabId>('delivery')

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontFamily: "var(--font-onder)", fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0.4, marginBottom: '2.5rem' }}>
          ← Главная
        </Link>

        <h1 style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: 'clamp(2rem, 8vw, 3.2rem)', marginBottom: '0.5rem', letterSpacing: '0.05em', lineHeight: 1 }}>
          ИНФА
        </h1>
        <div style={{ height: '2px', background: 'var(--accent)', opacity: 0.4, marginBottom: '2rem', width: '3rem' }} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.4rem 1rem',
                fontFamily: "var(--font-onder)",
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'box-shadow 0.12s, transform 0.1s, opacity 0.15s',
                WebkitTapHighlightColor: 'transparent',
                ...(tab === t.id
                  ? { background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)', boxShadow: '2px 2px 0 var(--accent)' }
                  : { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', boxShadow: '2px 2px 0 var(--border)', opacity: 0.55 }
                ),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)", fontSize: '0.9rem', lineHeight: 1.8 }}>

          {tab === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <p style={{ opacity: 0.88 }}>{c.delivery_intro}</p>
              <InfoSection label={c.payment_heading}>
                <p style={{ opacity: 0.88 }}>{c.payment_text}</p>
              </InfoSection>
              <InfoSection label={c.delivery_heading}>
                <p style={{ opacity: 0.88 }}>{c.delivery_text}</p>
                <p style={{ opacity: 0.5, fontSize: '0.82rem', marginTop: '0.4rem' }}>{c.delivery_note}</p>
              </InfoSection>
            </div>
          )}

          {tab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.6rem', letterSpacing: '0.16em', opacity: 0.4, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{c.write_heading}</p>
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <SocialRow href={c.vk_url} icon={<IconBrandVk size={18} />} label={c.vk_label} handle={c.vk_handle} />
                  <SocialRow href={c.tg_url} icon={<IconBrandTelegram size={18} />} label={c.tg_label} handle={c.tg_handle} />
                  <SocialRow href={`mailto:${c.mail_email}`} icon={<IconMail size={18} />} label={c.mail_label} handle={c.mail_email} last />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.6rem', letterSpacing: '0.16em', opacity: 0.4, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{c.follow_heading}</p>
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <SocialRow href={c.vk_community_url} icon={<IconBrandVk size={18} />} label="VK" handle={c.vk_community_handle} />
                  <SocialRow href={c.tiktok_url} icon={<IconBrandTiktok size={18} />} label="TT" handle={c.tiktok_handle} />
                  <SocialRow href={c.instagram_url} icon={<IconBrandInstagram size={18} />} label="IG*" handle={c.instagram_handle} last />
                </div>
                <p style={{ fontSize: '0.7rem', opacity: 0.3, marginTop: '0.75rem', fontFamily: "var(--font-involve)" }}>{c.contacts_meta_disclaimer}</p>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <InfoSection label={c.location_heading}>
                <p style={{ opacity: 0.88 }}>{c.location_text}</p>
              </InfoSection>
              <InfoSection label={c.what_heading}>
                <p style={{ opacity: 0.88 }}>{c.what_text}</p>
                <p style={{ opacity: 0.45, fontSize: '0.82rem', marginTop: '0.5rem', fontStyle: 'italic' }}>{c.what_subtext}</p>
              </InfoSection>
              <InfoSection label={c.how_heading}>
                <p style={{ opacity: 0.88 }}>{c.how_text}</p>
              </InfoSection>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
