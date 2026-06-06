import type React from 'react'

export const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--bg-subtle)',
  color: 'var(--accent)',
  border: '1px solid var(--border)',
  fontFamily: 'var(--font-involve)',
}

export const INPUT_STYLE_BG2: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-2)',
  border: '1px solid var(--border-soft)',
  borderRadius: '0.5rem',
  color: 'var(--text)',
  fontFamily: 'var(--font-involve)',
  fontSize: '0.85rem',
  outline: 'none',
  resize: 'vertical' as const,
}

export const LABEL_STYLE: React.CSSProperties = {
  color: 'var(--accent)',
  opacity: 0.5,
  fontFamily: 'var(--font-onder)',
}

export const LABEL_STYLE_MUTED: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-involve)',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

export const SECTION_TITLE: React.CSSProperties = {
  color: 'var(--accent)',
  fontFamily: 'var(--font-involve)',
  fontWeight: 800,
  fontSize: '1rem',
}

export const CHECKBOARD_LIGHT = 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'
export const CHECKBOARD_DARK  = 'repeating-conic-gradient(#404040 0% 25%, #111 0% 50%) 0 0 / 8px 8px'
