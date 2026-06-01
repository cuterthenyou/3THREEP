import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'

export const metadata = { title: 'Контакты — THREEP' }

export default async function ContactsPage() {
  const session = await auth()
  const isAdminUser = isAdmin(session?.user?.email)

  return (
    <main className="min-h-screen" style={{ background: '#0d0505' }}>
      <Header isAdminUser={isAdminUser} />
      <div className="max-w-2xl mx-auto px-6 py-28">
        <h1 className="heading-safe" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", marginBottom: '2rem' }}>
          Контакты
        </h1>
        <div style={{ color: '#F29774', fontFamily: "'Involve', sans-serif", fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
          <p style={{ marginBottom: '1rem' }}>
            По всем вопросам — в Telegram или на почту.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Telegram:</strong>{' '}
            <a href="https://t.me/threep_official" style={{ color: '#F29774', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
              @threep_official
            </a>
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:hello@3threep.ru" style={{ color: '#F29774', textDecoration: 'underline' }}>
              hello@3threep.ru
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
