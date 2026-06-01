import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'

export const metadata = { title: 'Доставка и оплата — THREEP' }

export default async function DeliveryPage() {
  const session = await auth()
  const isAdminUser = isAdmin(session?.user?.email)

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header isAdminUser={isAdminUser} />
      <div className="max-w-2xl mx-auto px-6 py-28">
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text)',
            fontFamily: "'ONDER', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            opacity: 0.55,
            marginBottom: '1.5rem',
            transition: 'opacity 0.2s',
          }}
        >
          ← На главную
        </Link>

        <h1 className="heading-safe" style={{ color: 'var(--text)', fontFamily: "'ONDER', sans-serif", marginBottom: '2rem' }}>
          Доставка и оплата
        </h1>
        <div style={{ color: 'var(--text)', fontFamily: "'Involve', sans-serif", fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
          <p style={{ marginBottom: '1.5rem' }}>
            После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Способы оплаты:</strong> Перевод на карту СБП / Tinkoff / Сбер.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Доставка:</strong> СДЭК, Почта России, Boxberry — по всей России.
            Срок обработки заказа — 1–3 рабочих дня.
          </p>
          <p>
            Стоимость доставки рассчитывается индивидуально и согласовывается в чате заказа.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
