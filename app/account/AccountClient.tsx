'use client'

import { signOut } from 'next-auth/react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Order, Profile, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  user: { id: string; email: string }
  profile: Profile | null
  orders: Order[]
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#F29774',
  paid: '#7EC8A4',
  in_progress: '#F2C46D',
  shipped: '#74B3F2',
  delivered: '#A8E6A3',
  cancelled: '#E08080',
}

function formatPrice(price: number) {
  return price.toLocaleString('ru-RU') + ' ₽'
}

function getLevel(sparks: number) {
  if (sparks === 0) return 1
  if (sparks <= 2) return 2
  if (sparks <= 5) return 3
  if (sparks <= 9) return 4
  return 5
}

function getUsername(email: string, name: string | null) {
  if (name) return name.toUpperCase()
  return email.split('@')[0].toUpperCase()
}

export default function AccountClient({ user, profile, orders }: Props) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory')
  const [showNicknameModal, setShowNicknameModal] = useState(!profile?.name)
  const [nicknameInput, setNicknameInput] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.name ?? null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const allItems = orders.flatMap(o => o.order_items ?? [])
  const sparks = allItems.reduce((sum, i) => sum + i.quantity, 0)
  const uniqueItems = [...new Map(allItems.map(i => [i.product_id, i])).values()]
  const level = getLevel(sparks)
  const username = getUsername(user.email, displayName)
  const collections = [...new Set(orders.map(o => 'AQUA+'))].length

  const TOTAL_SLOTS = 6
  const inventorySlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => uniqueItems[i] ?? null)

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim()
    if (!trimmed) { setNicknameError('Введи никнейм'); return }
    if (trimmed.length < 2) { setNicknameError('Минимум 2 символа'); return }
    if (trimmed.length > 20) { setNicknameError('Максимум 20 символов'); return }
    setSavingNickname(true)
    setNicknameError('')
    const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', user.id)
    if (error) { setNicknameError('Ошибка сохранения'); setSavingNickname(false); return }
    setDisplayName(trimmed)
    setShowNicknameModal(false)
    setSavingNickname(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/account/avatar', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setAvatarUrl(data.url + '?t=' + Date.now())
    setUploadingAvatar(false)
  }

  // async function handleLogout() {
  //   setLoggingOut(true)
  //   await supabase.auth.signOut()
  //   router.push('/')
  //   router.refresh()
  // }

  async function handleLogout() {
  setLoggingOut(true)

  await signOut({
    callbackUrl: '/',
  })
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0d0505' }}>

      {/* Nickname modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(13,5,5,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: 'linear-gradient(135deg, #A9342A 0%, #7a1f1a 100%)', border: '1px solid rgba(242,151,116,0.3)' }}>
            <div>
              <h2 className="text-xl" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", letterSpacing: '0.05em' }}>
                ТВОЙ ПОЗЫВНОЙ
              </h2>
              <p className="text-xs mt-1" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
                Как тебя звать в THREEP?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={e => { setNicknameInput(e.target.value); setNicknameError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSaveNickname()}
                placeholder="nickname"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-xl outline-none text-base"
                style={{
                  background: 'rgba(242,151,116,0.12)',
                  border: '1px solid rgba(242,151,116,0.3)',
                  color: '#F29774',
                  fontFamily: "'ONDER', sans-serif",
                  letterSpacing: '0.05em',
                }}
              />
              {nicknameError && (
                <p className="text-xs" style={{ color: '#E08080', fontFamily: "'Involve', sans-serif" }}>{nicknameError}</p>
              )}
            </div>
            <button
              onClick={handleSaveNickname}
              disabled={savingNickname}
              className="w-full py-3 uppercase tracking-widest transition-opacity"
              style={{
                background: '#F29774',
                color: '#A9342A',
                borderRadius: '10px',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.8rem',
                opacity: savingNickname ? 0.5 : 1,
              }}
            >
              {savingNickname ? 'Сохраняем...' : 'Подтвердить'}
            </button>
          </div>
        </div>
      )}

      {/* Background video - blurred */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(8px) brightness(0.25) saturate(0.6)', transform: 'scale(1.1)' }}
        autoPlay muted loop playsInline
      >
        <source src="/images/фон 2.mp4" type="video/mp4" />
      </video>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          opacity: 0.4,
        }}
      />

      <div className="relative z-10 min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-lg flex flex-col gap-4">

          {/* Profile card */}
          <div
            className="rounded-2xl p-5 flex gap-4"
            style={{
              background: 'linear-gradient(135deg, #A9342A 0%, #7a1f1a 60%, #5a1510 100%)',
              border: '1px solid rgba(242,151,116,0.2)',
            }}
          >
            <div className="flex-1 flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest flex items-center gap-1"
                  style={{ color: '#F29774', opacity: 0.7, fontFamily: "'Involve', sans-serif" }}>
                  ✦ Мой аккаунт
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full uppercase tracking-widest"
                  style={{
                    background: 'rgba(242,151,116,0.15)',
                    border: '1px solid rgba(242,151,116,0.4)',
                    color: '#F29774',
                    fontFamily: "'ONDER', sans-serif",
                    fontSize: '0.6rem',
                  }}
                >
                  Уровень {level}
                </span>
              </div>

              {/* Username */}
              <h2
                className="text-2xl leading-tight"
                style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", letterSpacing: '0.05em' }}
              >
                {username}
              </h2>

              {/* Collected item avatars */}
              <div className="flex gap-2">
                {uniqueItems.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg overflow-hidden"
                    style={{ border: '2px solid rgba(242,151,116,0.4)' }}
                  >
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_name} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs"
                        style={{ background: 'rgba(242,151,116,0.2)', color: '#F29774' }}>
                        {item.product_name[0]}
                      </div>
                    )}
                  </div>
                ))}
                {uniqueItems.length === 0 && [0,1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-lg"
                    style={{ background: 'rgba(242,151,116,0.1)', border: '2px solid rgba(242,151,116,0.2)' }} />
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Искорки', value: sparks },
                  { label: 'Шмот', value: uniqueItems.length },
                  { label: 'Заказы', value: orders.length },
                ].map(({ label, value }) => (
                  <p key={label} className="text-sm"
                    style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
                    <span style={{ opacity: 0.6 }}>{label}: </span>
                    <span>{value}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Right: avatar + actions */}
            <div className="flex flex-col items-center justify-between gap-3 flex-shrink-0">
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center group"
                style={{ border: '2px solid rgba(242,151,116,0.3)', background: 'rgba(242,151,116,0.1)' }}
                title="Сменить аватарку"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="80px" />
                ) : (
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                    {level >= 4 ? '🔥' : level >= 3 ? '⚡' : level >= 2 ? '✦' : '○'}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(13,5,5,0.6)' }}>
                  <span className="text-xs uppercase" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}>
                    {uploadingAvatar ? '...' : 'Сменить'}
                  </span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-xs px-3 py-1.5 uppercase tracking-widest transition-opacity"
                style={{
                  background: 'rgba(242,151,116,0.15)',
                  border: '1px solid rgba(242,151,116,0.3)',
                  color: '#F29774',
                  borderRadius: '6px',
                  fontFamily: "'ONDER', sans-serif",
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Collections */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'rgba(242,151,116,0.06)',
              border: '1px solid rgba(242,151,116,0.15)',
            }}
          >
            <p className="text-xs uppercase tracking-widest"
              style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
              Собранные коллекции: {collections}
            </p>
            <div className="flex gap-2 items-center">
              {orders.length > 0 ? (
                <Image
                  src="/images/aqua+.png"
                  alt="AQUA+"
                  width={32} height={32}
                  className="rounded-lg"
                  style={{ border: '2px solid rgba(242,151,116,0.4)' }}
                />
              ) : null}
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(242,151,116,0.08)',
                    border: '1px solid rgba(242,151,116,0.2)',
                  }}
                >
                  <span style={{ color: 'rgba(242,151,116,0.3)', fontSize: '1rem' }}>★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(['inventory', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-xs uppercase tracking-widest transition-all"
                style={{
                  borderRadius: '8px',
                  fontFamily: "'ONDER', sans-serif",
                  background: activeTab === tab ? '#F29774' : 'rgba(242,151,116,0.08)',
                  color: activeTab === tab ? '#A9342A' : '#F29774',
                  border: activeTab === tab ? 'none' : '1px solid rgba(242,151,116,0.2)',
                }}
              >
                {tab === 'inventory' ? 'Инвентарь' : 'Заказы'}
              </button>
            ))}
          </div>

          {/* Inventory tab */}
          {activeTab === 'inventory' && (
            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'rgba(242,151,116,0.06)',
                border: '1px solid rgba(242,151,116,0.15)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest"
                    style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
                    Инвентарь
                  </p>
                  <p className="text-2xl mt-0.5"
                    style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
                    ШМОТ
                  </p>
                </div>
                {sparks < 3 && (
                  <p className="text-xs text-right max-w-[140px]"
                    style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
                    «До открытия секретки осталось {3 - sparks} искорки»
                  </p>
                )}
              </div>

              {/* Item grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {inventorySlots.map((item, i) => (
                  item ? (
                    <Link
                      key={i}
                      href={`/account/orders/${orders.find(o => o.order_items?.some(oi => oi.id === item.id))?.id ?? ''}`}
                      className="relative aspect-square rounded-xl overflow-hidden transition-transform hover:scale-105"
                      style={{ border: '2px solid rgba(242,151,116,0.4)' }}
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
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: 'rgba(242,151,116,0.15)' }}>
                          <span className="text-xs text-center px-1"
                            style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", fontSize: '0.55rem' }}>
                            {item.product_name}
                          </span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className="aspect-square rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(242,151,116,0.05)',
                        border: '2px solid rgba(242,151,116,0.15)',
                      }}
                    >
                      <span style={{ color: 'rgba(242,151,116,0.3)', fontSize: '1.2rem' }}>?</span>
                    </div>
                  )
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/#catalog"
                className="w-full py-3 text-center uppercase tracking-widest transition-opacity hover:opacity-90"
                style={{
                  background: '#F29774',
                  color: '#A9342A',
                  borderRadius: '10px',
                  fontFamily: "'ONDER', sans-serif",
                  fontSize: '0.8rem',
                  display: 'block',
                }}
              >
                {sparks === 0 ? 'Собери коллекцию' : 'Добить коллекцию'}
              </Link>
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ background: 'rgba(242,151,116,0.06)', border: '1px solid rgba(242,151,116,0.15)' }}
                >
                  <p style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}>
                    Заказов пока нет
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="rounded-2xl p-4 flex flex-col gap-2 transition-opacity hover:opacity-90"
                    style={{
                      background: 'rgba(242,151,116,0.06)',
                      border: '1px solid rgba(242,151,116,0.15)',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs"
                        style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
                        #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full uppercase tracking-widest"
                        style={{
                          background: STATUS_COLORS[order.status] + '22',
                          color: STATUS_COLORS[order.status],
                          fontFamily: "'ONDER', sans-serif",
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
                          <p key={item.id} className="text-sm"
                            style={{ color: '#F29774', fontFamily: "'Involve', sans-serif" }}>
                            {item.product_name}
                            {item.size && <span style={{ opacity: 0.5 }}> / {item.size}</span>}
                          </p>
                        ))}
                      </div>
                      <p style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Bottom nav */}
          <Link
            href="/"
            className="text-xs text-center uppercase tracking-widest py-2"
            style={{ color: '#F29774', opacity: 0.4, fontFamily: "'ONDER', sans-serif" }}
          >
            ← В магазин
          </Link>

        </div>
      </div>
    </div>
  )
}
