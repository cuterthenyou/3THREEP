'use client'

import { useState, useEffect } from 'react'

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
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = src
  }, [src])

  if (!src) return null

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      style={{
        aspectRatio: String(ratio),
        backgroundColor: color,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
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
