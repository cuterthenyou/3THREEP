'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
  return price.toLocaleString('ru-RU') + ' ₽'
}

export default function CatalogSection({ products, categories, categoryData = {} }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  const openModal = useCallback((product: Product) => {
    setOpenProduct(product)
    requestAnimationFrame(() => setModalVisible(true))
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setModalVisible(false)
    setTimeout(() => {
      setOpenProduct(null)
      document.body.style.overflow = ''
    }, 300)
  }, [])

  return (
    <>
      {/* Category filter */}
      <div id="catalog" className="w-full overflow-x-auto pb-2 px-6 pt-16 sm:pt-20">
        <div className="flex gap-3 min-w-max mx-auto justify-center">
          {[{ name: 'Все', slug: 'all' }, ...categories.filter(c => c.slug !== 'all')].map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2 uppercase tracking-widest transition-all duration-200 ${s.filterBtn} ${activeCategory === cat.slug ? s.filterBtnActive : s.filterBtnInactive}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Collection logo TOP */}
      {(() => {
        const activeCat = categoryData[activeCategory]
        const logoTop = activeCat?.logo_top_url ?? '/images/vector-54.svg'
        return logoTop ? (
          <div className="flex justify-center pt-6 pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoTop} alt="Collection" className="theme-img h-16 sm:h-20 lg:h-28 w-auto" />
          </div>
        ) : null
      })()}

      {/* Product grid */}
      <section className="w-full px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 max-w-6xl mx-auto">
          {filtered.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} onOpen={openModal} categoryData={categoryData} />
          ))}
        </div>
      </section>

      {/* Collection logo BOTTOM */}
      {(() => {
        const activeCat = categoryData[activeCategory]
        const logoBottom = activeCat?.logo_bottom_url ?? '/images/vector-43.svg'
        return logoBottom ? (
          <div className="flex justify-center pb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoBottom} alt="Collection" className="theme-img w-32 h-auto" />
          </div>
        ) : null
      })()}

      <ProductModal product={openProduct} visible={modalVisible} onClose={closeModal} />
    </>
  )
}


function ProductCard({
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
  const touchStartX = React.useRef<number | null>(null)

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

  // Staggered auto-slide — random start offset 0–4000ms
  useEffect(() => {
    if (product.images.length <= 1) return
    let id: ReturnType<typeof setInterval>
    const startId = setTimeout(() => {
      id = setInterval(() => {
        setCurrentImg((i) => (i + 1) % product.images.length)
      }, 3000)
    }, Math.random() * 4000)
    return () => { clearTimeout(startId); clearInterval(id) }
  }, [product.images.length])

  function prevImg(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    setCurrentImg(i => (i - 1 + product.images.length) % product.images.length)
  }

  function nextImg(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
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
      style={{ background: 'var(--accent)' }}
      onClick={() => onOpen(product)}
      onMouseEnter={triggerGlitch}
    >
      {/* Dark theme texture overlay */}
      <div className={s.themeOverlay} />

      {/* Image carousel */}
      <div
        className={`w-full relative overflow-hidden ${s.productImgWrap}`}
        onTouchStart={e => { touchStartX.current = e.changedTouches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null || product.images.length <= 1) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 30) {
            e.stopPropagation()
            dx < 0 ? nextImg(e) : prevImg(e)
          }
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
            style={{ opacity: i === currentImg ? 1 : 0, transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)', position: 'absolute', top: 0, left: 0 }}
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

        {/* Desktop arrow buttons — shown on card hover via CSS */}
        {product.images.length > 1 && (
          <>
            <button className={s.imgArrow} style={{ left: 8 }} onClick={prevImg} aria-label="Предыдущее фото">‹</button>
            <button className={s.imgArrow} style={{ right: 8 }} onClick={nextImg} aria-label="Следующее фото">›</button>
          </>
        )}

        {/* Dot indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" style={{ zIndex: 4 }}>
            {product.images.map((_, i) => (
              <span key={i} className="rounded-full transition-all"
                style={{ width: i === currentImg ? '16px' : '6px', height: '6px', background: i === currentImg ? 'var(--accent)' : 'var(--accent-2)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={s.productInfo}>
        <p className={s.productType}>{product.product_type || 'T-SHIRT'}</p>
        <div className="flex items-end justify-between gap-2">
          <h3 className={s.productName}>{product.name}</h3>
          <span className={s.productPrice}>{Number(product.price).toLocaleString('ru-RU')}</span>
        </div>
      </div>
    </div>
  )
}
