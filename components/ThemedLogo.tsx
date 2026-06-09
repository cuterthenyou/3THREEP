'use client'

import { useState, useEffect } from 'react'
import { preload } from 'react-dom'

interface Props {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  /** CSS color value — defaults to var(--accent) to match theme */
  color?: string
  /** Fallback aspect ratio shown before image loads (icon≈1, text≈4-6) */
  defaultRatio?: number
}

/** Convert external URL to same-origin proxy so CSS mask-image works without CORS. */
function toMaskUrl(src: string): string {
  if (!src) return ''
  // Local paths and data URIs don't need proxying
  if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:')) {
    return `url(${src})`
  }
  return `url(/api/proxy?url=${encodeURIComponent(src)})`
}

export default function ThemedLogo({
  src,
  alt = '',
  className = '',
  style,
  color = 'var(--accent)',
  defaultRatio = 1,
}: Props) {
  const [ratio, setRatio] = useState(defaultRatio)

  useEffect(() => {
    if (!src) return
    const proxied = src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')
      ? src
      : `/api/proxy?url=${encodeURIComponent(src)}`
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = proxied
  }, [src])

  if (!src) return null

  const proxied = src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')
    ? src
    : `/api/proxy?url=${encodeURIComponent(src)}`
  // Early preload hint (fires during render, before the measuring effect)
  preload(proxied, { as: 'image' })

  const maskUrl = toMaskUrl(src)

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      style={{
        aspectRatio: String(ratio),
        backgroundColor: color,
        maskImage: maskUrl,
        WebkitMaskImage: maskUrl,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
