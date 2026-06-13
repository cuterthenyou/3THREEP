'use client'

import { useEffect, useState } from 'react'
import s from './LeaderboardModal.module.css'

type Row = {
  rank: number
  nickname: string | null
  level: number | null
  platform: string
  difficulty: string
  score: number
  win: boolean
  isMe: boolean
}
type Data = { top: Row[]; me: { rank: number; score: number } | null }

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch on open
  useEffect(() => {
    if (!open) return
    setLoading(true)
    setData(null)
    fetch('/api/leaderboard')
      .then((r) => (r.ok ? r.json() : { top: [], me: null }))
      .then(setData)
      .catch(() => setData({ top: [], me: null }))
      .finally(() => setLoading(false))
  }, [open])

  // Escape + scroll lock
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`fixed inset-0 ${s.backdrop}`} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>ЛИДЕРБОРД · ОХОТА</span>
          <button className={`${s.close} blade-glint`} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {data?.me ? (
          <div className={s.meBanner}>
            Ты на <b>{data.me.rank}</b>-м месте · <span className={s.meScore}>×{data.me.score}</span>
          </div>
        ) : !loading && data ? (
          <div className={s.meBanner}>Сыграй в «Охоту», чтобы попасть в топ</div>
        ) : null}

        <div className={s.list}>
          {loading && <p className={s.empty}>Загрузка…</p>}
          {!loading && data && data.top.length === 0 && <p className={s.empty}>Пока пусто — стань первым</p>}
          {!loading && data?.top.map((r) => (
            <div key={r.rank} className={`${s.row} ${r.isMe ? s.rowMe : ''}`}>
              <span className={s.rank}>{r.rank <= 3 ? MEDALS[r.rank - 1] : `#${r.rank}`}</span>
              <span className={s.name}>
                {r.win && <span className={s.crown}>👑 </span>}
                {r.nickname || 'Аноним'}
                {r.isMe && <span className={s.youTag}> · ты</span>}
              </span>
              {r.level != null && <span className={s.lvl}>ур.{r.level}</span>}
              <span className={s.plat} aria-hidden="true">{r.platform === 'mobile' ? '📱' : '🖥'}</span>
              {r.difficulty === 'death' && <span className={s.death}>DEATH</span>}
              <span className={s.score}>×{r.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
