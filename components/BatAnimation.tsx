'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import s from './BatAnimation.module.css'

// ── Pixel-art bat ─────────────────────────────────────────────────────────────
function PixelBat() {
  return (
    <svg width="72" height="50" viewBox="0 -5 48 33" fill="currentColor" aria-hidden="true"
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}>
      <path d="M 18,14 L 0,3 L 4,10 L 0,14 L 3,19 L 7,21 L 10,17 L 5,22 L 11,24 L 15,19 L 12,23 L 17,22 L 19,17 Z"/>
      <line x1="18" y1="14" x2="4"  y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="7"  y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="18" y1="14" x2="11" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <path d="M 30,14 L 48,3 L 44,10 L 48,14 L 45,19 L 41,21 L 38,17 L 43,22 L 37,24 L 33,19 L 36,23 L 31,22 L 29,17 Z"/>
      <line x1="30" y1="14" x2="44" y2="10" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="41" y2="21" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <line x1="30" y1="14" x2="37" y2="24" stroke="var(--bg)" strokeWidth="0.7" opacity="0.4"/>
      <polygon points="24,3 29,8 30,14 29,21 24,24 19,21 18,14 19,8"/>
      <polygon points="21,7 17,0 23,9"/>
      <polygon points="19,5 18,2 21,6" fill="var(--bg)" opacity="0.5"/>
      <polygon points="21,4 19,-3 24,2"/>
      <polygon points="21,3 20,0 23,2" fill="var(--bg)" opacity="0.5"/>
      <polygon points="27,7 31,0 25,9"/>
      <polygon points="29,5 30,2 27,6" fill="var(--bg)" opacity="0.5"/>
      <polygon points="27,4 24,2 29,-3"/>
      <polygon points="27,3 25,2 28,0" fill="var(--bg)" opacity="0.5"/>
      <polygon points="21,14 22,12 23,14 22,16" fill="var(--bg)"/>
      <polygon points="25,14 26,12 27,14 26,16" fill="var(--bg)"/>
      <polygon points="23,9 24,6 25,9 24,12" fill="var(--accent, #f29774)"/>
      <line x1="19" y1="21" x2="29" y2="21" stroke="var(--bg)" strokeWidth="1" opacity="0.6"/>
      <line x1="21" y1="21" x2="20" y2="23" stroke="var(--bg)" strokeWidth="0.8" opacity="0.5"/>
      <line x1="27" y1="21" x2="28" y2="23" stroke="var(--bg)" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface BatData       { id: number; startX: number; startY: number; startVx: number; startVy: number; scale: number }
interface ExplosionData { id: number; x: number; y: number }
interface SplatData     { id: number; x: number; y: number; variant: number; angle: number }
interface HitMarkerData { id: number; x: number; y: number }
type GameState = 'idle' | 'lure' | 'playing' | 'game_over'

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const PARTICLE_DIST   = 38

// ── Timeout explosion (bat escapes) ──────────────────────────────────────────
function BatExplosion({ data, onDone }: { data: ExplosionData; onDone: () => void }) {
  const cbRef = useRef(onDone); cbRef.current = onDone
  useEffect(() => { const t = setTimeout(() => cbRef.current(), 650); return () => clearTimeout(t) }, [])
  return (
    <div className={s.explosion} style={{ left: data.x, top: data.y }}>
      <div className={`${s.explosionRing} ${s.explosionRingTimeout}`} />
      {PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <div key={i} className={`${s.particle} ${s.particleTimeout}`}
            style={{ '--dx': `${Math.cos(rad) * PARTICLE_DIST}px`, '--dy': `${Math.sin(rad) * PARTICLE_DIST}px` } as React.CSSProperties} />
        )
      })}
    </div>
  )
}

// ── COD Warzone hit marker ────────────────────────────────────────────────────
function HitMarker({ data, onDone }: { data: HitMarkerData; onDone: () => void }) {
  const cbRef = useRef(onDone); cbRef.current = onDone
  useEffect(() => { const t = setTimeout(() => cbRef.current(), 320); return () => clearTimeout(t) }, [])
  return (
    <div className={s.hitMarker} style={{ left: data.x, top: data.y }}>
      <svg className={s.hitMarkerSvg} viewBox="-28 -28 56 56" fill="none">
        <line x1="-22" y1="-22" x2="-10" y2="-10" stroke="white" strokeWidth="3.5" strokeLinecap="square"/>
        <line x1="10"  y1="-22" x2="22"  y2="-10" stroke="white" strokeWidth="3.5" strokeLinecap="square"/>
        <line x1="-22" y1="10"  x2="-10" y2="22"  stroke="white" strokeWidth="3.5" strokeLinecap="square"/>
        <line x1="10"  y1="10"  x2="22"  y2="22"  stroke="white" strokeWidth="3.5" strokeLinecap="square"/>
      </svg>
    </div>
  )
}

