'use client'

// Lightweight client-side event tracker. Fires anonymous funnel/behaviour
// events to /api/track-event via sendBeacon (non-blocking, survives unload).
// Mirrors the session id used by VisitTracker.

function getSessionId(): string {
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

export type EventType =
  | 'product_view'
  | 'cart_add'
  | 'checkout_start'
  | 'bat_score'

export function trackEvent(type: EventType, meta: Record<string, unknown> = {}): void {
  try {
    const body = JSON.stringify({ type, session_id: getSessionId(), meta })
    navigator.sendBeacon('/api/track-event', new Blob([body], { type: 'application/json' }))
  } catch {
    // sendBeacon unavailable / blocked — silent fail, never breaks UX
  }
}
