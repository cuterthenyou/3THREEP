'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollRestorer() {
  const pathname = usePathname()

  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    const key = `scroll:${pathname}`
    const saved = sessionStorage.getItem(key)
    if (saved !== null) {
      requestAnimationFrame(() => window.scrollTo(0, Number(saved)))
    }

    let saveTimer: ReturnType<typeof setTimeout>
    function onScroll() {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        sessionStorage.setItem(key, String(window.scrollY))
      }, 150)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(saveTimer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  return null
}
