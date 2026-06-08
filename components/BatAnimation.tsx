'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import s from './BatAnimation.module.css'

// ── Pixel-art bat — wider face, horns, third eye ─────────────────────────────
function PixelBat() {
  return (
    <svg
      width="72"
      height="50"
      viewBox="0 -5 48 33"
      fill="currentColor"
      aria-hidden="true"
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
    >
      {/* Left wing */}
      <path d="M 18,14 L 0,3 L 4,10 L 0,14 L 3,19 L 7,21 L 10,17 L 5,22 L 11,24 L 15,19 L 12,23 L 17,22 L 19,17 Z"/>
      <line x1="18" y1="14" x2="4"  y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="7"  y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="11" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      {/* Right wing */}
      <path d="M 30,14 L 48,3 L 44,10 L 48,14 L 45,19 L 41,21 L 38,17 L 43,22 L 37,24 L 33,19 L 36,23 L 31,22 L 29,17 Z"/>
      <line x1="30" y1="14" x2="44" y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="41" y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="37" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      {/* Wider body/face */}
      <polygon points="24,3 29,8 30,14 29,21 24,24 19,21 18,14 19,8"/>
      {/* Left ear */}
      <polygon points="21,7 17,0 23,9"/>
      <polygon points="19,5 18,2 21,6" fill="var(--bg)" opacity="0.5"/>
      {/* Left horn */}
      <polygon points="21,4 19,-3 24,2"/>
      <polygon points="21,3 20,0 23,2" fill="var(--bg)" opacity="0.5"/>
      {/* Right ear */}
      <polygon points="27,7 31,0 25,9"/>
      <polygon points="29,5 30,2 27,6" fill="var(--bg)" opacity="0.5"/>
      {/* Right horn */}
      <polygon points="27,4 24,2 29,-3"/>
      <polygon points="27,3 25,2 28,0" fill="var(--bg)" opacity="0.5"/>
      {/* Eyes */}
      <polygon points="21,14 22,12 23,14 22,16" fill="var(--bg)"/>
      <polygon points="25,14 26,12 27,14 26,16" fill="var(--bg)"/>
      {/* Third eye — glowing on forehead */}
      <polygon points="23,9 24,6 25,9 24,12" fill="var(--accent, #f29774)"/>
      {/* Wider mouth */}
      <line x1="19" y1="21" x2="29" y2="21" stroke="var(--bg)" strokeWidth="1" opacity="0.6"/>
      {/* Fangs */}
      <line x1="21" y1="21" x2="20" y2="23" stroke="var(--bg)" strokeWidth="0.8" opacity="0.5"/>
      <line x1="27" y1="21" x2="28" y2="23" stroke="var(--bg)" strokeWidth="0.8" opacity="0.5"/>
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

interface SplatData {
  id: number
  x: number
  y: number
  variant: number
  angle: number
}

type GameState = 'idle' | 'lure' | 'playing' | 'game_over'

// ── Doom explosion constants ──────────────────────────────────────────────────
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const PARTICLE_DIST   = 38

const DOOM_ANGLES = Array.from({ length: 16 }, (_, i) => i * 22.5)
const DOOM_DISTS  = [32, 55, 28, 62, 45, 30, 58, 40, 25, 50, 38, 65, 34, 48, 42, 52]
const DOOM_SIZES  = [4,   6,  3,  8,  5,  3,  7,  4,  3,  6,  5,  7,  4,  5,  3,  6]
const DOOM_GORE   = [false, true, false, true, false, false, true, false, true, false, true, false, false, true, false, true]
const DOOM_SQUARE = [false, false, true, false, false, true, false, false, false, false, false, true, false, false, true, false]

// ── BatExplosion ─────────────────────────────────────────────────────────────
function BatExplosion({ data, onDone }: { data: ExplosionData; onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const isTimeout = data.type === 'timeout'

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), isTimeout ? 650 : 750)
    return () => clearTimeout(t)
  }, [isTimeout])

  if (isTimeout) {
    return (
      <div className={s.explosion} style={{ left: data.x, top: data.y }}>
        <div className={`${s.explosionRing} ${s.explosionRingTimeout}`} />
        {PARTICLE_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const dx = Math.cos(rad) * PARTICLE_DIST
          const dy = Math.sin(rad) * PARTICLE_DIST
          return (
            <div
              key={i}
              className={`${s.particle} ${s.particleTimeout}`}
              style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as React.CSSProperties}
            />
          )
        })}
      </div>
    )
  }

  // Doom-style click explosion
  return (
    <div className={s.explosion} style={{ left: data.x, top: data.y }}>
      <div className={s.explosionFlash} />
      <div className={s.explosionRing} />
      <div className={s.explosionRingDoom2} />
      <div className={s.explosionRingDoom3} />
      {DOOM_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const dx = Math.cos(rad) * DOOM_DISTS[i]
        const dy = Math.sin(rad) * DOOM_DISTS[i]
        const sz = DOOM_SIZES[i]
        const cls = DOOM_SQUARE[i] ? s.particleChunk : DOOM_GORE[i] ? s.particleGore : s.particle
        return (
          <div
            key={i}
            className={cls}
            style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, width: `${sz}px`, height: `${sz}px` } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

// ── Pixel-art blood splat — 4 variants ───────────────────────────────────────
function PixelSplat({ data }: { data: SplatData }) {
  return (
    <div className={s.splat} style={{ left: data.x, top: data.y }}>
      <div className={s.splatInner} style={{ transform: `rotate(${data.angle}deg)` }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#a00000"
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block' }}>
          {data.variant === 0 && <>
            <polygon points="8,8 16,8 18,12 16,16 8,16 6,12"/>
            <rect x="4" y="4" width="2" height="2"/>
            <rect x="18" y="4" width="2" height="2"/>
            <rect x="2" y="11" width="2" height="2"/>
            <rect x="20" y="11" width="2" height="2"/>
            <rect x="6" y="18" width="2" height="2"/>
            <rect x="16" y="18" width="2" height="2"/>
          </>}
          {data.variant === 1 && <>
            <polygon points="6,7 14,6 16,10 14,15 6,14 4,10"/>
            <rect x="16" y="4" width="3" height="2"/>
            <rect x="20" y="2" width="2" height="2"/>
            <rect x="18" y="7" width="2" height="2"/>
            <rect x="3" y="16" width="2" height="3"/>
            <rect x="6" y="20" width="2" height="2"/>
            <rect x="15" y="17" width="2" height="2"/>
          </>}
          {data.variant === 2 && <>
            <polygon points="9,9 15,9 17,12 15,15 9,15 7,12"/>
            <rect x="17" y="10" width="3" height="2"/>
            <rect x="20" y="9" width="2" height="2"/>
            <rect x="22" y="8" width="1" height="2"/>
            <rect x="5" y="5" width="2" height="2"/>
            <rect x="7" y="17" width="3" height="2"/>
            <rect x="15" y="18" width="2" height="2"/>
          </>}
          {data.variant === 3 && <>
            <polygon points="5,10 10,8 14,8 19,10 17,14 14,16 10,16 7,14"/>
            <rect x="2" y="8" width="2" height="2"/>
            <rect x="20" y="8" width="2" height="2"/>
            <rect x="11" y="2" width="2" height="3"/>
            <rect x="11" y="19" width="2" height="3"/>
            <rect x="4" y="17" width="2" height="2"/>
            <rect x="18" y="17" width="2" height="2"/>
          </>}
        </svg>
      </div>
    </div>
  )
}

// ── Pixel-art roomba robot ────────────────────────────────────────────────────
function PixelRoomba({ dir }: { dir: 'left' | 'right' }) {
  return (
    <div className={`${s.roomba} ${dir === 'left' ? s.roombaLeft : s.roombaRight}`}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block' }}>
        {/* Body */}
        <polygon points="8,2 16,2 20,4 22,8 22,16 20,20 16,22 8,22 4,20 2,16 2,8 4,4"/>
        {/* Inner panel */}
        <polygon points="9,5 15,5 18,7 19,10 19,14 18,17 15,19 9,19 6,17 5,14 5,10 6,7" fill="var(--bg)" opacity="0.35"/>
        {/* Front bumper accent */}
        <rect x="9" y="2" width="6" height="2" fill="var(--accent)" opacity="0.9"/>
        {/* Center brush line */}
        <rect x="5" y="11" width="14" height="2" fill="var(--accent)" opacity="0.55"/>
        {/* LED indicator */}
        <rect x="11" y="8" width="2" height="2" fill="var(--accent)"/>
        {/* Wheels */}
        <rect x="2" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
        <rect x="20" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
        {/* Dirt trail dots */}
        <rect x="7" y="21" width="2" height="1" fill="var(--accent)" opacity="0.3"/>
        <rect x="12" y="22" width="2" height="1" fill="var(--accent)" opacity="0.2"/>
        <rect x="16" y="21" width="2" height="1" fill="var(--accent)" opacity="0.3"/>
      </svg>
    </div>
  )
}

// ── BatInstance: rAF animation ────────────────────────────────────────────────
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

      const W = window.innerWidth
      const H = window.innerHeight
      const bW = 72 * bat.scale
      const bH = 50 * bat.scale

      if (st.x < 0)       { st.x = 0;      st.vx =  Math.abs(st.vx) }
      if (st.x > W - bW)  { st.x = W - bW; st.vx = -Math.abs(st.vx) }
      if (st.y < 0)       { st.y = 0;      st.vy =  Math.abs(st.vy) }
      if (st.y > H - bH)  { st.y = H - bH; st.vy = -Math.abs(st.vy) }

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
function ScoreCounter({ score, waveNum }: { score: number; waveNum: number }) {
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
      {waveNum > 0 && <span className={s.waveLabel}>WAVE {waveNum}</span>}
      <span className={s.scoreLabel}>убито</span>
      <span className={`${s.scoreNum} ${pulse ? s.pulse : ''}`}>×{score}</span>
    </div>
  )
}

// ── GAME OVER banner ──────────────────────────────────────────────────────────
function GameOverBanner() {
  return <div className={s.gameOverCenter}>GAME OVER</div>
}

// ── Click ripple ──────────────────────────────────────────────────────────────
function Ripple({ data, onDone }: { data: { id: number; x: number; y: number }; onDone: () => void }) {
  return (
    <div
      className={s.ripple}
      style={{ left: data.x, top: data.y }}
      onAnimationEnd={onDone}
      aria-hidden="true"
    />
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
    case 0: {
      startX = Math.random() * Math.max(1, W - 72)
      startY = 0
      const a = Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 1: {
      startX = Math.max(0, W - 72)
      startY = Math.random() * Math.max(1, H - 50)
      const a = Math.PI + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    case 2: {
      startX = Math.random() * Math.max(1, W - 72)
      startY = Math.max(0, H - 50)
      const a = -Math.PI / 2 + spread
      startVx = Math.cos(a) * speed; startVy = Math.sin(a) * speed
      break
    }
    default: {
      startX = 0
      startY = Math.random() * Math.max(1, H - 50)
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
  const [gameState, setGameState]       = useState<GameState>('idle')
  const [bats, setBats]                 = useState<BatData[]>([])
  const [explosions, setExplosions]     = useState<ExplosionData[]>([])
  const [splats, setSplats]             = useState<SplatData[]>([])
  const [score, setScore]               = useState(0)
  const [waveNum, setWaveNum]           = useState(0)
  const [roombaSweeping, setRoombaSweeping] = useState(false)
  const [roombaDir, setRoombaDir]       = useState<'left' | 'right'>('left')
  const [ripples, setRipples]           = useState<{ id: number; x: number; y: number }[]>([])

  const waveTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spawnTimersRef     = useRef<ReturnType<typeof setTimeout>[]>([])
  const batPositions       = useRef<Map<number, { x: number; y: number }>>(new Map())
  const nextWaveNRef       = useRef(0)
  const currentWaveSizeRef = useRef(0)
  const scheduleWaveRef    = useRef(false)
  const gameStateRef       = useRef<GameState>('idle')
  gameStateRef.current     = gameState
  const scoreRef           = useRef(0)

  const spawnWaveRef = useRef<(n: number) => void>()
  spawnWaveRef.current = (n: number) => {
    currentWaveSizeRef.current = n
    if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
    spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []

    for (let i = 0; i < n; i++) {
      const t = setTimeout(() => setBats(prev => [...prev, spawnBat()]), i * 150)
      spawnTimersRef.current.push(t)
    }

    waveTimerRef.current = setTimeout(() => {
      spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
      const positions = [...batPositions.current.values()]
      batPositions.current.clear()
      setBats([])
      positions.forEach((p, i) => {
        setTimeout(() => {
          setExplosions(prev => [...prev, { id: nextId(), x: p.x, y: p.y, type: 'timeout' }])
        }, i * 100)
      })
      if (gameStateRef.current === 'lure') {
        setGameState('idle')
      } else {
        setGameState('game_over')
        // Save high score
        try {
          const cur = scoreRef.current
          const stored = parseInt(localStorage.getItem('threep-bat-hs') ?? '-1', 10)
          if (cur > stored) localStorage.setItem('threep-bat-hs', String(cur))
        } catch {}
        goTimerRef.current = setTimeout(() => {
          setSplats([])
          setGameState('idle')
          setScore(0)
          scoreRef.current = 0
          setWaveNum(0)
        }, 3000)
      }
    }, 4000)
  }

  useEffect(() => {
    if (gameState !== 'idle') return
    const t = setTimeout(() => setGameState('lure'), 3000)
    return () => clearTimeout(t)
  }, [gameState])

  useEffect(() => () => {
    if (waveTimerRef.current) clearTimeout(waveTimerRef.current)
    if (goTimerRef.current)   clearTimeout(goTimerRef.current)
    spawnTimersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (gameState === 'lure') spawnWaveRef.current!(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  // Bats cleared → roomba sweep → next wave
  useEffect(() => {
    if (bats.length === 0 && scheduleWaveRef.current) {
      scheduleWaveRef.current = false
      const n = nextWaveNRef.current
      if (n > 0) {
        setWaveNum(n)
        setRoombaDir(n % 2 === 0 ? 'right' : 'left')
        setRoombaSweeping(true)
        const t = setTimeout(() => {
          setRoombaSweeping(false)
          setSplats([])
          spawnWaveRef.current!(n)
        }, 2500)
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

    // Blood splat at kill position
    setSplats(prev => [...prev, {
      id: nextId(),
      x: pos.x,
      y: pos.y,
      variant: Math.floor(Math.random() * 4),
      angle: Math.floor(Math.random() * 360),
    }])

    setScore(s => {
      const next = s + 1
      scoreRef.current = next
      return next
    })

    setBats(prev => {
      const remaining = prev.filter(b => b.id !== clickedId)
      if (remaining.length === 0) {
        if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
        const nextN = currentWaveSizeRef.current + 1
        nextWaveNRef.current = nextN
        scheduleWaveRef.current = true
        if (gameStateRef.current === 'lure') setGameState('playing')
      }
      return remaining
    })
  }, [])

  const removeExplosion = useCallback((id: number) => {
    setExplosions(prev => prev.filter(e => e.id !== id))
  }, [])

  const overlayActive = gameState === 'playing' || gameState === 'game_over'
  const showScore     = gameState === 'playing' || gameState === 'game_over'

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    const id = nextId()
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
  }, [])

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id))
  }, [])

  return (
    <>
      {overlayActive && (
        <div className={s.overlay} aria-hidden="true" onClick={handleOverlayClick} />
      )}
      {/* Blood splatters — above overlay (z91), below bats (z100) */}
      {splats.map(sp => <PixelSplat key={sp.id} data={sp} />)}
      {ripples.map(r => (
        <Ripple key={r.id} data={r} onDone={() => removeRipple(r.id)} />
      ))}
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
      {/* Roomba between waves */}
      {roombaSweeping && <PixelRoomba dir={roombaDir} />}
      {gameState === 'game_over' && <GameOverBanner />}
      {showScore && <ScoreCounter score={score} waveNum={waveNum} />}
    </>
  )
}
