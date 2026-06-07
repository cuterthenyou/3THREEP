'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import s from './auth.module.css';

// ── 6-slot animated code input ───────────────────────────────────────────────
function CodeInput({ value, onChange, disabled }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={s.codeWrap} onClick={() => inputRef.current?.focus()}>
      {Array.from({ length: 6 }, (_, i) => {
        const char = value[i] ?? null
        const isActive = i === value.length && value.length < 6
        return (
          <div key={i} className={`${s.slot} ${isActive ? s.slotActive : ''} ${char !== null ? s.slotFilled : ''}`}>
            {char === null
              ? <span className={s.slotDash}>—</span>
              : <span className={s.slotDigit} key={i + '_' + char}>{char}</span>}
          </div>
        )
      })}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        value={value}
        disabled={disabled}
        autoFocus
        maxLength={6}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className={s.hiddenInput}
      />
    </div>
  )
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => () => {
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
  }, []);

  function startResendTimer() {
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    setResendSeconds(60);
    resendIntervalRef.current = setInterval(() => {
      setResendSeconds(s => {
        if (s <= 1) { clearInterval(resendIntervalRef.current!); resendIntervalRef.current = null; return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function requestCode() {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('email', { email, redirect: false });
      if (result?.error) {
        setError('Не удалось отправить код. Попробуй ещё раз.');
      } else {
        setStep('code');
        startResendTimer();
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
        `/api/auth/callback/email?token=${code}&email=${encodeURIComponent(email)}`,
        { redirect: 'manual' }
      );
      const location = response.headers.get('Location') ?? '';
      if (response.status !== 302 || location.toLowerCase().includes('error')) {
        setError('Неверный код. Попробуй ещё раз.');
        setLoading(false);
        return;
      }
      if (newsletter) {
        await fetch('/api/newsletter/subscribe', { method: 'POST' }).catch(() => {})
      }
      window.location.href = callbackUrl;
    } catch {
      setError('Произошла ошибка. Попробуй ещё раз.');
      setLoading(false);
    }
  }

  return (
    <main className={s.page}>
      <button onClick={() => router.back()} className={s.authBack}>
        ← НАЗАД
      </button>
      <div className={s.card}>
        <h1 className={s.title}>Вход</h1>

        {step === 'email' ? (
          <>
            <p className={s.hint}>Введи email — пришлём код для входа</p>
            <div>
              <input
                type="email"
                placeholder="твой@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                onKeyDown={(e) => e.key === 'Enter' && !loading && isEmailValid && consent && requestCode()}
                className={`${s.input} ${emailTouched && email ? (isEmailValid ? s.inputValid : s.inputError) : ''}`}
                autoFocus
                disabled={loading}
              />
              {emailTouched && email && !isEmailValid && (
                <p className={s.fieldError}>Введите действительный email</p>
              )}
            </div>
            <label className={s.consent}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className={s.consentCheck}
              />
              <span>
                Я соглашаюсь с{' '}
                <Link href="/privacy" target="_blank" className={s.consentLink}>
                  Политикой конфиденциальности
                </Link>{' '}
                и обработкой персональных данных
              </span>
            </label>
            <label className={s.consent}>
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className={s.consentCheck}
              />
              <span>Я хочу получать новости и акции от 3THREEP</span>
            </label>
            <button onClick={requestCode} disabled={loading || !isEmailValid || !consent} className={s.btn}>
              {loading ? 'Отправляем...' : 'Получить код'}
            </button>
          </>
        ) : (
          <>
            <p className={s.hint} style={{ opacity: 0.9 }}>
              Код отправлен на <strong>{email}</strong>
            </p>
            <CodeInput
              value={code}
              onChange={setCode}
              disabled={loading}
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
                if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
                setResendSeconds(0);
              }}
              className={s.backLink}
            >
              Изменить email
            </button>
            {resendSeconds > 0
              ? <span className={s.resendTimer}>Запросить снова — {resendSeconds}с</span>
              : <button onClick={() => { setCode(''); setError(''); requestCode(); }} disabled={loading} className={s.backLink}>Запросить снова</button>
            }
          </>
        )}

        {error && <p className={s.error}>{error}</p>}
      </div>
    </main>
  );
}
