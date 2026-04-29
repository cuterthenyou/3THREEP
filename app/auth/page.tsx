'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}

function AuthForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'

  async function sendCode() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setStep('code')
    }
    setLoading(false)
  }

  async function verifyCode() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) {
      setError('Неверный код. Попробуй ещё раз.')
    } else {
      router.push(next)
      router.refresh()
    }
    setLoading(false)
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
          className={`text-center uppercase tracking-widest ${step === 'code' ? 'text-base sm:text-lg' : 'text-2xl'}`}
          style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif" }}
        >
          {step === 'email' ? 'Вход' : 'Код из письма'}
        </h1>

        {step === 'email' ? (
          <>
            <p
              className="text-sm text-center"
              style={{ color: '#F29774', opacity: 0.8, fontFamily: "'Involve', sans-serif" }}
            >
              Введи email — пришлём одноразовый код
            </p>
            <input
              type="email"
              placeholder="твой@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCode()}
              className="w-full px-4 py-3 rounded outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#F29774',
                border: '2px solid #F29774',
                borderRadius: '5px',
                fontFamily: "'Involve', sans-serif",
              }}
              autoFocus
            />
            <button
              onClick={sendCode}
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
              style={{ color: '#F29774', opacity: 0.8, fontFamily: "'Involve', sans-serif" }}
            >
              Код отправлен на <strong>{email}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000000"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
              className="w-full px-3 py-3 rounded outline-none text-center text-lg tracking-[0.35em]"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#F29774',
                border: '2px solid #F29774',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
              }}
              autoFocus
            />
            <button
              onClick={verifyCode}
              disabled={loading || code.length < 6}
              className="w-full py-3 uppercase tracking-widest transition-opacity"
              style={{
                background: '#F29774',
                color: '#A9342A',
                borderRadius: '5px',
                fontFamily: "'ONDER', sans-serif",
                fontSize: '0.8rem',
                opacity: loading || code.length < 6 ? 0.5 : 1,
              }}
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </button>
            <button
              onClick={() => { setStep('email'); setCode(''); setError('') }}
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
