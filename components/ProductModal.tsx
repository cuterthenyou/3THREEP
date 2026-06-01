'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart'
import s from './ProductModal.module.css'

interface Props {
  product: Product | null
  visible: boolean
  onClose: () => void
}

function AddToCartButton({ product, size, onClose }: { product: Product; size: string; onClose: () => void }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product, size, product.colors[0] ?? '')
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 800)
  }

  return (
    <button onClick={handleAdd} className={`${s.addBtn} ${added ? s.addBtnAdded : s.addBtnDefault}`}>
      {added ? '✓ Добавлено' : 'В корзину'}
    </button>
  )
}

export default function ProductModal({ product, visible, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('S')
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const [slideOut, setSlideOut] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const historyPushed = useRef(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  function closeWithAnimation() {
    if (isTouch) {
      setSlideOut(true)
      setTimeout(() => {
        setSlideOut(false)
        if (historyPushed.current) {
          historyPushed.current = false
          history.back()
        } else {
          onClose()
        }
      }, 280)
    } else {
      if (historyPushed.current) {
        historyPushed.current = false
        history.back()
      } else {
        onClose()
      }
    }
  }

  useEffect(() => {
    if (product) {
      setActiveImg(0)
      setSelectedSize(product.sizes?.[0] || 'S')
    }
  }, [product])

  // Ensure body scroll is restored on unmount
  useEffect(() => () => { document.body.style.overflow = '' }, [])

  useEffect(() => {
    if (!visible) return

    history.pushState({ modal: product?.id }, '')
    historyPushed.current = true

    const onPopState = () => {
      historyPushed.current = false
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWithAnimation()
      if (!product) return
      if (e.key === 'ArrowLeft') setActiveImg((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setActiveImg((i) => Math.min(product.images.length - 1, i + 1))
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, product, onClose])

  if (!product) return null

  const sizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL', '2XL']

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      setTouchStart({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY })
      setTouchDelta(0)
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (touchStart !== null) setTouchDelta(e.changedTouches[0].clientX - touchStart.x)
    },
    onTouchEnd: () => {
      if (Math.abs(touchDelta) > 50) {
        if (touchDelta < 0) setActiveImg((i) => Math.min(product.images.length - 1, i + 1))
        else setActiveImg((i) => Math.max(0, i - 1))
      }
      setTouchStart(null); setTouchDelta(0)
    },
  }

  const modalTouchHandlers = isTouch ? {
    onTouchStart: (e: React.TouchEvent) => {
      setTouchStart({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY })
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (touchStart !== null) {
        const dx = e.changedTouches[0].clientX - touchStart.x
        const dy = Math.abs(e.changedTouches[0].clientY - touchStart.y)
        if (dx > 0 && dx > dy) { e.preventDefault(); setTouchDelta(dx) }
      }
    },
    onTouchEnd: () => {
      if (touchDelta >= 80) {
        setTouchStart(null); setTouchDelta(0)
        closeWithAnimation()
        return
      }
      setTouchStart(null); setTouchDelta(0)
    },
  } : {}

  return (
    <div
      className={`fixed inset-0 z-50 ${s.backdrop}`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: visible ? 'auto' : 'none' }}
      onClick={(e) => e.target === e.currentTarget && closeWithAnimation()}
      {...modalTouchHandlers}
    >
      <div className={`absolute inset-0 overflow-y-auto ${s.inner}`}>
        <button
          onClick={closeWithAnimation}
          className={`fixed top-5 right-5 z-50 flex items-center justify-center w-9 h-9 ${s.closeBtn}`}
          aria-label="Закрыть"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="#A9342A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className="w-full max-w-6xl mx-auto px-6 py-20 sm:py-16"
          style={{
            transform: (isTouch && slideOut) ? 'translateX(100%)' : visible ? 'translateY(0)' : 'translateY(30px)',
            opacity: visible ? 1 : 0,
            transition: (isTouch && slideOut) ? 'transform 0.28s ease-in' : 'transform 0.3s ease, opacity 0.3s ease',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

            {/* Gallery */}
            <div className="flex flex-col gap-4">
              <div
                className="w-full rounded-lg overflow-hidden"
                style={{ aspectRatio: '1/1', position: 'relative', background: '#000' }}
                {...touchHandlers}
              >
                <Image src={product.images[activeImg] || product.images[0]} alt={product.name} fill className="object-cover select-none" draggable={false} sizes="(max-width: 768px) 100vw, 50vw" />
                {product.images.length > 1 && (
                  <>
                    <button className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded text-xl ${s.arrowBtn}`} onClick={() => setActiveImg((i) => Math.max(0, i - 1))}>‹</button>
                    <button className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded text-xl ${s.arrowBtn}`} onClick={() => setActiveImg((i) => Math.min(product.images.length - 1, i + 1))}>›</button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={s.thumbBtn} style={{ outline: i === activeImg ? '2px solid #F29774' : '2px solid transparent', outlineOffset: '-2px' }}>
                      <Image src={img} alt={product.name} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col gap-5 pt-2 pb-24 lg:pt-0 lg:pb-0">
              <div className="flex justify-center lg:justify-start">
                <Image src="/images/aqua+.png" alt="AQUA+" width={0} height={0} sizes="15vw" className="theme-img h-10 w-auto" />
              </div>

              <p className={`uppercase tracking-widest text-xs ${s.category}`}>
                {product.category?.toUpperCase() || 'T-SHIRT'}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <h2 className={`text-xl sm:text-2xl lg:text-3xl ${s.name}`}>{product.name}</h2>
                <p className={`text-lg sm:text-xl ${s.price}`}>{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>

              <p className={`text-sm ${s.description}`}>{product.description}</p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className={`text-sm ${s.detail}`}><span style={{ opacity: 0.7 }}>Состав:</span> хлопок 100%</p>
                  <p className={`text-sm ${s.detail}`}><span style={{ opacity: 0.7 }}>Посадка:</span> oversize</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {sizes.map((size) => (
                    <button key={size} className={`${s.sizeBtn} ${selectedSize === size ? s.sizeBtnActive : ''}`} onClick={() => setSelectedSize(size)}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <AddToCartButton product={product} size={selectedSize} onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
