'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import Image from 'next/image'
import Link from 'next/link'
import s from './page.module.css'

function formatPrice(p: number) {
  return p.toLocaleString('ru-RU') + ' ₽'
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const router = useRouter()

  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressTouched, setAddressTouched] = useState(false)

  async function handleSubmit() {
    if (!address.trim()) { setError('Укажи адрес доставки'); return }
    if (items.length === 0) { setError('Корзина пуста'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth?next=/checkout')
          return
        }
        throw new Error(data.error || 'Ошибка создания заказа')
      }

      clear()
      router.push(`/account/orders/${data.id}`)
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
        <Link href="/" className={s.backLink}>
          ← В магазин
        </Link>
      </main>
    )
  }

  return (
    <main className={`min-h-screen px-4 sm:px-10 py-8 sm:py-14 ${s.page}`}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6 sm:gap-10">

        {/* Header: back link above title on mobile, inline on desktop */}
        <div>
          <Link
            href="/"
            className={s.backLink}
          >
            ← В магазин
          </Link>
          <h1
            className={`text-xl sm:text-3xl uppercase tracking-widest ${s.pageTitle}`}
          >
            Оформление заказа
          </h1>
        </div>

        {/* Two-column grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">

          {/* LEFT — order summary */}
          <div className="flex flex-col gap-4">
            <h2
              className={s.sectionLabel}
            >
              Состав заказа
            </h2>
            <div
              className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-4 ${s.summaryCard}`}
            >
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
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
                    <p
                      className={s.itemName}
                    >
                      {item.product.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${s.itemVariant}`}
                    >
                      {item.size}{item.color && ` · ${item.color}`} × {item.quantity}
                    </p>
                  </div>
                  <p
                    className={s.itemPrice}
                  >
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div
                className={`flex justify-between items-center pt-3 ${s.totalDivider}`}
              >
                <span className={s.totalLabel}>Итого</span>
                <span className={s.totalValue}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Payment notice */}
            <div
              className={s.notice}
            >
              <p className={s.noticeText}>
                После оформления мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.
              </p>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="flex flex-col gap-5">
            <h2
              className={s.sectionLabel}
            >
              Данные доставки
            </h2>

            <div className="flex flex-col gap-2">
              <label
                className={s.fieldLabel}
              >
                Адрес *
              </label>
              <input
                type="text"
                placeholder="Город, улица, дом, квартира, индекс"
                value={address}
                onChange={e => { setAddress(e.target.value); setAddressTouched(true); }}
                className={`px-4 py-3 sm:py-4 ${s.input} ${addressTouched ? (address.trim() ? s.inputValid : s.inputError) : ''}`}
              />
              {addressTouched && !address.trim() && (
                <p className={s.fieldError}>Укажите адрес доставки</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                className={s.fieldLabel}
              >
                Комментарий
              </label>
              <textarea
                placeholder="Пожелания по заказу..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className={`px-4 py-3 sm:py-4 ${s.input}`}
              />
            </div>

            {error && (
              <p className={s.errorText}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`py-4 sm:py-5 ${s.submitBtn}`}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Оформляем...' : 'Оформить заказ'}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
