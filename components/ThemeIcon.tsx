// Брутальная SVG-иконка темы — по ключу палитры (см. lib/palettes.ts).
// Перекрашивается currentColor. Один источник для шапки и личного кабинета.
// Неизвестный ключ → искра (как light). viewBox у всех 14×14.

export default function ThemeIcon({ theme, size = 14 }: { theme: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 14 14', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true as const }

  switch (theme) {
    case 'dark': // луна
      return <svg {...common} fill="currentColor"><path d="M8,1 L12,3 L14,7 L12,11 L8,13 L10,10.5 L11,7 L10,3.5 Z" /></svg>

    case 'trip': // спираль (психоделика)
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M7 1.5a5.5 5.5 0 105.5 5.5A3 3 0 017 4a2 2 0 002 2" strokeLinecap="round" />
        </svg>
      )

    case 'ash': // пепел — зубчатый гребень
      return <svg {...common} fill="currentColor"><path d="M0.5 13 L4 5.5 L6 9 L8 4 L10 7.5 L13.5 13 Z" /></svg>

    case 'toxic': // токсичность — частицы вокруг ядра
      return (
        <svg {...common} fill="currentColor">
          <circle cx="7" cy="2.6" r="1.7" />
          <circle cx="3.2" cy="10.6" r="1.7" />
          <circle cx="10.8" cy="10.6" r="1.7" />
          <circle cx="7" cy="7.2" r="1.4" />
        </svg>
      )

    case 'blood': // кровь — капля
      return <svg {...common} fill="currentColor"><path d="M7 1 L11 9 A4 4 0 1 1 3 9 Z" /></svg>

    case 'noir': // нуар — ромб
      return <svg {...common} fill="currentColor"><path d="M7 0.5 L13.5 7 L7 13.5 L0.5 7 Z" /></svg>

    case 'ice': // лёд — кристалл-снежинка
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M7 0.5 V13.5 M1.2 3.75 L12.8 10.25 M1.2 10.25 L12.8 3.75" />
        </svg>
      )

    case 'ember': // угли — острое пламя
      return <svg {...common} fill="currentColor"><path d="M7 0 L9 4 L8 5 L10 6 L9 8 L11 9 L7 14 L3 9 L5 8 L4 6 L6 5 Z" /></svg>

    case 'light':
    default: // искра (солнце)
      return <svg {...common} fill="currentColor"><path d="M7 0L9 5.5L14 7L9 8.5L7 14L5 8.5L0 7L5 5.5Z" /></svg>
  }
}
