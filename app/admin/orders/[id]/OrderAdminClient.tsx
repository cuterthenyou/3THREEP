'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { OrderStatus, Message } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'

const STATUSES: OrderStatus[] = ['new', 'paid', 'in_progress', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#F29774', paid: '#7EC8A4', in_progress: '#F2C46D',
  shipped: '#74B3F2', delivered: '#A8E6A3', cancelled: '#E08080',
}

function formatPrice(p: number) { return p.toLocaleString('ru-RU') + ' ₽' }

interface Props {
  order: Record<string, unknown>
  messages: Message[]
  adminId: string
}

export default function OrderAdminClient({ order, messages: init, adminId }: Props) {
  const [status, setStatus] = useState(order.status as OrderStatus)
  const [tracking, setTracking] = useState(String(order.tracking_number ?? ''))
  const [messages, setMessages] = useState<Message[]>(init)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}/messages`)
      if (!res.ok) return
      const data: Message[] = await res.json()
      setMessages(data)
    } catch {}
  }, [order.id])

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  async function saveOrder() {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking || null }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  async function sendMessage() {
    if (!text.trim()) return
    setSending(true)
    const msgText = text.trim()
    setText('')

    const optimistic: Message = {
      id: `temp-${Date.now()}`, order_id: String(order.id), sender_id: adminId,
      is_admin: true, text: msgText, created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    await fetch(`/api/admin/orders/${order.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msgText }),
    })

    await fetchMessages()
    setSending(false)
  }

  const profile = order.profiles as Record<string, unknown> | null
  const items = (order.order_items as Record<string, unknown>[]) ?? []

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-xs uppercase tracking-widest"
          style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>
          ← Заказы
        </Link>
        <span className="text-xs" style={{ color: '#F29774', opacity: 0.3, fontFamily: "'Involve', sans-serif" }}>
          #{String(order.id).slice(0, 8)}
        </span>
      </div>

      {/* Customer + items */}
      <div className="rounded-xl p-4 flex flex-col gap-3"
        style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.15)' }}>
        {profile && (
          <p className="text-sm" style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
            <span style={{ opacity: 0.5 }}>Клиент: </span>
            {String(profile.name || profile.email || '')}
          </p>
        )}
        {items.map(item => (
          <div key={String(item.id)} className="flex justify-between text-sm"
            style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
            <span>{String(item.product_name)}{item.size ? ` / ${item.size}` : ''} × {Number(item.quantity)}</span>
            <span>{formatPrice(Number(item.price) * Number(item.quantity))}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2"
          style={{ borderTop: '1px solid rgba(242,151,116,0.15)', color: '#F29774' }}>
          <span style={{ opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>Итого</span>
          <span style={{ fontFamily: "'ONDER', sans-serif" }}>{formatPrice(Number(order.total))}</span>
        </div>
        {!!order.delivery_address && (
          <p className="text-sm" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
            <span style={{ opacity: 0.5 }}>Адрес: </span>{`${order.delivery_address}`}
          </p>
        )}
        {!!order.comment && (
          <p className="text-sm" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
            <span style={{ opacity: 0.5 }}>Комментарий: </span>{`${order.comment}`}
          </p>
        )}
      </div>

      {/* Status + tracking */}
      <div className="rounded-xl p-4 flex flex-col gap-4"
        style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.15)' }}>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest"
            style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>
            Статус
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className="text-xs px-3 py-1.5 rounded-full uppercase tracking-widest transition-all"
                style={{
                  background: status === s ? STATUS_COLORS[s] + '33' : 'transparent',
                  color: STATUS_COLORS[s],
                  border: `1px solid ${STATUS_COLORS[s]}${status === s ? 'ff' : '55'}`,
                  fontFamily: "'ONDER', sans-serif",
                  fontSize: '0.6rem',
                }}>
                {ORDER_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest"
            style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>
            Трек-номер
          </label>
          <input type="text" placeholder="RU123456789" value={tracking}
            onChange={e => setTracking(e.target.value)}
            className="w-full px-4 py-2 rounded-lg outline-none text-sm"
            style={{ background: 'rgba(242,151,116,0.08)', color: '#F29774', border: '1px solid rgba(242,151,116,0.2)', fontFamily: "'Involve', sans-serif" }} />
        </div>
        <button onClick={saveOrder} disabled={saving}
          className="px-6 py-2 uppercase tracking-widest text-sm transition-opacity self-start"
          style={{ background: '#F29774', color: '#A9342A', borderRadius: '8px', fontFamily: "'ONDER', sans-serif", fontSize: '0.75rem', opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </div>

      {/* Chat */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-widest"
          style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>
          Чат с клиентом
        </h3>
        <div className="rounded-xl p-4 flex flex-col gap-3 max-h-80 overflow-y-auto"
          style={{ background: '#111' }}>
          {messages.length === 0 && (
            <p className="text-sm text-center m-auto"
              style={{ color: '#F29774', opacity: 0.3, fontFamily: "'Involve', sans-serif" }}>
              Нет сообщений
            </p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] rounded-xl px-4 py-2"
                style={{ background: msg.is_admin ? '#A9342A' : 'rgba(242,151,116,0.1)' }}>
                {!msg.is_admin && (
                  <p className="text-xs mb-1" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'ONDER', sans-serif" }}>Клиент</p>
                )}
                <p className="text-sm" style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Ответить клиенту..." value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 px-4 py-2 rounded-lg outline-none text-sm"
            style={{ background: 'rgba(242,151,116,0.08)', color: '#F29774', border: '1px solid rgba(242,151,116,0.2)', fontFamily: "'Involve', sans-serif" }} />
          <button onClick={sendMessage} disabled={sending || !text.trim()}
            className="px-4 py-2 uppercase tracking-widest transition-opacity"
            style={{ background: '#F29774', color: '#A9342A', borderRadius: '8px', fontFamily: "'ONDER', sans-serif", fontSize: '0.75rem', opacity: sending || !text.trim() ? 0.5 : 1 }}>
            →
          </button>
        </div>
      </div>
    </div>
  )
}
