'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import s from './CartDrawer.module.css'

function formatPrice(p: number) {
  return p.toLocaleString('ru-RU') + ' ₽'
}

export default function CartDrawer() {
  const { items, removeItem, updateQty, total, count, open, setOpen } = useCart()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col ${s.drawer}`}
        style={{
          width: 'min(480px, 100vw)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 ${s.drawerHeader}`}
        >
          <h2
            className={s.heading}
          >
            Корзина {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className={`w-8 h-8 flex items-center justify-center rounded ${s.closeBtn}`}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <p
                className={s.emptyText}
              >
                Корзина пуста
              </p>
              <button
                onClick={() => setOpen(false)}
                className={`px-6 py-2 uppercase tracking-widest ${s.backToShopBtn}`}
              >
                В каталог
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className={`flex gap-3 items-center ${s.item}`}
              >
                {/* Image */}
                <div
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${s.itemImg}`}
                >
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'rgba(242,151,116,0.1)' }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={s.productName}>
                    {item.product.name}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${s.productVariant}`}
                  >
                    {item.size}{item.color ? ` · ${item.color}` : ''}
                  </p>
                  <p className={`mt-1 ${s.productPrice}`}>
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.product.id, item.size, -1)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-sm ${s.qtyBtn}`}
                  >
                    −
                  </button>
                  <span className={`text-sm w-4 text-center ${s.qtyValue}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.product.id, item.size, +1)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-sm ${s.qtyBtn}`}
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id, item.size)}
                  className={`flex-shrink-0 text-xs ${s.removeBtn}`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className={`px-6 py-5 flex flex-col gap-3 ${s.drawerFooter}`}
          >
            <div className="flex justify-between items-center">
              <span className={s.totalLabel}>Итого</span>
              <span className={s.totalValue}>
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className={`w-full py-3 transition-opacity hover:opacity-90 ${s.checkoutLink}`}
            >
              Оформить заказ
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
