export function formatPrice(p: number): string {
  return p.toLocaleString('ru-RU') + ' RUB'
}

/** Округление вниз до кратного 3 (бренд 333 — все цены кратны 3). */
export function roundToMultipleOf3Down(n: number): number {
  return Math.floor(n / 3) * 3
}

/**
 * Цена со скидкой, округлённая ВНИЗ до кратного 3.
 * percent<=0 → базовая цена без изменений (админ держит базу кратной 3).
 */
export function applyDiscount(price: number, percent: number): number {
  if (!percent || percent <= 0) return price
  return roundToMultipleOf3Down(price * (1 - percent / 100))
}
