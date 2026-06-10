const KEY = 'threep-theme'

// 'trip' — скрытая третья тема (психоделика). Открывается 3 быстрыми нажатиями
// на кнопку смены темы. Ничего не пропагандируем — чистое визуальное вдохновение.
export type Theme = 'light' | 'dark' | 'trip'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(KEY) as Theme) ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}

// 3 быстрых нажатия (< 1.6с между ними) активируют trip; из trip — выход в dark.
let _clicks: number[] = []
export function toggleTheme() {
  const now = Date.now()
  _clicks = _clicks.filter(t => now - t < 1600)
  _clicks.push(now)
  const current = (document.documentElement.dataset.theme as Theme) ?? 'light'
  if (current === 'trip') { _clicks = []; setTheme('dark'); return }
  if (_clicks.length >= 3) { _clicks = []; setTheme('trip'); return }
  setTheme(current === 'dark' ? 'light' : 'dark')
}
