'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import s from './BatAnimation.module.css'

// ── Pixel-art bat SVG ────────────────────────────────────────────────────────
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
      <path d="M 18,14 L 0,3 L 4,10 L 0,14 L 3,19 L 7,21 L 10,17 L 5,22 L 11,24 L 15,19 L 12,23 L 17,22 L 19,17 Z"/>
      <line x1="18" y1="14" x2="4"  y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="7"  y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="11" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <path d="M 30,14 L 48,3 L 44,10 L 48,14 L 45,19 L 41,21 L 38,17 L 43,22 L 37,24 L 33,19 L 36,23 L 31,22 L 29,17 Z"/>
      <line x1="30" y1="14" x2="44" y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="41" y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="37" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <polygon points="24,4 27,8 28,14 27,20 24,24 21,20 20,14 21,8"/>
      <polygon points="21,7 17,0 23,9"/>
      <polygon points="19,5 18,2 21,6" fill="var(--bg)" opacity="0.5"/>
      <polygon points="27,7 31,0 25,9"/>
      <polygon points="29,5 30,2 27,6" fill="var(--bg)" opacity="0.5"/>
      <polygon points="22,14 23,12 24,14 23,16" fill="var(--bg)"/>
      <polygon points="26,14 27,12 28,14 27,16" fill="var(--bg)"/>
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

interface ExplosionData {
  id: number
  x: number
  y: number
  type: 'click' | 'timeout'
}

type GameState = 'idle' | 'lure' | 'playing' | 'game_over'

// ── BatExplosion: ring + 8 flying particles ───────────────────────────────────
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const PARTICLE_DIST = 38

