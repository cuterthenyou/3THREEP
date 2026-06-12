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
import s from './info.module.css'

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
  tg_community_url: string
  tg_community_handle: string
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
  vk_handle: '@3threep_shop',
  tg_label: 'TG',
  tg_url: 'http://t.me/arasuka333',
  tg_handle: '@arasuka333',
  mail_label: 'MAIL',
  mail_email: '3threep.work@gmail.com',
  follow_heading: 'Следить за нами',
  vk_community_url: 'https://vk.com/3threep_shop',
  vk_community_handle: '@3threep_shop',
  tiktok_url: 'https://www.tiktok.com/@3threep.shop',
  tiktok_handle: '@3threep.shop',
  instagram_url: 'https://www.instagram.com/3threep.shop/',
  instagram_handle: '@3threep.shop',
  tg_community_url: 'https://t.me/threep_shop',
  tg_community_handle: '@threep_shop',
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

export default function InfoClient({ content }: { content: InfoContent }) {
  const c = content
  const tabs: { id: TabId; label: string }[] = [
    { id: 'delivery', label: c.tab1_label },
    { id: 'contacts', label: c.tab2_label },
    { id: 'about',    label: c.tab3_label },
  ]
  const [tab, setTab] = useState<TabId>('delivery')

  return (
    <main className={s.page}>

      {/* Cinematic hero header */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '3rem' }}>
            <Link href="/" className={s.backLink} style={{ marginBottom: 0 }}>← Главная</Link>
            <Link href="/#menu" className={s.backLink} style={{ marginBottom: 0, opacity: 0.5 }}>В МЕНЮ ↗</Link>
          </div>
          <span className={s.heading}>ИНФА</span>
          <div className={s.divider} />
          <p className={s.subhead}>Доставка · Контакты · О бренде</p>
        </div>
      </div>

      {/* Body */}
      <div className={s.body}>

        {/* Tabs */}
        <div className={s.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`${s.tabBtn} ${tab === t.id ? s.tabBtnActive : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={s.content}>

          {tab === 'delivery' && (
            <div className={s.sectionBlock}>
              <p className={s.text}>{c.delivery_intro}</p>
              <div>
                <span className={s.sectionLabel}>{c.payment_heading}</span>
                <p className={s.text}>{c.payment_text}</p>
              </div>
              <div>
                <span className={s.sectionLabel}>{c.delivery_heading}</span>
                <p className={s.text}>{c.delivery_text}</p>
                <p className={s.textNote}>{c.delivery_note}</p>
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className={s.socialGroup}>
              <div>
                <span className={s.socialGroupLabel}>{c.write_heading}</span>
                <div className={s.socialList}>
                  <a href={c.vk_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandVk size={18}/></span>
                    <span className={s.socialHandle}>{c.vk_handle}</span>
                  </a>
                  <a href={c.tg_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandTelegram size={18}/></span>
                    <span className={s.socialHandle}>{c.tg_handle}</span>
                  </a>
                  <a href={`mailto:${c.mail_email}`} className={s.socialRow}>
                    <span className={s.socialIcon}><IconMail size={18}/></span>
                    <span className={s.socialHandle}>{c.mail_email}</span>
                  </a>
                </div>
              </div>
              <div>
                <span className={s.socialGroupLabel}>{c.follow_heading}</span>
                <div className={s.socialList}>
                  <a href={c.vk_community_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandVk size={18}/></span>
                    <span className={s.socialHandle}>{c.vk_community_handle}</span>
                  </a>
                  <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandTiktok size={18}/></span>
                    <span className={s.socialHandle}>{c.tiktok_handle}</span>
                  </a>
                  <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandInstagram size={18}/></span>
                    <span className={s.socialHandle}>{c.instagram_handle}</span>
                  </a>
                  <a href={c.tg_community_url} target="_blank" rel="noopener noreferrer" className={s.socialRow}>
                    <span className={s.socialIcon}><IconBrandTelegram size={18}/></span>
                    <span className={s.socialHandle}>{c.tg_community_handle}</span>
                  </a>
                </div>
                <p className={s.disclaimer}>{c.contacts_meta_disclaimer}</p>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className={s.sectionBlock}>
              <div>
                <span className={s.sectionLabel}>{c.location_heading}</span>
                <p className={s.text}>{c.location_text}</p>
              </div>
              <div>
                <span className={s.sectionLabel}>{c.what_heading}</span>
                <p className={s.text}>{c.what_text}</p>
                <p className={s.textSub}>{c.what_subtext}</p>
              </div>
              <div>
                <span className={s.sectionLabel}>{c.how_heading}</span>
                <p className={s.text}>{c.how_text}</p>
              </div>
            </div>
          )}

        </div>
      </div>

    </main>
  )
}
