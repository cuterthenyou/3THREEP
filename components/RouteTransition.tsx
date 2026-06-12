'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import s from './RouteTransition.module.css'

/**
 * Кинематографичный VHS/глитч-переход между страницами в стиле THREEP:
 * вуаль-«срыв сигнала» уходит, поверх — RGB-сплит, сканлайны и вспышка.
 * Включение/сила настраиваются в админке (page_transition_enabled / _intensity).
 * Чисто визуальный слой (pointer-events: none), уважает reduced-motion.
 */
export default function RouteTransition() {
  const pathname = usePathname()
  const [tick, setTick] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [intensity, setIntensity] = useState(1)
  const first = useRef(true)

  // Настройки из админки (один раз на маунт)
  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.ok ? r.json() : {})
      .then((d: Record<string, string>) => {
        if (d.page_transition_enabled === 'false') setEnabled(false)
        const i = parseFloat(d.page_transition_intensity ?? '')
        if (!isNaN(i)) setIntensity(Math.min(2, Math.max(0.3, i)))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (first.current) { first.current = false; return } // не мигаем на первом рендере
    if (enabled) setTick(t => t + 1)
  }, [pathname, enabled])

  if (tick === 0 || !enabled) return null

  return (
    <div key={tick} className={s.overlay} style={{ ['--rt-i' as string]: intensity }} aria-hidden="true">
      <div className={s.veil} />
      <div className={s.rgb} />
      <div className={s.scan} />
      <div className={s.bar} />
      <div className={s.flash} />
    </div>
  )
}
