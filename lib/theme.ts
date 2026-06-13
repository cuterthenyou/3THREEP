const KEY = 'threep-theme'

// Тема — произвольный ключ палитры (см. lib/palettes.ts). 'trip' — скрытая
// психоделика: в обычный цикл НЕ входит, открывается 3 быстрыми тапами.
export type Theme = string

// Включённые в цикл темы (инжектится ThemeStyles из site_settings.enabled_themes).
// Фолбэк — light/dark, чтобы переключение работало даже до гидрации настроек.
function cycleThemes(): string[] {
  if (typeof window === 'undefined') return ['light', 'dark']
  const w = (window as unknown as Record<string, unknown>)['__THREEP_THEMES__']
  return Array.isArray(w) && w.length ? (w as string[]) : ['light', 'dark']
}
function tripEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return (window as unknown as Record<string, unknown>)['__THREEP_TRIP_ENABLED__'] === true
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(KEY) as Theme) ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}

// 3 ОЧЕНЬ быстрых тапа (все три в окне `tripTapWindow()`мс — осознанный «бёрст»,
// а не обычное перелистывание тем) активируют trip, если он включён в админке.
// Из trip — выход в первую тему цикла. Окно настраивается в админке (по умолч. 500мс),
// чтобы trip не всплывал случайно при цикле тем.
function tripTapWindow(): number {
  if (typeof window === 'undefined') return 500
  const w = (window as unknown as Record<string, unknown>)['__THREEP_TRIP_TAP_MS__']
  return typeof w === 'number' && w > 0 ? w : 500
}
let _clicks: number[] = []
export function toggleTheme() {
  const now = Date.now()
  _clicks = _clicks.filter(t => now - t < tripTapWindow())
  _clicks.push(now)

  const cycle = cycleThemes()
  const current = (document.documentElement.dataset.theme as Theme) ?? cycle[0] ?? 'light'

  // Из trip — назад в первую обычную тему
  if (current === 'trip') { _clicks = []; setTheme(cycle[0] ?? 'light'); return }
  // Тройной тап → trip (только если включён)
  if (tripEnabled() && _clicks.length >= 3) { _clicks = []; setTheme('trip'); return }
  // Иначе — следующая включённая тема по кругу
  const idx = cycle.indexOf(current)
  const next = cycle[(idx + 1) % cycle.length] ?? cycle[0] ?? 'light'
  setTheme(next)
}
