'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { SVG_EMOJIS } from './svgEmojis'

export interface CustomEmoji {
  id: number
  name: string
  url: string
}

interface Props {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([])
  const [tab, setTab] = useState<'standard' | 'custom'>('standard')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/emojis').then(r => r.json()).then(setCustomEmojis).catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0.4rem', opacity: open ? 0.9 : 0.55,
          transition: 'opacity 0.15s', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, color: 'var(--accent)',
        }}
        title="Эмодзи"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
          <circle cx="10" cy="10" r="8.5"/>
          <circle cx="7" cy="8.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="13" cy="8.5" r="1" fill="currentColor" stroke="none"/>
          <path d="M7,12.5 Q10,15.5 13,12.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: '2.75rem', left: 0,
          width: 288, background: 'var(--bg-2)',
          border: '1px solid var(--border-soft)',
          borderRadius: '0.75rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {customEmojis.length > 0 && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', flexShrink: 0 }}>
              {(['standard', 'custom'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '0.45rem', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.68rem',
                    fontFamily: 'var(--font-involve)', textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {t === 'standard' ? 'THREEP' : 'Кастомные'}
                </button>
              ))}
            </div>
          )}

          <div style={{ overflow: 'auto', padding: '0.5rem', maxHeight: 220 }}>
            {tab === 'standard' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.15rem' }}>
                {SVG_EMOJIS.map(emoji => (
                  <button
                    key={emoji.name}
                    type="button"
                    onClick={() => { onSelect(`:${emoji.name}:`); setOpen(false) }}
                    title={`:${emoji.name}:`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.25rem', borderRadius: '0.3rem',
                      transition: 'background 0.1s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)',
                      width: '100%', aspectRatio: '1',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: 18, height: 18, display: 'block' }}>
                      {emoji.svg}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
                {customEmojis.map(ce => (
                  <button
                    key={ce.id}
                    type="button"
                    onClick={() => { onSelect(`:${ce.name}:`); setOpen(false) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderRadius: '0.3rem', padding: '0.2rem',
                      transition: 'background 0.1s',
                    }}
                    title={`:${ce.name}:`}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <Image src={ce.url} alt={ce.name} width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
