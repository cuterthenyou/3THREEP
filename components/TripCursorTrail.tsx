'use client'

import { useEffect, useRef } from 'react'

const DOTS = 7

/**
 * Психоделический след за курсором — ТОЛЬКО в trip-теме.
 * Цепочка точек лерпит за указателем; каждая точка крутит hue от --accent
 * (per-dot hue-rotate), blend = screen → радужный «жидкий» хвост.
 * Активен лишь при fine-pointer и без prefers-reduced-motion; вне trip — спит.
 */
export default function TripCursorTrail() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let active = document.documentElement.dataset.theme === 'trip'
    const mouse = { x: -100, y: -100 }
    const pts = Array.from({ length: DOTS }, () => ({ x: -100, y: -100 }))

    const hideAll = () => {
      for (const el of refs.current) if (el) el.style.opacity = '0'
    }

    const obs = new MutationObserver(() => {
      active = document.documentElement.dataset.theme === 'trip'
      if (!active) hideAll()
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!active) return
      let px = mouse.x
      let py = mouse.y
      for (let i = 0; i < DOTS; i++) {
        const p = pts[i]
        p.x += (px - p.x) * 0.35
        p.y += (py - p.y) * 0.35
        const el = refs.current[i]
        if (el) {
          const s = 1 - i / DOTS
          el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${0.35 + s})`
          el.style.opacity = String(0.55 * s)
        }
        px = p.x
        py = p.y
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      obs.disconnect()
    }
  }, [])

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99990, mixBlendMode: 'screen' }}>
      {Array.from({ length: DOTS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: 20, height: 20, borderRadius: '50%',
            opacity: 0,
            background: 'radial-gradient(circle, var(--accent), transparent 70%)',
            filter: `hue-rotate(${i * 42}deg) saturate(1.5)`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}
