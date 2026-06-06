import type { ReactNode } from 'react'
import { SVG_EMOJIS } from './svgEmojis'
import type { CustomEmoji } from './EmojiPicker'

export function renderMessage(text: string, customEmojis: CustomEmoji[]): ReactNode[] {
  if (!text.includes(':')) return [text]
  const parts = text.split(/(:[\w-]+:)/g)
  return parts.map((part, i) => {
    const match = part.match(/^:([\w-]+):$/)
    if (match) {
      const name = match[1]
      const svgEmoji = SVG_EMOJIS.find(e => e.name === name)
      if (svgEmoji) {
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 20,
              height: 20,
              verticalAlign: 'middle',
              margin: '0 1px',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            {svgEmoji.svg}
          </span>
        )
      }
      const ce = customEmojis.find(e => e.name === name)
      if (ce) {
        return (
          <img
            key={i}
            src={ce.url}
            alt={name}
            style={{
              width: 20,
              height: 20,
              objectFit: 'contain',
              display: 'inline-block',
              verticalAlign: 'middle',
              margin: '0 1px',
            }}
          />
        )
      }
    }
    return <span key={i}>{part}</span>
  })
}
