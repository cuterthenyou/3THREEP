import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'

export const metadata = { title: 'Доставка и оплата — THREEP' }

export default async function DeliveryPage() {
  const session = await auth()
  const isAdminUser = isAdmin(session?.user?.email)

  return (
    <main className="min-h-screen" style={{ background: '#0d0505' }}>
      <Header isAdminUser={isAdminUser} />
      <div className="max-w-2xl mx-auto px-6 py-28">
        <h1 className="heading-safe" style={{ color: '#F29774', fontFamily: "'ONDER', sans-serif", marginBottom: '2rem' }}>
          Доставка и оплата
        </h1>
        <div style={{ color: '#F29774', fontFamily: "'Involve', sans-serif", fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
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
