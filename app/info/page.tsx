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

const TABS = [
  { id: 'delivery', label: 'Отгрузка' },
  { id: 'contacts', label: 'Связь' },
  { id: 'about',    label: 'Суть' },
] as const

type TabId = typeof TABS[number]['id']

function SocialRow({
  href,
  icon,
  label,
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
        color: 'var(--text)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span style={{ color: 'var(--accent)', opacity: 0.8, flexShrink: 0, display: 'flex' }}>{icon}</span>
      <span style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.58rem', letterSpacing: '0.16em', opacity: 0.4, minWidth: '2.2rem', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: "'Involve', sans-serif", fontSize: '0.88rem' }}>{handle}</span>
    </a>
  )
}

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.6rem', letterSpacing: '0.16em', opacity: 0.4, marginBottom: '0.6rem', textTransform: 'uppercase' }}>{label}</p>
      {children}
    </div>
  )
}

export default function InfoPage() {
  const [tab, setTab] = useState<TabId>('delivery')

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0.4, marginBottom: '2.5rem' }}>
          ← Главная
        </Link>

        <h1 style={{ color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: 'clamp(2rem, 8vw, 3.2rem)', marginBottom: '0.5rem', letterSpacing: '0.05em', lineHeight: 1 }}>
          ИНФА
        </h1>
        <div style={{ height: '2px', background: 'var(--accent)', opacity: 0.25, marginBottom: '2rem', width: '3rem' }} />

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.55rem 1.1rem',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                opacity: tab === t.id ? 1 : 0.42,
                transition: 'opacity 0.15s, border-color 0.15s',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ color: 'var(--text)', fontFamily: "'Involve', sans-serif", fontSize: '0.9rem', lineHeight: 1.8 }}>

          {tab === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <p style={{ opacity: 0.75 }}>После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.</p>
              <InfoSection label="Оплата">
                <p style={{ opacity: 0.75 }}>Перевод на карту — СБП, Tinkoff, Сбер.</p>
              </InfoSection>
              <InfoSection label="Доставка">
                <p style={{ opacity: 0.75 }}>СДЭК, Почта России, Boxberry — по всей России.</p>
                <p style={{ opacity: 0.5, fontSize: '0.82rem', marginTop: '0.4rem' }}>Срок обработки 1–3 рабочих дня. Стоимость согласовывается в чате заказа.</p>
              </InfoSection>
            </div>
          )}

          {tab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.6rem', letterSpacing: '0.16em', opacity: 0.4, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Написать нам</p>
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <SocialRow href="https://vk.me/3threep_shop" icon={<IconBrandVk size={18} />} label="VK" handle="vk.me/3threep_shop" />
                  <SocialRow href="http://t.me/arasuka333" icon={<IconBrandTelegram size={18} />} label="TG" handle="@arasuka333" />
                  <SocialRow href="mailto:3threep.work@gmail.com" icon={<IconMail size={18} />} label="MAIL" handle="3threep.work@gmail.com" last />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.6rem', letterSpacing: '0.16em', opacity: 0.4, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Следить за нами</p>
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <SocialRow href="https://vk.com/3threep_shop" icon={<IconBrandVk size={18} />} label="VK" handle="vk.com/3threep_shop" />
                  <SocialRow href="https://www.tiktok.com/@3threep.shop" icon={<IconBrandTiktok size={18} />} label="TT" handle="@3threep.shop" />
                  <SocialRow href="https://www.instagram.com/3threep.shop/" icon={<IconBrandInstagram size={18} />} label="IG*" handle="@3threep.shop" last />
                </div>
                <p style={{ fontSize: '0.7rem', opacity: 0.3, marginTop: '0.75rem', fontFamily: "'Involve', sans-serif" }}>* Meta признана экстремистской организацией в РФ</p>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <InfoSection label="Где мы">
                <p style={{ opacity: 0.75 }}>Пермь, Россия. Made in Russia.</p>
              </InfoSection>
              <InfoSection label="Что мы">
                <p style={{ opacity: 0.75 }}>THREEP — экспериментальный уличный бренд. Атмосфера, визуальный язык, смешанная эстетика.</p>
                <p style={{ opacity: 0.45, fontSize: '0.82rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Не мода — ощущение.</p>
              </InfoSection>
              <InfoSection label="Как мы делаем">
                <p style={{ opacity: 0.75 }}>Каждая вещь — это ручная работа. Хлор, ткань, история. Нет двух одинаковых.</p>
              </InfoSection>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
