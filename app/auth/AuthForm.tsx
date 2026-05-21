'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'

  async function sendMagicLink() {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Не удалось отправить письмо. Попробуй ещё раз.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуй ещё раз.')
    } finally {
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

        {success ? (
          <div className="flex flex-col gap-4">
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.9, fontFamily: "'Involve', sans-serif" }}
            >
              ✅ Письмо отправлено на <strong>{email}</strong>
            </p>
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.7, fontFamily: "'Involve', sans-serif" }}
            >
              Открой письмо и кликни по ссылке для входа.
            </p>
            <p
              className="text-xs text-center"
              style={{ color: '#F29774', opacity: 0.5, fontFamily: "'Involve', sans-serif" }}
            >
              Ссылка действительна 15 минут.
            </p>
            <button
              onClick={() => { setSuccess(false); setEmail(''); }}
              className="text-sm text-center underline mt-4"
              style={{ color: '#F29774', opacity: 0.6, fontFamily: "'Involve', sans-serif" }}
            >
              Изменить email
            </button>
          </div>
        ) : (
          <>
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.8, fontFamily: "'Involve', sans-serif" }}
            >
              Введи email — пришлём ссылку для входа
            </p>
            <input
              type="email"
              placeholder="твой@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && email && sendMagicLink()}
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
              onClick={sendMagicLink}
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
              {loading ? 'Отправляем...' : 'Получить ссылку'}
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