'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import s from './RouteTransition.module.css'

/**
 * Кинематографичный переход между страницами: при смене маршрута проигрывает
 * короткую «проявку» — вуаль цвета фона уходит вверх + accent скан-линия + лёгкий
 * глитч. Чисто визуальный слой (pointer-events: none), уважает reduced-motion.
 */
export default function RouteTransition() {
  const pathname = usePathname()
  const [tick, setTick] = useState(0)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return } // не мигаем на первом рендере
    setTick(t => t + 1)
  }, [pathname])

  if (tick === 0) return null

  return (
    <div key={tick} className={s.overlay} aria-hidden="true">
      <div className={s.veil} />
      <div className={s.glitch} />
      <div className={s.scan} />
    </div>
  )
}
