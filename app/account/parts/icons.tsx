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
      case 'skull': // мастер охоты — череп
        return <>
          <path d="M12 5.5c-3 0-5 2-5 4.8 0 1.7 1 2.8 1 3.6V15h8v-1.1c0-.8 1-1.9 1-3.6 0-2.8-2-4.8-5-4.8Z" fill="currentColor" />
          <circle cx="10" cy="10.5" r="1.2" fill="var(--bg-2)" />
          <circle cx="14" cy="10.5" r="1.2" fill="var(--bg-2)" />
          <rect x="11.4" y="15" width="1.2" height="2.2" fill="currentColor" />
        </>
      case 'crown': // свой человек — корона
        return <path d="M6 16h12l-1-7-3 3-2-4-2 4-3-3-1 7Z" fill="currentColor" />
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

// Нео-трайбл овальная рама ВОКРУГ аватарки (отсылка к референсу — острые
// «пламенные» отростки, образующие вертикальный овал с навершиями и шипами).
// Перекрашивается currentColor. viewBox с запасом сверху/снизу под финиалы.
export function OvalTribalFrame() {
  return (
    <svg viewBox="0 -12 200 264" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      <g stroke="currentColor" fill="currentColor" vectorEffect="non-scaling-stroke">
        {/* основные «пламенные» дуги овала */}
        <path d="M100 6 C152 14 186 62 183 120 C180 186 150 228 100 236" fill="none" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M100 6 C48 14 14 62 17 120 C20 186 50 228 100 236" fill="none" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* тонкий внутренний контур */}
        <path d="M100 18 C140 26 170 66 167 120 C164 176 140 214 100 224" fill="none" strokeWidth="1" opacity="0.45" vectorEffect="non-scaling-stroke" />
        <path d="M100 18 C60 26 30 66 33 120 C36 176 60 214 100 224" fill="none" strokeWidth="1" opacity="0.45" vectorEffect="non-scaling-stroke" />
        {/* верхний/нижний финиал-крестоцвет */}
        <polygon points="100,4 93,-10 100,1 107,-10" />
        <polygon points="100,238 93,252 100,241 107,252" />
        {/* боковые шипы-«языки пламени» */}
        <polygon points="183,120 200,108 187,122 200,134" />
        <polygon points="17,120 0,108 13,122 0,134" />
        <polygon points="176,66 192,52 181,70" />
        <polygon points="24,66 8,52 19,70" />
        <polygon points="176,174 192,188 181,170" />
        <polygon points="24,174 8,188 19,170" />
      </g>
    </svg>
  )
}

// Готическая рама — детализированный орнамент (стрельчатые арки с навершиями,
// розетки-квадрифолии, остроконечные финиалы). Перекрашивается currentColor.
// preserveAspectRatio="none": по X деталь чёткая (vectorEffect), по Y тянется на
// всю высоту аватарки/карточки. Арки вытягиваются — что только усиливает «готику».
export function GothicStrip() {
  const W = 24
  const cx = W / 2
  const cells = 3                 // число стрельчатых арок
  const finial = 11               // зона под навершия сверху/снизу
  const H = 120
  const span = H - finial * 2
  const cellH = span / cells

  const arches = Array.from({ length: cells }, (_, i) => {
    const yTop = finial + i * cellH       // пружинная линия (низ начала кривой)
    const yBot = yTop + cellH             // основание ячейки
    const apex = yTop + cellH * 0.16      // острая вершина арки
    const spring = yTop + cellH * 0.5     // откуда начинается кривая
    const mid = (apex + yBot) / 2
    return (
      <g key={i}>
        {/* стрельчатая (огивальная) арка */}
        <path
          d={`M5 ${yBot} L5 ${spring} Q5 ${apex} ${cx} ${apex} Q${W - 5} ${apex} ${W - 5} ${spring} L${W - 5} ${yBot}`}
          fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke"
        />
        {/* трилистник-навершие на вершине арки */}
        <circle cx={cx} cy={apex + 2.5} r="1.4" fill="currentColor" opacity="0.7" />
        {/* квадрифолий-розетка в центре ячейки */}
        <g opacity="0.45" stroke="currentColor" strokeWidth="0.7" fill="none" vectorEffect="non-scaling-stroke">
          <circle cx={cx - 2.4} cy={mid} r="2" />
          <circle cx={cx + 2.4} cy={mid} r="2" />
          <circle cx={cx} cy={mid - 2.4} r="2" />
          <circle cx={cx} cy={mid + 2.4} r="2" />
        </g>
        {/* основание-карниз между арками */}
        <line x1="2" y1={yBot} x2={W - 2} y2={yBot} stroke="currentColor" strokeWidth="1.2" opacity="0.5" vectorEffect="non-scaling-stroke" />
      </g>
    )
  })

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* внешние колонны-рейлы */}
      <line x1="2"     y1="2" x2="2"     y2={H - 2} stroke="currentColor" strokeWidth="1.4" opacity="0.7" vectorEffect="non-scaling-stroke" />
      <line x1={W - 2} y1="2" x2={W - 2} y2={H - 2} stroke="currentColor" strokeWidth="1.4" opacity="0.7" vectorEffect="non-scaling-stroke" />
      {/* внутренние тонкие рейлы */}
      <line x1="5"     y1={finial} x2="5"     y2={H - finial} stroke="currentColor" strokeWidth="0.7" opacity="0.3" vectorEffect="non-scaling-stroke" />
      <line x1={W - 5} y1={finial} x2={W - 5} y2={H - finial} stroke="currentColor" strokeWidth="0.7" opacity="0.3" vectorEffect="non-scaling-stroke" />

      {arches}

      {/* верхний финиал — крестоцвет (остроконечный) */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.75" vectorEffect="non-scaling-stroke">
        <line x1={cx} y1="1" x2={cx} y2={finial} />
        <line x1={cx - 4} y1="5" x2={cx + 4} y2="5" />
      </g>
      <polygon points={`${cx},1 ${cx - 2.4},5 ${cx + 2.4},5`} fill="currentColor" opacity="0.7" />

      {/* нижний финиал — зеркальный крестоцвет */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.75" vectorEffect="non-scaling-stroke">
        <line x1={cx} y1={H - finial} x2={cx} y2={H - 1} />
        <line x1={cx - 4} y1={H - 5} x2={cx + 4} y2={H - 5} />
      </g>
      <polygon points={`${cx},${H - 1} ${cx - 2.4},${H - 5} ${cx + 2.4},${H - 5}`} fill="currentColor" opacity="0.7" />
    </svg>
  )
}
