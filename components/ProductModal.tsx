'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ThemedLogo from './ThemedLogo'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart'
import { trackEvent } from '@/lib/track'
import { formatPrice, applyDiscount } from '@/lib/utils'
import s from './ProductModal.module.css'

interface Props {
  product: Product | null
  visible: boolean
  onClose: () => void
  modalBg?: string | null
  tintBg?: boolean
  collectionLogo?: string | null
  discount?: number
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
    <button onClick={handleAdd} className={`${s.addBtn} ${added ? s.addBtnAdded : s.addBtnDefault} blade-glint`}>
      {added ? '✓ Добавлено' : 'ШВЫРНУТЬ В КОРЗИНУ'}
    </button>
  )
}

export default function ProductModal({ product, visible, onClose, modalBg, tintBg = false, collectionLogo, discount = 0 }: Props) {
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

  // Track product views (funnel stage 1) when the modal actually opens
  useEffect(() => {
    if (visible && product) {
      trackEvent('product_view', { id: product.id, name: product.name })
    }
  }, [visible, product])


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
      <div className={`absolute inset-0 overflow-y-auto ${s.inner}`} style={modalBg ? { backgroundImage: `url(${modalBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', ...(tintBg ? { backgroundColor: 'var(--art-tint, var(--bg))', backgroundBlendMode: 'multiply' } : {}) } : undefined}>
        <button
          onClick={closeWithAnimation}
          className={`fixed top-5 right-5 z-50 flex items-center justify-center w-9 h-9 ${s.closeBtn}`}
          aria-label="Закрыть"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="var(--bg-2)" strokeWidth="2.5" strokeLinecap="round" />
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
          {/* Main grid: image col + text col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:items-stretch">

            {/* Image column */}
            <div>
              {/* Desktop: thumbs LEFT of main image */}
              <div className="hidden lg:flex gap-2 items-start">
                {product.images.length > 1 && (
                  <div className={s.thumbsCol}>
                    {product.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={s.thumbBtn}
                        style={{ outline: i === activeImg ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '-2px' }}>
                        <Image src={img} alt={product.name} fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
                <div
                  className="flex-1 rounded-lg overflow-hidden"
                  style={{ aspectRatio: '3/4', position: 'relative', background: 'var(--bg-2)', maxHeight: '72vh' }}
                  {...touchHandlers}
                >
                  {/* Все фото смонтированы и грузятся eager → переключение мгновенно (кроссфейд) */}
                  {product.images.map((img, i) => (
                    <Image key={i} src={img} alt={product.name} fill loading="eager" className="object-cover select-none" draggable={false} sizes="40vw"
                      style={{ opacity: i === activeImg ? 1 : 0, transition: 'opacity 0.25s ease' }} />
                  ))}
                </div>
              </div>

              {/* Mobile: image then thumbs below */}
              <div className="lg:hidden">
                <div
                  className="w-full rounded-lg overflow-hidden"
                  style={{ aspectRatio: '3/4', position: 'relative', background: 'var(--bg-2)' }}
                  {...touchHandlers}
                >
                  {product.images.map((img, i) => (
                    <Image key={i} src={img} alt={product.name} fill loading="eager" className="object-cover select-none" draggable={false} sizes="100vw"
                      style={{ opacity: i === activeImg ? 1 : 0, transition: 'opacity 0.25s ease' }} />
                  ))}
                </div>
                {product.images.length > 1 && (
                  <div className={s.thumbsRow}>
                    {product.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={s.thumbBtn}
                        style={{ outline: i === activeImg ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '-2px' }}>
                        <Image src={img} alt={product.name} fill className="object-cover" sizes="52px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product info — same height as main image */}
            <div className="flex flex-col pt-2 pb-24 lg:pt-0 lg:pb-0" style={{ height: '100%', justifyContent: 'space-between' }}>

              {/* Top section */}
              <div className="flex flex-col gap-5">
                {collectionLogo && (
                  <div className="flex justify-center lg:justify-start">
                    <ThemedLogo
                      src={collectionLogo}
                      alt="Collection"
                      className="h-10 w-auto"
                      defaultRatio={4}
                    />
                  </div>
                )}

                <p className={`uppercase tracking-widest text-xs ${s.category}`}>
                  {product.category?.toUpperCase() || 'T-SHIRT'}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <h2 className={`text-lg sm:text-xl ${s.name}`}>{product.name}</h2>
                  {discount > 0 ? (
                    <p className={`text-lg sm:text-xl ${s.price}`}>
                      <span className={s.priceOld}>{formatPrice(product.price)}</span>
                      {' '}{formatPrice(applyDiscount(product.price, discount))}
                    </p>
                  ) : (
                    <p className={`text-lg sm:text-xl ${s.price}`}>{formatPrice(product.price)}</p>
                  )}
                </div>

                {(() => {
                  const NOTE_SEP = '\n---NOTE---\n'
                  const parts = (product.description ?? '').split(NOTE_SEP)
                  const mainDesc = parts[0]
                  const noteText = parts[1] ?? ''
                  return (
                    <>
                      <p className={s.description} style={{ whiteSpace: 'pre-wrap', marginBottom: noteText ? '0.25rem' : '0.5rem' }}>{mainDesc}</p>
                      {noteText && (
                        <p className={s.note} style={{ marginBottom: '0.5rem' }}>{noteText}</p>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Bottom section — details, sizes, button */}
              <div className="flex flex-col gap-5">
                {(product.material || product.cut) && (
                  <div className="flex flex-col gap-1">
                    {product.material && (
                      <p className={s.detail}><span style={{ opacity: 0.7 }}>Состав:</span> {product.material}</p>
                    )}
                    {product.cut && (
                      <p className={s.detail}><span style={{ opacity: 0.7 }}>Крой:</span> {product.cut}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => (
                    <button key={size} className={`${s.sizeBtn} ${selectedSize === size ? s.sizeBtnActive : ''}`} onClick={() => setSelectedSize(size)}>
                      {size}
                    </button>
                  ))}
                </div>

                <AddToCartButton product={product} size={selectedSize} onClose={onClose} />

                {(product.grade || product.series || product.article) && (
                  <div className={s.metaRow}>
                    {product.grade && <span>Grade {product.grade}</span>}
                    {product.series && <span>Серия: {product.series}</span>}
                    {product.article && <span>Арт.: {product.article}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
