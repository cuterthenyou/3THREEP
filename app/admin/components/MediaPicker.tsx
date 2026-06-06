'use client'

import { useState, useEffect, useMemo } from 'react'
import a from '../admin.module.css'

interface MediaFile {
  bucket: string
  name: string
  url: string
  size: number
  created_at: string
  mime: string
}

const FOLDER_LABELS: Record<string, string> = {
  products: 'Товары',
  avatars: 'Аватары',
  assets: 'Ассеты',
  static: 'Статика',
}
const KNOWN_FOLDERS = Object.keys(FOLDER_LABELS)

function getFolder(file: MediaFile): string {
  if (file.bucket === 'static') return 'static'
  const slash = file.name.indexOf('/')
  return slash > 0 ? file.name.slice(0, slash) : '_root'
}

function isImageFile(mime: string, name: string) {
  return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
}

interface BasePicker {
  open: boolean
  onClose: () => void
  accept?: 'image' | 'video' | 'all'
}
interface SinglePicker extends BasePicker {
  multiple?: false
  onSelect: (url: string) => void
  onSelectMultiple?: never
}
interface MultiPicker extends BasePicker {
  multiple: true
  onSelect?: never
  onSelectMultiple: (urls: string[]) => void
}
type Props = SinglePicker | MultiPicker

export default function MediaPicker(props: Props) {
  const { open, onClose, accept = 'all', multiple = false } = props
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [folder, setFolder] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSelected(new Set())
    setFolder('all')
    setSearch('')
    fetch('/api/admin/media')
      .then(r => r.json())
      .then(d => setFiles(d.files ?? []))
      .finally(() => setLoading(false))
  }, [open])

  const presentFolders = useMemo(() => [...new Set(files.map(getFolder))], [files])

  const filtered = useMemo(() => {
    let list = folder === 'all'
      ? files
      : files.filter(f => getFolder(f) === folder)
    if (accept === 'image') list = list.filter(f => isImageFile(f.mime, f.name))
    if (accept === 'video') list = list.filter(f => f.mime.startsWith('video/'))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, folder, search, accept])

  function toggle(url: string) {
    if (!multiple) {
      setSelected(new Set([url]))
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        if (next.has(url)) next.delete(url)
        else next.add(url)
        return next
      })
    }
  }

  function confirm() {
    if (selected.size === 0) return
    if (multiple && props.onSelectMultiple) {
      props.onSelectMultiple([...selected])
    } else if (!multiple && props.onSelect) {
      const url = [...selected][0]
      if (url) props.onSelect(url)
    }
    onClose()
  }

  if (!open) return null

  const accent = 'var(--accent)'
  const accentDim = 'var(--bg-subtle)'

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: accent, fontFamily: 'var(--font-involve)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Медиабиблиотека
          </span>
          <button onClick={onClose} style={{ color: accent, opacity: 0.4, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
        </div>

        {/* Filters */}
        <div className="px-3 py-2 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: 'var(--border)' }}>
          <input
            type="search"
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded text-sm outline-none"
            style={{ background: accentDim, color: accent, border: '1px solid var(--border)', fontFamily: 'var(--font-involve)', width: '160px' }}
          />
          <div className="flex flex-wrap gap-1.5">
            {(['all', ...KNOWN_FOLDERS.filter(f => presentFolders.includes(f))]).map(b => (
              <button
                key={b}
                onClick={() => setFolder(b)}
                className="px-2.5 py-1 rounded uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-involve)', fontWeight: 700, fontSize: '0.62rem', background: folder === b ? accent : accentDim, color: folder === b ? 'var(--bg)' : accent, border: '1px solid var(--border)' }}
              >
                {b === 'all' ? 'Все' : FOLDER_LABELS[b] ?? b}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs" style={{ color: accent, opacity: 0.4, fontFamily: 'var(--font-involve)' }}>
            {filtered.length} файлов
          </span>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-16" style={{ color: accent, opacity: 0.4, fontFamily: 'var(--font-involve)', fontSize: '0.85rem' }}>Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: accent, opacity: 0.4, fontFamily: 'var(--font-involve)', fontSize: '0.85rem' }}>Нет файлов</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {filtered.map(file => {
                const isSel = selected.has(file.url)
                return (
                  <div
                    key={file.url}
                    onClick={() => toggle(file.url)}
                    className="rounded overflow-hidden cursor-pointer"
                    style={{
                      border: `2px solid ${isSel ? accent : 'var(--border)'}`,
                      background: accentDim,
                      transform: isSel ? 'scale(0.96)' : 'scale(1)',
                      transition: 'transform 0.1s, border-color 0.1s',
                    }}
                  >
                    {isImageFile(file.mime, file.name) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={file.url} alt={file.name} className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                    ) : (
                      <div className="flex items-center justify-center" style={{ aspectRatio: '1/1', background: '#111' }}>
                        <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>📄</span>
                      </div>
                    )}
                    <p className="px-1 py-0.5 truncate" style={{ color: accent, opacity: isSel ? 1 : 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.52rem' }}>
                      {file.name.split('/').pop()}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: accent, opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>
            {selected.size > 0 ? `Выбрано: ${selected.size}` : 'Нажмите на файл для выбора'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className={a.btnSecondary}>Отмена</button>
            <button onClick={confirm} disabled={selected.size === 0} className={a.btn}>
              {multiple ? `Добавить (${selected.size})` : 'Выбрать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
