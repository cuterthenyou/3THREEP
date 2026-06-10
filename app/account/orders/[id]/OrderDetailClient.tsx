'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Order, Message, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import EmojiPicker, { type CustomEmoji } from '@/components/EmojiPicker';
import { renderMessage } from '@/components/renderEmoji';
import s from './order-detail.module.css';

interface Props {
  order: Order;
  messages: Message[];
  userId: string;
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

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'СЕГОДНЯ';
  if (d.toDateString() === yest.toDateString()) return 'ВЧЕРА';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }).toUpperCase();
}

export default function OrderDetailClient({ order, messages: initialMessages, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  const hasUserMessages = initialMessages.some(m => !m.is_admin && m.sender_id === userId);
  const [chatConsented, setChatConsented] = useState(hasUserMessages);
  const [consentChecked, setConsentChecked] = useState(false);
  const [copied, setCopied] = useState<string>('');

  function copy(value: string, label: string) {
    navigator.clipboard?.writeText(value)
      .then(() => { setCopied(label); setTimeout(() => setCopied(''), 1500); })
      .catch(() => {});
  }

  useEffect(() => {
    if (!hasUserMessages) {
      const stored = localStorage.getItem(`chat-consent-${order.id}`);
      if (stored === '1') setChatConsented(true);
    }
  }, [hasUserMessages, order.id]);

  useEffect(() => {
    fetch('/api/emojis').then(r => r.json()).then(setCustomEmojis).catch(() => {});
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // First render: jump to bottom. After that, only follow if the reader is
    // already near the bottom (don't yank them while scrolled up reading).
    if (!didInitialScroll.current) {
      didInitialScroll.current = true;
      bottomRef.current?.scrollIntoView();
      return;
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!input) {
      setText(t => t + emoji);
      return;
    }
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

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

        <div className={`${s.orderCard} hud-corners`}>
          <div className={s.orderHeader}>
            <span
              className={s.orderId}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              title="Скопировать номер заказа"
              onClick={() => copy(order.id, 'id')}
            >
              Заказ #{order.id.slice(0, 8)} <span style={{ opacity: 0.5 }}>{copied === 'id' ? '✓' : '⧉'}</span>
            </span>
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
              <strong
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                title="Скопировать трек-номер"
                onClick={() => copy(order.tracking_number!, 'track')}
              >
                {order.tracking_number} <span style={{ opacity: 0.5, fontWeight: 400 }}>{copied === 'track' ? '✓' : '⧉'}</span>
              </strong>
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
          <div className={`${s.chatMessages} hud-corners`} ref={messagesRef}>
            {messages.length === 0 && (
              <p className={s.chatEmpty}>Напиши нам по деталям заказа</p>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id}>
                {(i === 0 || !sameDay(messages[i - 1].created_at, msg.created_at)) && (
                  <div className={s.dateSep}><span>{dayLabel(msg.created_at)}</span></div>
                )}
                <div className={msg.is_admin ? s.msgAdmin : s.msgUser}>
                  <div className={msg.is_admin ? s.msgBubbleAdmin : s.msgBubbleUser}>
                    {msg.is_admin && <p className={s.msgSender}>THREEP</p>}
                    <p className={s.msgText}>{renderMessage(msg.text, customEmojis)}</p>
                    <p className={s.msgTime}>
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {!chatConsented ? (
            <div className={s.consentBanner}>
              <label className={s.consentLabel}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                />
                <span>Я согласен с хранением переписки о заказе</span>
              </label>
              <button
                disabled={!consentChecked}
                onClick={() => {
                  localStorage.setItem(`chat-consent-${order.id}`, '1');
                  setChatConsented(true);
                }}
                className={s.consentBtn}
              >
                Начать чат
              </button>
            </div>
          ) : (
            <div className={s.chatInputRow}>
              <EmojiPicker onSelect={insertEmoji} />
              <input
                ref={inputRef}
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
          )}
        </div>
      </div>
    </main>
  );
}
