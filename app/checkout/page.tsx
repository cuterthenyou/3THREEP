'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { trackEvent } from '@/lib/track'
import s from './page.module.css'

type Mode = 'loading' | 'user' | 'choose' | 'guest'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [mode, setMode] = useState<Mode>('loading')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressTouched, setAddressTouched] = useState(false)
  const [guestEmailTouched, setGuestEmailTouched] = useState(false)
  const [guestNameTouched, setGuestNameTouched] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') setMode('user')
    else if (status === 'unauthenticated') setMode('choose')
  }, [status])

  // Funnel stage 3: reaching checkout with a non-empty cart
  useEffect(() => {
    if (items.length > 0) trackEvent('checkout_start', { items: items.length, total })
    // fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isGuestEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)

  async function handleSubmit() {
    const isGuest = mode === 'guest'
    setAddressTouched(true)
    setGuestEmailTouched(true)
    setGuestNameTouched(true)

    if (!address.trim()) { setError('Укажи адрес доставки'); return }
    if (items.length === 0) { setError('Корзина пуста'); return }
    if (isGuest && !guestName.trim()) { setError('Укажи имя'); return }
    if (isGuest && !isGuestEmailValid) { setError('Укажи корректный email'); return }

    setLoading(true)
    setError('')

    try {
      const payload: Record<string, unknown> = {
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.images[0] ?? null,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.product.price,
        })),
        total,
        delivery_address: address.trim(),
        comment: comment.trim() || null,
      }

      if (isGuest) {
        payload.guest_name = guestName.trim()
        payload.guest_email = guestEmail.trim()
        payload.guest_phone = guestPhone.trim() || null
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка создания заказа')

      clear()
      if (data.isGuest) {
        router.push(`/order-confirmation?id=${data.id}&email=${encodeURIComponent(guestEmail.trim())}&guest=1`)
      } else {
        router.push(`/account/orders/${data.id}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${s.page}`}>
        <p className={s.emptyText}>Корзина пуста</p>
        <Link href="/" className={s.backLink}>← В магазин</Link>
      </main>
    )
  }

  const orderSummary = (
    <div className="flex flex-col gap-4">
      <h2 className={s.sectionLabel}>Состав заказа</h2>
      <div className={`p-5 sm:p-6 flex flex-col gap-4 hud-corners ${s.summaryCard}`}>
        {items.map(item => (
          <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden flex-shrink-0" style={{ borderRadius: 'var(--radius-base, 0)', border: '1px solid var(--border-soft)' }}>
              {item.product.images[0] && (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 64px, 80px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={s.itemName}>{item.product.name}</p>
              <p className={`text-xs mt-0.5 ${s.itemVariant}`}>
                {item.size}{item.color && ` · ${item.color}`} × {item.quantity}
              </p>
            </div>
            <p className={s.itemPrice}>{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
        <div className={`flex justify-between items-center pt-3 ${s.totalDivider}`}>
          <span className={s.totalLabel}>Итого</span>
          <span className={s.totalValue}>{formatPrice(total)}</span>
        </div>
      </div>
      <div className={s.notice}>
        <p className={s.noticeText}>
          После оформления мы свяжемся с тобой и пришлём реквизиты для перевода.
        </p>
      </div>
    </div>
  )

  return (
    <main className={`min-h-screen px-4 sm:px-10 py-8 sm:py-14 ${s.page}`}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6 sm:gap-10">

        <div>
          <Link href="/" className={s.backLink}>← В магазин</Link>
          <h1 className={`text-xl sm:text-3xl uppercase tracking-widest ${s.pageTitle}`}>
            Оформление заказа
          </h1>
        </div>

        {mode === 'loading' && (
          <p style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)', fontSize: '0.9rem' }}>
            Загрузка...
          </p>
        )}

        {mode === 'choose' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">
            {orderSummary}
            <div className="flex flex-col gap-4">
              <h2 className={s.sectionLabel}>Как хочешь оформить?</h2>
              <Link
                href={`/auth?callbackUrl=${encodeURIComponent('/account')}`}
                className={`py-4 text-center ${s.submitBtn} blade-glint`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                Войти / Зарегистрироваться
              </Link>
              <button onClick={() => setMode('guest')} className={s.guestBtn}>
                Без аккаунта
              </button>
              <p className={s.noticeText} style={{ opacity: 0.45, fontSize: '0.78rem' }}>
                Войди, чтобы отслеживать заказы и общаться с нами в чате
              </p>
            </div>
          </div>
        )}

        {(mode === 'user' || mode === 'guest') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">
            {orderSummary}

            <div className="flex flex-col gap-5">
              <h2 className={s.sectionLabel}>
                {mode === 'guest' ? 'Данные для связи' : 'Данные доставки'}
              </h2>

              {mode === 'guest' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className={s.fieldLabel}>Имя *</label>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Как к тебе обращаться"
                      value={guestName}
                      onChange={e => { setGuestName(e.target.value); setGuestNameTouched(true) }}
                      className={`px-4 py-3 sm:py-4 ${s.input} ${guestNameTouched ? (guestName.trim() ? s.inputValid : s.inputError) : ''}`}
                    />
                    {guestNameTouched && !guestName.trim() && (
                      <p className={s.fieldError}>Укажите имя</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={s.fieldLabel}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="твой@email.com"
                      value={guestEmail}
                      onChange={e => { setGuestEmail(e.target.value); setGuestEmailTouched(true) }}
                      className={`px-4 py-3 sm:py-4 ${s.input} ${guestEmailTouched ? (isGuestEmailValid ? s.inputValid : s.inputError) : ''}`}
                    />
                    {guestEmailTouched && !isGuestEmailValid && (
                      <p className={s.fieldError}>Введите действительный email</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={s.fieldLabel}>Телефон</label>
                    <input
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      className={`px-4 py-3 sm:py-4 ${s.input}`}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className={s.fieldLabel}>Адрес доставки *</label>
                <input
                  type="text"
                  name="street-address"
                  autoComplete="street-address"
                  placeholder="Город, улица, дом, квартира, индекс"
                  value={address}
                  onChange={e => { setAddress(e.target.value); setAddressTouched(true) }}
                  className={`px-4 py-3 sm:py-4 ${s.input} ${addressTouched ? (address.trim() ? s.inputValid : s.inputError) : ''}`}
                />
                {addressTouched && !address.trim() && (
                  <p className={s.fieldError}>Укажите адрес доставки</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className={s.fieldLabel}>Комментарий</label>
                <textarea
                  placeholder="Пожелания по заказу..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  className={`px-4 py-3 sm:py-4 ${s.input}`}
                />
              </div>

              {error && <p key={error} className={`${s.errorText} form-shake`}>{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`py-4 sm:py-5 ${s.submitBtn} blade-glint`}
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Оформляем...' : 'Оформить заказ'}
              </button>

              {mode === 'guest' && (
                <button onClick={() => setMode('choose')} className={s.switchModeBtn}>
                  ← Назад к выбору
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
