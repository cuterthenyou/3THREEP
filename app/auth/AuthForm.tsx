'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import s from './auth.module.css';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  async function requestCode() {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('email', { email, redirect: false });
      if (result?.error) {
        setError('Не удалось отправить код. Попробуй ещё раз.');
      } else {
        setStep('code');
      }
    } catch {
      setError('Произошла ошибка. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/auth/callback/email?token=${code}&email=${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        setError('Неверный код. Попробуй ещё раз.');
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError('Произошла ошибка. Попробуй ещё раз.');
      setLoading(false);
    }
  }

  return (
    <main className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>Вход</h1>

        {step === 'email' ? (
          <>
            <p className={s.hint}>Введи email — пришлём код для входа</p>
            <input
              type="email"
              placeholder="твой@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && email && requestCode()}
              className={s.input}
              autoFocus
              disabled={loading}
            />
            <button onClick={requestCode} disabled={loading || !email} className={s.btn}>
              {loading ? 'Отправляем...' : 'Получить код'}
            </button>
          </>
        ) : (
          <>
            <p className={s.hint} style={{ opacity: 0.9 }}>
              Код отправлен на <strong>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && !loading && code.length === 6 && verifyCode()}
              className={s.inputCode}
              autoFocus
              disabled={loading}
              maxLength={6}
            />
            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className={s.btn}
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </button>
            <button
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className={s.backLink}
            >
              Изменить email
            </button>
          </>
        )}

        {error && <p className={s.error}>{error}</p>}
      </div>
    </main>
  );
}
