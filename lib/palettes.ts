// Реестр тем-палитр THREEP. Один источник для ThemeStyles (генерация CSS-переменных),
// lib/theme.ts (цикл переключения) и админки (тумблеры ВКЛ/ВЫКЛ).
// light/dark/trip — «базовые» (их CSS уже генерится в ThemeStyles с админ-оверрайдами цветов).
// Остальные — доп-палитры в стиле бренда: тёмные, кинематографичные.

export interface Palette {
  key: string
  label: string
  hidden?: boolean   // не в обычном цикле переключения (TRIP — только тройной тап)
  base?: boolean     // базовая (CSS генерится отдельно с админ-оверрайдами)
  bg: string
  text: string
  accent: string
}

export const PALETTES: Palette[] = [
  { key: 'light', label: 'LIGHT', base: true, bg: '#a9342a', text: '#f29774', accent: '#f29774' },
  { key: 'dark',  label: 'DARK',  base: true, bg: '#1c1c1e', text: '#FCB0B2', accent: '#FCB0B2' },
  { key: 'trip',  label: 'TRIP',  base: true, hidden: true, bg: '#160a2b', text: '#cdbcff', accent: '#ff5ad0' },
  // ── доп-палитры (стиль THREEP) ──
  { key: 'ash',   label: 'ASH',   bg: '#17181a', text: '#c9c5bd', accent: '#9aa0a6' },
  { key: 'toxic', label: 'TOXIC', bg: '#0e1410', text: '#bfe9b0', accent: '#9dff5e' },
  { key: 'blood', label: 'BLOOD', bg: '#150a0a', text: '#e8b4b4', accent: '#e0454a' },
  { key: 'noir',  label: 'NOIR',  bg: '#0c0c0e', text: '#d6d6dc', accent: '#e8e8ee' },
  { key: 'ice',   label: 'ICE',   bg: '#0c1620', text: '#bfe0f2', accent: '#74c7ff' },
  { key: 'ember', label: 'EMBER', bg: '#1a0f08', text: '#f2c39a', accent: '#ff8a3d' },
]

export const ALL_THEME_KEYS = PALETTES.map(p => p.key)
export const DEFAULT_ENABLED = ['light', 'dark', 'trip']

/** CSS-блок переменных для доп-палитры (модель — как dark в ThemeStyles). */
export function paletteVarsCss(p: Palette): string {
  const { bg, text, accent } = p
  return `[data-theme="${p.key}"] {
  --bg: ${bg};
  --bg-2: color-mix(in srgb, ${bg} 60%, black);
  --text: ${text};
  --text-muted: color-mix(in srgb, ${text} 55%, transparent);
  --accent: ${accent};
  --accent-2: color-mix(in srgb, ${accent} 25%, transparent);
  --border: color-mix(in srgb, ${accent} 18%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bg} 60%, transparent);
  --bg-subtle: color-mix(in srgb, ${accent} 8%, transparent);
  --border-soft: color-mix(in srgb, ${accent} 12%, transparent);
  --border-mid: color-mix(in srgb, ${accent} 30%, transparent);
  --accent-glow: color-mix(in srgb, ${accent} 35%, transparent);
  --bg-card: ${accent};
  --text-on-card: ${bg};
  --color-accent: ${accent};
  --color-primary: ${bg};
  --color-bg: ${bg};
  --color-bg-dark: color-mix(in srgb, ${bg} 60%, black);
  --grain-opacity: 0.04;
  --cursor-color: var(--accent);
}`
}
