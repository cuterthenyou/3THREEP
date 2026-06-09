'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CartItem, Product } from './types'
import { trackEvent } from './track'

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, size: string, color: string) => void
  removeItem: (productId: string, size: string) => void
  updateQty: (productId: string, size: string, delta: number) => void
  clear: () => void
  total: number
  count: number
  open: boolean
  setOpen: (v: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('threep_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('threep_cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Product, size: string, color: string) => {
    setItems(prev => {
      const exists = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (exists) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, size, color, quantity: 1 }]
    })
    setOpen(true)
    trackEvent('cart_add', { id: product.id, name: product.name, size })
  }, [])

  const removeItem = useCallback((productId: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)))
  }, [])

  const updateQty = useCallback((productId: string, size: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i =>
          i.product.id === productId && i.size === size
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter(i => i.quantity > 0)
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
