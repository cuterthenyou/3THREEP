'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, Category } from '@/lib/types'
import ProductModal from './ProductModal'
import ProductCard from './ProductCard'
import s from './CatalogSection.module.css'

interface Props {
  products: Product[]
  categories: ProductCategory[]
  categoryData?: Record<string, Category>
}

export default function CatalogSection({ products, categories, categoryData = {} }: Props) {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeType, setActiveType] = useState<string>('all')
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalBg, setModalBg] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark')
    const obs = new MutationObserver(() => setIsDark(document.documentElement.dataset.theme === 'dark'))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const rawCategory = searchParams.get('category') ?? 'all'
  const rawType = searchParams.get('type') ?? 'all'
  const hasMountedRef = React.useRef(false)

  useEffect(() => {
    setActiveCategory(rawCategory)
    setActiveType(rawType)
    if (!hasMountedRef.current) { hasMountedRef.current = true; return }
    if (rawCategory !== 'all' || rawType !== 'all') {
      const id = setTimeout(() =>
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
      , 350)
      return () => clearTimeout(id)
    }
  }, [rawCategory, rawType])


  const categoryFiltered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)

  const types = [...new Set(categoryFiltered.map(p => p.product_type).filter(Boolean))] as string[]

  const filtered = activeType === 'all'
    ? categoryFiltered
    : categoryFiltered.filter(p => p.product_type === activeType)

  const openModal = useCallback((product: Product) => {
    setOpenProduct(product)
    const cat = categoryData[product.category]
    setModalBg(isDark
      ? (cat?.modal_bg_url_dark ?? cat?.modal_bg_url ?? null)
      : (cat?.modal_bg_url ?? cat?.modal_bg_url_dark ?? null)
    )
    requestAnimationFrame(() => setModalVisible(true))
    const y = window.scrollY
    document.body.style.top = `-${y}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  }, [categoryData, isDark])

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
            <ProductCard key={product.id} product={product} index={idx} onOpen={openModal} categoryData={categoryData} isDark={isDark} />
          ))}
        </div>
      </section>

      {/* Collection description — between cards and bottom logo */}
      {activeCategory !== 'all' && (() => {
        const desc = categoryData[activeCategory]?.description
        return desc ? (
          <div style={{ textAlign: 'center', padding: '0 2rem 1.5rem', maxWidth: '560px', margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-involve)',
              fontSize: '0.72rem',
              color: 'var(--accent)',
              opacity: 0.5,
              letterSpacing: '0.03em',
              lineHeight: 1.8,
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
