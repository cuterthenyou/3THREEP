import Link from 'next/link';
import type { Metadata } from 'next';
import { queryOne } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — THREEP',
  description: 'Политика конфиденциальности и обработки персональных данных магазина THREEP.',
};

type PrivacySection = { heading: string; body: string }

const PRIVACY_DEFAULTS: PrivacySection[] = [
  {
    heading: '1. Оператор персональных данных',
    body: 'Оператором персональных данных является интернет-магазин THREEP, расположенный по адресу: 3threep.ru.\n\nКонтактный email: iakimow2@yandex.ru\n\nНастоящая Политика конфиденциальности разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».',
  },
  {
    heading: '2. Какие персональные данные мы собираем',
    body: '• Контактные данные: адрес электронной почты (при регистрации и авторизации), а также имя, телефон и адрес доставки — при оформлении заказа.\n• Профильные данные: никнейм (по желанию пользователя), аватар.\n• Данные заказов: состав, сумма и история заказов, переписка в чате заказа.\n• Технические данные: IP-адрес, тип устройства и браузера, данные сессии (cookie).\n• Обезличенная аналитика: просмотренные страницы, источник перехода, тип устройства и браузера — собираются в агрегированном виде для статистики посещаемости и улучшения работы сайта и не используются для идентификации конкретного человека.\n\nМы не собираем и не обрабатываем специальные категории персональных данных (расовое происхождение, политические взгляды, состояние здоровья и пр.).',
  },
  {
    heading: '3. Цели обработки персональных данных',
    body: '• Идентификация пользователя и предоставление доступа к личному кабинету.\n• Обработка и исполнение заказов, организация доставки.\n• Коммуникация с пользователем по вопросам заказов (email, чат в личном кабинете).\n• Направление кода авторизации (OTP) на указанный email.\n• Сбор обезличенной статистики посещаемости для улучшения работы сайта.\n• Обеспечение безопасности и предотвращение мошенничества.\n• Исполнение требований законодательства РФ.',
  },
  {
    heading: '4. Правовое основание обработки',
    body: 'Обработка персональных данных осуществляется на основании:\n\n• Согласия субъекта персональных данных (п. 1 ч. 1 ст. 6 152-ФЗ).\n• Договора, заключённого с субъектом персональных данных (п. 5 ч. 1 ст. 6 152-ФЗ) — при оформлении заказа.\n• Требований законодательства РФ (п. 2 ч. 1 ст. 6 152-ФЗ).',
  },
  {
    heading: '5. Сроки хранения данных',
    body: '• Данные аккаунта — до момента удаления аккаунта пользователем или в течение 3 лет с последней активности.\n• Данные заказов — 5 лет (требования законодательства о бухгалтерском учёте).\n• Технические данные (логи) — не более 12 месяцев.\n• Данные сессий (cookie) — до 30 дней или до закрытия браузера.',
  },
  {
    heading: '6. Передача данных третьим лицам',
    body: 'Персональные данные могут передаваться следующим категориям получателей:\n\n• ООО «Яндекс.Облако» (Yandex Cloud) — для хранения файлов (изображения, аватары) на территории РФ в соответствии с требованиями ст. 18 152-ФЗ.\n• SMTP-провайдер (для отправки email с кодами авторизации).\n• Служба доставки — адрес доставки передаётся при оформлении отправления.\n\nМы не продаём и не передаём данные третьим лицам в коммерческих или рекламных целях.',
  },
  {
    heading: '7. Cookies',
    body: 'Сайт использует cookie-файлы для обеспечения работы личного кабинета и сессии авторизации. Cookie не используются для рекламного таргетинга или аналитики третьих лиц.\n\nВы можете управлять cookie через настройки браузера. Отключение сессионных cookie сделает невозможным использование личного кабинета.',
  },
  {
    heading: '8. Права субъекта персональных данных',
    body: 'В соответствии с 152-ФЗ вы вправе:\n\n• Получить информацию об обработке ваших персональных данных.\n• Потребовать уточнения, блокирования или уничтожения данных.\n• Отозвать согласие на обработку данных.\n• Обжаловать действия оператора в Роскомнадзоре (rkn.gov.ru).\n\nДля реализации прав направьте запрос на: iakimow2@yandex.ru',
  },
  {
    heading: '9. Защита данных',
    body: 'Мы применяем технические и организационные меры защиты: шифрование соединений (HTTPS), хэширование токенов авторизации, ограничение доступа к данным для сотрудников.',
  },
  {
    heading: '10. Изменения политики',
    body: 'Мы вправе вносить изменения в настоящую Политику. Актуальная версия всегда доступна на этой странице. При существенных изменениях мы уведомим пользователей по email.',
  },
]

export default async function PrivacyPage() {
  let sections = PRIVACY_DEFAULTS
  try {
    const row = await queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'privacy_content'`)
    if (row?.value) sections = JSON.parse(row.value)
  } catch { /* table may not exist yet */ }

  const updated = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) + ' г.'

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <Link href="/" className="neo-btn" style={{
          display: 'inline-block', marginBottom: '2rem', padding: '0.4rem 0.9rem',
          color: 'var(--bg)', background: 'var(--accent)',
          fontFamily: 'var(--font-onder)', fontSize: '0.62rem',
          textTransform: 'uppercase', letterSpacing: '0.14em',
          textDecoration: 'none', borderRadius: 'var(--radius-base, 0px)',
        }}>
          ← На главную
        </Link>

        <span style={{
          display: 'block', fontFamily: 'var(--font-involve)', fontSize: '0.5rem',
          letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)',
          opacity: 0.45, marginBottom: '0.6rem',
        }}>
          // LEGAL / DATA POLICY
        </span>

        <h1 style={{
          color: 'var(--text)', fontFamily: 'var(--font-onder)', fontSize: '1.6rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', lineHeight: 1.1,
        }}>
          Политика конфиденциальности
        </h1>
        <p style={{
          color: 'var(--text)', fontFamily: 'var(--font-involve)', fontSize: '0.78rem',
          opacity: 0.45, marginBottom: '2.5rem',
        }}>
          Последнее обновление: {updated}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map((section, i) => (
            <div
              key={i}
              className="hud-corners"
              style={{
                position: 'relative',
                background: 'var(--bg-2)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-base, 0px)',
                padding: '1.4rem 1.4rem 1.5rem',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-deutsch)', fontSize: '0.7rem', letterSpacing: '0.15em',
                color: 'var(--accent)', opacity: 0.4, display: 'block', marginBottom: '0.5rem',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 style={{
                color: 'var(--text)', fontFamily: 'var(--font-onder)', fontSize: '0.95rem',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', lineHeight: 1.25,
              }}>
                {section.heading.replace(/^\d+\.\s*/, '')}
              </h2>
              <p style={{
                color: 'var(--text)', fontFamily: 'var(--font-involve)', fontSize: '0.85rem',
                lineHeight: 1.75, opacity: 0.82, whiteSpace: 'pre-line',
              }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <Link href="/" style={{
          display: 'inline-block', marginTop: '2rem', color: 'var(--text)',
          fontFamily: 'var(--font-onder)', fontSize: '0.7rem', textTransform: 'uppercase',
          letterSpacing: '0.1em', opacity: 0.4, textDecoration: 'none',
        }}>
          ← На главную
        </Link>
      </div>
    </main>
  );
}
