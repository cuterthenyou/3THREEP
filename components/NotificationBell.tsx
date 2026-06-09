'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import s from './NotificationBell.module.css'

interface Notif {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - d)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const days = Math.floor(h / 24)
  return `${days} дн назад`
}

export default function NotificationBell() {
  const [authed, setAuthed] = useState(false)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications', { cache: 'no-store' })
      if (!r.ok) return
      const d = await r.json()
      setAuthed(!!d.authed)
      setItems(d.items ?? [])
      setUnread(d.unread ?? 0)
    } catch {}
  }, [])

  // Бейдж при загрузке + лёгкий поллинг (кэш тёплый, 60с)
  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 60000)
    return () => clearInterval(id)
  }, [fetchData])

  // Закрытие по клику вне / Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      await fetchData()
      // Помечаем прочитанными — бейдж гаснет (список остаётся виден)
      if (unread > 0) {
        setUnread(0)
        fetch('/api/notifications/read', { method: 'POST' }).catch(() => {})
      }
    }
  }

  function handleItemClick(n: Notif) {
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  if (!authed) return null

  return (
    <div ref={wrapRef} className={s.wrap}>
      <button onClick={toggleOpen} className={s.bellBtn} aria-label="Уведомления">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M4 7a4 4 0 0 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" />
          <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
        </svg>
        {unread > 0 && <span className={s.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={`${s.panel} hud-corners`}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Уведомления</span>
          </div>
          <div className={s.list}>
            {items.length === 0 ? (
              <p className={s.empty}>Пока пусто</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`${s.item} ${n.read ? '' : s.itemUnread}`}
                  disabled={!n.link}
                >
                  <span className={s.itemTitle}>{n.title}</span>
                  {n.body && <span className={s.itemBody}>{n.body}</span>}
                  <span className={s.itemTime}>{timeAgo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
