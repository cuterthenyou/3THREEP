'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import s from './BatAnimation.module.css'
import { trackEvent } from '@/lib/track'

// ── Admin-tunable balance (site_settings → info/page.tsx → prop) ──────────────
export interface GameConfig {
  roombaSpeed: number    // множитель скорости пылесоса
  batSpeed: number       // множитель скорости нетопырей
  batScale: number       // множитель размера нетопырей
  powerupChance: number  // множитель шанса дропа пауэрапа
  bossHp: number         // попаданий чтобы убить обычного босса (10/20/…)
  bossMegaHp: number     // попаданий для мега-босса (33/66/99)
  bossShieldMs: number   // длительность фазы щита (босс неуязвим), мс
  bossVulnMs: number     // длительность окна уязвимости (можно бить), мс
  bossTimeoutMs: number  // сколько даётся на убийство обычного босса, мс
}
export const DEFAULT_GAME_CONFIG: GameConfig = {
  roombaSpeed: 1, batSpeed: 1, batScale: 1, powerupChance: 1,
  bossHp: 8, bossMegaHp: 18, bossShieldMs: 1600, bossVulnMs: 1500, bossTimeoutMs: 45000,
}

// Босс на каждом 10-м уровне; мега-босс на 33/66/99
const isBossWave = (n: number) => n > 0 && n % 10 === 0
const isMegaWave = (n: number) => n === 33 || n === 66 || n === 99

// Сложность (выбор после первого нетопыря): множитель скорости + стартовая волна
type Difficulty = 'chill' | 'normal' | 'hard'
const DIFFICULTY: Record<Difficulty, { label: string; speed: number; startWave: number; hint: string }> = {
  chill:  { label: 'ЧИЛЛ',   speed: 0.8, startWave: 1, hint: 'спокойно' },
  normal: { label: 'НОРМ',   speed: 1.0, startWave: 2, hint: 'как надо' },
  hard:   { label: 'ХАРДКОР', speed: 1.35, startWave: 5, hint: 'жёстко' },
}

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
      {/* Eyes — glowing slit pupils */}
      <polygon points="21,14 22,11.5 23,14 22,16.5" fill="var(--bg)"/>
      <polygon points="25,14 26,11.5 27,14 26,16.5" fill="var(--bg)"/>
      {/* Third eye — distinct accent glow on the forehead */}
      <g className={s.thirdEye}>
        <polygon points="22.6,9 24,5.5 25.4,9 24,12.5" fill="var(--accent, #f29774)"/>
        <polygon points="23.4,9 24,7.4 24.6,9 24,10.6" fill="var(--bg)"/>
      </g>
      {/* Mouth + sharpened fangs */}
      <line x1="19" y1="20.5" x2="29" y2="20.5" stroke="var(--bg)" strokeWidth="1" opacity="0.6"/>
      <polygon points="20.5,20.5 21.4,20.5 20.7,23.4" fill="var(--bg)" opacity="0.7"/>
      <polygon points="27.5,20.5 28.6,20.5 28.3,23.4" fill="var(--bg)" opacity="0.7"/>
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
type BatVariant = 'normal' | 'golden' | 'armored' | 'boss'
type PowerKind  = 'slowmo' | 'freeze' | 'double'
interface BatData       { id: number; startX: number; startY: number; startVx: number; startVy: number; scale: number; variant: BatVariant; hp: number }
interface ExplosionData { id: number; x: number; y: number }
interface SplatData     { id: number; x: number; y: number; variant: number; angle: number }
interface HitMarkerData { id: number; x: number; y: number; kind?: 'kill' | 'clink' }
interface PowerUpData   { id: number; x: number; y: number; kind: PowerKind }
type GameState = 'idle' | 'lure' | 'choose' | 'playing' | 'game_over'

const VARIANT_BASE: Record<BatVariant, number> = { normal: 1, golden: 3, armored: 2, boss: 30 }
const POWER_LABELS: Record<PowerKind, string> = { slowmo: 'ЗАМЕДЛЕНИЕ', freeze: 'ЗАМОРОЗКА', double: 'ОЧКИ ×2' }

const TIMEOUT_PARTICLE_ANGLES = Array.from({ length: 16 }, (_, i) => i * 22.5)
const TIMEOUT_PARTICLE_DIST   = 58

// ── Timeout explosion (bat escapes) — brutal shockwave ────────────────────────
function BatExplosion({ data, onDone }: { data: ExplosionData; onDone: () => void }) {
  const cbRef = useRef(onDone); cbRef.current = onDone
  useEffect(() => { const t = setTimeout(() => cbRef.current(), 950); return () => clearTimeout(t) }, [])
  return (
    <div className={s.explosion} style={{ left: data.x, top: data.y }}>
      <div className={s.explosionFlashTimeout} />
      <div className={`${s.explosionRing} ${s.explosionRingT1}`} />
      <div className={`${s.explosionRing} ${s.explosionRingT2}`} />
      <div className={`${s.explosionRing} ${s.explosionRingT3}`} />
      {TIMEOUT_PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <div key={i} className={`${s.particle} ${s.particleTimeout}`}
            style={{ '--dx': `${Math.cos(rad) * TIMEOUT_PARTICLE_DIST}px`, '--dy': `${Math.sin(rad) * TIMEOUT_PARTICLE_DIST}px` } as React.CSSProperties} />
        )
      })}
    </div>
  )
}

