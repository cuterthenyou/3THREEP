'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, Category } from '@/lib/types'
import ProductModal from './ProductModal'
import s from './CatalogSection.module.css'

const FALLBACK_TEXTURES = ['/images/cart-bg-1.jpg', '/images/cart-bg-2.jpg', '/images/cart-bg-3.jpg']

interface Props {
  products: Product[]
  categories: ProductCategory[]
  categoryData?: Record<string, Category>
}

function formatPrice(price: number) {
  return price.toLocaleString('ru-RU') + ' RUB'
}

export default function CatalogSection({ products, categories, categoryData = {} }: Props) {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeType, setActiveType] = useState<string>('all')
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalBg, setModalBg] = useState<string | null>(null)

  useEffect(() => {
    const cat = searchParams.get('category')
    const type = searchParams.get('type')
    setActiveCategory(cat ?? 'all')
    setActiveType(type ?? 'all')
  }, [searchParams])


  const categoryFiltered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)

  const types = [...new Set(categoryFiltered.map(p => p.product_type).filter(Boolean))] as string[]

  const filtered = activeType === 'all'
    ? categoryFiltered
    : categoryFiltered.filter(p => p.product_type === activeType)

  const openModal = useCallback((product: Product) => {
    setOpenProduct(product)
    setModalBg(categoryData[product.category]?.modal_bg_url ?? null)
    requestAnimationFrame(() => setModalVisible(true))
    const y = window.scrollY
    document.body.style.top = `-${y}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  }, [categoryData])

  const closeModal = useCallback(() => {
    setModalVisible(false)
    const top = parseFloat(document.body.style.top || '0')
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (top) window.scrollTo(0, -top)
    setTimeout(() => setOpenProduct(null), 300)
  }, [])

  return (
    <>
      {/* Category filter */}
      <div id="catalog" className="w-full overflow-x-auto pb-2 px-6 pt-16 sm:pt-20">
        <div className="flex gap-3 min-w-max mx-auto justify-center">
          {[{ name: 'Все', slug: 'all' }, ...categories.filter(c => c.slug !== 'all')].map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setActiveType('all') }}
              className={`px-5 py-2 uppercase tracking-widest transition-all duration-200 ${s.filterBtn} ${activeCategory === cat.slug ? s.filterBtnActive : s.filterBtnInactive}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Collection logo TOP — only when a collection is selected */}
      {activeCategory !== 'all' && (() => {
        const activeCat = categoryData[activeCategory]
        const logoTop = activeCat?.logo_top_url
        return logoTop ? (
          <div className="flex justify-center pt-6 pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoTop} alt="Collection" className="theme-img h-16 sm:h-20 lg:h-28 w-auto" />
          </div>
        ) : null
      })()}

      {/* Type filter tabs */}
      {activeCategory !== 'all' && types.length > 0 && (
        <div className="flex gap-2 justify-center px-4 overflow-x-auto" style={{ padding: '0.75rem 1rem 1.5rem' }}>
          {types.map(type => (
            <button key={type}
              onClick={() => setActiveType(t => t === type ? 'all' : type)}
              className={`${s.typeBtn} ${activeType === type || (activeType === 'all' && type === types[0]) ? s.typeBtnActive : s.typeBtnInactive}`}>
              {type}
            </button>
          ))}
          {Array.from({ length: Math.max(0, 3 - types.length) }).map((_, i) => (
            <span key={`soon-${i}`} className={s.typeBtnSoon}>СКОРО</span>
          ))}
        </div>
      )}

      {/* Product grid */}
      <section className="w-full px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 max-w-6xl mx-auto">
          {filtered.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} onOpen={openModal} categoryData={categoryData} />
          ))}
        </div>
      </section>

      {/* Collection description — between cards and bottom logo */}
      {activeCategory !== 'all' && (() => {
        const desc = categoryData[activeCategory]?.description
        return desc ? (
          <div style={{ textAlign: 'center', padding: '0 2rem 1.5rem', maxWidth: '560px', margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-onder)',
              fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)',
              color: 'var(--accent)',
              opacity: 0.42,
              letterSpacing: '0.1em',
              lineHeight: 1.9,
              textTransform: 'uppercase',
            }}>
              {desc}
            </p>
          </div>
        ) : null
      })()}

      {/* Collection logo BOTTOM — only when a collection is selected */}
      {activeCategory !== 'all' && (() => {
        const activeCat = categoryData[activeCategory]
        const logoBottom = activeCat?.logo_bottom_url
        return logoBottom ? (
          <div className="flex justify-center pb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoBottom} alt="Collection" className="theme-img w-32 h-auto" />
          </div>
        ) : null
      })()}

      <ProductModal product={openProduct} visible={modalVisible} onClose={closeModal} modalBg={modalBg} />
    </>
  )
}


const ProductCard = React.memo(function ProductCard({
  product,
  index,
  onOpen,
  categoryData,
}: {
  product: Product
  index: number
  onOpen: (p: Product) => void
  categoryData: Record<string, Category>
}) {
  const [currentImg, setCurrentImg] = useState(0)
  const [btnText, setBtnText] = useState('Посмотреть')
  const [btnFade, setBtnFade] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const touchStartX = React.useRef<number | null>(null)
  const lastInteractionRef = React.useRef<number>(0)
  const isManualRef = React.useRef(false)

  const TEXTS = ['Посмотреть', 'чекнуть', 'чё, по чём?', 'скок стоит?', 'сколько денег?', 'чё по цене?']

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

  return (
    <div
      className={`flex flex-col w-full ${s.productCard}`}
      style={{ background: 'var(--bg-card)' }}
      onClick={() => onOpen(product)}
      onMouseEnter={triggerGlitch}
    >
      {/* Dark theme texture overlay */}
      <div className={s.themeOverlay} />

      {/* Image carousel */}
      <div
        className={`w-full relative overflow-hidden ${s.productImgWrap}`}
        style={product.bg_url ? { backgroundImage: `url(${product.bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
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
        <p className={s.productType}>{product.product_type || 'T-SHIRT'}</p>
        <div className="flex items-end justify-between gap-2">
          <h3 className={s.productName}>{product.name}</h3>
          <span className={s.productPrice}>{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
})
