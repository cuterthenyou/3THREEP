'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Emoji {
  id: number
  name: string
  url: string
  created_at: string
}

export default function EmojisClient({ initialEmojis }: { initialEmojis: Emoji[] }) {
  const [emojis, setEmojis] = useState<Emoji[]>(initialEmojis)
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload?folder=assets', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      setImageUrl(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  async function handleAdd() {
    if (!name.trim() || !imageUrl) { setError('Укажи имя и загрузи изображение'); return }
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/emojis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка добавления')
      setEmojis(prev => [data, ...prev])
      setName('')
      setImageUrl('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка добавления')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить emoji?')) return
    const res = await fetch(`/api/admin/emojis?id=${id}`, { method: 'DELETE' })
    if (res.ok) setEmojis(prev => prev.filter(e => e.id !== id))
  }

  const labelStyle = {
    color: 'var(--accent)', fontFamily: 'var(--font-onder)',
    fontSize: '0.7rem', textTransform: 'uppercase' as const,
    letterSpacing: '0.1em', opacity: 0.55,
  }
  const inputStyle = {
    background: 'var(--bg-subtle)', color: 'var(--accent)',
    border: '1px solid var(--border-mid)', fontFamily: 'var(--font-involve)',
    fontSize: '0.9rem', borderRadius: '0.75rem', outline: 'none',
    padding: '0.65rem 0.9rem', width: '100%',
  }
  const btnStyle = {
    background: 'var(--accent)', color: 'var(--bg)',
    fontFamily: 'var(--font-onder)', fontSize: '0.78rem',
    textTransform: 'uppercase' as const, letterSpacing: '0.1em',
    padding: '0.65rem 1.25rem', borderRadius: '8px',
    border: 'none', cursor: 'pointer',
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <h1 style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5rem' }}>
        Кастомные Emoji
      </h1>

      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
          Добавить emoji
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={labelStyle}>Изображение</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleUpload}
            style={{ ...inputStyle, padding: '0.5rem 0.9rem', cursor: 'pointer' }}
            disabled={uploading}
          />
          {uploading && <p style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Загружаем...</p>}
          {imageUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <Image src={imageUrl} alt="preview" width={40} height={40} style={{ objectFit: 'contain', borderRadius: 6, background: 'var(--bg-2)', padding: 4 }} unoptimized />
              <span style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.75rem' }}>Загружено</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={labelStyle}>Имя (латиница, цифры, дефис)</label>
          <input
            type="text"
            placeholder="например: threep-fire"
            value={name}
            onChange={e => setName(e.target.value.replace(/[^a-z0-9_-]/gi, '-').toLowerCase())}
            style={inputStyle}
          />
          {name && <p style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)', fontSize: '0.75rem' }}>Маркер: <code>:{name}:</code></p>}
        </div>

        {error && <p style={{ color: 'var(--status-error)', fontFamily: 'var(--font-involve)', fontSize: '0.82rem' }}>{error}</p>}

        <button onClick={handleAdd} disabled={adding || uploading || !imageUrl || !name.trim()} style={{ ...btnStyle, opacity: (adding || uploading || !imageUrl || !name.trim()) ? 0.5 : 1 }}>
          {adding ? 'Добавляем...' : '+ Добавить'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {emojis.length === 0 && (
          <p style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)' }}>Пока нет кастомных emoji</p>
        )}
        {emojis.map(emoji => (
          <div key={emoji.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem',
          }}>
            <Image src={emoji.url} alt={emoji.name} width={40} height={40} style={{ objectFit: 'contain', borderRadius: 6, background: 'var(--bg-2)', padding: 3, flexShrink: 0 }} unoptimized />
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: '0.9rem' }}>:{emoji.name}:</p>
              <p style={{ color: 'var(--accent)', opacity: 0.35, fontFamily: 'var(--font-involve)', fontSize: '0.72rem' }}>
                {new Date(emoji.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <button
              onClick={() => handleDelete(emoji.id)}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--status-error)', borderRadius: '6px', padding: '0.3rem 0.65rem', cursor: 'pointer', fontFamily: 'var(--font-involve)', fontSize: '0.78rem', opacity: 0.7 }}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
