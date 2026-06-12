'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import s from './auth.module.css';

// ── 6-slot animated code input ───────────────────────────────────────────────
function CodeInput({ value, onChange, disabled, shake }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  shake?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={`${s.codeWrap} ${shake ? s.codeShake : ''}`} onClick={() => inputRef.current?.focus()}>
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
        onPaste={e => {
          e.preventDefault()
          const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
          if (pasted) onChange(pasted)
        }}
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
  // Из письма (кнопка «ВВЕСТИ КОД»): ?email=…&step=code → сразу на ввод кода,
  // код уже отправлен, повторно не шлём.
  const startOnCode = searchParams.get('step') === 'code' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromUrl);

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code'>(startOnCode ? 'code' : 'email');
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [shake, setShake] = useState(false);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyingRef = useRef(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (!isEmailValid) { setIsExistingUser(null); return; }
    fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => setIsExistingUser(!!d.exists))
      .catch(() => setIsExistingUser(null));
  }, [email, isEmailValid]);

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
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/auth/callback/email?token=${code}&email=${encodeURIComponent(email)}`
      );
      if (response.url.includes('/error') || response.url.includes('error=')) {
        setError('Неверный код. Попробуй ещё раз.');
        setShake(true);
        setTimeout(() => { setShake(false); setCode(''); }, 450);
        setLoading(false);
        verifyingRef.current = false;
        return;
      }
      if (newsletter) {
        await fetch('/api/newsletter/subscribe', { method: 'POST' }).catch(() => {})
      }
      window.location.href = callbackUrl;
    } catch {
      setError('Произошла ошибка. Попробуй ещё раз.');
      setLoading(false);
      verifyingRef.current = false;
    }
  }

  // Auto-submit once all 6 digits are entered
  useEffect(() => {
    if (step === 'code' && code.length === 6 && !verifyingRef.current) {
      verifyCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step]);

  return (
    <main className={s.page}>
      <button onClick={() => router.back()} className={s.authBack}>
        ← НАЗАД
      </button>
      <div className={`${s.card} hud-corners`}>
        <span className={s.cardTag}>// ACCESS</span>
        <h1 className={s.title}>Вход</h1>

        {step === 'email' ? (
          <>
            <p className={s.hint}>Введи email — пришлём код для входа</p>
            <div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="твой@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                onKeyDown={(e) => e.key === 'Enter' && !loading && isEmailValid && (isExistingUser !== false || consent) && requestCode()}
                className={`${s.input} ${emailTouched && email ? (isEmailValid ? s.inputValid : s.inputError) : ''}`}
                autoFocus
                disabled={loading}
              />
              {emailTouched && email && !isEmailValid && (
                <p className={s.fieldError}>Введите действительный email</p>
              )}
            </div>
            {/* Галочки согласия видны по умолчанию (и пока статус не определён);
                скрываем только для подтверждённо существующего аккаунта. */}
            {isExistingUser !== true && (
              <>
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
              </>
            )}
            <button onClick={requestCode} disabled={loading || !isEmailValid || (isExistingUser === false && !consent)} className={s.btn}>
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
              shake={shake}
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