// ── Hit marker — diagonal X (kill) / ring (armor clink) ───────────────────────
function HitMarker({ data, onDone }: { data: HitMarkerData; onDone: () => void }) {
  const cbRef = useRef(onDone); cbRef.current = onDone
  useEffect(() => { const t = setTimeout(() => cbRef.current(), 280); return () => clearTimeout(t) }, [])
  const clink = data.kind === 'clink'
  return (
    <div className={s.hitMarker} style={{ left: data.x, top: data.y }}>
      <svg className={s.hitMarkerSvg} viewBox="-20 -20 40 40" fill="none">
        {clink ? (
          <circle cx="0" cy="0" r="12" stroke="#cfd6dd" strokeWidth="2" strokeDasharray="4 4" />
        ) : (
          <>
            <line x1="-13" y1="-13" x2="13" y2="13"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13"  y1="-13" x2="-13" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </div>
  )
}

// ── Power-up token ────────────────────────────────────────────────────────────
function PowerUp({ data, onCollect, onExpire }: { data: PowerUpData; onCollect: (k: PowerKind) => void; onExpire: () => void }) {
  const expRef = useRef(onExpire); expRef.current = onExpire
  useEffect(() => { const t = setTimeout(() => expRef.current(), 3600); return () => clearTimeout(t) }, [])
  const glyph = data.kind === 'slowmo' ? '◷' : data.kind === 'freeze' ? '❄' : '×2'
  return (
    <button
      className={`${s.powerup} ${s[`power_${data.kind}`]}`}
      style={{ left: data.x, top: data.y }}
      onClick={() => onCollect(data.kind)}
      onTouchStart={e => { e.preventDefault(); onCollect(data.kind) }}
      aria-label={POWER_LABELS[data.kind]}
    >
      <span>{glyph}</span>
    </button>
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
function PixelRoomba({ splats, dir, speedMult = 1, onSplatHit, onDone }: {
  splats: SplatData[]
  dir: 'left' | 'right'
  speedMult?: number
  onSplatHit: (id: number) => void
  onDone: () => void
}) {
  const divRef  = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone);     doneRef.current = onDone
  const hitRef  = useRef(onSplatHit); hitRef.current  = onSplatHit

  useEffect(() => {
    const div = divRef.current; if (!div) return
    const W = window.innerWidth, H = window.innerHeight
    // Скорость пропорциональна ширине вьюпорта (фикс «медленно на десктопе /
    // быстро на мобиле») × админ-множитель. Время прохода ≈ постоянно на всех экранах.
    const SIZE = 52, RADIUS = 52
    const SPEED = Math.max(200, Math.min(W * 0.5, 820)) * (speedMult || 1)
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
      <span className={s.roombaBody}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block' }}>
          <polygon points="8,2 16,2 20,4 22,8 22,16 20,20 16,22 8,22 4,20 2,16 2,8 4,4"/>
          <polygon points="9,5 15,5 18,7 19,10 19,14 18,17 15,19 9,19 6,17 5,14 5,10 6,7" fill="var(--bg)" opacity="0.35"/>
          <rect x="9" y="2" width="6" height="2" fill="var(--accent)" opacity="0.9"/>
          {/* spinning brush bar */}
          <rect x="5" y="11" width="14" height="2" fill="var(--accent)" opacity="0.55" className={s.roombaBrush}/>
          {/* status LED */}
          <rect x="11" y="8" width="2" height="2" fill="var(--accent)" className={s.roombaLed}/>
          <rect x="2" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
          <rect x="20" y="10" width="2" height="4" fill="var(--bg)" opacity="0.65"/>
        </svg>
      </span>
    </div>
  )
}

// ── BatInstance ───────────────────────────────────────────────────────────────
function BatInstance({ bat, cracked, vulnerable = false, level = 1, speedRef, onClick, onPositionUpdate }: {
  bat: BatData
  cracked: boolean
  vulnerable?: boolean
  level?: number
  speedRef: React.MutableRefObject<number>
  onClick: () => void
  onPositionUpdate: (id: number, x: number, y: number) => void
}) {
  const divRef   = useRef<HTMLDivElement>(null)
  const clickRef = useRef(onClick);          clickRef.current = onClick
  const posRef   = useRef(onPositionUpdate); posRef.current   = onPositionUpdate

  useEffect(() => {
    const div = divRef.current; if (!div) return
    // golden bats fly faster and turn more erratically; boss — медленный и плавный
    const erratic = bat.variant === 'golden'
    const isBoss = bat.variant === 'boss'
    const st = { x: bat.startX, y: bat.startY, vx: bat.startVx, vy: bat.startVy, lastTime: 0, nextTurnAt: 0 }
    let animId: number, alive = true
    function frame(t: number) {
      if (!alive) return
      const dt = st.lastTime ? Math.min((t - st.lastTime) / 1000, 0.05) : 0
      st.lastTime = t
      const mult = speedRef.current   // slow-mo / freeze / normal
      if (t > st.nextTurnAt) {
        // Манёвренность растёт с уровнем (0→1 за ~30 волн): резче виражи, чаще
        // смена курса — нетопырей сложнее «тапнуть», но плавно.
        const ag = Math.min(1, (level - 1) / 30)
        const curA = Math.atan2(st.vy, st.vx)
        const deflect = (Math.random() - 0.5) * Math.PI * (erratic ? 1.9 : isBoss ? 0.5 : 1.3 + ag * 0.7)
        const minS = isBoss ? 36 : 80
        const maxS = erratic ? 320 : isBoss ? 120 : 240 + ag * 90
        const speed = Math.max(minS, Math.min(maxS, Math.hypot(st.vx, st.vy) * (0.8 + Math.random() * 0.4)))
        st.vx = Math.cos(curA + deflect) * speed; st.vy = Math.sin(curA + deflect) * speed
        st.nextTurnAt = t + (erratic ? 350 : isBoss ? 1100 : 600 - ag * 260) + Math.random() * (erratic ? 700 : 1400 - ag * 600)
      }
      st.x += st.vx * dt * mult; st.y += st.vy * dt * mult
      const W = window.innerWidth, H = window.innerHeight
      const bW = 72 * bat.scale, bH = 50 * bat.scale
      if (st.x < 0)       { st.x = 0;      st.vx =  Math.abs(st.vx) }
      if (st.x > W - bW)  { st.x = W - bW; st.vx = -Math.abs(st.vx) }
      if (st.y < 0)       { st.y = 0;      st.vy =  Math.abs(st.vy) }
      if (st.y > H - bH)  { st.y = H - bH; st.vy = -Math.abs(st.vy) }
      posRef.current(bat.id, st.x + bW / 2, st.y + bH / 2)
      // боссы не «крутятся» по направлению — остаются вертикально (только лёгкий наклон)
      const angle = isBoss ? Math.sin(t / 600) * 6 : Math.atan2(st.vy, st.vx) * 180 / Math.PI
      div!.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${angle}deg) scale(${bat.scale})`
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => { alive = false; cancelAnimationFrame(animId) }
  // level намеренно вне deps: он постоянен для волны нетопыря, не перезапускаем rAF
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bat, speedRef])

  const variantClass = bat.variant === 'golden' ? s.batGold
    : bat.variant === 'armored' ? s.batArmored
    : bat.variant === 'boss' ? s.batBoss : ''
  const isBoss = bat.variant === 'boss'
  const stateClass = isBoss ? (vulnerable ? s.batVuln : s.batShield) : (cracked ? s.batCracked : '')

  return (
    <div ref={divRef} className={`${s.bat} ${variantClass} ${stateClass}`}
      style={{ transform: `translate(${bat.startX}px, ${bat.startY}px) scale(${bat.scale})` }}
      onClick={() => clickRef.current()}
      onTouchStart={e => { e.preventDefault(); clickRef.current() }}>
      {isBoss && <span className={s.bossShieldRing} aria-hidden="true" />}
      <span className={s.flap}><PixelBat /></span>
    </div>
  )
}

// ── Score + Game Over ─────────────────────────────────────────────────────────
function ScoreCounter({ score, waveNum, best, combo, effect, bonus, difficultyLabel }: {
  score: number; waveNum: number; best: number; combo: number
  effect: { kind: PowerKind } | null; bonus: boolean; difficultyLabel?: string
}) {
  const [pulse, setPulse] = useState(false)
  const prev = useRef(score)
  useEffect(() => {
    if (score !== prev.current) { prev.current = score; setPulse(true); setTimeout(() => setPulse(false), 160) }
  }, [score])
  const newRecord = score > 0 && score >= best
  const comboMult = Math.min(1 + Math.floor((combo - 1) / 3), 5)
  return (
    <div className={s.score}>
      {waveNum > 0 && (
        <span className={s.waveLabel}>
          {bonus ? 'BONUS WAVE' : `WAVE ${waveNum}`}{difficultyLabel ? ` · ${difficultyLabel}` : ''}
        </span>
      )}
      <span className={s.scoreLabel}>очки</span>
      <span className={`${s.scoreNum} ${pulse ? s.pulse : ''}`}>×{score}</span>
      {combo >= 2 && (
        <span className={s.comboLabel}>КОМБО ×{combo}{comboMult > 1 ? ` · ×${comboMult}` : ''}</span>
      )}
      {effect && <span className={s.effectLabel}>{POWER_LABELS[effect.kind]}</span>}
      {best > 0 && (
        <span className={`${s.recordLabel} ${newRecord ? s.recordNew : ''}`}>
          {newRecord ? 'НОВЫЙ РЕКОРД' : 'РЕКОРД'} ×{best}
        </span>
      )}
    </div>
  )
}

function GameOverBanner() { return <div className={s.gameOverCenter}>GAME OVER</div> }

// Центральное оповещение о новой волне (incoming)
function WaveBanner({ waveNum, bonus, boss, mega }: { waveNum: number; bonus: boolean; boss?: boolean; mega?: boolean }) {
  const kick = boss ? (mega ? '// ⚠ МЕГА-БОСС' : '// ⚠ БОСС') : bonus ? '// СВАРМ' : '// ВХОДЯЩАЯ'
  const num  = boss ? (mega ? 'MEGA BOSS' : 'BOSS') : bonus ? 'BONUS WAVE' : `WAVE ${waveNum}`
  const cls  = boss ? s.waveBannerBoss : bonus ? s.waveBannerBonus : ''
  return (
    <div className={`${s.waveBanner} ${cls}`} aria-hidden="true">
      <span className={s.waveBannerKick}>{kick}</span>
      <span className={s.waveBannerNum}>{num}</span>
      <span className={s.waveBannerBar} />
    </div>
  )
}

// HP-бар босса + подсказка фазы (ЩИТ / БЕЙ!)
function BossHud({ boss }: { boss: { hp: number; maxHp: number; mega: boolean; vulnerable: boolean } }) {
  const pct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))
  return (
    <div className={s.bossHud} aria-hidden="true">
      <span className={s.bossHudLabel}>{boss.mega ? 'МЕГА-БОСС' : 'БОСС'}</span>
      <div className={s.bossHudBarTrack}>
        <div className={s.bossHudBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={`${s.bossHudState} ${boss.vulnerable ? s.bossHudVuln : ''}`}>
        {boss.vulnerable ? '⊙ УЯЗВИМ — БЕЙ В ГЛАЗ!' : '◈ ЩИТ — ждёт окна'}
      </span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let _id = 0
function nextId() { return ++_id }

function spawnBat(waveNum = 0, allowSpecial = false, goldenBoost = 0, cfg: GameConfig = DEFAULT_GAME_CONFIG, diffMult = 1): BatData {
  const W = typeof window !== 'undefined' ? window.innerWidth  : 400
  const H = typeof window !== 'undefined' ? window.innerHeight : 800

  // Pick variant
  let variant: BatVariant = 'normal'
  if (allowSpecial) {
    const r = Math.random()
    if (r < 0.08 + goldenBoost) variant = 'golden'
    else if (r < 0.30 && waveNum >= 2) variant = 'armored'
  }

  // Difficulty: base speed растёт плавно и ДОЛЬШЕ (до ~30 волны), чтобы сложность
  // шла через скорость/манёвр, а не количество. ×admin/difficulty.
  const diff = 1 + Math.min(waveNum, 30) * 0.035
  const speedMul = (cfg.batSpeed || 1) * (diffMult || 1)
  let speed = (120 + Math.random() * 80) * diff * speedMul
  // нетопыри чуть крупнее (Яна) + админ-множитель размера
  let scale = (0.72 + Math.random() * 0.78) * (cfg.batScale || 1)
  let hp = 1
  if (variant === 'golden')  { speed *= 1.6; scale = (0.6 + Math.random() * 0.28) * (cfg.batScale || 1); hp = 1 }
  if (variant === 'armored') { speed *= 0.92; scale = (1.0 + Math.random() * 0.42) * (cfg.batScale || 1); hp = 2 }

  const side = Math.floor(Math.random() * 4)
  const spread = (Math.random() - 0.5) * 0.5
  let startX = 0, startY = 0, startVx = 0, startVy = 0
  switch (side) {
    case 0: startX = Math.random()*(W-72); startY = 0; startVx = Math.cos(Math.PI/2+spread)*speed; startVy = Math.sin(Math.PI/2+spread)*speed; break
    case 1: startX = Math.max(0,W-72); startY = Math.random()*(H-50); startVx = Math.cos(Math.PI+spread)*speed; startVy = Math.sin(Math.PI+spread)*speed; break
    case 2: startX = Math.random()*(W-72); startY = Math.max(0,H-50); startVx = Math.cos(-Math.PI/2+spread)*speed; startVy = Math.sin(-Math.PI/2+spread)*speed; break
    default: startX = 0; startY = Math.random()*(H-50); startVx = Math.cos(spread)*speed; startVy = Math.sin(spread)*speed; break
  }
  return { id: nextId(), startX, startY, startVx, startVy, scale, variant, hp }
}

// Босс — крупный, медленный, влетает сверху по центру. HP = число попаданий по
// уязвимости (щит блокирует). Мега-босс крупнее и толще.
function spawnBoss(mega: boolean, cfg: GameConfig = DEFAULT_GAME_CONFIG): BatData {
  const W = typeof window !== 'undefined' ? window.innerWidth  : 400
  const speed = mega ? 70 : 90
  const scale = (mega ? 3.4 : 2.5) * (cfg.batScale || 1)
  const hp = mega ? Math.max(1, Math.round(cfg.bossMegaHp)) : Math.max(1, Math.round(cfg.bossHp))
  const spread = (Math.random() - 0.5) * 0.4
  return {
    id: nextId(),
    startX: W / 2 - 36, startY: -40,
    startVx: Math.cos(Math.PI / 2 + spread) * speed,
    startVy: Math.sin(Math.PI / 2 + spread) * speed,
    scale, variant: 'boss', hp,
  }
}

// ── Main controller ───────────────────────────────────────────────────────────
export default function BatAnimation({ config = DEFAULT_GAME_CONFIG }: { config?: GameConfig } = {}) {
  const cfgRef = useRef<GameConfig>(config); cfgRef.current = config
  const difficultyRef = useRef<Difficulty>('normal')
  const firstKillRef = useRef(false)
  // Босс: видимое состояние (HP-бар, фаза щита/уязвимости) + служебные рефы
  const [boss, setBoss] = useState<{ hp: number; maxHp: number; mega: boolean; vulnerable: boolean } | null>(null)
  const bossRef = useRef<{ id: number; mega: boolean } | null>(null)
  const bossVulnRef = useRef(false)
  const bossCycleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [gameState, setGameState]           = useState<GameState>('idle')
  const [bats, setBats]                     = useState<BatData[]>([])
  const [explosions, setExplosions]         = useState<ExplosionData[]>([])
  const [splats, setSplats]                 = useState<SplatData[]>([])
  const [hitMarkers, setHitMarkers]         = useState<HitMarkerData[]>([])
  const [score, setScore]                   = useState(0)
  const [bestScore, setBestScore]           = useState(0)
  const [waveNum, setWaveNum]               = useState(0)
  const [roombaSweeping, setRoombaSweeping] = useState(false)
  const [roombaSplats, setRoombaSplats]     = useState<SplatData[]>([])
  const [roombaDir, setRoombaDir]           = useState<'left' | 'right'>('left')
  const [crackedIds, setCrackedIds]         = useState<Set<number>>(new Set())
  const [powerups, setPowerups]             = useState<PowerUpData[]>([])
  const [comboDisplay, setComboDisplay]     = useState(0)
  const [activeEffect, setActiveEffect]     = useState<{ kind: PowerKind } | null>(null)
  const [screenShake, setScreenShake]       = useState(false)
  const [bonusWave, setBonusWave]           = useState(false)
  const [waveBanner, setWaveBanner]         = useState(false)

  const batsRef            = useRef<BatData[]>([])
  batsRef.current          = bats
  const batHpRef           = useRef<Map<number, number>>(new Map())
  const comboRef           = useRef(0)
  const comboTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedMultRef       = useRef(1)   // slow-mo / freeze
  const scoreMultRef       = useRef(1)   // ×2 power-up
  const effectTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // ── Boss: цикл «щит ↔ уязвимость» ──
  function stopBossCycle() {
    if (bossCycleRef.current) { clearTimeout(bossCycleRef.current); bossCycleRef.current = null }
  }
  function startBossCycle(mega: boolean) {
    stopBossCycle()
    const cfg = cfgRef.current
    const shieldMs = Math.max(400, cfg.bossShieldMs * (mega ? 0.8 : 1))
    const vulnMs   = Math.max(400, cfg.bossVulnMs   * (mega ? 0.75 : 1))
    const toVuln = () => {
      bossVulnRef.current = true
      setBoss(b => (b ? { ...b, vulnerable: true } : b))
      bossCycleRef.current = setTimeout(toShield, vulnMs)
    }
    const toShield = () => {
      bossVulnRef.current = false
      setBoss(b => (b ? { ...b, vulnerable: false } : b))
      bossCycleRef.current = setTimeout(toVuln, shieldMs)
    }
    toShield() // стартуем под щитом
  }

  // ── Game over (запись рекорда + сброс) — общий для свармов и боссов ──
  function endGame() {
    setGameState('game_over')
    try {
      const cur = scoreRef.current
      const raw = parseInt(localStorage.getItem('threep-bat-hs') ?? '', 10)
      const prev = Number.isFinite(raw) ? raw : 0
      const best = Math.max(cur, prev)
      if (best > prev) localStorage.setItem('threep-bat-hs', String(best))
      setBestScore(best)
    } catch { /* localStorage blocked */ }
    if (scoreRef.current > 0) trackEvent('bat_score', { score: scoreRef.current })
    goTimerRef.current = setTimeout(() => {
      setSplats([]); setGameState('idle'); setScore(0); scoreRef.current = 0; setWaveNum(0)
      setPowerups([]); setCrackedIds(new Set()); setComboDisplay(0); setActiveEffect(null)
      setBonusWave(false); setBoss(null); bossRef.current = null; bossVulnRef.current = false
      comboRef.current = 0; speedMultRef.current = 1; scoreMultRef.current = 1
      firstKillRef.current = false; difficultyRef.current = 'normal'
    }, 3000)
  }

  // ── Перейти к следующей волне через пылесос (после убийства всех/босса) ──
  function advanceWave(n: number) {
    const n2 = n + 1
    pendingWaveRef.current = n2
    setWaveNum(n2)
    setRoombaDir(n2 % 2 === 0 ? 'right' : 'left')
    setRoombaSplats([...splatsRef.current])
    setRoombaSweeping(true)
  }

  const spawnWaveRef = useRef<(n: number) => void>()
  spawnWaveRef.current = (n: number) => {
    currentWaveSizeRef.current = n

    // ── BOSS WAVE (каждый 10-й; мега на 33/66/99) ──
    if (isBossWave(n)) {
      const mega = isMegaWave(n)
      setBonusWave(false)
      if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
      spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
      batPositions.current.clear(); batHpRef.current.clear()
      const b = spawnBoss(mega, cfgRef.current)
      batHpRef.current.set(b.id, b.hp)
      bossRef.current = { id: b.id, mega }
      bossVulnRef.current = false
      setBoss({ hp: b.hp, maxHp: b.hp, mega, vulnerable: false })
      setBats([b])
      startBossCycle(mega)
      // На убийство даётся МНОГО времени; мега — ещё больше. Не успел → game over.
      const timeout = cfgRef.current.bossTimeoutMs * (mega ? 1.7 : 1)
      waveTimerRef.current = setTimeout(() => {
        stopBossCycle()
        const pos = batPositions.current.get(b.id)
        batPositions.current.clear(); batHpRef.current.clear()
        setBats([]); setBoss(null); bossRef.current = null
        if (pos) setExplosions(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y }])
        setScreenShake(true); setTimeout(() => setScreenShake(false), 420)
        endGame()
      }, timeout)
      return
    }

    // Every 5th wave is a frantic BONUS swarm: more bats, faster, more gold
    const isBonus = n >= 5 && n % 5 === 0
    setBonusWave(isBonus)
    // Плавное усложнение: число нетопырей растёт МЕДЛЕННО и упирается в потолок
    // (особенно на мобиле — иначе к 8-й волне весь экран в мышах). Дальше сложность
    // идёт через скорость/манёвренность полёта (spawnBat diff + level-agility), а не количество.
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
    const mobile = vw < 640
    const cap = mobile ? 6 : 11
    // Старт с ОДНОЙ мыши (n=1), дальше плавный рост с плато. Сложность дальше —
    // через скорость/манёвр (spawnBat diff + level-agility), а не количество.
    const base = Math.min(cap, Math.max(1, Math.round(1 + Math.sqrt(Math.max(0, n - 1)) * 1.7)))
    const count = isBonus ? Math.min(cap + (mobile ? 2 : 4), base + (mobile ? 2 : 3)) : base
    const allowSpecial = n >= 2
    const interval = isBonus ? 90 : 150
    const diffMult = DIFFICULTY[difficultyRef.current].speed
    if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
    spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
    for (let i = 0; i < count; i++) {
      spawnTimersRef.current.push(setTimeout(
        () => setBats(prev => [...prev, spawnBat(n, allowSpecial, isBonus ? 0.18 : 0, cfgRef.current, diffMult)]),
        i * interval
      ))
    }
    waveTimerRef.current = setTimeout(() => {
      spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
      const positions = [...batPositions.current.values()]
      batPositions.current.clear()
      batHpRef.current.clear()
      setBats([])
      // bats escaped → screen shake
      if (positions.length > 0 && gameStateRef.current === 'playing') {
        setScreenShake(true); setTimeout(() => setScreenShake(false), 420)
      }
      positions.forEach((p, i) => {
        setTimeout(() => setExplosions(prev => [...prev, { id: nextId(), x: p.x, y: p.y }]), i * 100)
      })
      if (gameStateRef.current === 'lure') {
        setGameState('idle')
      } else if (isBonus) {
        // Бонус-волна не наказывает: улетевшие нетопыри просто исчезают — дальше.
        advanceWave(currentWaveSizeRef.current)
      } else {
        endGame()
      }
    }, 4000)
  }

  useEffect(() => {
    if (gameState !== 'idle') return
    const t = setTimeout(() => setGameState('lure'), 3000)
    return () => clearTimeout(t)
  }, [gameState])

  // Уход со вкладки: rAF замораживает нетопырей, но таймер «улёта» продолжает
  // тикать → нечестный game over. Не штрафуем — мягко сбрасываем раунд в idle.
  useEffect(() => {
    function onHidden() {
      if (!document.hidden) return
      const gs = gameStateRef.current
      if (gs !== 'playing' && gs !== 'lure') return
      if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
      if (goTimerRef.current) { clearTimeout(goTimerRef.current); goTimerRef.current = null }
      if (comboTimerRef.current) { clearTimeout(comboTimerRef.current); comboTimerRef.current = null }
      stopBossCycle()
      spawnTimersRef.current.forEach(clearTimeout); spawnTimersRef.current = []
      batPositions.current.clear(); batHpRef.current.clear()
      setBats([]); setPowerups([]); setCrackedIds(new Set()); setBoss(null)
      bossRef.current = null; bossVulnRef.current = false
      setScore(0); scoreRef.current = 0; setWaveNum(0)
      setComboDisplay(0); comboRef.current = 0; setActiveEffect(null); setBonusWave(false)
      speedMultRef.current = 1; scoreMultRef.current = 1
      firstKillRef.current = false; difficultyRef.current = 'normal'
      setGameState('idle')
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [])

  useEffect(() => () => {
    if (waveTimerRef.current)   clearTimeout(waveTimerRef.current)
    if (goTimerRef.current)     clearTimeout(goTimerRef.current)
    if (comboTimerRef.current)  clearTimeout(comboTimerRef.current)
    if (effectTimerRef.current) clearTimeout(effectTimerRef.current)
    if (bossCycleRef.current)   clearTimeout(bossCycleRef.current)
    spawnTimersRef.current.forEach(clearTimeout)
  }, [])

  // Load saved record on mount
  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem('threep-bat-hs') ?? '', 10)
      if (Number.isFinite(stored) && stored > 0) setBestScore(stored)
    } catch { /* localStorage blocked (iOS private mode) */ }
  }, [])

  useEffect(() => {
    if (gameState === 'lure') spawnWaveRef.current!(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  // Центральное оповещение о новой волне
  useEffect(() => {
    if (waveNum <= 0 || gameState !== 'playing') return
    setWaveBanner(true)
    const t = setTimeout(() => setWaveBanner(false), 1700)
    return () => clearTimeout(t)
  }, [waveNum, gameState])

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

  const bumpCombo = useCallback(() => {
    comboRef.current += 1
    setComboDisplay(comboRef.current)
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => { comboRef.current = 0; setComboDisplay(0) }, 1500)
  }, [])

  const handleBatClick = useCallback((clickedId: number) => {
    const bat = batsRef.current.find(b => b.id === clickedId)
    if (!bat) return
    const pos = batPositions.current.get(clickedId) ?? {
      x: (typeof window !== 'undefined' ? window.innerWidth  : 400) / 2,
      y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2,
    }

    // ── BOSS: щит блокирует, бить можно только в окно уязвимости (третий глаз) ──
    if (bat.variant === 'boss') {
      if (!bossVulnRef.current) {
        // под щитом — удар заблокирован
        setHitMarkers(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, kind: 'clink' }])
        return
      }
      const left = (batHpRef.current.get(clickedId) ?? bat.hp) - 1
      batHpRef.current.set(clickedId, left)
      setBoss(b => (b ? { ...b, hp: Math.max(0, left) } : b))
      bumpCombo()
      setHitMarkers(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, kind: 'kill' }])
      setSplats(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, variant: Math.floor(Math.random() * 4), angle: Math.floor(Math.random() * 360) }])
      setScore(n => { const next = n + scoreMultRef.current; scoreRef.current = next; return next })
      setBestScore(b => Math.max(b, scoreRef.current))
      if (left <= 0) {
        // БОСС ПОВЕРЖЕН — крупная награда, взрыв, следующая волна
        const mega = bossRef.current?.mega
        stopBossCycle()
        if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
        batPositions.current.delete(clickedId); batHpRef.current.delete(clickedId)
        const comboMult = Math.min(1 + Math.floor((comboRef.current - 1) / 3), 5)
        const reward = VARIANT_BASE.boss * comboMult * scoreMultRef.current * (mega ? 3 : 1)
        setScore(n => { const next = n + reward; scoreRef.current = next; return next })
        setBestScore(b => Math.max(b, scoreRef.current))
        setExplosions(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y }])
        setScreenShake(true); setTimeout(() => setScreenShake(false), 500)
        setBoss(null); bossRef.current = null; bossVulnRef.current = false
        nextWaveNRef.current = currentWaveSizeRef.current + 1
        scheduleWaveRef.current = true
        setBats([])
      }
      return
    }

    // Armored bat: first hit only cracks the shell (no kill / no score)
    const hp = batHpRef.current.get(clickedId) ?? bat.hp
    if (hp > 1) {
      batHpRef.current.set(clickedId, hp - 1)
      setCrackedIds(prevSet => { const n = new Set(prevSet); n.add(clickedId); return n })
      setHitMarkers(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, kind: 'clink' }])
      return
    }

    batPositions.current.delete(clickedId)
    batHpRef.current.delete(clickedId)
    setCrackedIds(prevSet => { if (!prevSet.has(clickedId)) return prevSet; const n = new Set(prevSet); n.delete(clickedId); return n })

    // Combo + scoring
    bumpCombo()
    const comboMult = Math.min(1 + Math.floor((comboRef.current - 1) / 3), 5)
    const gained = VARIANT_BASE[bat.variant] * comboMult * scoreMultRef.current

    setHitMarkers(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, kind: 'kill' }])
    setSplats(prev => [...prev, {
      id: nextId(), x: pos.x, y: pos.y,
      variant: Math.floor(Math.random() * 4),
      angle: Math.floor(Math.random() * 360),
    }])
    setScore(n => { const next = n + gained; scoreRef.current = next; return next })
    setBestScore(b => Math.max(b, scoreRef.current))

    // Power-up drop (only mid-game, ~9% — golden bats are more generous)
    if (gameStateRef.current === 'playing') {
      const pc = cfgRef.current.powerupChance || 1
      const dropChance = (bat.variant === 'golden' ? 0.45 : 0.14) * pc
      if (Math.random() < dropChance) {
        const kinds: PowerKind[] = ['slowmo', 'freeze', 'double']
        const kind = kinds[Math.floor(Math.random() * kinds.length)]
        setPowerups(prev => [...prev, { id: nextId(), x: pos.x, y: pos.y, kind }])
      }
    }

    setBats(prev => {
      const remaining = prev.filter(b => b.id !== clickedId)
      if (remaining.length === 0) {
        if (waveTimerRef.current) { clearTimeout(waveTimerRef.current); waveTimerRef.current = null }
        // Первый убитый нетопырь (в lure) → экран выбора сложности, а не сразу игра
        if (gameStateRef.current === 'lure' && !firstKillRef.current) {
          firstKillRef.current = true
          setGameState('choose')
          return remaining
        }
        nextWaveNRef.current = currentWaveSizeRef.current + 1
        scheduleWaveRef.current = true
        if (gameStateRef.current === 'lure') setGameState('playing')
      }
      return remaining
    })
  }, [bumpCombo])

  // Выбор сложности после первого нетопыря → старт игры с выбранной волны
  const chooseDifficulty = useCallback((d: Difficulty) => {
    difficultyRef.current = d
    const startWave = DIFFICULTY[d].startWave
    setSplats([])
    setWaveNum(startWave)
    setGameState('playing')
    spawnWaveRef.current?.(startWave)
  }, [])

  const collectPowerUp = useCallback((id: number, kind: PowerKind) => {
    setPowerups(prev => prev.filter(p => p.id !== id))
    setActiveEffect({ kind })
    if (effectTimerRef.current) clearTimeout(effectTimerRef.current)
    let duration = 4000
    if (kind === 'slowmo') { speedMultRef.current = 0.4; duration = 4000 }
    if (kind === 'freeze')  { speedMultRef.current = 0;   duration = 1600 }
    if (kind === 'double')  { scoreMultRef.current = 2;   duration = 5000 }
    effectTimerRef.current = setTimeout(() => {
      speedMultRef.current = 1; scoreMultRef.current = 1; setActiveEffect(null)
    }, duration)
  }, [])

  const expirePowerUp = useCallback((id: number) => {
    setPowerups(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleSplatHit   = useCallback((id: number) => setSplats(prev => prev.filter(s => s.id !== id)), [])
  const handleRoombaDone = useCallback(() => {
    setRoombaSweeping(false)
    setSplats([])
    if (spawnWaveRef.current) spawnWaveRef.current(pendingWaveRef.current)
  }, [])
  const removeExplosion  = useCallback((id: number) => setExplosions(prev => prev.filter(e => e.id !== id)), [])
  const removeHitMarker  = useCallback((id: number) => setHitMarkers(prev => prev.filter(h => h.id !== id)), [])

  const overlayActive = gameState === 'playing' || gameState === 'game_over' || gameState === 'choose'
  // Счётчик НЕ мешает во время охоты: показываем только на «отдыхе» (пылесос между
  // волнами) и на game over. Во время активной волны он скрыт.
  const showScore     = gameState === 'game_over' || (gameState === 'playing' && roombaSweeping)

  return (
    <>
      {overlayActive && <div className={`${s.overlay} ${screenShake ? s.overlayShake : ''}`} aria-hidden="true" />}
      {splats.map(sp => <PixelSplat key={sp.id} data={sp} />)}
      {bats.map(bat => (
        <BatInstance key={bat.id} bat={bat} cracked={crackedIds.has(bat.id)} speedRef={speedMultRef}
          vulnerable={bat.variant === 'boss' ? (boss?.vulnerable ?? false) : false}
          level={waveNum}
          onClick={() => handleBatClick(bat.id)}
          onPositionUpdate={handlePositionUpdate} />
      ))}
      {boss && gameState === 'playing' && <BossHud boss={boss} />}
      {powerups.map(pu => (
        <PowerUp key={pu.id} data={pu}
          onCollect={(k) => collectPowerUp(pu.id, k)}
          onExpire={() => expirePowerUp(pu.id)} />
      ))}
      {explosions.map(exp => (
        <BatExplosion key={exp.id} data={exp} onDone={() => removeExplosion(exp.id)} />
      ))}
      {hitMarkers.map(hm => (
        <HitMarker key={hm.id} data={hm} onDone={() => removeHitMarker(hm.id)} />
      ))}
      {roombaSweeping && (
        <PixelRoomba key={waveNum} splats={roombaSplats} dir={roombaDir}
          speedMult={cfgRef.current.roombaSpeed}
          onSplatHit={handleSplatHit} onDone={handleRoombaDone} />
      )}
      {gameState === 'lure' && (
        <div className={s.lureHint} aria-hidden="true">Поймай нетопыря — начни охоту</div>
      )}
      {gameState === 'choose' && (
        <div className={s.chooseWrap}>
          <span className={s.chooseKick}>// ВЫБЕРИ СЛОЖНОСТЬ</span>
          <div className={s.chooseRow}>
            {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
              <button key={d} className={s.chooseBtn} onClick={() => chooseDifficulty(d)}
                onTouchStart={e => { e.preventDefault(); chooseDifficulty(d) }}>
                <span className={s.chooseBtnLabel}>{DIFFICULTY[d].label}</span>
                <span className={s.chooseBtnHint}>{DIFFICULTY[d].hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {gameState === 'game_over' && <GameOverBanner />}
      {waveBanner && gameState === 'playing' && (
        <WaveBanner waveNum={waveNum} bonus={!isBossWave(waveNum) && waveNum >= 5 && waveNum % 5 === 0}
          boss={isBossWave(waveNum)} mega={isMegaWave(waveNum)} />
      )}
      {showScore && (
        <ScoreCounter score={score} waveNum={waveNum} best={bestScore}
          combo={comboDisplay} effect={activeEffect} bonus={bonusWave}
          difficultyLabel={DIFFICULTY[difficultyRef.current].label} />
      )}
    </>
  )
}
