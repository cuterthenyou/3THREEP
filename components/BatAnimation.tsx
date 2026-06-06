'use client'

import { useState, useEffect, useRef } from 'react'
import s from './BatAnimation.module.css'

const FLIGHT_CLASSES = ['batFlyTL', 'batFlyTR', 'batFlyBL', 'batFlyBR'] as const
type FlightClass = typeof FLIGHT_CLASSES[number]

function BatSvg() {
  return (
    <svg width="100" height="50" viewBox="0 0 100 50" fill="currentColor" aria-hidden="true">
      {/* Left wing — scalloped 2-lobe edge */}
      <path d="M30,24 L0,5 L7,17 L0,25 L9,34 L22,36 L28,28 Z"/>
      {/* Right wing — mirror */}
      <path d="M70,24 L100,5 L93,17 L100,25 L91,34 L78,36 L72,28 Z"/>
      {/* Body */}
      <polygon points="50,8 56,12 58,20 55,30 52,36 50,38 48,36 45,30 42,20 44,12"/>
      {/* Left ear */}
      <polygon points="43,10 38,1 47,14"/>
      {/* Right ear */}
      <polygon points="57,10 53,14 62,1"/>
      {/* Eyes */}
      <circle cx="46" cy="18" r="2.5" style={{fill:'var(--bg)'}}/>
      <circle cx="54" cy="18" r="2.5" style={{fill:'var(--bg)'}}/>
      {/* Nose */}
      <circle cx="50" cy="24" r="1.5" style={{fill:'var(--bg)'}}/>
    </svg>
  )
}

export default function BatAnimation() {
  const [flying, setFlying] = useState(false)
  const [flightClass, setFlightClass] = useState<FlightClass>('batFlyTL')
  const [animKey, setAnimKey] = useState(0)
  const blockedUntilRef = useRef(0)
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function launch() {
    if (Date.now() < blockedUntilRef.current) return
    const cls = FLIGHT_CLASSES[Math.floor(Math.random() * 4)]
    setFlightClass(cls)
    setAnimKey(k => k + 1)
    setFlying(true)
  }

  function scheduleNext(delay: number) {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
    nextTimerRef.current = setTimeout(launch, delay)
  }

  useEffect(() => {
    scheduleNext(3000)
    return () => { if (nextTimerRef.current) clearTimeout(nextTimerRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnimationEnd(e: React.AnimationEvent) {
    if (!(['batFlyTL','batFlyTR','batFlyBL','batFlyBR'] as string[]).includes(e.animationName)) return
    setFlying(false)
    scheduleNext(18000 + Math.random() * 10000)
  }

  function handleClick() {
    setFlying(false)
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
    blockedUntilRef.current = Date.now() + 3000
    scheduleNext(3100)
  }

  if (!flying) return null

  return (
    <div
      key={animKey}
      className={`${s.bat} ${s[flightClass]}`}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <span className={s.flap}>
        <BatSvg />
      </span>
    </div>
  )
}
