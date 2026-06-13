'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/**
 * Scroll-into-view reveal wrapper. Renders children hidden (.reveal) and adds
 * `.is-in` once the element enters the viewport (one-shot IntersectionObserver).
 *
 * Respects the admin «Анимации» toggle (window.__THREEP_ANIM__.reveal),
 * prefers-reduced-motion and missing IO support — in all those cases it renders
 * immediately visible. Duration scales with the global --animation-speed token
 * (handled in globals.css `.reveal.is-in`).
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div' as ElementType,
}: {
  children: ReactNode
  /** stagger in ms (applied as animation-delay) */
  delay?: number
  className?: string
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const anim = (window as unknown as { __THREEP_ANIM__?: { reveal?: boolean } }).__THREEP_ANIM__
    const enabled = anim?.reveal !== false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!enabled || reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
