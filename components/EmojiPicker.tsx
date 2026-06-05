'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const STANDARD_EMOJIS = [
  '😀','😂','🥹','😍','🤩','😎','🥶','😤','😭','🤯','😴','🤔',
  '👍','👎','👏','🤝','🙏','🫶','✌️','💪','🤞','🫵','☝️','👋',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❤️‍🔥','✨','🔥',
  '💯','🎉','🎊','🥳','🏆','👑','💎','🚀','⚡','🌙','⭐','🌊',
  '😈','👿','💀','☠️','🤡','🎭','🎨','🕶️','👁️','🤌','🫡','😤',
  '🍕','🍔','☕','🍺','🥂','🎵','🎶','📸','💻','🔑','💸','🎯',
  '🐈','🐕','🐺','🦊','🦁','🐉','🦋','🌹','🍀','☀️','🌈','🌙',
]

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
          fontSize: '1.2rem', padding: '0 0.4rem', opacity: open ? 0.9 : 0.55,
          transition: 'opacity 0.15s', lineHeight: 1,
        }}
        title="Эмодзи"
      >
        😊
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
                  {t === 'standard' ? 'Стандартные' : 'Кастомные'}
                </button>
              ))}
            </div>
          )}

          <div style={{ overflow: 'auto', padding: '0.5rem', maxHeight: 220 }}>
            {tab === 'standard' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.15rem' }}>
                {STANDARD_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onSelect(emoji); setOpen(false) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '1.15rem', padding: '0.2rem', borderRadius: '0.3rem',
                      transition: 'background 0.1s', lineHeight: 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {emoji}
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
