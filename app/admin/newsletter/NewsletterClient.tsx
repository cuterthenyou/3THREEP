'use client'

import type { Subscriber } from './page'
import a from '../admin.module.css'
import { AdminPageTitle, AdminEmptyState } from '../components'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function downloadCsv(subscribers: Subscriber[]) {
  const header = 'Email,Имя,Дата подписки'
  const rows = subscribers.map(s =>
    `"${s.email}","${s.name ?? ''}","${formatDate(s.subscribed_at)}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'newsletter-subscribers.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function NewsletterClient({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <AdminPageTitle>Рассылка ({subscribers.length})</AdminPageTitle>
        {subscribers.length > 0 && (
          <button onClick={() => downloadCsv(subscribers)} className={a.btnSecondary}>
            Скачать CSV
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <AdminEmptyState>Нет подписчиков</AdminEmptyState>
      ) : (
        <div style={{
          border: '1px solid var(--border-soft)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-subtle)' }}>
                {['Email', 'Имя', 'Дата подписки'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '0.6rem 1rem',
                      textAlign: 'left',
                      fontFamily: 'var(--font-involve)',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--accent)',
                      opacity: 0.5,
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.email}
                  style={{
                    borderBottom: i < subscribers.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                  }}
                >
                  <td style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-involve)', fontSize: '0.82rem', color: 'var(--accent)' }}>
                    {s.email}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-involve)', fontSize: '0.82rem', color: 'var(--accent)', opacity: 0.6 }}>
                    {s.name ?? '—'}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-involve)', fontSize: '0.75rem', color: 'var(--accent)', opacity: 0.45 }}>
                    {formatDate(s.subscribed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
