'use client'

import { useEffect, useRef } from 'react'

const HEIGHT = 200

export default function HeroTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rawW = Math.round(canvas.offsetWidth * dpr)
    const rawH = Math.round(HEIGHT * dpr)
    canvas.width = rawW
    canvas.height = rawH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function getBgColor() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
      return v || '#a9342a'
    }

    function hexToRgb(hex: string) {
      const h = hex.replace('#', '').trim()
      if (h.length !== 6) return { r: 169, g: 52, b: 42 }
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      }
    }

    // Generate fixed pixel pattern once — reused for all redraws so it doesn't flicker
    type Pixel = { x: number; y: number; alpha: number }
    const pixels: Pixel[] = []
    const PIXEL_SIZE = Math.max(2, Math.round(3 * dpr))
    for (let y = 0; y < rawH; y += PIXEL_SIZE) {
      for (let x = 0; x < rawW; x += PIXEL_SIZE) {
        const normalizedY = y / rawH
        const density = Math.pow(normalizedY, 1.6)
        if (Math.random() < density) {
          const alpha = Math.min(1, density * 0.95 + Math.random() * 0.1)
          for (let py = 0; py < PIXEL_SIZE && y + py < rawH; py++) {
            for (let px = 0; px < PIXEL_SIZE && x + px < rawW; px++) {
              pixels.push({ x: x + px, y: y + py, alpha })
            }
          }
        }
      }
    }

    function drawColor(rgb: { r: number; g: number; b: number }) {
      const imageData = ctx!.createImageData(rawW, rawH)
      const data = imageData.data
      for (const { x, y, alpha } of pixels) {
        const idx = (y * rawW + x) * 4
        data[idx]     = rgb.r
        data[idx + 1] = rgb.g
        data[idx + 2] = rgb.b
        data[idx + 3] = Math.floor(alpha * 255)
      }
      ctx!.putImageData(imageData, 0, 0)
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
    function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

    let current = hexToRgb(getBgColor())
    drawColor(current)

    let target = { ...current }
    let animStart: number | null = null
    let animFrame: number | null = null
    const DURATION = 450

    function animate(ts: number) {
      if (animStart === null) animStart = ts // fallback for initial draw
      const t = easeInOut(Math.min((ts - animStart) / DURATION, 1))
      drawColor({
        r: Math.round(lerp(current.r, target.r, t)),
        g: Math.round(lerp(current.g, target.g, t)),
        b: Math.round(lerp(current.b, target.b, t)),
      })
      if (t < 1) {
        animFrame = requestAnimationFrame(animate)
      } else {
        current = { ...target }
        animFrame = null
        animStart = null
      }
    }

    const obs = new MutationObserver(() => {
      target = hexToRgb(getBgColor())
      if (animFrame !== null) cancelAnimationFrame(animFrame)
      // Record start time synchronously so canvas matches CSS transition's start frame
      animStart = performance.now()
      animFrame = requestAnimationFrame(animate)
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      obs.disconnect()
      if (animFrame !== null) cancelAnimationFrame(animFrame)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        height: HEIGHT,
        marginTop: -HEIGHT / 2,
        marginBottom: 0,
        zIndex: 5,
        pointerEvents: 'none',
        display: 'block',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
