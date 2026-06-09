'use client'

import { useState, useRef, useEffect } from 'react'
import { INPUT_STYLE } from '../adminStyles'

// ── Color picker ────────────────────────────────────────────────
export function ColorPicker({
  label,
  value,
  cssVar,
  onChange,
}: {
  label: string
  value: string
  cssVar?: string
  onChange: (v: string) => void
}) {
  const [hex, setHex] = useState(value)

  function handleHexInput(v: string) {
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onChange(v)
      if (cssVar) document.documentElement.style.setProperty(cssVar, v)
    }
  }

  function handleColorPicker(v: string) {
    setHex(v)
    onChange(v)
    if (cssVar) document.documentElement.style.setProperty(cssVar, v)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex.length === 7 ? hex : '#000000'}
          onChange={e => handleColorPicker(e.target.value)}
          style={{
            width: 38, height: 38, padding: 3,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={hex}
          maxLength={7}
          onChange={e => handleHexInput(e.target.value)}
          style={{
            ...INPUT_STYLE,
            width: 110,
            padding: '0.3rem 0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: 28, height: 28,
            background: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

// ── Font selector ───────────────────────────────────────────────
export function FontSelect({
  label,
  value,
  onChange,
  previewText,
  allFonts,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  previewText: string
  allFonts: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...INPUT_STYLE,
          padding: '0.4rem 0.6rem',
          fontSize: '0.82rem',
          borderRadius: 4,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {allFonts.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <p style={{ fontFamily: `'${value}', sans-serif`, fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.3 }}>
        {previewText}
      </p>
    </div>
  )
}

// ── Glitter preview mini-canvas ─────────────────────────────────
export function GlitterPreview({ intensity, enabled }: { intensity: number; enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !enabled) return
    const ctx = canvas.getContext('2d')!

    let id: number

    function init() {
      const W = canvas!.width  = canvas!.offsetWidth || 400
      const H = canvas!.height = 88
      const count = Math.max(2, Math.round((W * H / 2500) * (intensity / 100)))
      const particles = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() < 0.25 ? 2 : 1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 2.0,
        colorShift: Math.random(),
      }))
      const start = performance.now()
      cancelAnimationFrame(id)
      function draw() {
        const t = (performance.now() - start) / 1000
        ctx.clearRect(0, 0, W, H)
        const sweepX = ((Math.sin(t * 0.12) + 1) / 2) * W
        for (const p of particles) {
          const b = Math.pow(Math.sin(t * p.speed + p.phase), 3)
          const dist = Math.abs(p.x - sweepX) / W
          const boost = dist < 0.18 ? 0.45 * (1 - dist / 0.18) : 0
          const bright = Math.max(0, Math.min(1, b + boost))
          if (bright < 0.05) continue
          ctx.fillStyle = `rgba(255, ${Math.round(160 + p.colorShift * 50)}, ${Math.round(170 + p.colorShift * 30)}, ${bright})`
          ctx.fillRect(p.x, p.y, p.size, p.size)
        }
        id = requestAnimationFrame(draw)
      }
      id = requestAnimationFrame(draw)
    }

    init()
    window.addEventListener('resize', init)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', init) }
  }, [intensity, enabled])

  return (
    <div style={{ position: 'relative', height: 88, borderRadius: 6, overflow: 'hidden', background: '#1c1c1e', border: '1px solid var(--border-soft)' }}>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 88, opacity: enabled ? 1 : 0.15, transition: 'opacity 0.3s' }} />
      {!enabled && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>ВЫКЛЮЧЕНО</span>
        </div>
      )}
    </div>
  )
}
