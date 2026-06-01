import Link from 'next/link'

export const metadata = { title: 'Контакты — THREEP' }

export default function ContactsPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0.5, marginBottom: '1.5rem' }}>
          ← На главную
        </Link>

        <h1 style={{ color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '2rem', lineHeight: 1.2, wordBreak: 'break-word' }}>
          Контакты
        </h1>

        <div style={{ color: 'var(--text)', fontFamily: "'Involve', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8 }}>
          <p style={{ marginBottom: '1rem' }}>По всем вопросам — в Telegram или на почту.</p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Telegram:</strong>{' '}
            <a href="https://t.me/threep_official" style={{ color: 'var(--accent)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
              @threep_official
            </a>
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:hello@3threep.ru" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              hello@3threep.ru
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
