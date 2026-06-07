'use client'

import { useState, useEffect } from 'react'

interface Props {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  color?: string
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
  const [maskUrl, setMaskUrl] = useState<string | null>(null)
  const [ratio, setRatio] = useState(defaultRatio)
  const [imgFallback, setImgFallback] = useState(false)

  useEffect(() => {
    if (!src) return
    let blobUrl: string | null = null

    // Fetch as blob → same-origin blob URL → CSS mask-image bypasses CDN CORS
    fetch(src, { mode: 'no-cors' })
      .then(r => r.blob())
      .then(blob => {
        blobUrl = URL.createObjectURL(blob)
        setMaskUrl(blobUrl)

        // Detect aspect ratio from the blob URL
        const img = new Image()
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            setRatio(img.naturalWidth / img.naturalHeight)
          }
        }
        img.src = blobUrl
      })
      .catch(() => {
        // If fetch failed entirely, fall back to plain <img> (no theming)
        setImgFallback(true)
        const img = new Image()
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            setRatio(img.naturalWidth / img.naturalHeight)
          }
        }
        img.src = src
      })

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [src])

  if (imgFallback) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={{ objectFit: 'contain', flexShrink: 0, ...style }} />
  }

  if (!maskUrl) return null

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      style={{
        aspectRatio: String(ratio),
        backgroundColor: color,
        maskImage: `url(${maskUrl})`,
        WebkitMaskImage: `url(${maskUrl})`,
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
