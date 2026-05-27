'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')

  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'

  async function requestCode() {
    setLoading(true)
    setError('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError('Не удалось отправить код. Попробуй ещё раз.')
      } else {
        setStep('code')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    setLoading(true)
    setError('')

    try {
      // Вызываем callback URL напрямую с токеном
      const response = await fetch(`/api/auth/callback/email?token=${code}&email=${encodeURIComponent(email)}`)
      
      if (!response.ok) {
        setError('Неверный код. Попробуй ещё раз.')
        setLoading(false)
        return
      }

      // Перезагружаем страницу для применения сессии
      window.location.href = callbackUrl
    } catch (err) {
      setError('Произошла ошибка. Попробуй ещё раз.')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#1a1a1a' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 flex flex-col gap-6"
        style={{ background: '#A9342A' }}
      >
        <h1
          className="text-2xl text-center uppercase tracking-widest"
          style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
        >
          Вход
        </h1>

        {step === 'email' ? (
          <>
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.8, fontFamily: "'Involve', sans-serif" }}
            >
              Введи email — пришлём код для входа
            </p>
            <input
              type="email"
              placeholder="твой@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && email && requestCode()}
              className="w-full px-4 py-3 rounded outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#F29774',
                border: '2px solid #F29774',
                borderRadius: '5px',
                fontFamily: "'Involve', sans-serif",
              }}
              autoFocus
              disabled={loading}
            />
            <button
              onClick={requestCode}
              disabled={loading || !email}
              className="w-full py-3 uppercase tracking-widest transition-opacity"
              style={{
                background: '#F29774',
                color: '#A9342A',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.8rem',
                opacity: loading || !email ? 0.5 : 1,
              }}
            >
              {loading ? 'Отправляем...' : 'Получить код'}
            </button>
          </>
        ) : (
          <>
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.9, fontFamily: "'Involve', sans-serif" }}
            >
              Код отправлен на <strong>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && !loading && code.length === 6 && verifyCode()}
              className="w-full px-4 py-3 rounded outline-none text-center text-2xl tracking-widest"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#F29774',
                border: '2px solid #F29774',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
              }}
              autoFocus
              disabled={loading}
              maxLength={6}
            />
            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full py-3 uppercase tracking-widest transition-opacity"
              style={{
                background: '#F29774',
                color: '#A9342A',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.8rem',
                opacity: loading || code.length !== 6 ? 0.5 : 1,
              }}
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </button>
            <button
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="text-sm text-center underline"
              style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}
            >
              Изменить email
            </button>
          </>
        )}

        {error && (
          <p
            className="text-sm text-center"
            style={{ color: '#ffcccc', fontFamily: "'Involve', sans-serif" }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  )
}