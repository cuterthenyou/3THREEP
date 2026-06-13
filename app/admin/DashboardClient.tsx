'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import s from './admin.module.css'

// Chart.js + react-chartjs-2 are heavy (~150KB) and admin-only → load on demand,
// keeping them out of the dashboard's initial bundle.
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  ssr: false,
  loading: () => <div style={{ height: 220, opacity: 0.3 }} />,
})

type Period = 'today' | '7d' | '30d' | 'all'

interface LabelCount { label: string; count: number }

interface DashboardData {
  kpi: { orders: string; revenue: string; avg_check: string; returns: string }
  topProducts: { product_name: string; units_sold: string; revenue: string }[]
  sizeBreakdown: { size: string; total_sold: string }[]
  dailyRevenue: { day: string; revenue: string }[]
  analytics: { views: string; unique_visits: string; new_users: string; newsletter: string } | null
  devices?: LabelCount[]
  browsers?: LabelCount[]
  referrers?: { host: string; count: number }[]
  sessionMetrics?: { sessions: string; avg_pages: string; avg_dur: string; bounces: string }
  funnel?: { visits: string; product_views: string; cart_adds: string; checkouts: string; orders: string }
  productViews?: { name: string; views: string }[]
  repeat?: { buyers: string; repeat_buyers: string }
  batScoresDesktop?: { score: number; level?: number | null; created_at: string; player?: string | null; difficulty?: string; win?: boolean }[]
  batScoresMobile?: { score: number; level?: number | null; created_at: string; player?: string | null; difficulty?: string; win?: boolean }[]
  batPlays?: { plays: string; players: string }
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

function fmtDur(seconds: number) {
  if (!seconds || seconds < 1) return '0с'
  const m = Math.floor(seconds / 60)
  const sec = Math.round(seconds % 60)
  return m > 0 ? `${m}м ${sec}с` : `${sec}с`
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Мобильные', tablet: 'Планшеты', desktop: 'Десктоп', bot: 'Боты', unknown: 'Неизвестно',
}

const panelStyle: React.CSSProperties = {
  background: 'var(--accent-2)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.25rem',
}
const panelTitle: React.CSSProperties = {
  fontFamily: 'var(--font-involve)', fontSize: '0.68rem', color: 'var(--accent)', opacity: 0.5,
  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem',
}

function BarList({ rows }: { rows: LabelCount[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (rows.length === 0) return <p style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Нет данных</p>
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
          <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.7rem', color: 'var(--accent)', minWidth: '5.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <div style={{ flex: 1, height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: 'var(--accent)', opacity: 0.6, minWidth: '2.5rem', textAlign: 'right' }}>{r.count}</span>
        </div>
      ))}
    </>
  )
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'all', label: 'Всё время' },
]

const accent = 'var(--accent)'
const accentDim = 'var(--accent-2)'

