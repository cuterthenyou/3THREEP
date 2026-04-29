'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, Message, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  order: Order
  messages: Message[]
  userId: string
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#F29774',
  paid: '#7EC8A4',
  in_progress: '#F2C46D',
  shipped: '#74B3F2',
  delivered: '#A8E6A3',
  cancelled: '#E08080',
}

function formatPrice(p: number) {
  return p.toLocaleString('ru-RU') + ' ₽'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetailClient({ order, messages: initialMessages, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${order.id}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          const tempIdx = prev.findIndex((m) => m.id.startsWith('temp-') && m.text === msg.text && m.sender_id === msg.sender_id)
          if (tempIdx !== -1) {
            const updated = [...prev]
            updated[tempIdx] = msg
            return updated
          }
          return [...prev, msg]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [order.id, supabase])

  async function sendMessage() {
    if (!text.trim()) return
    setSending(true)
    const msgText = text.trim()
    setText('')
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      order_id: order.id,
      sender_id: userId,
      is_admin: false,
      text: msgText,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    const { data } = await supabase.from('messages').insert({
      order_id: order.id,
      sender_id: userId,
      is_admin: false,
      text: msgText,
    }).select().single()
    if (data) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? data as Message : m))
    }
    setSending(false)
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: '#1a1a1a' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Back */}
        <Link
          href="/account"
          className="text-sm uppercase tracking-widest"
          style={{ color: '#F29774', opacity: 0.6, fontFamily: "'ONDER', sans-serif" }}
        >
          ← Мои заказы
        </Link>

        {/* Order header */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: '#A9342A' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-sm uppercase tracking-widest"
              style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
            >
              Заказ #{order.id.slice(0, 8)}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full uppercase tracking-widest"
              style={{
                background: STATUS_COLORS[order.status] + '22',
                color: STATUS_COLORS[order.status],
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.65rem',
                border: `1px solid ${STATUS_COLORS[order.status]}`,
              }}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <p className="text-xs" style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
            {formatDate(order.created_at)}
          </p>

          {/* Items */}
          <div className="flex flex-col gap-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image && (
                  <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                    <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                  </div>
                )}
                <div className="flex-1">
                  <p style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", fontSize: '0.9rem' }}>
                    {item.product_name}
                  </p>
                  <p className="text-xs" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </p>
                </div>
                <p style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(242,151,116,0.2)' }}>
            <span className="text-sm" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>Итого</span>
            <span className="text-xl" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>{formatPrice(order.total)}</span>
          </div>

          {/* Delivery */}
          {order.delivery_address && (
            <div className="text-sm" style={{ color: '#F29774', opacity: 0.7, fontFamily: "'Involve', sans-serif" }}>
              <span style={{ opacity: 0.5 }}>Адрес: </span>{order.delivery_address}
            </div>
          )}
          {order.tracking_number && (
            <div className="text-sm" style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
              <span style={{ opacity: 0.5 }}>Трек-номер: </span>
              <strong>{order.tracking_number}</strong>
            </div>
          )}

          {/* Payment info for new orders */}
          {order.status === 'new' && (
            <div
              className="rounded-lg p-4 text-sm"
              style={{ background: 'rgba(242,151,116,0.1)', border: '1px solid rgba(242,151,116,0.3)' }}
            >
              <p style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
                Для оплаты переведи <strong>{formatPrice(order.total)}</strong> на карту.
                Реквизиты уточни в чате ниже.
              </p>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="flex flex-col gap-3">
          <h3
            className="text-sm uppercase tracking-widest"
            style={{ color: '#F29774', opacity: 0.6, fontFamily: "'ONDER', sans-serif" }}
          >
            Чат по заказу
          </h3>

          <div
            className="rounded-xl p-4 flex flex-col gap-3 min-h-[200px] max-h-[400px] overflow-y-auto"
            style={{ background: '#111' }}
          >
            {messages.length === 0 && (
              <p
                className="text-sm text-center m-auto"
                style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}
              >
                Напиши нам по деталям заказа
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="max-w-[75%] rounded-xl px-4 py-2"
                  style={{
                    background: msg.is_admin ? '#A9342A' : 'rgba(242,151,116,0.15)',
                    border: msg.is_admin ? 'none' : '1px solid rgba(242,151,116,0.3)',
                  }}
                >
                  {msg.is_admin && (
                    <p className="text-xs mb-1" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'ONDER', sans-serif" }}>
                      THREEP
                    </p>
                  )}
                  <p className="text-sm" style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
                    {msg.text}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Написать сообщение..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1 px-4 py-3 rounded outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#F29774',
                border: '2px solid rgba(242,151,116,0.3)',
                borderRadius: '5px',
                fontFamily: "'Involve', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="px-5 py-3 uppercase tracking-widest transition-opacity"
              style={{
                background: '#F29774',
                color: '#A9342A',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.75rem',
                opacity: sending || !text.trim() ? 0.5 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
