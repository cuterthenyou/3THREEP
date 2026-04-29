'use client'

import { useState, useEffect, useCallback } from 'react'
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

function isImage(mime: string, name: string) {
  return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
}

function isSvg(mime: string, name: string) {
  return mime === 'image/svg+xml' || /\.svg$/i.test(name)
}

const KNOWN_BUCKETS = ['products', 'avatars', 'static']

export default function MediaClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [allBuckets, setAllBuckets] = useState<string[]>(KNOWN_BUCKETS)
  const [loading, setLoading] = useState(true)
  const [bucket, setBucket] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    setFiles(data.files ?? [])
    if (data.buckets) setAllBuckets(data.buckets)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const otherBuckets = allBuckets.filter(b => !KNOWN_BUCKETS.includes(b))
  const filtered = bucket === 'all'
    ? files
    : bucket === 'other'
    ? files.filter(f => !KNOWN_BUCKETS.includes(f.bucket))
    : files.filter(f => f.bucket === bucket)

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  async function deleteFile(file: MediaFile) {
    if (!confirm(`Удалить ${file.name}?`)) return
    setDeleting(file.url)
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket: file.bucket, name: file.name }),
    })
    setDeleting(null)
    load()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-lg uppercase tracking-widest"
          style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
        >
          Медиабиблиотека
        </h1>
        <button
          onClick={load}
          className="text-xs uppercase tracking-widest px-4 py-2 rounded"
          style={{ background: 'rgba(242,151,116,0.1)', color: '#F29774', border: '1px solid rgba(242,151,116,0.3)', fontFamily: "'ONDER', sans-serif" }}
        >
          Обновить
        </button>
      </div>

      {/* Bucket filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', ...KNOWN_BUCKETS] as string[]).concat(otherBuckets.length ? ['other'] : []).map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className="px-4 py-1.5 rounded uppercase tracking-widest"
            style={{
              fontFamily: "'ONDER', sans-serif",
              fontSize: '0.65rem',
              background: bucket === b ? '#F29774' : 'rgba(242,151,116,0.08)',
              color: bucket === b ? '#A9342A' : '#F29774',
              border: '1px solid rgba(242,151,116,0.3)',
            }}
          >
            {b === 'all' ? 'Все' : b === 'other' ? 'Другое' : b}
          </button>
        ))}
        <span className="ml-auto text-xs self-center" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
          {filtered.length} файлов
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
          Нет файлов
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((file) => (
            <div
              key={file.url}
              className="flex flex-col rounded-lg overflow-hidden"
              style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.15)' }}
            >
              {/* Preview */}
              <div className="relative bg-black" style={{ aspectRatio: '1/1' }}>
                {file.mime.startsWith('video/') ? (
                  <video
                    src={file.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0 }}
                  />
                ) : isSvg(file.mime, file.name) ? (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : isImage(file.mime, file.name) ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-contain"
                    sizes="200px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span style={{ fontSize: '2rem' }}>📄</span>
                    <span className="text-xs uppercase" style={{ color: '#F29774', opacity: 0.5 }}>
                      {file.name.split('.').pop()}
                    </span>
                  </div>
                )}
                {/* Bucket badge */}
                <span
                  className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-xs uppercase"
                  style={{ background: '#A9342A', color: '#F29774', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}
                >
                  {file.bucket}
                </span>
              </div>

              {/* Info */}
              <div className="p-2 flex flex-col gap-1.5 flex-1">
                <p
                  className="text-xs leading-tight break-all"
                  style={{ color: '#F29774', fontFamily: "'Involve', sans-serif", opacity: 0.8 }}
                  title={file.name}
                >
                  {file.name.length > 24 ? file.name.slice(0, 22) + '…' : file.name}
                </p>
                <p className="text-xs" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                  {formatBytes(file.size)}
                </p>
                <div className="flex gap-1 mt-auto pt-1">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="flex-1 py-1 rounded text-center"
                    style={{
                      background: copied === file.url ? 'rgba(126,200,164,0.2)' : 'rgba(242,151,116,0.1)',
                      color: copied === file.url ? '#7EC8A4' : '#F29774',
                      border: '1px solid rgba(242,151,116,0.2)',
                      fontFamily: "'ONDER', sans-serif",
                      fontSize: '0.55rem',
                    }}
                    title="Копировать URL"
                  >
                    {copied === file.url ? '✓' : 'URL'}
                  </button>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="px-2 py-1 rounded"
                    style={{
                      background: 'rgba(242,151,116,0.1)',
                      color: '#F29774',
                      border: '1px solid rgba(242,151,116,0.2)',
                      fontFamily: "'ONDER', sans-serif",
                      fontSize: '0.55rem',
                    }}
                    title="Открыть"
                  >
                    ↗
                  </button>
                  <button
                    onClick={() => deleteFile(file)}
                    disabled={deleting === file.url}
                    className="px-2 py-1 rounded"
                    style={{
                      background: 'rgba(224,128,128,0.1)',
                      color: '#E08080',
                      border: '1px solid rgba(224,128,128,0.2)',
                      fontFamily: "'ONDER', sans-serif",
                      fontSize: '0.55rem',
                      opacity: deleting === file.url ? 0.5 : 1,
                    }}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
