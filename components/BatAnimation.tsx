'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import s from './BatAnimation.module.css'

// ── Pixel-art style bat SVG ──────────────────────────────────────────────────
// 48×28 viewBox, shape-rendering: crispEdges for pixel feel
function PixelBat() {
  return (
    <svg
      width="72"
      height="42"
      viewBox="0 0 48 28"
      fill="currentColor"
      aria-hidden="true"
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
    >
      {/* ── Left wing — 3 scalloped lobes ── */}
      <path d="
        M 18,14
        L 0,3   L 4,10  L 0,14
        L 3,19  L 7,21  L 10,17
        L 5,22  L 11,24 L 15,19
        L 12,23 L 17,22 L 19,17
        Z
      "/>
      {/* Left wing finger-bone lines */}
      <line x1="18" y1="14" x2="4" y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="7"  y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="11" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>

      {/* ── Right wing — mirror ── */}
      <path d="
        M 30,14
        L 48,3   L 44,10  L 48,14
        L 45,19  L 41,21  L 38,17
        L 43,22  L 37,24  L 33,19
        L 36,23  L 31,22  L 29,17
        Z
      "/>
      {/* Right wing finger-bone lines */}
      <line x1="30" y1="14" x2="44" y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="41" y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="37" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>

      {/* ── Body ── */}
      <polygon points="24,4 27,8 28,14 27,20 24,24 21,20 20,14 21,8"/>

      {/* ── Left ear ── */}
      <polygon points="21,7 17,0 23,9"/>
      {/* Ear notch */}
      <polygon points="19,5 18,2 21,6" fill="var(--bg)" opacity="0.5"/>

      {/* ── Right ear ── */}
      <polygon points="27,7 31,0 25,9"/>
      {/* Ear notch */}
      <polygon points="29,5 30,2 27,6" fill="var(--bg)" opacity="0.5"/>

      {/* ── Eyes — angular diamonds ── */}
      <polygon points="22,14 23,12 24,14 23,16" fill="var(--bg)"/>
      <polygon points="26,14 27,12 28,14 27,16" fill="var(--bg)"/>

      {/* ── Mouth — tiny angry line ── */}
      <line x1="22" y1="20" x2="26" y2="20" stroke="var(--bg)" strokeWidth="1" opacity="0.6"/>
    </svg>
  )
}

// ── Types ────────────────────────────────────────────────────────────────────
interface BatData {
  id: number
  startX: number
  startY: number
  startVx: number
  startVy: number
  scale: number
}

interface BatInstanceProps {
  bat: BatData
  onClick: () => void
  onExit: () => void
}

