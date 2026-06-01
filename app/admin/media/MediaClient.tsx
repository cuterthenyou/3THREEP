'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'

interface MediaFile {
  bucket: string
  name: string
  url: string
  size: number
  created_at: string
  mime: string
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 / 1024).toFixed(1) + ' MB'
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function isImage(mime: string, name: string) {
  return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
}

function isSvg(mime: string, name: string) {
  return mime === 'image/svg+xml' || /\.svg$/i.test(name)
}

const KNOWN_BUCKETS = ['products', 'avatars', 'static']

function VideoCard({ file }: { file: MediaFile }) {
  const [duration, setDuration] = useState<number | null>(null)
  return (
    <div className="relative bg-black" style={{ aspectRatio: '1/1' }}>
      <video
        src={file.url}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        onLoadedMetadata={e => setDuration((e.currentTarget as HTMLVideoElement).duration)}
        onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
        onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0 }}
      />
      {duration !== null && (
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#F29774', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}>
          {formatDuration(duration)}
        </span>
      )}
    </div>
  )
}

export default function MediaClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [allBuckets, setAllBuckets] = useState<string[]>(KNOWN_BUCKETS)
  const [loading, setLoading] = useState(true)
  const [bucket, setBucket] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [massDeleting, setMassDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    setFiles(data.files ?? [])
    if (data.buckets) setAllBuckets(data.buckets)
    setLoading(false)
    setSelected(new Set())
  }, [])

  useEffect(() => { load() }, [load])

  const otherBuckets = allBuckets.filter(b => !KNOWN_BUCKETS.includes(b))

  const filtered = useMemo(() => {
    let list = bucket === 'all'
      ? files
      : bucket === 'other'
      ? files.filter(f => !KNOWN_BUCKETS.includes(f.bucket))
      : files.filter(f => f.bucket === bucket)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, bucket, search])

  function toggleSelect(url: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(f => f.url)))
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  async function deleteFile(file: MediaFile) {
    if (!confirm(`Удалить ${file.name}?`)) return
    setDeleting(prev => new Set(prev).add(file.url))
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket: file.bucket, name: file.name }),
    })
    setDeleting(prev => { const n = new Set(prev); n.delete(file.url); return n })
    load()
  }

  async function deleteSelected() {
    const toDelete = filtered.filter(f => selected.has(f.url))
    if (!confirm(`Удалить ${toDelete.length} файлов?`)) return
    setMassDeleting(true)
    await Promise.all(toDelete.map(f =>
      fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: f.bucket, name: f.name }),
      })
    ))
    setMassDeleting(false)
    load()
  }

  function downloadSelected() {
    filtered.filter(f => selected.has(f.url)).forEach(f => {
      const a = document.createElement('a')
      a.href = f.url
      a.download = f.name
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  const accent = '#F29774'
  const accentDim = 'rgba(242,151,116,0.08)'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg uppercase tracking-widest" style={{ color: accent, fontFamily: "'ONDER', sans-serif" }}>
          Медиабиблиотека
        </h1>
        <button onClick={load} className="text-xs uppercase tracking-widest px-4 py-2 rounded"
          style={{ background: accentDim, color: accent, border: '1px solid rgba(242,151,116,0.3)', fontFamily: "'ONDER', sans-serif" }}>
          Обновить
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input type="search" placeholder="Поиск по имени файла..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: accentDim, color: accent, border: '1px solid rgba(242,151,116,0.2)', fontFamily: "'Involve', sans-serif" }} />
      </div>

      {/* Bucket tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...KNOWN_BUCKETS] as string[]).concat(otherBuckets.length ? ['other'] : []).map((b) => (
          <button key={b} onClick={() => setBucket(b)} className="px-4 py-1.5 rounded uppercase tracking-widest"
            style={{ fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', background: bucket === b ? accent : accentDim, color: bucket === b ? '#A9342A' : accent, border: '1px solid rgba(242,151,116,0.3)' }}>
            {b === 'all' ? 'Все' : b === 'other' ? 'Другое' : b}
          </button>
        ))}
        <span className="ml-auto text-xs self-center" style={{ color: accent, opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
          {filtered.length} файлов
        </span>
      </div>

      {/* Mass action panel */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(242,151,116,0.12)', border: '1px solid rgba(242,151,116,0.3)' }}>
          <span style={{ color: accent, fontFamily: "'Involve', sans-serif", fontSize: '0.8rem' }}>
            Выбрано: {selected.size}
          </span>
          <button onClick={downloadSelected}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest"
            style={{ background: 'rgba(116,179,242,0.18)', color: '#74B3F2', border: '1px solid rgba(116,179,242,0.3)', fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem' }}>
            Скачать
          </button>
          <button onClick={deleteSelected} disabled={massDeleting}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest"
            style={{ background: 'rgba(224,128,128,0.18)', color: '#E08080', border: '1px solid rgba(224,128,128,0.3)', fontFamily: "'ONDER', sans-serif", fontSize: '0.65rem', opacity: massDeleting ? 0.5 : 1 }}>
            {massDeleting ? 'Удаляем...' : 'Удалить'}
          </button>
          <button onClick={() => setSelected(new Set())}
            className="ml-auto text-xs" style={{ color: accent, opacity: 0.5, fontFamily: "'Involve', sans-serif", background: 'none', border: 'none', cursor: 'pointer' }}>
            Снять выбор
          </button>
        </div>
      )}

      {/* Select all row */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={selectAll}
            style={{ accentColor: accent, cursor: 'pointer' }}
          />
          <span style={{ color: accent, opacity: 0.5, fontFamily: "'Involve', sans-serif", fontSize: '0.75rem' }}>
            Выбрать все
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20" style={{ color: accent, opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: accent, opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>Нет файлов</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((file) => {
            const isSelected = selected.has(file.url)
            return (
              <div key={file.url} className="flex flex-col rounded-lg overflow-hidden"
                style={{ background: accentDim, border: `1px solid ${isSelected ? accent : 'rgba(242,151,116,0.15)'}`, outline: isSelected ? `2px solid ${accent}` : 'none', outlineOffset: '-2px' }}>

                {/* Checkbox + Preview */}
                <div className="relative">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(file.url)}
                    className="absolute top-2 left-2 z-10"
                    style={{ accentColor: accent, cursor: 'pointer', width: '16px', height: '16px' }} />

                  {file.mime.startsWith('video/') ? (
                    <VideoCard file={file} />
                  ) : isSvg(file.mime, file.name) ? (
                    <div className="bg-black" style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" style={{ width: '100%', height: '100%' }} />
                    </div>
                  ) : isImage(file.mime, file.name) ? (
                    <div className="relative bg-black" style={{ aspectRatio: '1/1' }}>
                      <Image src={file.url} alt={file.name} fill className="object-contain" sizes="200px" unoptimized />
                    </div>
                  ) : (
                    <div className="bg-black flex flex-col items-center justify-center gap-1" style={{ aspectRatio: '1/1' }}>
                      <span style={{ fontSize: '2rem' }}>📄</span>
                      <span className="text-xs uppercase" style={{ color: accent, opacity: 0.5 }}>{file.name.split('.').pop()}</span>
                    </div>
                  )}

                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs uppercase"
                    style={{ background: '#A9342A', color: accent, fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}>
                    {file.bucket}
                  </span>
                </div>

                {/* Info */}
                <div className="p-2 flex flex-col gap-1.5 flex-1">
                  <p className="text-xs leading-tight break-all" style={{ color: accent, fontFamily: "'Involve', sans-serif", opacity: 0.8 }} title={file.name}>
                    {file.name.length > 24 ? file.name.slice(0, 22) + '…' : file.name}
                  </p>
                  <p className="text-xs" style={{ color: accent, opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                    {formatBytes(file.size)} · {new Date(file.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  <div className="flex gap-1 mt-auto pt-1">
                    <button onClick={() => copyUrl(file.url)} className="flex-1 py-1 rounded text-center"
                      style={{ background: copied === file.url ? 'rgba(126,200,164,0.2)' : 'rgba(242,151,116,0.1)', color: copied === file.url ? '#7EC8A4' : accent, border: '1px solid rgba(242,151,116,0.2)', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}
                      title="Копировать URL">
                      {copied === file.url ? '✓' : 'URL'}
                    </button>
                    <button onClick={() => window.open(file.url, '_blank')} className="px-2 py-1 rounded"
                      style={{ background: 'rgba(242,151,116,0.1)', color: accent, border: '1px solid rgba(242,151,116,0.2)', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}
                      title="Открыть">↗</button>
                    <button onClick={() => deleteFile(file)} disabled={deleting.has(file.url)} className="px-2 py-1 rounded"
                      style={{ background: 'rgba(224,128,128,0.1)', color: '#E08080', border: '1px solid rgba(224,128,128,0.2)', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem', opacity: deleting.has(file.url) ? 0.5 : 1 }}
                      title="Удалить">✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
