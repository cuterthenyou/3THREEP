'use client'

import { useState } from 'react'
import Link from 'next/link'

const TABS = [
  { id: 'delivery', label: 'Отгрузка' },
  { id: 'contacts', label: 'Связь' },
  { id: 'about',    label: 'Суть' },
] as const

type TabId = typeof TABS[number]['id']

export default function InfoPage() {
  const [tab, setTab] = useState<TabId>('delivery')

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0.5, marginBottom: '2rem' }}>
          ← На главную
        </Link>

        <h1 style={{ color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
          ИНФА
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.5rem 1rem',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                opacity: tab === t.id ? 1 : 0.45,
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
        <div style={{ color: 'var(--text)', fontFamily: "'Involve', sans-serif", fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.85 }}>

          {tab === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p>После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.</p>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.35rem' }}>ОПЛАТА</p>
                <p>Перевод на карту — СБП, Tinkoff, Сбер.</p>
              </div>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.35rem' }}>ДОСТАВКА</p>
                <p>СДЭК, Почта России, Boxberry — по всей России. Срок обработки заказа 1–3 рабочих дня. Стоимость доставки согласовывается в чате заказа.</p>
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.75rem' }}>НАПИСАТЬ НАМ</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="https://vk.me/3threep_shop" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>VK</span>
                    vk.me/3threep_shop
                  </a>
                  <a href="http://t.me/arasuka333" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>TG</span>
                    @arasuka333
                  </a>
                  <a href="mailto:3threep.work@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>MAIL</span>
                    3threep.work@gmail.com
                  </a>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.75rem' }}>СЛЕДИТЬ ЗА НАМИ</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="https://vk.com/3threep_shop" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>VK</span>
                    vk.com/3threep_shop
                  </a>
                  <a href="https://www.tiktok.com/@3threep.shop" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>TT</span>
                    @3threep.shop
                  </a>
                  <a href="https://www.instagram.com/3threep.shop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ opacity: 0.5, fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em' }}>IG*</span>
                    @3threep.shop
                  </a>
                </div>
                <p style={{ fontSize: '0.72rem', opacity: 0.4, marginTop: '1rem' }}>*Meta признана экстремистской организацией в РФ</p>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>ГДЕ МЫ</p>
                <p>Пермь, Россия. Made in Russia.</p>
              </div>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>ЧТО МЫ</p>
                <p>THREEP — экспериментальный уличный бренд. Атмосфера, визуальный язык, смешанная эстетика. Не мода — ощущение.</p>
              </div>
              <div>
                <p style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>КАК МЫ ДЕЛАЕМ</p>
                <p>Каждая вещь — это ручная работа. Хлор, ткань, история. Нет двух одинаковых.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
