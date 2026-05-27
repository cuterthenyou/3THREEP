'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1a1a1a' }}>
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
            ⚠️
          </h1>
          <h2 className="text-2xl font-bold" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}>
            ОШИБКА ВХОДА
          </h2>
          <p className="text-lg" style={{ color: '#F29774', opacity: 0.8, fontFamily: "'Involve', sans-serif" }}>
            {message}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}>
            {error === 'Verification' && 'Возможно, ссылка устарела или уже была использована.'}
            {error === 'AccessDenied' && 'У вас нет доступа к этому ресурсу.'}
            {!error && 'Попробуйте войти снова.'}
          </p>

          <Link
            href="/auth"
            className="block w-full py-3 uppercase tracking-widest transition-opacity"
            style={{
              background: '#F29774',
              color: '#A9342A',
              borderRadius: '5px',
              fontFamily: "'ONDER', sans-serif",
              fontSize: '0.8rem',
            }}
          >
            Попробовать снова
          </Link>
        </div>

        {error && (
          <p className="text-xs" style={{ color: '#F29774', opacity: 0.4, fontFamily: "'Involve', sans-serif" }}>
            Код ошибки: {error}
          </p>
        )}
      </div>
    </div>
  )
}
