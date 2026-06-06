'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { AdminPageTitle, AdminEmptyState } from '../components'

type SortKey = 'date' | 'total'
type SortDir = 'asc' | 'desc'

interface Order {
  id: string
  status: string
  total: number
  created_at: string
  order_items: Record<string, unknown>[]
  profiles: Record<string, unknown> | null
  guest_name: string | null
  guest_email: string | null
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') ?? 'all')
  const [sortKey, setSortKey] = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'date')
  const [sortDir, setSortDir] = useState<SortDir>((searchParams.get('dir') as SortDir) ?? 'desc')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (sortKey !== 'date') params.set('sort', sortKey)
      if (sortDir !== 'desc') params.set('dir', sortDir)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, filterStatus, sortKey, sortDir, pathname, router])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = [...orders]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o => {
        const email = String((o.profiles as Record<string, unknown>)?.email ?? o.guest_email ?? '').toLowerCase()
        const name = String((o.profiles as Record<string, unknown>)?.name ?? o.guest_name ?? '').toLowerCase()
        return o.id.toLowerCase().includes(q) || email.includes(q) || name.includes(q)
      })
    }
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus)
    list.sort((a, b) => {
      const v = sortKey === 'date'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : a.total - b.total
      return sortDir === 'asc' ? v : -v
    })
    return list
  }, [orders, search, filterStatus, sortKey, sortDir])

  function SortBtn({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <button onClick={() => toggleSort(k)} style={{ color: 'var(--accent)', opacity: active ? 1 : 0.4, fontFamily: "var(--font-onder)", fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </button>
    )
  }

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <AdminPageTitle>Заказы ({filtered.length}/{orders.length})</AdminPageTitle>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="search"
          placeholder="Поиск по email, имени, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', border: '1px solid var(--border)', fontFamily: "var(--font-involve)" }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', border: '1px solid var(--border)', fontFamily: "var(--font-involve)" }}>
          <option value="all">Все статусы</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(s => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Sort headers */}
      <div className="flex gap-4 mb-2 px-2">
        <div className="flex-1" />
        <SortBtn label="Дата" k="date" />
        <SortBtn label="Сумма" k="total" />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <AdminEmptyState>Ничего не найдено</AdminEmptyState>
        )}
        {filtered.map((order) => {
          const profile = order.profiles as Record<string, unknown> | null
          const items = order.order_items ?? []

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-opacity hover:opacity-90"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', textDecoration: 'none' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs px-2 py-0.5 uppercase tracking-widest"
                    style={{ borderRadius: '2px', background: 'var(--bg-subtle)', color: STATUS_COLORS[order.status as OrderStatus], fontFamily: "var(--font-onder)", fontSize: '0.6rem', border: '1px solid var(--border)' }}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="mt-1 flex flex-col gap-0.5">
                  {items.map((item) => (
                    <span key={String(item.id)} className="text-sm" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)" }}>
                      {String(item.product_name)}{item.size ? ` / ${item.size}` : ''} × {Number(item.quantity)}
                    </span>
                  ))}
                </div>
                {profile ? (
                  <p className="text-xs mt-1" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                    {String(profile.name || profile.email || '')}
                  </p>
                ) : (order.guest_name || order.guest_email) ? (
                  <p className="text-xs mt-1" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                    Гость: {[order.guest_name, order.guest_email].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </div>
              <p className="text-lg flex-shrink-0" style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)" }}>
                {formatPrice(order.total)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
