'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Product, Category } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import s from './CatalogSection.module.css'

const TEXTS = ['Посмотреть', 'чекнуть', 'чё, по чём?', 'скок стоит?', 'сколько денег?', 'чё по цене?']

const ProductCard = React.memo(function ProductCard({
  product,
  index,
  onOpen,
  categoryData,
  isDark,
}: {
  product: Product
  index: number
  onOpen: (p: Product) => void
  categoryData: Record<string, Category>
  isDark: boolean
}) {
  const [currentImg, setCurrentImg] = useState(0)
  const [btnText, setBtnText] = useState('Посмотреть')
  const [btnFade, setBtnFade] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const touchStartX = React.useRef<number | null>(null)
  const lastInteractionRef = React.useRef<number>(0)
  const isManualRef = React.useRef(false)

  // Button text rotation
  useEffect(() => {
    let cur = 'Посмотреть'
    const offset = index * 500
    const id = setInterval(() => {
      setBtnFade(true)
      setTimeout(() => {
        let next: string
        do { next = TEXTS[Math.floor(Math.random() * TEXTS.length)] } while (next === cur)
        cur = next
        setBtnText(next)
        setBtnFade(false)
      }, 200)
    }, 2000 + offset)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Swipe hint — show once on first card
  useEffect(() => {
    if (index !== 0 || product.images.length <= 1) return
    try {
      if (!sessionStorage.getItem('catalogSwipeHintShown')) {
        setShowHint(true)
        sessionStorage.setItem('catalogSwipeHintShown', '1')
        setTimeout(() => setShowHint(false), 1800)
      }
    } catch { /* sessionStorage unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Staggered auto-slide — pauses 5s after user interaction; skips if reduce-motion enabled
  useEffect(() => {
    if (product.images.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let id: ReturnType<typeof setInterval>
    const startId = setTimeout(() => {
      id = setInterval(() => {
        if (Date.now() - lastInteractionRef.current < 5000) return
        isManualRef.current = false
        setCurrentImg((i) => (i + 1) % product.images.length)
      }, 3000)
    }, Math.random() * 4000)
    return () => { clearTimeout(startId); clearInterval(id) }
  }, [product.images.length])

  function prevImg(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    lastInteractionRef.current = Date.now()
    isManualRef.current = true
    setCurrentImg(i => (i - 1 + product.images.length) % product.images.length)
  }

  function nextImg(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    lastInteractionRef.current = Date.now()
    isManualRef.current = true
    setCurrentImg(i => (i + 1) % product.images.length)
  }

  function triggerGlitch() {
    if (glitching) return
    setGlitching(true)
    setTimeout(() => setGlitching(false), 420)
  }

  const bgUrl = isDark
    ? (product.bg_url_dark ?? product.bg_url ?? null)
    : (product.bg_url ?? product.bg_url_dark ?? null)

  return (
    <div
      className={`flex flex-col w-full ${s.productCard}`}
      style={bgUrl
        ? { backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'var(--bg-card)' }
      }
      onClick={() => onOpen(product)}
      onMouseEnter={triggerGlitch}
    >
      {/* Dark theme texture overlay */}
      <div className={s.themeOverlay} />

      {/* Image carousel */}
      <div
        className={`w-full relative overflow-hidden ${s.productImgWrap}`}
        onMouseMove={e => {
          if (product.images.length <= 1) return
          const rect = e.currentTarget.getBoundingClientRect()
          const idx = Math.max(0, Math.min(
            Math.floor((e.clientX - rect.left) / rect.width * product.images.length),
            product.images.length - 1
          ))
          isManualRef.current = true
          setCurrentImg(idx)
          lastInteractionRef.current = Date.now()
        }}
        onTouchStart={e => { touchStartX.current = e.changedTouches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null || product.images.length <= 1) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 30) {
            e.stopPropagation()
            dx < 0 ? nextImg(e) : prevImg(e)
          }
          lastInteractionRef.current = Date.now()
          touchStartX.current = null
        }}
      >
        {product.images.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={product.name}
            fill
            className="object-cover select-none"
            draggable={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 2 && i === 0}
            loading={index < 2 && i === 0 ? undefined : 'lazy'}
            quality={70}
            decoding="async"
            style={{ opacity: i === currentImg ? 1 : 0, transition: isManualRef.current ? 'none' : 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)', position: 'absolute', top: 0, left: 0 }}
          />
        ))}

        {/* VHS glitch layer */}
        {glitching && (
          <div
            className={s.vhsGlitch}
            style={{
              position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
              backgroundImage: `url(${product.images[currentImg]})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              animation: 'vhs-glitch 0.42s steps(1) forwards',
            }}
          />
        )}

        {/* Swipe hint overlay — mobile, once per session */}
        {showHint && (
          <div className="sm:hidden absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ animation: 'fadeOutHint 1.8s ease forwards' }}>
            <span style={{ fontSize: '1.4rem', opacity: 0.65, letterSpacing: '0.5em' }}>← →</span>
          </div>
        )}

        {/* Swipe dot indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5"
            style={{ zIndex: 4, animation: 'swipeHint 0.9s ease 0.8s 1' }}>
            {product.images.map((_, i) => (
              <span key={i} className="transition-all"
                style={{ width: i === currentImg ? '14px' : '5px', height: '5px', borderRadius: '2px', background: i === currentImg ? 'var(--accent)' : 'var(--accent-2)', transition: 'width 0.2s, background 0.2s' }} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={s.productInfo}>
        <p className={s.productType}>
          {product.product_type || 'T-SHIRT'}
          {product.grade && (
            <span className={s.productGrade}> · GRADE {product.grade.toUpperCase()}</span>
          )}
        </p>
        <div className="flex items-end justify-between gap-2">
          <h3 className={s.productName}>{product.name}</h3>
          <span className={s.productPrice}>{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
})

export default ProductCard