// ── BatInstance — animates itself via rAF, no React re-render per frame ──────
function BatInstance({ bat, onClick, onExit }: BatInstanceProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const onExitRef = useRef(onExit)
  const onClickRef = useRef(onClick)
  onExitRef.current = onExit
  onClickRef.current = onClick

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const state = {
      x: bat.startX,
      y: bat.startY,
      vx: bat.startVx,
      vy: bat.startVy,
      lastTime: 0,
      nextTurnAt: 0,
      exited: false,
    }

    let animId: number

    function frame(t: number) {
      if (state.exited) return
      const dt = state.lastTime ? Math.min((t - state.lastTime) / 1000, 0.05) : 0
      state.lastTime = t

      // Chaotic direction change every 0.6–2.0s
      if (t > state.nextTurnAt) {
        const currentAngle = Math.atan2(state.vy, state.vx)
        const deflect = (Math.random() - 0.5) * Math.PI * 1.3
        const newAngle = currentAngle + deflect
        const speed = Math.hypot(state.vx, state.vy) * (0.8 + Math.random() * 0.4)
        const clampedSpeed = Math.max(80, Math.min(220, speed))
        state.vx = Math.cos(newAngle) * clampedSpeed
        state.vy = Math.sin(newAngle) * clampedSpeed
        state.nextTurnAt = t + 600 + Math.random() * 1400
      }

      state.x += state.vx * dt
      state.y += state.vy * dt

      const W = window.innerWidth
      const H = window.innerHeight
      const margin = 260

      if (state.x < -margin || state.x > W + margin || state.y < -margin || state.y > H + margin) {
        state.exited = true
        onExitRef.current()
        return
      }

      const angle = Math.atan2(state.vy, state.vx) * 180 / Math.PI
      div!.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${angle}deg) scale(${bat.scale})`

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)
    return () => {
      state.exited = true
      cancelAnimationFrame(animId)
    }
  }, [bat])

  return (
    <div
      ref={divRef}
      className={s.bat}
      style={{ transform: `translate(${bat.startX}px, ${bat.startY}px) scale(${bat.scale})` }}
      onClick={() => onClickRef.current()}
      onTouchStart={e => { e.preventDefault(); onClickRef.current() }}
    >
      <span className={s.flap}>
        <PixelBat />
      </span>
    </div>
  )
}

// ── Score counter ─────────────────────────────────────────────────────────────
function ScoreCounter({ score }: { score: number }) {
  const [pulse, setPulse] = useState(false)
  const prevScore = useRef(score)

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 160)
      return () => clearTimeout(t)
    }
  }, [score])

  return (
    <div className={s.score}>
      <span className={s.scoreLabel}>убито</span>
      <span className={`${s.scoreNum} ${pulse ? s.pulse : ''}`}>×{score}</span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let _idCounter = 0
function nextId() { return ++_idCounter }

function spawnBat(): BatData {
  const W = typeof window !== 'undefined' ? window.innerWidth : 400
  const H = typeof window !== 'undefined' ? window.innerHeight : 800
  const side = Math.floor(Math.random() * 4)
  const speed = 110 + Math.random() * 90
  const spread = (Math.random() - 0.5) * 0.6 // ±~17° from inward direction

  let startX: number, startY: number, startVx: number, startVy: number

  switch (side) {
    case 0: { // top
      startX = Math.random() * W
      startY = -60
      const a = Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 1: { // right
      startX = W + 60
      startY = Math.random() * H
      const a = Math.PI + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 2: { // bottom
      startX = Math.random() * W
      startY = H + 60
      const a = -Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    default: { // left
      startX = -60
      startY = Math.random() * H
      const a = 0 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
  }

  return {
    id: nextId(),
    startX, startY, startVx, startVy,
    scale: 0.6 + Math.random() * 0.75,
  }
}

// ── Main controller ───────────────────────────────────────────────────────────
export default function BatAnimation() {
  const [bats, setBats] = useState<BatData[]>([])
  const [score, setScore] = useState(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleIdleBat = useCallback(() => {
    if (nextWaveTimerRef.current) clearTimeout(nextWaveTimerRef.current)
    nextWaveTimerRef.current = setTimeout(() => {
      setBats([spawnBat()])
    }, 15000 + Math.random() * 10000)
  }, [])

  // Initial spawn
  useEffect(() => {
    nextWaveTimerRef.current = setTimeout(() => {
      setBats([spawnBat()])
    }, 2000 + Math.random() * 2500)

    return () => {
      if (nextWaveTimerRef.current) clearTimeout(nextWaveTimerRef.current)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const handleBatClick = useCallback((clickedId: number) => {
    // Cancel reset timer (user was fast enough)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)

    setBats(prev => {
      const remaining = prev.filter(b => b.id !== clickedId)
      const nextCount = remaining.length + 1 // clicked one → spawn count + 1 new
      return Array.from({ length: nextCount }, () => spawnBat())
    })

    setScore(s => s + 1)

    // Give 4s to click next bat; if missed → reset
    resetTimerRef.current = setTimeout(() => {
      setBats([])
      scheduleIdleBat()
    }, 4000)
  }, [scheduleIdleBat])

  const handleBatExit = useCallback((exitedId: number) => {
    setBats(prev => {
      const remaining = prev.filter(b => b.id !== exitedId)
      if (remaining.length === 0) {
        scheduleIdleBat()
      }
      return remaining
    })
  }, [scheduleIdleBat])

  return (
    <>
      {bats.map(bat => (
        <BatInstance
          key={bat.id}
          bat={bat}
          onClick={() => handleBatClick(bat.id)}
          onExit={() => handleBatExit(bat.id)}
        />
      ))}
      {score > 0 && <ScoreCounter score={score} />}
    </>
  )
}
