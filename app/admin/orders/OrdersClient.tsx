'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { AdminPageTitle, AdminEmptyState, AdminModal } from '../components'
import { INPUT_STYLE } from '../adminStyles'
import a from '../admin.module.css'

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

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M2 3h9M5 3V2h3v1M4 3l.5 8M9 3l-.5 8M6.5 3v8"/>
    </svg>
  )
}

interface CatalogProduct { id: string; name: string; price: number; sizes: string[]; image: string | null }

export default function OrdersClient({ orders, products = [] }: { orders: Order[]; products?: CatalogProduct[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') ?? 'all')
  const [sortKey, setSortKey] = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'date')
  const [sortDir, setSortDir] = useState<SortDir>((searchParams.get('dir') as SortDir) ?? 'desc')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Создание заказа (офлайн-продажи) ──
  type NewItem = { product_id: string; product_name: string; product_image: string | null; size: string; quantity: string; price: string }
  const emptyItem: NewItem = { product_id: '', product_name: '', product_image: null, size: '', quantity: '1', price: '' }
  const [showCreate, setShowCreate] = useState(false)
  const [cEmail, setCEmail] = useState('')
  const [cName, setCName] = useState('')
  const [cAddress, setCAddress] = useState('')
  const [cStatus, setCStatus] = useState<OrderStatus>('delivered')
  const [cItems, setCItems] = useState<NewItem[]>([{ ...emptyItem }])
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')

  const createTotal = cItems.reduce((sum, it) => sum + (parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 1), 0)

  function resetCreate() {
    setCEmail(''); setCName(''); setCAddress(''); setCStatus('delivered')
    setCItems([{ ...emptyItem }]); setCreateErr('')
  }

  // Выбор товара из базы → автоподстановка названия/цены/картинки/первого размера
  function selectProduct(i: number, id: string) {
    setCItems(arr => arr.map((x, j) => {
      if (j !== i) return x
      if (!id) return { ...x, product_id: '', product_image: null }
      const p = products.find(pp => pp.id === id)
      if (!p) return x
      return {
        ...x,
        product_id: id,
        product_name: p.name,
        product_image: p.image,
        price: String(p.price),
        size: p.sizes[0] ?? '',
      }
    }))
  }

  async function submitCreate() {
    setCreateErr('')
    if (!cEmail.trim()) { setCreateErr('Укажи email'); return }
    const items = cItems
      .filter(it => it.product_name.trim() && parseFloat(it.price) > 0)
      .map(it => ({
        product_id: it.product_id || null,
        product_name: it.product_name.trim(),
        product_image: it.product_image,
        size: it.size.trim() || null,
        quantity: parseInt(it.quantity, 10) || 1,
        price: parseFloat(it.price) || 0,
      }))
    if (items.length === 0) { setCreateErr('Добавь хотя бы одну позицию (название + цена)'); return }
    setCreating(true)
    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_email: cEmail.trim(), guest_name: cName.trim() || null,
        delivery_address: cAddress.trim() || null, status: cStatus, items,
      }),
    })
    setCreating(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setCreateErr(d.error ?? 'Ошибка создания'); return }
    setShowCreate(false); resetCreate()
    router.refresh()
  }

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

  async function deleteOrder(id: string) {
    setDeleting(true)
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    setDeleting(false)
    setConfirmId(null)
    router.refresh()
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
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <AdminPageTitle>Заказы ({filtered.length}/{orders.length})</AdminPageTitle>
        <button onClick={() => { resetCreate(); setShowCreate(true) }} className={a.btn}>+ Заказ по email</button>
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
          const isConfirming = confirmId === order.id

          return (
            <div key={order.id} style={{ position: 'relative' }}>
              <Link href={`/admin/orders/${order.id}`} className={a.orderCard} style={{ display: 'block' }}>
                {/* Zone 1: ID left, status + date right */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
                    #{order.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2" style={{ paddingRight: '2rem' }}>
                    <span className="text-xs px-2 py-0.5 uppercase tracking-widest"
                      style={{ borderRadius: '2px', background: 'var(--bg-subtle)', color: STATUS_COLORS[order.status as OrderStatus], fontFamily: "var(--font-onder)", fontSize: '0.6rem', border: '1px solid var(--border)' }}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                {/* Zone 2: items + user */}
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <span key={String(item.id)} className="text-sm" style={{ color: 'var(--accent)', fontFamily: "var(--font-involve)" }}>
                      {String(item.product_name)}{item.size ? ` / ${item.size}` : ''} × {Number(item.quantity)}
                    </span>
                  ))}
                  {profile ? (
                    <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                      {String(profile.name || profile.email || '')}
                    </p>
                  ) : (order.guest_name || order.guest_email) ? (
                    <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: "var(--font-involve)" }}>
                      Гость: {[order.guest_name, order.guest_email].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>
                {/* Zone 3: price right-aligned */}
                <div className="flex justify-end">
                  <p className="text-lg" style={{ color: 'var(--accent)', fontFamily: "var(--font-deutsch)" }}>
                    {formatPrice(order.total)}
                  </p>
                </div>
              </Link>

              {/* Delete button */}
              <button
                onClick={e => { e.stopPropagation(); setConfirmId(isConfirming ? null : order.id) }}
                title="Удалить заказ"
                style={{
                  position: 'absolute',
                  top: '0.6rem',
                  right: '0.6rem',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  color: 'var(--accent)',
                  opacity: isConfirming ? 1 : 0.35,
                  transition: 'opacity 0.15s, border-color 0.15s',
                  zIndex: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = isConfirming ? '1' : '0.35')}
              >
                <TrashIcon />
              </button>

              {/* Inline confirmation */}
              {isConfirming && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                    background: 'var(--bg)',
                    border: '1px solid var(--accent)',
                    boxShadow: '3px 3px 0 var(--accent)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '0 1.5rem',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-involve)', fontSize: '0.82rem', color: 'var(--accent)', flex: 1 }}>
                    Удалить заказ <span style={{ opacity: 0.5 }}>#{order.id.slice(0, 8)}</span>?
                  </p>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    disabled={deleting}
                    style={{
                      padding: '0.35rem 0.9rem',
                      background: 'var(--accent)',
                      color: 'var(--bg)',
                      border: '1px solid var(--accent)',
                      boxShadow: '2px 2px 0 var(--accent)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-onder)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: deleting ? 'wait' : 'pointer',
                      opacity: deleting ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {deleting ? '...' : 'Да, удалить'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{
                      padding: '0.35rem 0.9rem',
                      background: 'transparent',
                      color: 'var(--accent)',
                      border: '1px solid var(--border)',
                      boxShadow: '2px 2px 0 var(--border)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-onder)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Создание заказа по email (офлайн-продажи) */}
      {showCreate && (
        <AdminModal title="Новый заказ по email" onClose={() => setShowCreate(false)}>
          <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
            Если пользователь с таким email уже есть — заказ привяжется сразу. Иначе прилетит в его ЛК при
            первом входе с этим email (с искрами/скидкой при статусе «доставлен»).
          </p>

          <div className="flex flex-col gap-2">
            <input value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="email покупателя *"
              style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.5rem 0.7rem', outline: 'none' }} />
            <div className="flex gap-2 flex-wrap">
              <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Имя (необязательно)"
                style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.5rem 0.7rem', outline: 'none', flex: 1, minWidth: 140 }} />
              <select value={cStatus} onChange={e => setCStatus(e.target.value as OrderStatus)}
                style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.5rem 0.7rem', outline: 'none' }}>
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(st => (
                  <option key={st} value={st}>{ORDER_STATUS_LABELS[st]}</option>
                ))}
              </select>
            </div>
            <input value={cAddress} onChange={e => setCAddress(e.target.value)} placeholder="Адрес доставки (необязательно)"
              style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.5rem 0.7rem', outline: 'none' }} />
          </div>

          {/* Позиции */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Позиции</span>
            {cItems.map((it, i) => {
              const selected = products.find(p => p.id === it.product_id)
              return (
                <div key={i} className="flex flex-col gap-2" style={{ border: '1px solid var(--border-soft)', borderRadius: 4, padding: '0.6rem' }}>
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Выбор товара из базы (или вручную) */}
                    <select value={it.product_id} onChange={e => selectProduct(i, e.target.value)}
                      style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', flex: 2, minWidth: 160 }}>
                      <option value="">— ввести вручную —</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} · {p.price}</option>
                      ))}
                    </select>
                    {cItems.length > 1 && (
                      <button onClick={() => setCItems(arr => arr.filter((_, j) => j !== i))} className={a.btnDanger} style={{ padding: '0.3rem 0.6rem' }}>✕</button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Без выбора из базы — ручной ввод названия */}
                    {!it.product_id && (
                      <input value={it.product_name} onChange={e => setCItems(arr => arr.map((x, j) => j === i ? { ...x, product_name: e.target.value } : x))}
                        placeholder="Название товара" style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', flex: 2, minWidth: 120 }} />
                    )}
                    {/* Размер: из базы (select) или вручную */}
                    {selected && selected.sizes.length > 0 ? (
                      <select value={it.size} onChange={e => setCItems(arr => arr.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                        style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', width: 90 }}>
                        {selected.sizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                      </select>
                    ) : (
                      <input value={it.size} onChange={e => setCItems(arr => arr.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                        placeholder="Размер" style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', width: 80 }} />
                    )}
                    <input value={it.quantity} onChange={e => setCItems(arr => arr.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))}
                      inputMode="numeric" placeholder="Кол-во" style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', width: 60 }} />
                    <input value={it.price} onChange={e => setCItems(arr => arr.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                      inputMode="numeric" placeholder="Цена" style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.4rem 0.6rem', outline: 'none', width: 80 }} />
                  </div>
                </div>
              )
            })}
            <button onClick={() => setCItems(arr => [...arr, { ...emptyItem }])} className={a.btnSecondary} style={{ alignSelf: 'flex-start' }}>+ позиция</button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <span style={{ fontFamily: 'var(--font-deutsch)', fontSize: '1.1rem', color: 'var(--accent)' }}>Итого: {formatPrice(createTotal)}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreate(false)} className={a.btnSecondary}>Отмена</button>
              <button onClick={submitCreate} disabled={creating} className={a.btn}>{creating ? 'Создаём...' : 'Создать заказ'}</button>
            </div>
          </div>
          {createErr && <span style={{ color: 'var(--status-error)', fontFamily: 'var(--font-involve)', fontSize: '0.78rem' }}>{createErr}</span>}
        </AdminModal>
      )}
    </div>
  )
}
