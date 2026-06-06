'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { OrderStatus, Message } from '@/lib/types';
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import EmojiPicker, { type CustomEmoji } from '@/components/EmojiPicker';
import { renderMessage } from '@/components/renderEmoji';
import s from './order-admin.module.css';

const STATUSES: OrderStatus[] = [
  'new',
  'paid',
  'in_progress',
  'shipped',
  'delivered',
  'cancelled',
];

interface Props {
  order: Record<string, unknown>;
  messages: Message[];
  adminId: string;
}

export default function OrderAdminClient({ order, messages: init, adminId }: Props) {
  const [status, setStatus] = useState(order.status as OrderStatus);
  const [tracking, setTracking] = useState(String(order.tracking_number ?? ''));
  const [messages, setMessages] = useState<Message[]>(init);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/emojis').then(r => r.json()).then(setCustomEmojis).catch(() => {});
  }, []);

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

  function insertEmoji(emoji: string) {
    const input = inputRef.current;
    if (!input) { setText(t => t + emoji); return; }
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function saveOrder() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking || null }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    const msgText = text.trim();
    setText('');

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      order_id: String(order.id),
      sender_id: adminId,
      is_admin: true,
      text: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    await fetch(`/api/admin/orders/${order.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msgText }),
    });

    await fetchMessages();
    setSending(false);
  }

  const profile = order.profiles as Record<string, unknown> | null;
  const items = (order.order_items as Record<string, unknown>[]) ?? [];

  return (
    <div className={s.page}>
      <div className={s.breadcrumb}>
        <Link href="/admin/orders" className={s.backLink}>← Заказы</Link>
        <span className={s.orderId}>#{String(order.id).slice(0, 8)}</span>
      </div>

      {/* Customer + items */}
      <div className={s.card}>
        {profile ? (
          <p className={s.clientName}>
            <span className={s.clientLabel}>Клиент: </span>
            {String(profile.name || profile.email || '')}
          </p>
        ) : (order.guest_name || order.guest_email) ? (
          <p className={s.clientName}>
            <span className={s.clientLabel}>Гость: </span>
            {[String(order.guest_name || ''), String(order.guest_email || '')].filter(Boolean).join(' · ')}
            {order.guest_phone ? ` · ${order.guest_phone}` : ''}
          </p>
        ) : null}
        {items.map((item) => (
          <div key={String(item.id)} className={s.itemRow}>
            <span>
              {String(item.product_name)}
              {item.size ? ` / ${item.size}` : ''} × {Number(item.quantity)}
            </span>
            <span>{formatPrice(Number(item.price) * Number(item.quantity))}</span>
          </div>
        ))}
        <div className={s.totalRow}>
          <span className={s.totalLabel}>Итого</span>
          <span className={s.totalAmount}>{formatPrice(Number(order.total))}</span>
        </div>
        {!!order.delivery_address && (
          <p className={s.metaRow}>
            <span className={s.metaLabel}>Адрес: </span>
            {`${order.delivery_address}`}
          </p>
        )}
        {!!order.comment && (
          <p className={s.metaRow}>
            <span className={s.metaLabel}>Комментарий: </span>
            {`${order.comment}`}
          </p>
        )}
      </div>

      {/* Status + tracking */}
      <div className={s.card}>
        <div className="flex flex-col gap-2">
          <label className={s.sectionLabel}>Статус</label>
          <div className={s.statusRow}>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className="text-xs px-3 py-1.5 uppercase tracking-widest transition-all"
                style={{
                  borderRadius: '2px',
                  background: status === st ? STATUS_COLORS[st] + '33' : 'transparent',
                  color: STATUS_COLORS[st],
                  border: `1px solid ${STATUS_COLORS[st]}${status === st ? 'ff' : '55'}`,
                  fontFamily: 'var(--font-onder)',
                  fontSize: '0.6rem',
                }}
              >
                {ORDER_STATUS_LABELS[st]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className={s.sectionLabel}>Трек-номер</label>
          <input
            type="text"
            placeholder="RU123456789"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className={s.trackingInput}
          />
        </div>
        <button onClick={saveOrder} disabled={saving} className={s.saveBtn}>
          {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </div>

      {/* Chat */}
      <div className="flex flex-col gap-3">
        <h3 className={s.chatTitle}>Чат с клиентом</h3>
        <div className={s.chatMessages}>
          {messages.length === 0 && (
            <p className={s.chatEmpty}>Нет сообщений</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={msg.is_admin ? s.msgAdmin : s.msgClient}>
              <div className={msg.is_admin ? s.msgBubbleAdmin : s.msgBubbleClient}>
                {!msg.is_admin && <p className={s.msgSender}>Клиент</p>}
                <p className={s.msgText}>{renderMessage(msg.text, customEmojis)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className={s.chatInputRow}>
          <EmojiPicker onSelect={insertEmoji} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ответить клиенту..."
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
  );
}
