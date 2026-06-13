'use client'

import { useEffect } from 'react'

/**
 * Рассинхрон дёрганья заголовков в trip-теме.
 *
 * Зачем JS: CSS-десинк через :nth-of-type не работает для одиночных элементов —
 * заголовок карточки (единственный h3 в своём контейнере) всегда «первый своего
 * типа», поэтому ВСЕ карточки дёргались синхронно. Здесь каждому заголовку
 * назначается независимая случайная задержка/длительность, отмасштабированная
 * на --trip-desync (0 → синхронно, выше → сильнее вразнобой).
 *
 * Активен только в data-theme="trip"; subtree-наблюдатель за DOM подключается
 * лишь на время trip и ловит новые заголовки (роутинг/модалки/карточки).
 */
export default function TripDesync() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let domObs: MutationObserver | null = null
    let scheduled = false

    const apply = () => {
      scheduled = false
      if (root.dataset.theme !== 'trip') return
      const desync = parseFloat(getComputedStyle(root).getPropertyValue('--trip-desync')) || 0
      root.querySelectorAll<HTMLElement>('h1, h2, h3').forEach((el) => {
        if (el.dataset.tripJit) return
        el.dataset.tripJit = '1'
        const delay = -(Math.random() * desync * 2.6)
        el.style.animationDelay = `${delay.toFixed(2)}s`
        el.style.animationDuration = `${(2 + Math.random() * desync * 1.4).toFixed(2)}s`
      })
    }

    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(apply)
    }

    const sync = () => {
      if (root.dataset.theme === 'trip') {
        schedule()
        if (!domObs) {
          domObs = new MutationObserver(schedule)
          domObs.observe(document.body, { childList: true, subtree: true })
        }
      } else {
        domObs?.disconnect()
        domObs = null
      }
    }

    sync()
    const themeObs = new MutationObserver(sync)
    themeObs.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      themeObs.disconnect()
      domObs?.disconnect()
    }
  }, [])

  return null
}
