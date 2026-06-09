// Pure presentational SVG marks for the account page. No state, no deps.

export function BrutalSun() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z"/></svg>
}
export function BrutalMoon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M8,1 L12,3 L14,7 L12,11 L8,13 L10,10.5 L11,7 L10,3.5 Z"/></svg>
}
export function LvlFire() {
  return <svg width="40" height="40" viewBox="0 0 20 24" fill="currentColor"><path d="M10,0 L14,6 L16,4 L15,10 L18,8 L16,14 L18,13 L14,20 L10,24 L6,20 L2,13 L4,14 L2,8 L5,10 L4,4 L6,6 Z"/></svg>
}
export function LvlBolt() {
  return <svg width="36" height="40" viewBox="0 0 14 24" fill="currentColor"><path d="M9,0 L2,13 L7,13 L5,24 L12,11 L7,11 Z"/></svg>
}
export function LvlStar() {
  return <svg width="36" height="36" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z"/></svg>
}
export function LvlCircle() {
  return <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="7,0.5 13.5,4 13.5,10 7,13.5 0.5,10 0.5,4"/></svg>
}
// Медаль достижения — общий шестиугольный «жетон» + глиф по типу.
// Цвет берётся из currentColor (locked/unlocked задаётся в CSS).
export function Medal({ kind, size = 34 }: { kind: string; size?: number }) {
  const glyph = (() => {
    switch (kind) {
      case 'signal': // позывной — концентрические дуги
        return <>
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M8 12a4 4 0 0 1 8 0M6 12a6 6 0 0 1 12 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </>
      case 'first': // первая охота — мишень
        return <>
          <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </>
      case 'multi': // оптовик — три ромба
        return <>
          <polygon points="12,5 14,8 12,11 10,8" fill="currentColor" />
          <polygon points="8,11 10,14 8,17 6,14" fill="currentColor" />
          <polygon points="16,11 18,14 16,17 14,14" fill="currentColor" />
        </>
      case 'collection': // коллекционер — сетка 2x2
        return <>
          <rect x="7" y="7" width="4" height="4" fill="currentColor" />
          <rect x="13" y="7" width="4" height="4" fill="currentColor" />
          <rect x="7" y="13" width="4" height="4" fill="currentColor" />
          <rect x="13" y="13" width="4" height="4" fill="currentColor" />
        </>
      case 'game': // охотник — молния
        return <path d="M13 5 L8 13 H11 L10 19 L16 11 H12 Z" fill="currentColor" />
      default:
        return <circle cx="12" cy="12" r="3" fill="currentColor" />
    }
  })()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,1.5 21.5,6.5 21.5,17.5 12,22.5 2.5,17.5 2.5,6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {glyph}
    </svg>
  )
}

export function GothicStrip() {
  return (
    <svg width="14" height="120" viewBox="0 0 14 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="7" y1="0" x2="7" y2="120" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="2" y1="24" x2="12" y2="24" stroke="currentColor" strokeWidth="0.6" opacity="0.25"/>
      <polygon points="7,18 10,24 7,30 4,24" fill="currentColor" opacity="0.45"/>
      <line x1="2" y1="60" x2="12" y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.25"/>
      <polygon points="7,54 10,60 7,66 4,60" fill="currentColor" opacity="0.55"/>
      <line x1="2" y1="96" x2="12" y2="96" stroke="currentColor" strokeWidth="0.6" opacity="0.25"/>
      <polygon points="7,90 10,96 7,102 4,96" fill="currentColor" opacity="0.45"/>
      <line x1="5" y1="0" x2="9" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="5" y1="120" x2="9" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  )
}
