'use client';

import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import type { Order, Profile, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { toggleTheme } from '@/lib/theme';

function BrutalSun() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z"/></svg>
}
function BrutalMoon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M8,1 L12,3 L14,7 L12,11 L8,13 L10,10.5 L11,7 L10,3.5 Z"/></svg>
}
function LvlFire() {
  return <svg width="40" height="40" viewBox="0 0 20 24" fill="currentColor"><path d="M10,0 L14,6 L16,4 L15,10 L18,8 L16,14 L18,13 L14,20 L10,24 L6,20 L2,13 L4,14 L2,8 L5,10 L4,4 L6,6 Z"/></svg>
}
function LvlBolt() {
  return <svg width="36" height="40" viewBox="0 0 14 24" fill="currentColor"><path d="M9,0 L2,13 L7,13 L5,24 L12,11 L7,11 Z"/></svg>
}
function LvlStar() {
  return <svg width="36" height="36" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z"/></svg>
}
function LvlCircle() {
  return <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="7,0.5 13.5,4 13.5,10 7,13.5 0.5,10 0.5,4"/></svg>
}
import s from './account.module.css';

interface Props {
  user: { id: string; email: string };
  profile: Profile | null;
  orders: Order[];
  profileBg?: string | null;
  profileBgDark?: string | null;
}

function getLevel(sparks: number) {
  if (sparks === 0) return 1;
  if (sparks <= 2) return 2;
  if (sparks <= 5) return 3;
  if (sparks <= 9) return 4;
  return 5;
}

function getUsername(email: string, name: string | null) {
  if (name) return name.toUpperCase();
  return email.split('@')[0].toUpperCase();
}

