'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Ошибка конфигурации сервера',
    AccessDenied: 'Доступ запрещён',
    Verification: 'Ссылка недействительна или истекла',
    Default: 'Произошла ошибка при входе',
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="hud-corners w-full text-center"
        style={{
          position: 'relative', maxWidth: '24rem',
          background: 'var(--bg-2)', border: '1px solid var(--border-soft)',
          borderRadius: '0.4rem', padding: '2.25rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}
      >
        <span style={{ position: 'absolute', top: '0.7rem', left: '1rem', fontFamily: 'var(--font-involve)', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.4 }}>
          // ERROR
        </span>

        {/* Brutal warning glyph */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0.5rem auto 0', color: 'var(--accent)' }} aria-hidden="true">
          <path d="M12 2 L22 21 L2 21 Z" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <rect x="11.1" y="8.5" width="1.8" height="6" fill="currentColor" />
          <rect x="11.1" y="16.2" width="1.8" height="1.9" fill="currentColor" />
        </svg>

        <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', fontFamily: 'var(--font-onder)' }}>
          Ошибка входа
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--accent)', opacity: 0.85, fontFamily: 'var(--font-involve)' }}>
          {message}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)' }}>
          {error === 'Verification' && 'Возможно, ссылка устарела или уже была использована.'}
          {error === 'AccessDenied' && 'У вас нет доступа к этому ресурсу.'}
          {!error && 'Попробуйте войти снова.'}
        </p>

        <Link
          href="/auth"
          className="neo-btn"
          style={{
            display: 'block', width: '100%', padding: '0.8rem',
            textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.16em',
            background: 'var(--accent)', color: 'var(--bg)',
            borderRadius: 'var(--radius-base, 0px)',
            fontFamily: 'var(--font-onder)', fontSize: '0.78rem', textDecoration: 'none',
          }}
        >
          Попробовать снова
        </Link>

        {error && (
          <p style={{ fontSize: '0.62rem', color: 'var(--accent)', opacity: 0.35, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
            CODE: {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-2xl" style={{ color: 'var(--accent)' }}>Загрузка...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