export default function DashboardClient() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/dashboard?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  const kpiCards = data ? [
    { label: 'Заказы', value: Number(data.kpi.orders) },
    { label: 'Выручка', value: fmt(Number(data.kpi.revenue)) },
    { label: 'Средний чек', value: fmt(Math.round(Number(data.kpi.avg_check))) },
    { label: 'Отменено', value: Number(data.kpi.returns) },
  ] : []

  const chartLabels = data?.dailyRevenue.map((d) =>
    new Date(d.day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  ) ?? []
  const chartData = data?.dailyRevenue.map((d) => Number(d.revenue)) ?? []

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Title + period switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ color: accent, fontFamily: "var(--font-onder)", fontSize: '1.1rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Дашборд
        </h1>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`${s.periodBtn} ${period === p.value ? s.periodBtnActive : ''}`}
              style={{ opacity: loading ? 0.5 : 1 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.1rem', opacity: 0.4, height: '80px' }} />
            ))
          : kpiCards.map((card) => (
              <div key={card.label} style={{ background: accentDim, border: `1px solid var(--accent-2)`, borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.65rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</span>
                <span style={{ fontFamily: "var(--font-deutsch)", fontSize: '1.15rem', color: accent }}>{card.value}</span>
              </div>
            ))}
      </div>

      {/* Analytics tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.1rem', opacity: 0.25, height: '80px' }} />
            ))
          : [
              { label: 'Просмотры',         value: Number(data?.analytics?.views        ?? 0), icon: '👁' },
              { label: 'Уник. сессии',       value: Number(data?.analytics?.unique_visits ?? 0), icon: '🎯' },
              { label: 'Новые польз.',       value: Number(data?.analytics?.new_users     ?? 0), icon: '👤' },
              { label: 'Подписчики',         value: Number(data?.analytics?.newsletter    ?? 0), icon: '📧' },
            ].map((card) => (
              <div key={card.label} style={{ background: 'var(--bg-subtle)', border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.65rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {card.icon} {card.label}
                </span>
                <span style={{ fontFamily: "var(--font-deutsch)", fontSize: '1.15rem', color: accent }}>{card.value}</span>
              </div>
            ))}
      </div>

      {/* Revenue chart */}
      {!loading && chartData.length > 0 && (
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-involve)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
            График выручки
          </p>
          <RevenueChart labels={chartLabels} data={chartData} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Top products */}
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-involve)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Топ позиций</p>
          {!loading && data?.topProducts.length === 0 && (
            <p style={{ color: accent, opacity: 0.3, fontFamily: "var(--font-involve)", fontSize: '0.8rem' }}>Нет данных</p>
          )}
          {!loading && data?.topProducts.map((p, i) => (
            <div key={p.product_name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0', borderBottom: i < (data.topProducts.length - 1) ? '1px solid var(--bg-subtle)' : 'none' }}>
              <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.65rem', color: accent, opacity: 0.3, minWidth: '1.2rem' }}>{i + 1}</span>
              <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.78rem', color: accent, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</span>
              <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.72rem', color: accent, opacity: 0.6 }}>{p.units_sold} шт</span>
              <span style={{ fontFamily: "var(--font-deutsch)", fontSize: '0.72rem', color: accent, minWidth: '5rem', textAlign: 'right' }}>{fmt(Number(p.revenue))}</span>
            </div>
          ))}
        </div>

        {/* Size breakdown */}
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-involve)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Разбивка по размерам</p>
          {!loading && data?.sizeBreakdown.length === 0 && (
            <p style={{ color: accent, opacity: 0.3, fontFamily: "var(--font-involve)", fontSize: '0.8rem' }}>Нет данных</p>
          )}
          {!loading && data?.sizeBreakdown.map((s) => {
            const max = Math.max(...(data.sizeBreakdown.map((x) => Number(x.total_sold))))
            const pct = max > 0 ? (Number(s.total_sold) / max) * 100 : 0
            return (
              <div key={s.size} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
                <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.7rem', color: accent, minWidth: '2rem' }}>{s.size}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.72rem', color: accent, opacity: 0.6, minWidth: '2rem', textAlign: 'right' }}>{s.total_sold}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Behaviour tiles */}
      {!loading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(() => {
            const sm = data.sessionMetrics
            const rep = data.repeat
            const buyers = Number(rep?.buyers ?? 0)
            const repeatBuyers = Number(rep?.repeat_buyers ?? 0)
            const sessions = Number(sm?.sessions ?? 0)
            const bounces = Number(sm?.bounces ?? 0)
            const tiles = [
              { label: 'Ср. длит. сессии', value: fmtDur(Number(sm?.avg_dur ?? 0)) },
              { label: 'Стр. за сессию', value: Number(sm?.avg_pages ?? 0).toFixed(1) },
              { label: 'Отказы', value: sessions > 0 ? Math.round((bounces / sessions) * 100) + '%' : '—' },
              { label: 'Повторные покупки', value: buyers > 0 ? Math.round((repeatBuyers / buyers) * 100) + '%' : '—' },
            ]
            return tiles.map((t) => (
              <div key={t.label} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.65rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.label}</span>
                <span style={{ fontFamily: 'var(--font-deutsch)', fontSize: '1.15rem', color: accent }}>{t.value}</span>
              </div>
            ))
          })()}
        </div>
      )}

      {/* Conversion funnel */}
      {!loading && data?.funnel && (
        <div style={panelStyle}>
          <p style={panelTitle}>Воронка конверсии</p>
          {(() => {
            const f = data.funnel!
            const steps = [
              { label: 'Визиты', value: Number(f.visits) },
              { label: 'Просмотр товара', value: Number(f.product_views) },
              { label: 'В корзину', value: Number(f.cart_adds) },
              { label: 'Оформление', value: Number(f.checkouts) },
              { label: 'Заказы', value: Number(f.orders) },
            ]
            const top = Math.max(1, steps[0].value)
            return steps.map((st, i) => {
              const prev = i > 0 ? steps[i - 1].value : st.value
              const conv = prev > 0 ? Math.round((st.value / prev) * 100) : 0
              return (
                <div key={st.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
                  <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: accent, minWidth: '8rem' }}>{st.label}</span>
                  <div style={{ flex: 1, height: '14px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(st.value / top) * 100}%`, height: '100%', background: accent, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-deutsch)', fontSize: '0.78rem', color: accent, minWidth: '3rem', textAlign: 'right' }}>{st.value}</span>
                  {i > 0 && <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.65rem', color: accent, opacity: 0.45, minWidth: '3rem', textAlign: 'right' }}>{conv}%</span>}
                </div>
              )
            })
          })()}
        </div>
      )}

      {/* Devices + Browsers */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div style={panelStyle}>
            <p style={panelTitle}>Устройства</p>
            <BarList rows={(data.devices ?? []).map((d) => ({ label: DEVICE_LABELS[d.label] ?? d.label, count: d.count }))} />
          </div>
          <div style={panelStyle}>
            <p style={panelTitle}>Браузеры</p>
            <BarList rows={data.browsers ?? []} />
          </div>
        </div>
      )}

      {/* Referrers + Top product views */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div style={panelStyle}>
            <p style={panelTitle}>Источники переходов</p>
            <BarList rows={(data.referrers ?? []).map((r) => ({ label: r.host, count: r.count }))} />
          </div>
          <div style={panelStyle}>
            <p style={panelTitle}>Топ просмотров товаров</p>
            <BarList rows={(data.productViews ?? []).map((p) => ({ label: p.name, count: Number(p.views) }))} />
          </div>
        </div>
      )}

      {/* Bat game leaderboards — desktop (хардкор) vs mobile */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { title: 'Охота — DESKTOP', rows: data.batScoresDesktop ?? [] },
            { title: 'Охота — MOBILE', rows: data.batScoresMobile ?? [] },
          ] as const).map((board) => (
            <div key={board.title} style={panelStyle}>
              <p style={panelTitle}>
                {board.title}
                {data.batPlays && Number(data.batPlays.plays) > 0 && (
                  <span style={{ opacity: 0.6, marginLeft: '0.5rem' }}>
                    · {data.batPlays.plays} игр · {data.batPlays.players} игроков
                  </span>
                )}
              </p>
              {board.rows.length === 0 ? (
                <p style={{ color: accent, opacity: 0.3, fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Нет данных</p>
              ) : (
                board.rows.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: i < (board.rows.length - 1) ? '1px solid var(--bg-subtle)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.7rem', color: accent, opacity: 0.35, minWidth: '1.4rem' }}>#{i + 1}</span>
                    <span style={{ fontFamily: 'var(--font-deutsch)', fontSize: '0.95rem', color: accent, minWidth: '3rem' }}>
                      {b.win ? '👑 ' : ''}×{b.score}
                    </span>
                    {b.level != null && (
                      <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.6rem', color: accent, opacity: 0.55, border: '1px solid var(--border)', borderRadius: 3, padding: '0.05rem 0.3rem' }}>
                        ур.{b.level}
                      </span>
                    )}
                    {b.difficulty === 'death' && (
                      <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.55rem', letterSpacing: '0.08em', color: 'var(--status-error)', border: '1px solid var(--status-error)', borderRadius: 3, padding: '0.05rem 0.3rem', textTransform: 'uppercase' }}>
                        DEATH
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: accent, opacity: b.player ? 0.85 : 0.4, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.player || 'Аноним'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.65rem', color: accent, opacity: 0.4 }}>
                      {new Date(b.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
