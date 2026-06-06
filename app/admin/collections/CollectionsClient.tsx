'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/types'
import a from '../admin.module.css'
import { INPUT_STYLE, LABEL_STYLE } from '../adminStyles'
import { AdminPageTitle, AdminEmptyState, AdminModal } from '../components'
import MediaPicker from '../components/MediaPicker'

const EMPTY: Omit<Category, never> = {
  slug: '', name: '', active: true, description: null, logo_top_url: null, logo_bottom_url: null, modal_bg_url: null, modal_bg_url_dark: null,
}

type UploadField = 'logo_top_url' | 'logo_bottom_url' | 'modal_bg_url' | 'modal_bg_url_dark'

export default function CollectionsClient({ collections }: { collections: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [originalSlug, setOriginalSlug] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<UploadField | null>(null)
  const [error, setError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerField, setPickerField] = useState<UploadField | null>(null)
  const router = useRouter()

  const logoTopRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const logoBottomRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const modalBgRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const modalBgDarkRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  function openNew() { setEditing({ ...EMPTY }); setOriginalSlug(''); setError('') }
  function openEdit(c: Category) { setEditing({ ...c }); setOriginalSlug(c.slug); setError('') }

  function openPicker(field: UploadField) {
    setPickerField(field)
    setPickerOpen(true)
  }

  function onPickerSelect(url: string) {
    if (pickerField) setEditing(e => e ? { ...e, [pickerField]: url } : e)
  }

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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refEl.current?.click()}
            className={a.btnSecondary}
          >
            {uploading === field ? 'Загружаем...' : 'Загрузить'}
          </button>
          <button type="button" onClick={() => openPicker(field)} className={a.btnSecondary}>
            Из медиа
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <AdminPageTitle>Коллекции ({collections.length})</AdminPageTitle>
        <button onClick={openNew} className={a.btn}>
          + Добавить
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {collections.length === 0 && (
          <AdminEmptyState>Коллекций нет. Создай первую — slug должен совпадать с category у товаров.</AdminEmptyState>
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
                <button onClick={() => toggleActive(c)} className={a.btnSecondary}>
                  {c.active ? 'Скрыть' : 'Показать'}
                </button>
                <button onClick={() => openEdit(c)} className={a.btnSecondary}>
                  Ред.
                </button>
                <button onClick={() => remove(c.slug)} className={a.btnDanger}>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onPickerSelect}
        accept="image"
      />

      {editing && (
        <AdminModal title={editing.slug ? 'Редактировать' : 'Новая коллекция'} onClose={() => setEditing(null)}>

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
                className={a.btn} style={{ flex: 1 }}>
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditing(null)} className={a.btnSecondary}>
                Отмена
              </button>
            </div>
        </AdminModal>
      )}
    </div>
  )
}
