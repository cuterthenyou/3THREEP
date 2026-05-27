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
      <div style={{ textAlign: 'center', color: '#F29774' }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>⚠️ ОШИБКА</h1>
        <p>Некорректная ссылка для входа.</p>
        <a
          href="/auth"
          style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '12px 32px',
            background: '#F29774',
            color: '#A9342A',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold',
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
    <div style={{ textAlign: 'center', color: '#F29774' }}>
      <h1 style={{ fontSize: 28, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
        🔐 Подтверждение входа
      </h1>
      <p style={{ marginBottom: 10, opacity: 0.9 }}>Вход для:</p>
      <p style={{ marginBottom: 30, fontWeight: 'bold', fontSize: 18 }}>{email}</p>

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          display: 'inline-block',
          padding: '16px 48px',
          background: loading ? '#888' : '#F29774',
          color: '#A9342A',
          borderRadius: 8,
          border: 'none',
          fontSize: 18,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Входим...' : 'Войти'}
      </button>

      <p style={{ marginTop: 30, fontSize: 13, opacity: 0.6 }}>
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
        background: '#1a1a1a',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          background: '#A9342A',
          borderRadius: 12,
          padding: 40,
        }}
      >
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', color: '#F29774', fontSize: 20 }}>Загрузка...</div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  )
}
