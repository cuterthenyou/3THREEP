'use client'

import { useState } from 'react'
import a from '../admin.module.css'
import { LABEL_STYLE_MUTED } from '../adminStyles'
import { AdminPageTitle } from '../components'

interface NavConfig {
  hiddenCollections: string[]
  customItems: { label: string; href: string }[]
  collectionsOrder: string[]
}

interface Props {
  allCollections: { slug: string; name: string }[]
  initialConfig: NavConfig
  initialFooterText?: string
}

const DEFAULT_MENU_FOOTER = '333 · РУССКО-НАРОДНЫЙ · СДЕЛАНО ХЛОРКОЙ'

const INPUT_STYLE = { background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.85rem' }
const CARD_STYLE = { background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: '3px', padding: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '1rem' }

export default function MenuClient({ allCollections, initialConfig, initialFooterText = '' }: Props) {
  const [config, setConfig] = useState<NavConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newHref, setNewHref] = useState('')
  const [footerText, setFooterText] = useState(initialFooterText)

  const orderedCollections = (() => {
    const ordered = config.collectionsOrder
      .map(slug => allCollections.find(c => c.slug === slug))
      .filter(Boolean) as typeof allCollections
    const rest = allCollections.filter(c => !config.collectionsOrder.includes(c.slug))
    return [...ordered, ...rest]
  })()

  function toggleHidden(slug: string) {
    setConfig(prev => ({
      ...prev,
      hiddenCollections: prev.hiddenCollections.includes(slug)
        ? prev.hiddenCollections.filter(s => s !== slug)
        : [...prev.hiddenCollections, slug],
    }))
    setSaved(false)
  }

  function moveUp(slug: string) {
    const slugs = orderedCollections.map(c => c.slug)
    const i = slugs.indexOf(slug)
    if (i <= 0) return
    const next = [...slugs]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setConfig(prev => ({ ...prev, collectionsOrder: next }))
    setSaved(false)
  }

  function moveDown(slug: string) {
    const slugs = orderedCollections.map(c => c.slug)
    const i = slugs.indexOf(slug)
    if (i >= slugs.length - 1) return
    const next = [...slugs]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setConfig(prev => ({ ...prev, collectionsOrder: next }))
    setSaved(false)
  }

  function addCustomItem() {
    const label = newLabel.trim()
    const href = newHref.trim()
    if (!label || !href) return
    setConfig(prev => ({ ...prev, customItems: [...prev.customItems, { label, href }] }))
    setNewLabel('')
    setNewHref('')
    setSaved(false)
  }

  function removeCustomItem(i: number) {
    setConfig(prev => ({ ...prev, customItems: prev.customItems.filter((_, idx) => idx !== i) }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/admin/nav-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }),
        fetch('/api/admin/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'menu_footer_text', value: footerText.trim() || DEFAULT_MENU_FOOTER }),
        }),
      ])
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-content" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AdminPageTitle>МЕНЮ</AdminPageTitle>
        <button onClick={save} disabled={saving} className={a.btn}>
          {saving ? 'Сохранение...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </div>

      {/* Collections visibility & order */}
      <div style={CARD_STYLE}>
        <p style={{ ...LABEL_STYLE_MUTED, fontSize: '0.65rem' }}>Коллекции в меню</p>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-involve)', fontSize: '0.75rem', opacity: 0.6 }}>
          Все активные коллекции подтягиваются автоматически. Скрой ненужные или измени порядок.
        </p>
        {orderedCollections.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem', opacity: 0.5 }}>
            Нет активных коллекций. Добавь товары с категорией в разделе Товары.
          </p>
        )}
        {orderedCollections.map((col, i) => {
          const hidden = config.hiddenCollections.includes(col.slug)
          return (
            <div key={col.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-2)', borderRadius: '2px', border: `1px solid ${hidden ? 'var(--border)' : 'var(--accent)'}`, opacity: hidden ? 0.45 : 1 }}>
              <button onClick={() => toggleHidden(col.slug)} className={a.btnSecondary}>
                {hidden ? 'Скрыт' : 'Виден'}
              </button>
              <span style={{ flex: 1, fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>{col.name}</span>
              <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5 }}>{col.slug}</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => moveUp(col.slug)} disabled={i === 0} className={a.btnSecondary}>↑</button>
                <button onClick={() => moveDown(col.slug)} disabled={i === orderedCollections.length - 1} className={a.btnSecondary}>↓</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom items */}
      <div style={CARD_STYLE}>
        <p style={{ ...LABEL_STYLE_MUTED, fontSize: '0.65rem' }}>Кастомные пункты меню</p>
        {config.customItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-2)', borderRadius: '2px', border: '1px solid var(--border)' }}>
            <span style={{ flex: 1, fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)' }}>{item.label}</span>
            <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6 }}>{item.href}</span>
            <button onClick={() => removeCustomItem(i)} className={a.btnDanger}>Удалить</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Название пункта"
            style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.4rem 0.75rem', flex: 1, minWidth: '120px', outline: 'none' }}
          />
          <input
            value={newHref}
            onChange={e => setNewHref(e.target.value)}
            placeholder="/url или https://..."
            style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.4rem 0.75rem', flex: 1, minWidth: '160px', outline: 'none' }}
          />
          <button onClick={addCustomItem} className={a.btn}>Добавить</button>
        </div>
      </div>

      {/* Подпись внизу меню (easter-egg бренда) */}
      <div style={CARD_STYLE}>
        <p style={{ ...LABEL_STYLE_MUTED, fontSize: '0.65rem' }}>Подпись внизу меню</p>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-involve)', fontSize: '0.75rem', opacity: 0.6 }}>
          Мелкий текст в самом низу бургер-меню (под пунктами). Пусто — вернётся дефолт.
        </p>
        <input
          value={footerText}
          onChange={e => { setFooterText(e.target.value); setSaved(false) }}
          placeholder={DEFAULT_MENU_FOOTER}
          style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.4rem 0.75rem', outline: 'none' }}
        />
      </div>

      {/* Preview */}
      <div style={CARD_STYLE}>
        <p style={{ ...LABEL_STYLE_MUTED, fontSize: '0.65rem' }}>Превью бургер-меню</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem', background: 'var(--bg-2)', borderRadius: '2px' }}>
          <span style={{ fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)', opacity: 0.5 }}>▸ Коллекции</span>
          {orderedCollections.filter(c => !config.hiddenCollections.includes(c.slug)).map(c => (
            <span key={c.slug} style={{ fontFamily: 'var(--font-involve)', fontSize: '0.75rem', color: 'var(--accent)', paddingLeft: '1.5rem', opacity: 0.7 }}>— {c.name}</span>
          ))}
          {config.customItems.map((item, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)', opacity: 0.8 }}>◆ {item.label}</span>
          ))}
          <span style={{ fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)', opacity: 0.5 }}>◇ Инфа</span>
          <span style={{ fontFamily: 'var(--font-onder)', fontSize: '0.85rem', color: 'var(--accent)', opacity: 0.5 }}>△ Кабинет</span>
        </div>
      </div>
    </div>
  )
}
