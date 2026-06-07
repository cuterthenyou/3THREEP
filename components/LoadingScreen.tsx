'use client'

import { useEffect, useState } from 'react'
import s from './LoadingScreen.module.css'

// 16 spike polygons around the cap edge.
// Spike base at r≈24 (4px wide), tip at r=34. Rotated n×22.5° around (40,40).
const SPIKE_COUNT = 16
const spikes = Array.from({ length: SPIKE_COUNT }, (_, i) => {
  const angle = (i * 360) / SPIKE_COUNT
  return (
    <polygon
      key={i}
      points="38,16 42,16 40,7"
      transform={`rotate(${angle}, 40, 40)`}
      fill="currentColor"
      opacity={i % 2 === 0 ? 0.75 : 0.45}
      style={{ shapeRendering: 'crispEdges' } as React.CSSProperties}
    />
  )
})

function CapSpinner() {
  return (
    <svg
      viewBox="0 0 80 80"
      className={s.capSvg}
      aria-hidden="true"
      style={{ color: 'var(--accent, #f29774)', overflow: 'visible' }}
    >
      <g className={s.capGroup} style={{ transformOrigin: '40px 40px' } as React.CSSProperties}>
        {/* Spikes */}
        {spikes}

        {/* Cap rim ring */}
        <circle cx="40" cy="40" r="23" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />

        {/* Cap body */}
        <circle cx="40" cy="40" r="21" fill="currentColor" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />

        {/* Center hole */}
        <circle cx="40" cy="40" r="4" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />

        {/* "3T" pixel mark — "3" on left, "T" on right */}
        {/* 3: top bar */}
        <rect x="25" y="34" width="7" height="2" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
        {/* 3: mid bar */}
        <rect x="27" y="38" width="5" height="2" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
        {/* 3: bot bar */}
        <rect x="25" y="42" width="7" height="2" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
        {/* 3: right stem top */}
        <rect x="32" y="34" width="2" height="4" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
        {/* 3: right stem bot */}
        <rect x="32" y="40" width="2" height="5" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />

        {/* T: top bar */}
        <rect x="36" y="34" width="10" height="2" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
        {/* T: stem */}
        <rect x="40" y="36" width="2" height="9" fill="var(--bg, #090909)" style={{ shapeRendering: 'crispEdges' } as React.CSSProperties} />
      </g>
    </svg>
  )
}

export default function LoadingScreen() {
  const [show, setShow] = useState(false)
  const [exit, setExit] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('threep-booted')) return
      sessionStorage.setItem('threep-booted', '1')
    } catch {
      return
    }

    setShow(true)

    let minPassed = false
    let pageDone = false

    function dismiss() {
      setExit(true)
      setTimeout(() => setShow(false), 580)
    }

    function onPageReady() {
      pageDone = true
      if (minPassed) dismiss()
    }

    const minTimer = setTimeout(() => {
      minPassed = true
      if (pageDone) dismiss()
    }, 1900)

    if (document.readyState === 'complete') {
      onPageReady()
    } else {
      window.addEventListener('load', onPageReady, { once: true })
    }

    return () => {
      clearTimeout(minTimer)
      window.removeEventListener('load', onPageReady)
    }
  }, [])

  if (!show) return null

  return (
    <div className={`${s.screen} ${exit ? s.exit : ''}`} aria-hidden="true">
      <div className={s.scanlines} />
      <div className={s.vignette} />
      <div className={s.spinner}>
        <div className={s.string} />
        <CapSpinner />
        <div className={s.stringBottom} />
      </div>
      <div className={s.sub}>loading...</div>
    </div>
  )
}
