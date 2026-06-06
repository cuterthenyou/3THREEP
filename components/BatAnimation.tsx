'use client'

import { useState, useEffect, useRef } from 'react'
import s from './BatAnimation.module.css'

const FLIGHT_CLASSES = ['batFlyTL', 'batFlyTR', 'batFlyBL', 'batFlyBR'] as const
type FlightClass = typeof FLIGHT_CLASSES[number]

function BatSvg() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" fill="currentColor" aria-hidden="true">
      <path d="M28,20 L0,4 L4,28 L18,24 L24,20 Z"/>
      <path d="M44,20 L72,4 L68,28 L54,24 L48,20 Z"/>
      <ellipse cx="36" cy="20" rx="10" ry="12"/>
      <polygon points="30,8 27,0 34,10"/>
      <polygon points="42,8 38,10 45,0"/>
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
    scheduleNext(5000)
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
    blockedUntilRef.current = Date.now() + 10000
    scheduleNext(10500)
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
