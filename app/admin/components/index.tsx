import type React from 'react'
import { SECTION_TITLE } from '../adminStyles'

export function AdminPageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="uppercase tracking-widest"
      style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}
    >
      {children}
    </h1>
  )
}

export function AdminSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}
    >
      {title && <p style={SECTION_TITLE}>{title}</p>}
      {children}
    </div>
  )
}

export function AdminEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)' }}>
      {children}
    </p>
  )
}

export function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay-heavy)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[92vh]"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-lg uppercase tracking-widest"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontWeight: 800 }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              color: 'var(--accent)',
              opacity: 0.4,
              fontSize: '1.2rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
