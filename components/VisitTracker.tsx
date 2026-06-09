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
    // Only record referrer for the first hit of a session (external source)
    let referrer: string | null = null
    try {
      if (!sessionStorage.getItem('threep_ref_done')) {
        const r = document.referrer
        if (r && !r.includes(location.host)) referrer = r
        sessionStorage.setItem('threep_ref_done', '1')
      }
    } catch { /* ignore */ }
    const body = JSON.stringify({ path: pathname, session_id: sid, referrer })
    try {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } catch {
      // sendBeacon not available — silent fail
    }
  }, [pathname])

  return null
}
