'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@/lib/types'

const PRODUCT_TYPES = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Pants', 'Accessory', 'Other']

const EMPTY: Omit<Product, 'id' | 'created_at'> = {
  name: '', description: '', price: 0,
  images: [], sizes: ['S', 'M', 'L', 'XL', '2XL'],
  colors: [], stock: 10, active: true, category: '', product_type: 'T-Shirt', bg_url: null,
  grade: null, series: null, article: null, material: null, cut: null,
}

const INPUT_STYLE = {
  background: 'var(--bg-subtle)',
  color: 'var(--accent)',
  border: '1px solid var(--border)',
  fontFamily: "var(--font-involve)",
}

const LABEL_STYLE = {
  color: 'var(--accent)',
  opacity: 0.5,
  fontFamily: "var(--font-onder)",
}

function formatPrice(p: number) { return p.toLocaleString('ru-RU') + ' ₽' }

function Inp({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE} />
    </div>
  )
}

type SortKey = 'name' | 'price' | 'stock'
type SortDir = 'asc' | 'desc'

export default function ProductsClient({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [sizesInput, setSizesInput] = useState('')
  const [colorsInput, setColorsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [filterActive, setFilterActive] = useState(searchParams.get('active') ?? 'all')
  const [filterStock, setFilterStock] = useState(searchParams.get('stock') ?? 'all')
  const [sortKey, setSortKey] = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'name')
  const [sortDir, setSortDir] = useState<SortDir>((searchParams.get('dir') as SortDir) ?? 'asc')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (filterActive !== 'all') params.set('active', filterActive)
      if (filterStock !== 'all') params.set('stock', filterStock)
      if (sortKey !== 'name') params.set('sort', sortKey)
      if (sortDir !== 'asc') params.set('dir', sortDir)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, filterActive, filterStock, sortKey, sortDir, pathname, router])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (filterActive === 'active') list = list.filter(p => p.active)
    if (filterActive === 'hidden') list = list.filter(p => !p.active)
    if (filterStock === 'in') list = list.filter(p => p.stock > 0)
    if (filterStock === 'out') list = list.filter(p => p.stock === 0)
    list.sort((a, b) => {
      const v = sortKey === 'name' ? a.name.localeCompare(b.name) : sortKey === 'price' ? a.price - b.price : a.stock - b.stock
      return sortDir === 'asc' ? v : -v
    })
    return list
  }, [products, search, filterActive, filterStock, sortKey, sortDir])

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <button onClick={() => toggleSort(k)} style={{ color: 'var(--accent)', opacity: active ? 1 : 0.4, fontFamily: "var(--font-onder)", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </button>
    )
  }

  function openNew() {
    setEditing({ ...EMPTY })
    setImages([])
    setSizesInput('S,M,L,XL,2XL')
    setColorsInput('')
    setBgUrl(null)
    setError('')
  }

  function openEdit(p: Product) {
    setEditing({ ...p })
    setImages(p.images)
    setSizesInput(p.sizes.join(','))
    setColorsInput((p.colors ?? []).join(','))
    setBgUrl(p.bg_url ?? null)
    setError('')
  }

  async function uploadBg(file: File) {
    setUploadingBg(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingBg(false)
    if (data.url) setBgUrl(data.url)
    else setError(`Ошибка загрузки фона: ${data.error}`)
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
      else setError(`Ошибка загрузки ${file.name}: ${data.error}`)
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    if (!editing) return
    if (!editing.name?.trim()) { setError('Укажи название'); return }
    if (!editing.price) { setError('Укажи цену'); return }

    setSaving(true)
    setError('')

    const payload = {
      ...editing,
      images,
      bg_url: bgUrl,
      sizes: sizesInput.split(',').map(s => s.trim()).filter(Boolean),
      colors: colorsInput.split(',').map(s => s.trim()).filter(Boolean),
    }

    const url = editing.id ? `/api/admin/products/${editing.id}` : '/api/admin/products'
    const method = editing.id ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Ошибка сохранения')
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(null)
    router.refresh()
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    router.refresh()
  }

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="uppercase tracking-widest"
          style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
          Товары ({filtered.length}/{products.length})
        </h1>
        <button onClick={openNew}
          className="uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.68rem', padding: '0.4rem 0.8rem' }}>
          + Добавить товар
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(242,151,116,0.08)', color: 'var(--accent)', border: '1px solid rgba(242,151,116,0.2)', fontFamily: "var(--font-involve)" }}
        />
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'rgba(242,151,116,0.08)', color: 'var(--accent)', border: '1px solid rgba(242,151,116,0.2)', fontFamily: "var(--font-involve)" }}>
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
        </select>
        <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'rgba(242,151,116,0.08)', color: 'var(--accent)', border: '1px solid rgba(242,151,116,0.2)', fontFamily: "var(--font-involve)" }}>
          <option value="all">Любой остаток</option>
          <option value="in">В наличии</option>
          <option value="out">Нет в наличии</option>
        </select>
      </div>

      {/* Sort headers */}
      <div className="flex gap-4 mb-2 px-1">
        <div className="w-14 flex-shrink-0" />
        <SortHeader label="Название" k="name" />
        <div className="flex-1" />
        <SortHeader label="Цена" k="price" />
        <SortHeader label="Остаток" k="stock" />
        <div className="w-28 flex-shrink-0" />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
            Ничего не найдено
          </p>
        )}
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl p-3"
            style={{ display: 'grid', gridTemplateColumns: '3.5rem 1fr', gap: '0.75rem', alignItems: 'start', background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', opacity: p.active ? 1 : 0.5 }}>
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
              {p.images[0] ? (
                <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'var(--accent-2)', color: 'var(--accent)', fontSize: '1.2rem' }}>?</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 700 }}>{p.name}</p>
              <p className="truncate text-xs mt-0.5" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
                <span style={{ fontFamily: 'var(--font-deutsch)', opacity: 1 }}>{formatPrice(p.price)}</span>
                {' · '}Остаток: {p.stock}
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                <button onClick={() => openEdit(p)}
                  className="px-2.5 py-1 text-xs uppercase tracking-widest rounded-lg"
                  style={{ background: 'var(--accent-2)', color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 700, fontSize: '0.62rem' }}>
                  Ред.
                </button>
                <button onClick={() => toggleActive(p.id, p.active)}
                  className="px-2.5 py-1 text-xs uppercase tracking-widest rounded-lg"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', opacity: 0.7, fontFamily: "var(--font-involve)", fontWeight: 700, fontSize: '0.62rem', border: '1px solid var(--border-soft)' }}>
                  {p.active ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--overlay-heavy)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[92vh]"
            style={{ background: 'var(--bg-2)', border: '1px solid rgba(242,151,116,0.25)' }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg uppercase tracking-widest"
                style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 800 }}>
                {editing.id ? 'Редактировать' : 'Новый товар'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--accent)', opacity: 0.4, fontSize: '1.2rem' }}>✕</button>
            </div>

            <Inp label="Название *" value={editing.name ?? ''} onChange={v => setEditing(e => ({ ...e, name: v }))} />

            <div className="grid grid-cols-2 gap-3">
              <Inp label="Цена (₽) *" value={editing.price ?? 0} onChange={v => setEditing(e => ({ ...e, price: Number(v) }))} type="number" />
              <Inp label="Остаток" value={editing.stock ?? 0} onChange={v => setEditing(e => ({ ...e, stock: Number(v) }))} type="number" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Inp label="Коллекция (slug)" value={editing.category ?? ''} onChange={v => setEditing(e => ({ ...e, category: v }))} />
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Тип товара</label>
                <select
                  value={editing.product_type ?? 'T-Shirt'}
                  onChange={e => setEditing(ed => ({ ...ed, product_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Описание</label>
              <textarea value={editing.description ?? ''} rows={2}
                onChange={e => setEditing(ed => ({ ...ed, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg outline-none text-sm resize-none" style={INPUT_STYLE} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Размеры (S,M,L...)</label>
                <input value={sizesInput} onChange={e => setSizesInput(e.target.value)}
                  placeholder="S,M,L,XL,2XL"
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Цвета</label>
                <input value={colorsInput} onChange={e => setColorsInput(e.target.value)}
                  placeholder="Чёрный,Белый"
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={INPUT_STYLE} />
              </div>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Фото товара</label>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-5"
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent)' : 'rgba(242,151,116,0.25)'}`,
                  background: dragOver ? 'rgba(242,151,116,0.08)' : 'transparent',
                }}
              >
                {uploading ? (
                  <p className="text-sm" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)" }}>Загружаем...</p>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity={0.5}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
                      Перетащи или кликни для загрузки
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => e.target.files && uploadFiles(e.target.files)} />

              {/* Image previews */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'var(--overlay-medium)', color: 'var(--accent)', fontSize: '1rem' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extended product fields */}
            <div className="grid grid-cols-3 gap-3">
              <Inp label="Grade" value={editing.grade ?? ''} onChange={v => setEditing(e => ({ ...e, grade: v || null }))} />
              <Inp label="Серия" value={editing.series ?? ''} onChange={v => setEditing(e => ({ ...e, series: v || null }))} />
              <Inp label="Артикул" value={editing.article ?? ''} onChange={v => setEditing(e => ({ ...e, article: v || null }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Состав" value={editing.material ?? ''} onChange={v => setEditing(e => ({ ...e, material: v || null }))} />
              <Inp label="Крой" value={editing.cut ?? ''} onChange={v => setEditing(e => ({ ...e, cut: v || null }))} />
            </div>

            {/* Card background PNG */}
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest" style={LABEL_STYLE}>Фон карточки (PNG прозрачный)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bgRef.current?.click()}
                  className="px-3 py-2 text-xs rounded-lg uppercase tracking-widest"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: '0.65rem' }}
                >
                  {uploadingBg ? 'Загружаем...' : 'Загрузить PNG'}
                </button>
                <input ref={bgRef} type="file" accept="image/png" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadBg(e.target.files[0])} />
                {bgUrl && (
                  <span className="text-xs truncate max-w-[180px]" style={{ color: 'var(--accent)', opacity: 0.6, fontFamily: "var(--font-involve)" }}>
                    {bgUrl.split('/').pop()}
                  </span>
                )}
                {bgUrl && (
                  <button type="button" onClick={() => setBgUrl(null)} style={{ color: 'var(--accent)', opacity: 0.4, fontSize: '0.8rem' }}>✕</button>
                )}
              </div>
              {bgUrl && (
                <div className="w-16 h-10 rounded overflow-hidden mt-1" style={{ background: 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 0 0 / 8px 8px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="prod-active" checked={editing.active ?? true}
                onChange={e => setEditing(ed => ({ ...ed, active: e.target.checked }))} />
              <label htmlFor="prod-active" className="text-sm"
                style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)" }}>
                Показывать в каталоге
              </label>
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--status-error)', fontFamily: "var(--font-involve)" }}>{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={save} disabled={saving || uploading || uploadingBg}
                className="flex-1 py-3 uppercase tracking-widest transition-opacity"
                style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.75rem', opacity: saving || uploading || uploadingBg ? 0.5 : 1 }}>
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditing(null)}
                className="px-4 py-3 uppercase tracking-widest"
                style={{ background: 'rgba(242,151,116,0.1)', color: 'var(--accent)', borderRadius: '8px', fontFamily: "var(--font-onder)", fontSize: '0.75rem' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
