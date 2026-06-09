import type { ReactNode } from 'react'
import s from './HudFrame.module.css'

interface HudFrameProps {
  children: ReactNode
  /** Small mono tag rendered at the top-left, e.g. "PROFILE" → "// PROFILE" */
  label?: string
  /** panel = padded boxed surface; inline = corners only, no padding/bg */
  variant?: 'panel' | 'inline'
  className?: string
}

/**
 * 3THREEP HUD frame — thin accent corner brackets + optional mono label.
 * Cohesive "system terminal" framing used across account / auth / chat / modals.
 */
export default function HudFrame({ children, label, variant = 'panel', className = '' }: HudFrameProps) {
  return (
    <div className={`${s.frame} ${variant === 'panel' ? s.panel : s.inline} ${className}`}>
      <span className={`${s.corner} ${s.tl}`} aria-hidden="true" />
      <span className={`${s.corner} ${s.tr}`} aria-hidden="true" />
      <span className={`${s.corner} ${s.bl}`} aria-hidden="true" />
      <span className={`${s.corner} ${s.br}`} aria-hidden="true" />
      {label && <span className={s.label} aria-hidden="true">// {label}</span>}
      {children}
    </div>
  )
}
