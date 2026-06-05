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
    body: '• Контактные данные: адрес электронной почты (при регистрации и авторизации).\n• Профильные данные: никнейм (при желании пользователя), аватар.\n• Данные заказов: адрес доставки, состав и история заказов.\n• Технические данные: IP-адрес, тип браузера, данные сессии (cookie).\n\nМы не собираем и не обрабатываем специальные категории персональных данных (расовое происхождение, политические взгляды, состояние здоровья и пр.).',
  },
  {
    heading: '3. Цели обработки персональных данных',
    body: '• Идентификация пользователя и предоставление доступа к личному кабинету.\n• Обработка и исполнение заказов, организация доставки.\n• Коммуникация с пользователем по вопросам заказов (email, чат в ЛК).\n• Направление кода авторизации (OTP) на указанный email.\n• Обеспечение безопасности и предотвращение мошенничества.\n• Исполнение требований законодательства РФ.',
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

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: '2rem',
            color: 'var(--text)',
            fontFamily: "var(--font-onder)",
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.5,
            textDecoration: 'none',
          }}
        >
          ← На главную
        </Link>

        <h1 style={{
          color: 'var(--text)',
          fontFamily: "var(--font-onder)",
          fontSize: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}>
          Политика конфиденциальности
        </h1>
        <p style={{
          color: 'var(--text)',
          fontFamily: "var(--font-involve)",
          fontSize: '0.8rem',
          opacity: 0.45,
          marginBottom: '2.5rem',
        }}>
          Последнее обновление: июнь 2026 г.
        </p>

        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              color: 'var(--text)',
              fontFamily: "var(--font-onder)",
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.75rem',
            }}>
              {section.heading}
            </h2>
            <p style={{
              color: 'var(--text)',
              fontFamily: "var(--font-involve)",
              fontSize: '0.875rem',
              lineHeight: '1.7',
              opacity: 0.85,
              whiteSpace: 'pre-line',
            }}>
              {section.body}
            </p>
          </div>
        ))}

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            color: 'var(--text)',
            fontFamily: "var(--font-onder)",
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.4,
            textDecoration: 'none',
          }}
        >
          ← На главную
        </Link>
      </div>
    </main>
  );
}
