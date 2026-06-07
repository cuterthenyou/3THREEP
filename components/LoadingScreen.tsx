'use client'

import { useEffect, useState } from 'react'
import s from './LoadingScreen.module.css'

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
      <div className={s.content}>
        <div className={s.logo}>THREEP</div>
        <div className={s.sub}>— loading —</div>
      </div>
      <div className={s.bar} />
    </div>
  )
}
