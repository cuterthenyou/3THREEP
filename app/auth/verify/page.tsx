'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')
  const [loading, setLoading] = useState(false)

  if (!token || !email) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-involve)', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 14 }}>// ERROR</span>
        <h1 style={{ fontSize: 22, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-onder)' }}>Ошибка</h1>
        <p style={{ fontFamily: 'var(--font-involve)', opacity: 0.85 }}>Некорректная ссылка для входа.</p>
        <a
          href="/auth"
          className="neo-btn"
          style={{
            display: 'inline-block', marginTop: 24, padding: '0.8rem 2rem',
            background: 'var(--accent)', color: 'var(--bg)',
            borderRadius: 'var(--radius-base, 0px)', textDecoration: 'none',
            fontFamily: 'var(--font-onder)', fontSize: '0.78rem',
            textTransform: 'uppercase', letterSpacing: '0.16em',
          }}
        >
          Попробовать снова
        </a>
      </div>
    )
  }

  const handleConfirm = () => {
    setLoading(true)
    // Редиректим на NextAuth callback - только теперь активируем токен
    window.location.href = `/api/auth/callback/email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`
  }

  return (
    <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
      <span style={{ display: 'block', fontFamily: 'var(--font-involve)', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 16 }}>// AUTH CONFIRM</span>
      <h1 style={{ fontSize: 22, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-onder)' }}>
        Подтверждение входа
      </h1>
      <p style={{ marginBottom: 8, opacity: 0.6, fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Вход для:</p>
      <p style={{ marginBottom: 30, fontFamily: 'var(--font-deutsch)', fontSize: 18, letterSpacing: '0.03em' }}>{email}</p>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="neo-btn"
        style={{
          display: 'inline-block', padding: '0.95rem 3rem',
          background: loading ? 'var(--text-muted)' : 'var(--accent)',
          color: 'var(--bg)', borderRadius: 'var(--radius-base, 0px)',
          fontFamily: 'var(--font-onder)', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.14em',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Входим...' : 'Войти'}
      </button>

      <p style={{ marginTop: 30, fontSize: '0.72rem', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        Эта страница защищает твой токен от автоматических предзагрузок.
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div
        className="hud-corners"
        style={{
          position: 'relative',
          maxWidth: 420,
          width: '100%',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-soft)',
          borderRadius: '0.4rem',
          padding: '2.5rem 2rem',
        }}
      >
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 20 }}>Загрузка...</div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  )
}
