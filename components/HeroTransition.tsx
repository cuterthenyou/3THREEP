'use client'

import { useEffect, useRef } from 'react'

const HEIGHT = 200

export default function HeroTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = HEIGHT
    const rawW = Math.round(W * dpr)
    const rawH = Math.round(H * dpr)
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

    function draw() {
      ctx!.clearRect(0, 0, rawW, rawH)
      const rgb = hexToRgb(getBgColor())
      const imageData = ctx!.createImageData(rawW, rawH)
      const data = imageData.data
      const PIXEL_SIZE = Math.max(2, Math.round(3 * dpr))

      for (let y = 0; y < rawH; y += PIXEL_SIZE) {
        for (let x = 0; x < rawW; x += PIXEL_SIZE) {
          const normalizedY = y / rawH
          // Dense at bottom (blends into catalog), sparse at top (hero side)
          const density = Math.pow(normalizedY, 1.6)
          if (Math.random() < density) {
            const alpha = Math.min(1, density * 0.95 + Math.random() * 0.1)
            for (let py = 0; py < PIXEL_SIZE && y + py < rawH; py++) {
              for (let px = 0; px < PIXEL_SIZE && x + px < rawW; px++) {
                const idx = ((y + py) * rawW + (x + px)) * 4
                data[idx]     = rgb.r
                data[idx + 1] = rgb.g
                data[idx + 2] = rgb.b
                data[idx + 3] = Math.floor(alpha * 255)
              }
            }
          }
        }
      }
      ctx!.putImageData(imageData, 0, 0)
    }

    draw()

    const obs = new MutationObserver(draw)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
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
