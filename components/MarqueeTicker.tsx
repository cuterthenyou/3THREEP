'use client'

interface Props {
  texts: string[]
  speed?: number
}

export default function MarqueeTicker({ texts, speed = 35 }: Props) {
  if (!texts.length) return null
  const content = texts.join('  ·  ')
  const doubled = content + '  ·  ' + content

  return (
    <div style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      borderTop: '1px solid var(--border-soft)',
      borderBottom: '1px solid var(--border-soft)',
      padding: '0.45rem 0',
    }}>
      <span style={{
        display: 'inline-block',
        animation: `threep-ticker ${speed}s linear infinite`,
        fontFamily: 'var(--font-body, monospace)',
        fontSize: '0.62rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        opacity: 0.4,
        userSelect: 'none',
      }}>
        {doubled}
      </span>
      <style>{`@keyframes threep-ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
    </div>
  )
}
