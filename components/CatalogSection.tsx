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
            <img src={logoTop} alt="Collection" className="h-16 sm:h-20 lg:h-28 w-auto" />
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
            <img src={logoBottom} alt="Collection" className="w-32 h-auto" />
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

  const TEXTS = ['Посмотреть', 'чекнуть', 'чё, по чём?', 'скок стоит?', 'сколько денег?', 'чё по цене?']

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
  }, [index])

  useEffect(() => {
    if (product.images.length <= 1) return
    const id = setInterval(() => {
      setCurrentImg((i) => (i + 1) % product.images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [product.images.length])

  const col = index % 3
  const row = Math.floor(index / 3)
  const cat = categoryData[product.category]
  const catTextures = [cat?.texture_url, cat?.texture_url_2, cat?.texture_url_3].filter(Boolean) as string[]
  const texturePool = catTextures.length > 0 ? catTextures : FALLBACK_TEXTURES
  const texture = texturePool[(col + row) % texturePool.length]

  return (
    <div
      className={`flex flex-col w-full ${s.productCard}`}
      style={{ background: `url(${texture}) center/cover, #F29774` }}
      onClick={() => onOpen(product)}
    >
      {/* Image carousel */}
      <div
        className={`w-full relative overflow-hidden ${s.productImgWrap}`}
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
            style={{
              opacity: i === currentImg ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ))}
        {/* Dot indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {product.images.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === currentImg ? '16px' : '6px',
                  height: '6px',
                  background: i === currentImg ? '#A9342A' : 'rgba(169,52,42,0.3)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={s.productInfo}>
        {/* Category */}
        <p className={s.productType}>
          {product.product_type || 'T-SHIRT'}
        </p>

        {/* Name + Price row */}
        <div className="flex items-end justify-between gap-2">
          <h3 className={s.productName}>
            {product.name}
          </h3>
          <span className={s.productPrice}>
            {Number(product.price).toLocaleString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  )
}
