'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

type Period = 'today' | '7d' | '30d' | 'all'

interface DashboardData {
  kpi: { orders: string; revenue: string; avg_check: string; returns: string }
  topProducts: { product_name: string; units_sold: string; revenue: string }[]
  sizeBreakdown: { size: string; total_sold: string }[]
  dailyRevenue: { day: string; revenue: string }[]
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
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
              style={{
                fontFamily: "var(--font-involve)",
                fontSize: '0.72rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${period === p.value ? accent : 'var(--border)'}`,
                background: period === p.value ? 'var(--accent-2)' : 'transparent',
                color: accent,
                cursor: 'pointer',
                transition: 'all 0.18s',
                opacity: loading ? 0.5 : 1,
              }}
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

      {/* Revenue chart */}
      {!loading && chartData.length > 0 && (
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
            График выручки
          </p>
          <Line
            data={{
              labels: chartLabels,
              datasets: [{
                data: chartData,
                borderColor: accent,
                backgroundColor: 'var(--accent-2)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: accent,
                fill: true,
                tension: 0.35,
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--bg-2)', titleColor: accent, bodyColor: accent, borderColor: 'var(--border)', borderWidth: 1, callbacks: { label: (ctx) => ' ' + fmt(ctx.parsed.y ?? 0) } } },
              scales: {
                x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'var(--border-soft)' } },
                y: { ticks: { color: 'var(--text-muted)', font: { size: 10 }, callback: (v) => (Number(v) / 1000).toFixed(0) + 'k' }, grid: { color: 'var(--border-soft)' } },
              },
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Top products */}
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Топ позиций</p>
          {!loading && data?.topProducts.length === 0 && (
            <p style={{ color: accent, opacity: 0.3, fontFamily: "var(--font-involve)", fontSize: '0.8rem' }}>Нет данных</p>
          )}
          {!loading && data?.topProducts.map((p, i) => (
            <div key={p.product_name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0', borderBottom: i < (data.topProducts.length - 1) ? '1px solid var(--bg-subtle)' : 'none' }}>
              <span style={{ fontFamily: "var(--font-onder)", fontSize: '0.65rem', color: accent, opacity: 0.3, minWidth: '1.2rem' }}>{i + 1}</span>
              <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.78rem', color: accent, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</span>
              <span style={{ fontFamily: "var(--font-onder)", fontSize: '0.72rem', color: accent, opacity: 0.6 }}>{p.units_sold} шт</span>
              <span style={{ fontFamily: "var(--font-onder)", fontSize: '0.72rem', color: accent, minWidth: '5rem', textAlign: 'right' }}>{fmt(Number(p.revenue))}</span>
            </div>
          ))}
        </div>

        {/* Size breakdown */}
        <div style={{ background: accentDim, border: `1px solid var(--border-soft)`, borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontFamily: "var(--font-onder)", fontSize: '0.68rem', color: accent, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Разбивка по размерам</p>
          {!loading && data?.sizeBreakdown.length === 0 && (
            <p style={{ color: accent, opacity: 0.3, fontFamily: "var(--font-involve)", fontSize: '0.8rem' }}>Нет данных</p>
          )}
          {!loading && data?.sizeBreakdown.map((s) => {
            const max = Math.max(...(data.sizeBreakdown.map((x) => Number(x.total_sold))))
            const pct = max > 0 ? (Number(s.total_sold) / max) * 100 : 0
            return (
              <div key={s.size} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
                <span style={{ fontFamily: "var(--font-onder)", fontSize: '0.7rem', color: accent, minWidth: '2rem' }}>{s.size}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontFamily: "var(--font-involve)", fontSize: '0.72rem', color: accent, opacity: 0.6, minWidth: '2rem', textAlign: 'right' }}>{s.total_sold}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
