'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/types'

const EMPTY: Omit<Category, never> = {
  slug: '', name: '', active: true, description: null, logo_top_url: null, logo_bottom_url: null, modal_bg_url: null, modal_bg_url_dark: null,
}

const INPUT_STYLE = {
  background: 'var(--bg-subtle)',
  color: 'var(--accent)',
  border: '1px solid var(--border)',
  fontFamily: "var(--font-involve)",
}
const LABEL_STYLE = { color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-onder)" }

type UploadField = 'logo_top_url' | 'logo_bottom_url' | 'modal_bg_url' | 'modal_bg_url_dark'

export default function CollectionsClient({ collections }: { collections: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [originalSlug, setOriginalSlug] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<UploadField | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const logoTopRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const logoBottomRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const modalBgRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const modalBgDarkRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  function openNew() { setEditing({ ...EMPTY }); setOriginalSlug(''); setError('') }
  function openEdit(c: Category) { setEditing({ ...c }); setOriginalSlug(c.slug); setError('') }

  async function uploadFile(file: File, field: UploadField) {
    setUploading(field)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(null)
    if (data.url) setEditing(e => e ? { ...e, [field]: data.url } : e)
    else setError(`Ошибка загрузки: ${data.error}`)
  }

  async function save() {
    if (!editing) return
    if (!editing.slug.trim()) { setError('Укажи slug коллекции (напр. aqua)'); return }
    if (!editing.name.trim()) { setError('Укажи название'); return }
    setSaving(true); setError('')
    if (originalSlug && originalSlug !== editing.slug) {
      await fetch('/api/admin/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: originalSlug }),
      })
    }
    const res = await fetch('/api/admin/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Ошибка'); return }
    setEditing(null)
    router.refresh()
  }

  async function toggleActive(c: Category) {
    await fetch('/api/admin/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, active: !c.active }),
    })
    router.refresh()
  }

  async function remove(slug: string) {
    if (!confirm('Удалить коллекцию?')) return
    await fetch('/api/admin/collections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    router.refresh()
  }

  function UploadBtn({ field, label, refEl, accept = 'image/*,.svg' }: { field: UploadField; label: string; refEl: React.RefObject<HTMLInputElement>; accept?: string }) {
    const val = editing?.[field]
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refEl.current?.click()}
            className="px-3 py-2 text-xs rounded-lg uppercase tracking-widest"
            style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: '0.65rem' }}
          >
            {uploading === field ? 'Загружаем...' : 'Загрузить'}
          </button>
          <input
            ref={refEl}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], field)}
          />
          {val && (
            <span className="text-xs truncate max-w-[180px]" style={{ color: 'var(--accent)', opacity: 0.6, fontFamily: "var(--font-involve)" }}>
              {val.split('/').pop()}
            </span>
          )}
          {val && (
            <button type="button" onClick={() => setEditing(e => e ? { ...e, [field]: null } : e)}
              style={{ color: 'var(--accent)', opacity: 0.4, fontSize: '0.8rem' }}>✕</button>
          )}
        </div>
        {val && (
          <div className="w-16 h-10 rounded overflow-hidden mt-1" style={{ background: 'var(--bg-subtle)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={val} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="uppercase tracking-widest" style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
          Коллекции ({collections.length})
        </h1>
        <button onClick={openNew}
          className="uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.68rem', padding: '0.4rem 0.8rem' }}>
          + Добавить
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {collections.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
            Коллекций нет. Создай первую — slug должен совпадать с category у товаров.
          </p>
        )}
        {collections.map(c => (
          <div key={c.slug} className="rounded-xl p-3"
            style={{ display: 'grid', gridTemplateColumns: '3.5rem 1fr', gap: '0.75rem', alignItems: 'start', background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
            <div className="w-14 h-14 rounded-lg overflow-hidden" style={{ background: 'var(--accent-2)' }}>
              {c.logo_top_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_top_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 700 }}>{c.name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--accent)', opacity: 0.45, fontFamily: "var(--font-involve)" }}>
                {!c.active && <span style={{ color: 'var(--status-error)', opacity: 0.8 }}>● скрыта · </span>}
                slug: {c.slug}
                {c.logo_top_url ? ' · лого-топ ✓' : ''}
                {c.logo_bottom_url ? ' · лого-боттом ✓' : ''}
                {c.modal_bg_url ? ' · фон-модалки ✓' : ''}
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                <button onClick={() => toggleActive(c)}
                  className="px-2.5 py-1 text-xs uppercase tracking-widest rounded-lg"
                  style={{ background: c.active ? 'var(--bg-subtle)' : 'var(--accent-2)', color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 700, fontSize: '0.62rem', border: '1px solid var(--border-soft)' }}>
                  {c.active ? 'Скрыть' : 'Показать'}
                </button>
                <button onClick={() => openEdit(c)}
                  className="px-2.5 py-1 text-xs uppercase tracking-widest rounded-lg"
                  style={{ background: 'var(--accent-2)', color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 700, fontSize: '0.62rem' }}>
                  Ред.
                </button>
                <button onClick={() => remove(c.slug)}
                  className="px-2.5 py-1 text-xs uppercase tracking-widest rounded-lg"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)", fontWeight: 700, fontSize: '0.62rem', border: '1px solid var(--border-soft)' }}>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--overlay-heavy)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[92vh]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg uppercase tracking-widest" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 800 }}>
                {editing.slug ? 'Редактировать' : 'Новая коллекция'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--accent)', opacity: 0.4, fontSize: '1.2rem' }}>✕</button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Slug * (напр. aqua, dich)</label>
              <input value={editing.slug} onChange={e => setEditing(ed => ed ? { ...ed, slug: e.target.value } : ed)}
                className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE}
                placeholder="aqua" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Название *</label>
              <input value={editing.name} onChange={e => setEditing(ed => ed ? { ...ed, name: e.target.value } : ed)}
                className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE}
                placeholder="AQUA+" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Описание коллекции (2-3 строки)</label>
              <textarea
                value={editing.description ?? ''}
                onChange={e => setEditing(ed => ed ? { ...ed, description: e.target.value || null } : ed)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg outline-none text-sm resize-none"
                style={INPUT_STYLE}
                placeholder="Атмосфера коллекции..."
              />
            </div>

            <UploadBtn field="logo_top_url" label="Лого TOP (над каталогом)" refEl={logoTopRef} />
            <UploadBtn field="logo_bottom_url" label="Лого BOTTOM (под каталогом)" refEl={logoBottomRef} />
            <UploadBtn field="modal_bg_url" label="Фон модалки (свет)" refEl={modalBgRef} accept="image/*" />
            <UploadBtn field="modal_bg_url_dark" label="Фон модалки (темно)" refEl={modalBgDarkRef} accept="image/*" />

            {error && <p className="text-sm" style={{ color: 'var(--status-error)', fontFamily: "var(--font-involve)" }}>{error}</p>}

            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !!uploading}
                className="flex-1 py-3 uppercase tracking-widest transition-opacity"
                style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.75rem', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditing(null)}
                className="px-4 py-3 uppercase tracking-widest"
                style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.75rem' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