export default function AccountClient({ user, profile, orders, profileBg, profileBgDark }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [showNicknameModal, setShowNicknameModal] = useState(!profile?.name);
  const [nicknameInput, setNicknameInput] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.name ?? null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark');
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.dataset.theme === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const allItems = orders.flatMap((o) => o.order_items ?? []);
  const sparks = allItems.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueItems = [...new Map(allItems.map((i) => [i.product_id, i])).values()];
  const level = getLevel(sparks);
  const username = getUsername(user.email, displayName);
  const collections = [...new Set(orders.map(() => 'AQUA+'))].length;

  const TOTAL_SLOTS = 6;
  const inventorySlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => uniqueItems[i] ?? null);

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    if (!trimmed) { setNicknameError('Введи никнейм'); return; }
    if (trimmed.length < 2) { setNicknameError('Минимум 2 символа'); return; }
    if (trimmed.length > 20) { setNicknameError('Максимум 20 символов'); return; }
    setSavingNickname(true);
    setNicknameError('');
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) { setNicknameError('Ошибка сохранения'); setSavingNickname(false); return; }
    setDisplayName(trimmed);
    setShowNicknameModal(false);
    setSavingNickname(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/account/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setAvatarUrl(data.url + '?t=' + Date.now());
    setUploadingAvatar(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  }

  return (
    <div className={s.page} style={(() => { const bg = isDark ? (profileBgDark ?? profileBg) : (profileBg ?? profileBgDark); return bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : undefined })()} >
      {/* Nickname modal */}
      {showNicknameModal && (
        <div className={s.modalOverlay}>
          <div className={s.modalCard}>
            <div>
              <h2 className={s.modalTitle}>ТВОЙ ПОЗЫВНОЙ</h2>
              <p className={s.modalSubtitle}>Как тебя звать в THREEP?</p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => { setNicknameInput(e.target.value); setNicknameError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                placeholder="nickname"
                maxLength={20}
                autoFocus
                className={s.modalInput}
              />
              {nicknameError && <p className={s.modalError}>{nicknameError}</p>}
            </div>
            <button
              onClick={handleSaveNickname}
              disabled={savingNickname}
              className={s.modalBtn}
            >
              {savingNickname ? 'Сохраняем...' : 'Подтвердить'}
            </button>
          </div>
        </div>
      )}

      <div className={s.content}>
        <div className={s.inner}>
          {/* Top nav */}
          <div className={s.topNav}>
            <Link href="/" className={s.topNavLink}>← На главную</Link>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={handleLogout} disabled={loggingOut} className={s.topNavBtn}>
                {loggingOut ? '...' : 'Выйти'}
              </button>
              <button onClick={() => { toggleTheme(); setIsDark(d => !d); }} className={s.topNavBtn} title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
                {isDark ? <BrutalSun /> : <BrutalMoon />}
              </button>
            </div>
          </div>

          {/* Profile card */}
          <div className={s.profileCard}>
            <div className={s.profileInfo}>
              <span className={s.levelBadge}>LVL {level}</span>
              <h2 className={s.username}>{username}</h2>

              <div className="flex gap-2">
                {uniqueItems.slice(0, 4).map((item, i) => (
                  <div key={i} className={s.avatarThumb}>
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--accent)' }}
                      >
                        {item.product_name[0]}
                      </div>
                    )}
                  </div>
                ))}
                {uniqueItems.length === 0 &&
                  [0, 1, 2, 3].map((i) => <div key={i} className={s.avatarThumbEmpty} />)}
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { label: 'Искорки', value: sparks },
                  { label: 'Шмот', value: uniqueItems.length },
                  { label: 'Заказы', value: orders.length },
                ].map(({ label, value }) => (
                  <p key={label} className={s.stat}>
                    <span className={s.statLabel}>{label}: </span>
                    <span>{value}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Avatar — right column, full card height */}
            <div className={s.avatarCol}>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className={s.avatarBtn}
                title="Сменить аватарку"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="160px" />
                ) : (
                  <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {level >= 4 ? <LvlFire /> : level >= 3 ? <LvlBolt /> : level >= 2 ? <LvlStar /> : <LvlCircle />}
                  </span>
                )}
                <div className={s.avatarOverlay}>
                  {uploadingAvatar ? '...' : 'Сменить'}
                </div>
              </button>
            </div>
          </div>

          {/* Collections */}
          <div className={s.collectionsCard}>
            <p className={s.collectionsLabel}>Собранные коллекции: {collections}</p>
            <div className="flex gap-2 items-center">
              {orders.length > 0 && (
                <Image
                  src="/images/aqua+.png"
                  alt="AQUA+"
                  width={32}
                  height={32}
                  style={{ border: '2px solid var(--accent-2)', borderRadius: '2px' }}
                />
              )}
              {[...Array(7)].map((_, i) => (
                <div key={i} className={s.collectionSlot}>★</div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className={s.tabs}>
            {(['inventory', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? s.tabActive : s.tab}
              >
                {tab === 'inventory' ? 'Инвентарь' : 'Заказы'}
              </button>
            ))}
          </div>

          {/* Inventory tab */}
          {activeTab === 'inventory' && (
            <div className={s.inventoryCard}>
              <div className={s.inventoryHeader}>
                <div>
                  <p className={s.collectionsLabel}>Инвентарь</p>
                  <p className={s.inventoryTitle}>ШМОТ</p>
                </div>
                {sparks < 3 && (
                  <p className={s.inventoryHint}>
                    «До открытия секретки осталось {3 - sparks} искорки»
                  </p>
                )}
              </div>

              <div className={s.inventoryGrid}>
                {inventorySlots.map((item, i) =>
                  item ? (
                    <Link
                      key={i}
                      href={`/account/orders/${orders.find((o) => o.order_items?.some((oi) => oi.id === item.id))?.id ?? ''}`}
                      className={s.inventorySlot}
                    >
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          <span style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: '0.55rem' }}>
                            {item.product_name}
                          </span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div key={i} className={s.inventorySlotEmpty}>?</div>
                  )
                )}
              </div>

              <Link href="/#catalog" className={s.ctaBtn}>
                {sparks === 0 ? 'Собери коллекцию' : 'Добить коллекцию'}
              </Link>
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <div className={s.emptyOrders}>Заказов пока нет</div>
              ) : (
                orders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className={s.orderCard}>
                    <div className={s.orderMeta}>
                      <span className={s.orderId}>#{order.id.slice(0, 8)}</span>
                      <span
                        className="text-xs px-2 py-0.5 uppercase tracking-widest"
                        style={{
                          borderRadius: '2px',
                          background: STATUS_COLORS[order.status] + '22',
                          color: STATUS_COLORS[order.status],
                          fontFamily: "var(--font-onder)",
                          fontSize: '0.6rem',
                          border: `1px solid ${STATUS_COLORS[order.status]}55`,
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        {order.order_items?.map((item) => (
                          <p key={item.id} className={s.orderItemName}>
                            {item.product_name}
                            {item.size && <span className={s.orderItemSize}> / {item.size}</span>}
                          </p>
                        ))}
                      </div>
                      <p className={s.orderTotal}>{formatPrice(order.total)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          <Link href="/" className={s.backLink}>← В магазин</Link>
        </div>
      </div>
    </div>
  );
}
