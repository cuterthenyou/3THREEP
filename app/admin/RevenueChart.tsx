'use client'

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

const accent = 'var(--accent)'

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

export default function RevenueChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [{
          data,
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
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'var(--bg-2)', titleColor: accent, bodyColor: accent,
            borderColor: 'var(--border)', borderWidth: 1,
            callbacks: { label: (ctx) => ' ' + fmt(ctx.parsed.y ?? 0) },
          },
        },
        scales: {
          x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'var(--border-soft)' } },
          y: { ticks: { color: 'var(--text-muted)', font: { size: 10 }, callback: (v) => (Number(v) / 1000).toFixed(0) + 'k' }, grid: { color: 'var(--border-soft)' } },
        },
      }}
    />
  )
}
