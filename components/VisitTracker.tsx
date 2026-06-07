'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSessionId(): string {
  try {
    const key = 'threep_sid'
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
    return id
  } catch {
    return 'unknown'
  }
}

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return
    const sid = getOrCreateSessionId()
    const body = JSON.stringify({ path: pathname, session_id: sid })
    try {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } catch {
      // sendBeacon not available — silent fail
    }
  }, [pathname])

  return null
}
