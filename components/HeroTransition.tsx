'use client'

import { useEffect, useRef } from 'react'

export default function HeroTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // The catalog bg color — match globals.css --bg (light default)
    // We read the CSS variable so it works in both themes
    function getCatalogColor() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
      return v || '#f5f3ef'
    }

    function draw() {
      const bgColor = getCatalogColor()
      ctx!.clearRect(0, 0, W, H)

      // Parse hex/rgb to rgba with alpha
      function hexToRgb(hex: string) {
        const h = hex.replace('#', '')
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16),
        }
      }

      const rgb = hexToRgb(bgColor.startsWith('#') ? bgColor : '#f5f3ef')

      const imageData = ctx!.createImageData(W * dpr, H * dpr)
      const data = imageData.data
      const PIXEL_SIZE = 3

      for (let y = 0; y < H; y += PIXEL_SIZE) {
        for (let x = 0; x < W; x += PIXEL_SIZE) {
          // Density increases towards bottom (y=H is dense, y=0 is sparse)
          const normalizedY = y / H
          // Non-linear: pixels more dense in lower 40% of canvas
          const density = Math.pow(normalizedY, 1.8)

          if (Math.random() < density) {
            const alpha = density * 0.9 + Math.random() * 0.1
            // Fill the pixel block
            for (let py = 0; py < PIXEL_SIZE && y + py < H; py++) {
              for (let px = 0; px < PIXEL_SIZE && x + px < W; px++) {
                const idx = ((y + py) * W + (x + px)) * 4
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

    // Redraw on theme change
    const obs = new MutationObserver(draw)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 80,
        marginTop: -40,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
