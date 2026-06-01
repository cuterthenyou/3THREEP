import Link from 'next/link'

export const metadata = { title: 'Доставка и оплата — THREEP' }

export default function DeliveryPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0.5, marginBottom: '1.5rem' }}>
          ← На главную
        </Link>

        <h1 style={{ color: 'var(--text)', fontFamily: "'ONDER', sans-serif", fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '2rem', lineHeight: 1.2, wordBreak: 'break-word' }}>
          Доставка и оплата
        </h1>

        <div style={{ color: 'var(--text)', fontFamily: "'Involve', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8 }}>
          <p style={{ marginBottom: '1.25rem' }}>
            После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            <strong>Способы оплаты:</strong> Перевод на карту СБП / Tinkoff / Сбер.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            <strong>Доставка:</strong> СДЭК, Почта России, Boxberry — по всей России. Срок обработки заказа — 1–3 рабочих дня.
          </p>
          <p>
            Стоимость доставки рассчитывается индивидуально и согласовывается в чате заказа.
          </p>
        </div>
      </div>
    </main>
  )
}
