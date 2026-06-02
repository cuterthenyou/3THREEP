'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  size: 1 | 2
  phase: number
  speed: number
  colorShift: number
}

export default function GlitterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.dataset.theme === 'dark')
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!isDark) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.min(700, Math.floor(window.innerWidth * window.innerHeight / 2500))
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: (Math.random() < 0.25 ? 2 : 1) as 1 | 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 2.0,
      colorShift: Math.random(),
    }))

    let animId: number
    const startTime = performance.now()

    function draw(now: number) {
      const t = (now - startTime) / 1000
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      // Sweep band moves back and forth across viewport
      const sweepX = (Math.sin(t * 0.12) * canvas!.width * 0.55) + canvas!.width * 0.5
      const sweepRange = canvas!.width * 0.35

      for (const p of particles) {
        const sine = Math.sin(t * p.speed + p.phase)
        // Bursty: cube makes particles mostly dark with brief bright flashes
        const base = Math.max(0, sine) ** 3

        // Sweep boost: particles in the sweep band get extra brightness
        const dist = Math.abs(p.x - sweepX)
        const sweep = Math.max(0, 1 - dist / sweepRange) * 0.45

        const brightness = Math.min(1, base + sweep)
        if (brightness < 0.02) continue

        ctx.globalAlpha = brightness * 0.95
        // Color varies per particle: warm pink tones matching #FCB0B2
        const g = Math.floor(160 + p.colorShift * 50)
        const b = Math.floor(170 + p.colorShift * 30)
        ctx.fillStyle = `rgb(255,${g},${b})`
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size)
      }
      ctx.globalAlpha = 1

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  if (!isDark) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
