'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

function CrosshairShape() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: 1.5, background: 'var(--cursor-color)', transform: 'translateY(-50%)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0,
        width: 1.5, background: 'var(--cursor-color)', transform: 'translateX(-50%)',
      }} />
    </div>
  )
}

function SvgMask({ url }: { url: string }) {
  const proxied = `url(/api/proxy?url=${encodeURIComponent(url)})`
  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'var(--cursor-color)',
      maskImage: proxied,
      WebkitMaskImage: proxied,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    }} />
  )
}

export default function CustomCursor() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const [isFinePointer, setIsFinePointer] = useState(false)

  const mainRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const trailPos = useRef({ x: -100, y: -100 })
  const isHovering = useRef(false)
  const prevHovering = useRef(false)
  const rafId = useRef<number>(0)
  const reducedMotion = useRef(false)

  const isAdminPath = pathname?.startsWith('/admin') ?? false

  // Mount + pointer detection
  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(pointer: fine)')
    setIsFinePointer(mq.matches)
    const onMqChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches)
    mq.addEventListener('change', onMqChange)
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return () => mq.removeEventListener('change', onMqChange)
  }, [])

  // Fetch settings
  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.ok ? r.json() : {})
      .then((d: Record<string, string | null>) => {
        setEnabled(d.custom_cursor_enabled === 'true')
        setSvgUrl(d.custom_cursor_svg_url ?? null)
      })
      .catch(() => {})
  }, [])

  const active = mounted && enabled && isFinePointer && !isAdminPath

  // cursor: none injection
  useEffect(() => {
    const id = 'custom-cursor-override'
    if (active) {
      if (!document.getElementById(id)) {
        const style = document.createElement('style')
        style.id = id
        style.textContent = '* { cursor: none !important; }'
        document.head.appendChild(style)
      }
    } else {
      document.getElementById(id)?.remove()
    }
    return () => document.getElementById(id)?.remove()
  }, [active])

  // rAF animation loop + event listeners
  useEffect(() => {
    if (!active) return

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null
      isHovering.current = !!el?.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]')
    }

    const onOut = () => { isHovering.current = false }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOut, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })

    function animate() {
      const mp = mousePos.current
      const tp = trailPos.current
      const lerpF = reducedMotion.current ? 1 : 0.12

      tp.x += (mp.x - tp.x) * lerpF
      tp.y += (mp.y - tp.y) * lerpF

      if (mainRef.current) {
        mainRef.current.style.transform = `translate(${mp.x - 10}px, ${mp.y - 10}px)`
      }

      const hovering = isHovering.current
      const halfTrail = hovering ? 14 : 3

      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${tp.x - halfTrail}px, ${tp.y - halfTrail}px)`

        // Only update trail styles when hover state actually changes
        if (hovering !== prevHovering.current) {
          prevHovering.current = hovering
          if (hovering) {
            trailRef.current.style.width = '28px'
            trailRef.current.style.height = '28px'
            trailRef.current.style.background = 'transparent'
            trailRef.current.style.border = '1.5px solid var(--cursor-color)'
            trailRef.current.style.opacity = '0.7'
          } else {
            trailRef.current.style.width = '6px'
            trailRef.current.style.height = '6px'
            trailRef.current.style.background = 'var(--cursor-color)'
            trailRef.current.style.border = 'none'
            trailRef.current.style.opacity = '0.5'
          }
        }
      }

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOut)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafId.current)
    }
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Layer 1 — exact position */}
      <div
        ref={mainRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 20, height: 20,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          transform: 'translate(-100px, -100px)',
        }}
      >
        {svgUrl ? <SvgMask url={svgUrl} /> : <CrosshairShape />}
      </div>

      {/* Layer 2 — lerp trail */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--cursor-color)',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
          transform: 'translate(-100px, -100px)',
          transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease, border 0.2s ease, opacity 0.2s ease',
        }}
      />
    </>
  )
}