// ── Pixel blood splat — 4 variants ───────────────────────────────────────────
function PixelSplat({ data }: { data: SplatData }) {
  return (
    <div className={s.splat} style={{ left: data.x, top: data.y }}>
      <div className={s.splatInner} style={{ transform: `rotate(${data.angle}deg)` }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#a00000"
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block' }}>
          {data.variant === 0 && <>
            <polygon points="8,8 16,8 18,12 16,16 8,16 6,12"/>
            <rect x="4" y="4" width="2" height="2"/><rect x="18" y="4" width="2" height="2"/>
            <rect x="2" y="11" width="2" height="2"/><rect x="20" y="11" width="2" height="2"/>
            <rect x="6" y="18" width="2" height="2"/><rect x="16" y="18" width="2" height="2"/>
          </>}
          {data.variant === 1 && <>
            <polygon points="6,7 14,6 16,10 14,15 6,14 4,10"/>
            <rect x="16" y="4" width="3" height="2"/><rect x="20" y="2" width="2" height="2"/>
            <rect x="18" y="7" width="2" height="2"/><rect x="3" y="16" width="2" height="3"/>
            <rect x="6" y="20" width="2" height="2"/><rect x="15" y="17" width="2" height="2"/>
          </>}
          {data.variant === 2 && <>
            <polygon points="9,9 15,9 17,12 15,15 9,15 7,12"/>
            <rect x="17" y="10" width="3" height="2"/><rect x="20" y="9" width="2" height="2"/>
            <rect x="22" y="8" width="1" height="2"/><rect x="5" y="5" width="2" height="2"/>
            <rect x="7" y="17" width="3" height="2"/><rect x="15" y="18" width="2" height="2"/>
          </>}
          {data.variant === 3 && <>
            <polygon points="5,10 10,8 14,8 19,10 17,14 14,16 10,16 7,14"/>
            <rect x="2" y="8" width="2" height="2"/><rect x="20" y="8" width="2" height="2"/>
            <rect x="11" y="2" width="2" height="3"/><rect x="11" y="19" width="2" height="3"/>
            <rect x="4" y="17" width="2" height="2"/><rect x="18" y="17" width="2" height="2"/>
          </>}
        </svg>
      </div>
    </div>
  )
}

// ── Roomba snake-path builder ─────────────────────────────────────────────────
function buildSnakePath(splats: SplatData[], dir: 'left' | 'right', W: number, H: number) {
  const waypoints: { x: number; y: number; splatId?: number }[] = []
  if (splats.length > 0) {
    const BAND = 150
    const bands = new Map<number, SplatData[]>()
    for (const sp of splats) {
      const k = Math.floor(sp.y / BAND)
      if (!bands.has(k)) bands.set(k, [])
      bands.get(k)!.push(sp)
    }
    let goRight = dir === 'left'
    for (const k of [...bands.keys()].sort((a, b) => a - b)) {
      const row = [...bands.get(k)!].sort((a, b) => goRight ? a.x - b.x : b.x - a.x)
      for (const sp of row) waypoints.push({ x: sp.x, y: sp.y, splatId: sp.id })
      goRight = !goRight
    }
  }
  const last = waypoints[waypoints.length - 1]
  const exitX = last ? (last.x > W / 2 ? W + 80 : -80) : (dir === 'left' ? W + 80 : -80)
  waypoints.push({ x: exitX, y: last?.y ?? H * 0.65 })
  return waypoints
}

// ── Pixel roomba — JS rAF driven ──────────────────────────────────────────────
function PixelRoomba({ splats, dir, onSplatHit, onDone }: {
  splats: SplatData[]
  dir: 'left' | 'right'
  onSplatHit: (id: number) => void
  onDone: () => void
}) {
  const divRef  = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone);     doneRef.current = onDone
  const hitRef  = useRef(onSplatHit); hitRef.current  = onSplatHit

  useEffect(() => {
    const div = divRef.current; if (!div) return
    const W = window.innerWidth, H = window.innerHeight
    const SIZE = 52, SPEED = 190, RADIUS = 52
    const wps = buildSnakePath(splats, dir, W, H)
    const pos = { x: dir === 'left' ? -SIZE : W + SIZE, y: wps[0]?.y ?? H * 0.65 }
    div.style.transform = `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px)`
    let wpIdx = 0, lastT = 0, rafId: number, alive = true

    function frame(t: number) {
      if (!alive) return
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0
      lastT = t
      while (wpIdx < wps.length) {
        const wp = wps[wpIdx]
        const dx = wp.x - pos.x, dy = wp.y - pos.y
        if (Math.hypot(dx, dy) < RADIUS) {
          if (wp.splatId !== undefined) hitRef.current(wp.splatId)
          wpIdx++
          if (wpIdx >= wps.length) { doneRef.current(); return }
        } else {
          const d = Math.hypot(dx, dy)
          pos.x += (dx / d) * SPEED * dt
          pos.y += (dy / d) * SPEED * dt
          break
        }
      }
      if (div) div.style.transform = `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px)`
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => { alive = false; cancelAnimationFrame(rafId) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={divRef} className={s.roomba} style={{ position: 'fixed', top: 0, left: 0, willChange: 'transform' }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block' }}>
        <polygon points="8,2 16,2 20,4 22,8 22,16 20,20 16,22 8,22 4,20 2,16 2,8 4,4"/>
        <polygon points="9,5 15,5 18,7 19,10 19,14 18,17 15,19 9,19 6,17 5,14 5,10 6,7" fill="var(--bg)" opacity="0.35"/>
        <rect x="9" y="2" width="6" height="2" fill="var(--accent)" opacity="0.9"/>
        <rect x="5" y="11" width="14" height="2" fill="var(--accent)" opacity="0.55"/>
        <rect x="11" y="8" width="2" height="2" fill="var(--accent)"/>
        <rect x="2" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
        <rect x="20" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
      </svg>
    </div>
  )
}

// ── BatInstance ───────────────────────────────────────────────────────────────
function BatInstance({ bat, onClick, onPositionUpdate }: {
  bat: BatData
  onClick: () => void
  onPositionUpdate: (id: number, x: number, y: number) => void
}) {
  const divRef   = useRef<HTMLDivElement>(null)
  const clickRef = useRef(onClick);          clickRef.current = onClick
  const posRef   = useRef(onPositionUpdate); posRef.current   = onPositionUpdate

  useEffect(() => {
    const div = divRef.current; if (!div) return
    const st = { x: bat.startX, y: bat.startY, vx: bat.startVx, vy: bat.startVy, lastTime: 0, nextTurnAt: 0 }
    let animId: number, alive = true
    function frame(t: number) {
      if (!alive) return
      const dt = st.lastTime ? Math.min((t - st.lastTime) / 1000, 0.05) : 0
      st.lastTime = t
      if (t > st.nextTurnAt) {
        const curA = Math.atan2(st.vy, st.vx)
        const deflect = (Math.random() - 0.5) * Math.PI * 1.3
        const speed = Math.max(80, Math.min(220, Math.hypot(st.vx, st.vy) * (0.8 + Math.random() * 0.4)))
        st.vx = Math.cos(curA + deflect) * speed; st.vy = Math.sin(curA + deflect) * speed
        st.nextTurnAt = t + 600 + Math.random() * 1400
      }
      st.x += st.vx * dt; st.y += st.vy * dt
      const W = window.innerWidth, H = window.innerHeight
      const bW = 72 * bat.scale, bH = 50 * bat.scale
      if (st.x < 0)       { st.x = 0;      st.vx =  Math.abs(st.vx) }
      if (st.x > W - bW)  { st.x = W - bW; st.vx = -Math.abs(st.vx) }
      if (st.y < 0)       { st.y = 0;      st.vy =  Math.abs(st.vy) }
      if (st.y > H - bH)  { st.y = H - bH; st.vy = -Math.abs(st.vy) }
      posRef.current(bat.id, st.x + bW / 2, st.y + bH / 2)
      const angle = Math.atan2(st.vy, st.vx) * 180 / Math.PI
      div!.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${angle}deg) scale(${bat.scale})`
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => { alive = false; cancelAnimationFrame(animId) }
  }, [bat])

  return (
    <div ref={divRef} className={s.bat}
      style={{ transform: `translate(${bat.startX}px, ${bat.startY}px) scale(${bat.scale})` }}
      onClick={() => clickRef.current()}
      onTouchStart={e => { e.preventDefault(); clickRef.current() }}>
      <span className={s.flap}><PixelBat /></span>
    </div>
  )
}

// ── Score + Game Over ─────────────────────────────────────────────────────────
function ScoreCounter({ score, waveNum }: { score: number; waveNum: number }) {
  const [pulse, setPulse] = useState(false)
  const prev = useRef(score)
  useEffect(() => {
    if (score !== prev.current) { prev.current = score; setPulse(true); setTimeout(() => setPulse(false), 160) }
  }, [score])
  return (
    <div className={s.score}>
      {waveNum > 0 && <span className={s.waveLabel}>WAVE {waveNum}</span>}
      <span className={s.scoreLabel}>убито</span>
      <span className={`${s.scoreNum} ${pulse ? s.pulse : ''}`}>×{score}</span>
    </div>
  )
}

function GameOverBanner() { return <div className={s.gameOverCenter}>GAME OVER</div> }

// ── Helpers ───────────────────────────────────────────────────────────────────
let _id = 0
function nextId() { return ++_id }

function spawnBat(): BatData {
  const W = typeof window !== 'undefined' ? window.innerWidth  : 400
  const H = typeof window !== 'undefined' ? window.innerHeight : 800
  const side = Math.floor(Math.random() * 4)
  const speed = 120 + Math.random() * 80
  const spread = (Math.random() - 0.5) * 0.5
  let startX = 0, startY = 0, startVx = 0, startVy = 0
  switch (side) {
    case 0: startX = Math.random()*(W-72); startY = 0; startVx = Math.cos(Math.PI/2+spread)*speed; startVy = Math.sin(Math.PI/2+spread)*speed; break
    case 1: startX = Math.max(0,W-72); startY = Math.random()*(H-50); startVx = Math.cos(Math.PI+spread)*speed; startVy = Math.sin(Math.PI+spread)*speed; break
    case 2: startX = Math.random()*(W-72); startY = Math.max(0,H-50); startVx = Math.cos(-Math.PI/2+spread)*speed; startVy = Math.sin(-Math.PI/2+spread)*speed; break
    default: startX = 0; startY = Math.random()*(H-50); startVx = Math.cos(spread)*speed; startVy = Math.sin(spread)*speed; break
  }
  return { id: nextId(), startX, startY, startVx, startVy, scale: 0.6 + Math.random() * 0.75 }
}

// ── Main controller ───────────────────────────────────────────────────────────
export default function BatAnimation() {
  const [gameState, setGameState]           = useState<GameState>('idle')
  const [bats, setBats]                     = useState<BatData[]>([])
  const [explosions, setExplosions]         = useState<ExplosionData[]>([])
  const [splats, setSplats]                 = useState<SplatData[]>([])
  const [hitMarkers, setHitMarkers]         = useState<HitMarkerData[]>([])
  const [score, setScore]                   = useState(0)
  const [waveNum, setWaveNum]               = useState(0)
  const [roombaSweeping, setRoombaSweeping] = useState(false)
  const [roombaSplats, setRoombaSplats]     = useState<SplatData[]>([])
  const [roombaDir, setRoombaDir]           = useState<'left' | 'right'>('left')

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
  const splatsRef          = useRef<SplatData[]>([])
  splatsRef.current        = splats
  const pendingWaveRef     = useRef(0)

  const spawnWaveRef = useRef<(n: number) => void>()
  spawnWaveRef.current = (n: number) => {
    currentWaveSizeRef.current = n
    if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
    spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
    for (let i = 0; i < n; i++) {
      spawnTimersRef.current.push(setTimeout(() => setBats(prev => [...prev, spawnBat()]), i * 150))
    }
    waveTimerRef.current = setTimeout(() => {
      spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
      const positions = [...batPositions.current.values()]
      batPositions.current.clear()
      setBats([])
      positions.forEach((p, i) => {
        setTimeout(() => setExplosions(prev => [...prev, { id: nextId(), x: p.x, y: p.y }]), i * 100)
      })
      if (gameStateRef.current === 'lure') {
        setGameState('idle')
      } else {
        setGameState('game_over')
        try {
          const cur = scoreRef.current
          const stored = parseInt(localStorage.getItem('threep-bat-hs') ?? '-1', 10)
          if (cur > stored) localStorage.setItem('threep-bat-hs', String(cur))
        } catch {}
        goTimerRef.current = setTimeout(() => {
          setSplats([]); setGameState('idle'); setScore(0); scoreRef.current = 0; setWaveNum(0)
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

  // Bats cleared → start roomba sweep
  useEffect(() => {
    if (bats.length === 0 && scheduleWaveRef.current) {
      scheduleWaveRef.current = false
      const n = nextWaveNRef.current
      if (n > 0) {
        pendingWaveRef.current = n
        setWaveNum(n)
        setRoombaDir(n % 2 === 0 ? 'right' : 'left')
        setRoombaSplats([...splatsRef.current])
        setRoombaSweeping(true)
      }
    }
  }, [bats])

  // Disable text/element selection during game
  useEffect(() => {
    const active = gameState === 'playing' || gameState === 'game_over'
    if (!active) return
    const el = document.createElement('style')
    el.id = 'threep-no-select'
    el.textContent = '* { user-select: none !important; -webkit-user-select: none !important; }'
    document.head.appendChild(el)
    return () => document.getElementById('threep-no-select')?.remove()
  }, [gameState])

  const handlePositionUpdate = useCallback((id: number, x: number, y: number) => {
    batPositions.current.set(id, { x, y })
  }, [])

  const handleBatClick = useCallback((clickedId: number) => {
    const pos = batPositions.current.get(clickedId) ?? {
      x: (typeof window !== 'undefined' ? window.innerWidth  : 400) / 2,
      y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2,
    }
    batPositions.current.delete(clickedId)

    setHitMarkers(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y }])
    setSplats(prev => [...prev, {
      id: nextId(), x: pos.x, y: pos.y,
      variant: Math.floor(Math.random() * 4),
      angle: Math.floor(Math.random() * 360),
    }])
    setScore(n => { const next = n + 1; scoreRef.current = next; return next })
    setBats(prev => {
      const remaining = prev.filter(b => b.id !== clickedId)
      if (remaining.length === 0) {
        if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
        nextWaveNRef.current = currentWaveSizeRef.current + 1
        scheduleWaveRef.current = true
        if (gameStateRef.current === 'lure') setGameState('playing')
      }
      return remaining
    })
  }, [])

  const handleSplatHit   = useCallback((id: number) => setSplats(prev => prev.filter(s => s.id !== id)), [])
  const handleRoombaDone = useCallback(() => {
    setRoombaSweeping(false)
    setSplats([])
    if (spawnWaveRef.current) spawnWaveRef.current(pendingWaveRef.current)
  }, [])
  const removeExplosion  = useCallback((id: number) => setExplosions(prev => prev.filter(e => e.id !== id)), [])
  const removeHitMarker  = useCallback((id: number) => setHitMarkers(prev => prev.filter(h => h.id !== id)), [])

  const overlayActive = gameState === 'playing' || gameState === 'game_over'
  const showScore     = gameState === 'playing' || gameState === 'game_over'

  return (
    <>
      {overlayActive && <div className={s.overlay} aria-hidden="true" />}
      {splats.map(sp => <PixelSplat key={sp.id} data={sp} />)}
      {bats.map(bat => (
        <BatInstance key={bat.id} bat={bat}
          onClick={() => handleBatClick(bat.id)}
          onPositionUpdate={handlePositionUpdate} />
      ))}
      {explosions.map(exp => (
        <BatExplosion key={exp.id} data={exp} onDone={() => removeExplosion(exp.id)} />
      ))}
      {hitMarkers.map(hm => (
        <HitMarker key={hm.id} data={hm} onDone={() => removeHitMarker(hm.id)} />
      ))}
      {roombaSweeping && (
        <PixelRoomba key={waveNum} splats={roombaSplats} dir={roombaDir}
          onSplatHit={handleSplatHit} onDone={handleRoombaDone} />
      )}
      {gameState === 'game_over' && <GameOverBanner />}
      {showScore && <ScoreCounter score={score} waveNum={waveNum} />}
    </>
  )
}
