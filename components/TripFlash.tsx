'use client'

import { useEffect, useState } from 'react'
import s from './TripFlash.module.css'

/**
 * Кинематографичный «срыв сигнала» при входе в trip-тему и при выходе из неё.
 * Наблюдает data-theme: переход → trip = резкий VHS-глитч-флэш (800мс),
 * trip → обычная = короткий коллапс (480мс). Оверлей fixed, pointer-events:none,
 * над контентом. Уважает prefers-reduced-motion (тогда не рендерится).
 */
export default function TripFlash() {
  const [phase, setPhase] = useState<null | 'in' | 'out'>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    let prev = root.dataset.theme
    let timer: ReturnType<typeof setTimeout>
    const obs = new MutationObserver(() => {
      const next = root.dataset.theme
      if (next === prev) return
      if (next === 'trip') {
        setPhase('in')
        clearTimeout(timer)
        timer = setTimeout(() => setPhase(null), 800)
      } else if (prev === 'trip') {
        setPhase('out')
        clearTimeout(timer)
        timer = setTimeout(() => setPhase(null), 480)
      }
      prev = next
    })
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { obs.disconnect(); clearTimeout(timer) }
  }, [])

  if (!phase) return null
  return <div aria-hidden="true" className={`${s.flash} ${phase === 'in' ? s.in : s.out}`} />
}
