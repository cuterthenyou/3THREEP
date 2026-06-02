'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Order, Message, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import s from './order-detail.module.css';

interface Props {
  order: Order;
  messages: Message[];
  userId: string;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'var(--status-new)',
  paid: 'var(--status-paid)',
  in_progress: 'var(--status-in-progress)',
  shipped: 'var(--status-shipped)',
  delivered: 'var(--status-delivered)',
  cancelled: 'var(--status-cancelled)',
};

function formatPrice(p: number) {
  return p.toLocaleString('ru-RU') + ' ₽';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailClient({ order, messages: initialMessages, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}/messages`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
    } catch {}
  }, [order.id]);

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    const msgText = text.trim();
    setText('');

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      order_id: order.id,
      sender_id: userId,
      is_admin: false,
      text: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    await fetch(`/api/orders/${order.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msgText }),
    });

    await fetchMessages();
    setSending(false);
  }

  const statusColor = STATUS_COLORS[order.status];

  return (
    <main className={s.page}>
      <div className={s.container}>
        <Link href="/account" className={s.backLink}>← Мои заказы</Link>

        <div className={s.orderCard}>
          <div className={s.orderHeader}>
            <span className={s.orderId}>Заказ #{order.id.slice(0, 8)}</span>
            <span
              className="text-xs px-3 py-1 rounded-full uppercase tracking-widest"
              style={{
                background: statusColor + '22',
                color: statusColor,
                fontFamily: "var(--font-onder)",
                fontSize: '0.65rem',
                border: `1px solid ${statusColor}`,
              }}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <p className={s.orderDate}>{formatDate(order.created_at)}</p>

          <div className="flex flex-col gap-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className={s.itemRow}>
                {item.product_image && (
                  <div className={s.itemThumb}>
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className={s.itemName}>{item.product_name}</p>
                  <p className={s.itemMeta}>
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </p>
                </div>
                <p className={s.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className={s.totalRow}>
            <span className={s.totalLabel}>Итого</span>
            <span className={s.totalAmount}>{formatPrice(order.total)}</span>
          </div>

          {order.delivery_address && (
            <p className={s.deliveryRow}>
              <span className={s.deliveryLabel}>Адрес: </span>
              {order.delivery_address}
            </p>
          )}
          {order.tracking_number && (
            <p className={s.trackingRow}>
              <span style={{ opacity: 0.5 }}>Трек-номер: </span>
              <strong>{order.tracking_number}</strong>
            </p>
          )}

          {order.status === 'new' && (
            <div className={s.paymentInfo}>
              Для оплаты переведи <strong>{formatPrice(order.total)}</strong> на карту.
              Реквизиты уточни в чате ниже.
            </div>
          )}
        </div>

        <div className={s.chatSection}>
          <h3 className={s.chatTitle}>Чат по заказу</h3>
          <div className={s.chatMessages}>
            {messages.length === 0 && (
              <p className={s.chatEmpty}>Напиши нам по деталям заказа</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={msg.is_admin ? s.msgAdmin : s.msgUser}>
                <div className={msg.is_admin ? s.msgBubbleAdmin : s.msgBubbleUser}>
                  {msg.is_admin && <p className={s.msgSender}>THREEP</p>}
                  <p className={s.msgText}>{msg.text}</p>
                  <p className={s.msgTime}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className={s.chatInputRow}>
            <input
              type="text"
              placeholder="Написать сообщение..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className={s.chatInput}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className={s.chatSendBtn}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
