// Minimal, dependency-free user-agent sniffing for dashboard analytics.
// Not exhaustive — good enough to bucket traffic by device + browser family.

export function deviceFromUA(ua: string | null | undefined): 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown' {
  if (!ua) return 'unknown'
  const s = ua.toLowerCase()
  if (/bot|crawler|spider|crawling|yandex|googlebot|bingbot/.test(s)) return 'bot'
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) return 'tablet'
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) return 'mobile'
  return 'desktop'
}

export function browserFromUA(ua: string | null | undefined): string {
  if (!ua) return 'Unknown'
  const s = ua.toLowerCase()
  // order matters: Edge/Opera masquerade as Chrome
  if (/edg\//.test(s)) return 'Edge'
  if (/opr\/|opera/.test(s)) return 'Opera'
  if (/yabrowser/.test(s)) return 'Yandex'
  if (/samsungbrowser/.test(s)) return 'Samsung'
  if (/firefox|fxios/.test(s)) return 'Firefox'
  if (/crios|chrome/.test(s)) return 'Chrome'
  if (/safari/.test(s)) return 'Safari'
  return 'Other'
}