function BatExplosion({ data, onDone }: { data: ExplosionData; onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const isTimeout = data.type === 'timeout'

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 650)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={s.explosion} style={{ left: data.x, top: data.y }}>
      <div className={`${s.explosionRing} ${isTimeout ? s.explosionRingTimeout : ''}`} />
      {PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const dx = Math.cos(rad) * PARTICLE_DIST
        const dy = Math.sin(rad) * PARTICLE_DIST
        return (
          <div
            key={i}
            className={`${s.particle} ${isTimeout ? s.particleTimeout : ''}`}
            style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

// ── BatInstance: rAF animation, bounces within viewport ──────────────────────
interface BatInstanceProps {
  bat: BatData
  onClick: () => void
  onPositionUpdate: (id: number, x: number, y: number) => void
}

function BatInstance({ bat, onClick, onPositionUpdate }: BatInstanceProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const onClickRef = useRef(onClick)
  const onPosRef = useRef(onPositionUpdate)
  onClickRef.current = onClick
  onPosRef.current = onPositionUpdate

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const st = {
      x: bat.startX,
      y: bat.startY,
      vx: bat.startVx,
      vy: bat.startVy,
      lastTime: 0,
      nextTurnAt: 0,
    }

    let animId: number
    let alive = true

    function frame(t: number) {
      if (!alive) return
      const dt = st.lastTime ? Math.min((t - st.lastTime) / 1000, 0.05) : 0
      st.lastTime = t

      // Random direction change every 0.6–2.0s
      if (t > st.nextTurnAt) {
        const curA = Math.atan2(st.vy, st.vx)
        const deflect = (Math.random() - 0.5) * Math.PI * 1.3
        const speed = Math.max(80, Math.min(220, Math.hypot(st.vx, st.vy) * (0.8 + Math.random() * 0.4)))
        st.vx = Math.cos(curA + deflect) * speed
        st.vy = Math.sin(curA + deflect) * speed
        st.nextTurnAt = t + 600 + Math.random() * 1400
      }

      st.x += st.vx * dt
      st.y += st.vy * dt

      // Bounce off viewport walls
      const W = window.innerWidth
      const H = window.innerHeight
      const bW = 72 * bat.scale
      const bH = 42 * bat.scale

      if (st.x < 0)       { st.x = 0;      st.vx =  Math.abs(st.vx) }
      if (st.x > W - bW)  { st.x = W - bW; st.vx = -Math.abs(st.vx) }
      if (st.y < 0)       { st.y = 0;      st.vy =  Math.abs(st.vy) }
      if (st.y > H - bH)  { st.y = H - bH; st.vy = -Math.abs(st.vy) }

      // Report center position to controller
      onPosRef.current(bat.id, st.x + bW / 2, st.y + bH / 2)

      const angle = Math.atan2(st.vy, st.vx) * 180 / Math.PI
      div!.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${angle}deg) scale(${bat.scale})`

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)
    return () => {
      alive = false
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
      <span className={s.flap}><PixelBat /></span>
    </div>
  )
}

// ── Score counter ─────────────────────────────────────────────────────────────
function ScoreCounter({ score, gameOver }: { score: number; gameOver: boolean }) {
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
      {gameOver && <span className={s.gameOver}>GAME OVER</span>}
      <span className={s.scoreLabel}>убито</span>
      <span className={`${s.scoreNum} ${pulse ? s.pulse : ''}`}>×{score}</span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let _idCounter = 0
function nextId() { return ++_idCounter }

function spawnBat(): BatData {
  const W = typeof window !== 'undefined' ? window.innerWidth  : 400
  const H = typeof window !== 'undefined' ? window.innerHeight : 800
  const side = Math.floor(Math.random() * 4)
  const speed = 120 + Math.random() * 80
  const spread = (Math.random() - 0.5) * 0.5

  let startX: number, startY: number, startVx: number, startVy: number

  switch (side) {
    case 0: { // top edge
      startX = Math.random() * Math.max(1, W - 72)
      startY = 0
      const a = Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 1: { // right edge
      startX = Math.max(0, W - 72)
      startY = Math.random() * Math.max(1, H - 42)
      const a = Math.PI + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 2: { // bottom edge
      startX = Math.random() * Math.max(1, W - 72)
      startY = Math.max(0, H - 42)
      const a = -Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    default: { // left edge
      startX = 0
      startY = Math.random() * Math.max(1, H - 42)
      const a = spread
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
  const [gameState, setGameState] = useState<GameState>('idle')
  const [bats, setBats]           = useState<BatData[]>([])
  const [explosions, setExplosions] = useState<ExplosionData[]>([])
  const [score, setScore]         = useState(0)

  const waveTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const batPositions    = useRef<Map<number, { x: number; y: number }>>(new Map())
  const nextWaveNRef    = useRef(0)
  const scheduleWaveRef = useRef(false)
  const gameStateRef    = useRef<GameState>('idle')
  gameStateRef.current  = gameState

  // spawnWave: stored in a ref so timeouts always call the latest version
  const spawnWaveRef = useRef<(n: number) => void>()
  spawnWaveRef.current = (n: number) => {
    if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
    const newBats = Array.from({ length: n }, spawnBat)
    setBats(newBats)

    waveTimerRef.current = setTimeout(() => {
      // Wave timer expired — all remaining bats are game over
      const positions = [...batPositions.current.values()]
      batPositions.current.clear()
      setBats([])
      setGameState('game_over')
      // Stagger the explosions slightly for dramatic effect
      positions.forEach((p, i) => {
        setTimeout(() => {
          setExplosions(prev => [...prev, { id: nextId(), x: p.x, y: p.y, type: 'timeout' }])
        }, i * 100)
      })
      // Restart game after 10s
      goTimerRef.current = setTimeout(() => setGameState('lure'), 10000)
    }, 4000)
  }

  // Mount: wait 3s then show first bat
  useEffect(() => {
    const t = setTimeout(() => setGameState('lure'), 3000)
    return () => {
      clearTimeout(t)
      if (waveTimerRef.current) clearTimeout(waveTimerRef.current)
      if (goTimerRef.current)   clearTimeout(goTimerRef.current)
    }
  }, [])

  // When state becomes 'lure' → spawn single bat
  useEffect(() => {
    if (gameState === 'lure') spawnWaveRef.current!(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  // When bats array empties after all clicked → spawn next wave
  useEffect(() => {
    if (bats.length === 0 && scheduleWaveRef.current) {
      scheduleWaveRef.current = false
      const n = nextWaveNRef.current
      if (n > 0) {
        const t = setTimeout(() => spawnWaveRef.current!(n), 260)
        return () => clearTimeout(t)
      }
    }
  }, [bats])

  const handlePositionUpdate = useCallback((id: number, x: number, y: number) => {
    batPositions.current.set(id, { x, y })
  }, [])

  const handleBatClick = useCallback((clickedId: number) => {
    const pos = batPositions.current.get(clickedId) ?? {
      x: (typeof window !== 'undefined' ? window.innerWidth  : 400) / 2,
      y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2,
    }
    batPositions.current.delete(clickedId)

    setExplosions(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, type: 'click' }])
    setScore(s => s + 1)

    setBats(prev => {
      const remaining = prev.filter(b => b.id !== clickedId)
      if (remaining.length === 0) {
        // All bats in wave clicked — clear timer, queue next wave
        if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
        const nextN = prev.length + 1
        nextWaveNRef.current = nextN
        scheduleWaveRef.current = true
        // Upgrade lure → playing state on first successful click
        if (gameStateRef.current === 'lure') setGameState('playing')
      }
      return remaining
    })
  }, [])

  const removeExplosion = useCallback((id: number) => {
    setExplosions(prev => prev.filter(e => e.id !== id))
  }, [])

  const showScore = score > 0 || gameState === 'game_over'

  return (
    <>
      {bats.map(bat => (
        <BatInstance
          key={bat.id}
          bat={bat}
          onClick={() => handleBatClick(bat.id)}
          onPositionUpdate={handlePositionUpdate}
        />
      ))}
      {explosions.map(exp => (
        <BatExplosion
          key={exp.id}
          data={exp}
          onDone={() => removeExplosion(exp.id)}
        />
      ))}
      {showScore && <ScoreCounter score={score} gameOver={gameState === 'game_over'} />}
    </>
  )
}
