const KEY = 'threep-theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(KEY) as Theme) ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme as Theme ?? 'light'
  setTheme(current === 'dark' ? 'light' : 'dark')
}
