'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const email = searchParams.get('email')

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{
          fontSize: '3rem', lineHeight: 1,
          filter: 'grayscale(0.2)',
        }}>
          ✓
        </div>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-onder)', fontSize: '1.5rem',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--accent)', marginBottom: '0.75rem',
          }}>
            Заказ оформлен
          </h1>
          {id && (
            <p style={{
              fontFamily: 'var(--font-involve)', fontSize: '0.85rem',
              color: 'var(--accent)', opacity: 0.6, marginBottom: '0.35rem',
            }}>
              Номер заказа: <span style={{ opacity: 1, fontWeight: 600 }}>#{id.slice(0, 8)}</span>
            </p>
          )}
          {email && (
            <p style={{
              fontFamily: 'var(--font-involve)', fontSize: '0.85rem',
              color: 'var(--accent)', opacity: 0.6,
            }}>
              Мы свяжемся с тобой по email: <span style={{ opacity: 1 }}>{email}</span>
            </p>
          )}
        </div>

        <p style={{
          fontFamily: 'var(--font-involve)', fontSize: '0.82rem',
          color: 'var(--accent)', opacity: 0.45, lineHeight: 1.6,
        }}>
          После обработки заказа тебе придёт письмо с деталями и реквизитами для оплаты.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem', padding: '0.75rem 1.75rem',
            background: 'var(--accent)', color: 'var(--bg)',
            fontFamily: 'var(--font-onder)', fontSize: '0.78rem',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            borderRadius: '8px', textDecoration: 'none',
            alignSelf: 'center',
            transition: 'filter 0.2s, transform 0.15s',
          }}
        >
          ← На главную
        </Link>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
