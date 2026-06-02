import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — THREEP',
  description: 'Политика конфиденциальности и обработки персональных данных магазина THREEP.',
};

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{
      color: 'var(--text)',
      fontFamily: "var(--font-onder)",
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '0.75rem',
    }}>
      {title}
    </h2>
    <div style={{
      color: 'var(--text)',
      fontFamily: "var(--font-involve)",
      fontSize: '0.875rem',
      lineHeight: '1.7',
      opacity: 0.85,
    }}>
      {children}
    </div>
  </div>
);

export default function PrivacyPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Back */}
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

        <SECTION title="1. Оператор персональных данных">
          <p>
            Оператором персональных данных является интернет-магазин THREEP, расположенный по адресу:
            <strong style={{ color: 'var(--text)' }}> 3threep.ru</strong>.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Контактный email: <strong>iakimow2@yandex.ru</strong>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Настоящая Политика конфиденциальности разработана в соответствии с требованиями
            Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».
          </p>
        </SECTION>

        <SECTION title="2. Какие персональные данные мы собираем">
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong>Контактные данные:</strong> адрес электронной почты (при регистрации и авторизации).</li>
            <li><strong>Профильные данные:</strong> никнейм (при желании пользователя), аватар.</li>
            <li><strong>Данные заказов:</strong> адрес доставки, состав и история заказов.</li>
            <li><strong>Технические данные:</strong> IP-адрес, тип браузера, данные сессии (cookie).</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Мы не собираем и не обрабатываем специальные категории персональных данных
            (расовое происхождение, политические взгляды, состояние здоровья и пр.).
          </p>
        </SECTION>

        <SECTION title="3. Цели обработки персональных данных">
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            <li>Идентификация пользователя и предоставление доступа к личному кабинету.</li>
            <li>Обработка и исполнение заказов, организация доставки.</li>
            <li>Коммуникация с пользователем по вопросам заказов (email, чат в ЛК).</li>
            <li>Направление кода авторизации (OTP) на указанный email.</li>
            <li>Обеспечение безопасности и предотвращение мошенничества.</li>
            <li>Исполнение требований законодательства РФ.</li>
          </ul>
        </SECTION>

        <SECTION title="4. Правовое основание обработки">
          <p>
            Обработка персональных данных осуществляется на основании:
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0' }}>
            <li>Согласия субъекта персональных данных (п. 1 ч. 1 ст. 6 152-ФЗ).</li>
            <li>Договора, заключённого с субъектом персональных данных (п. 5 ч. 1 ст. 6 152-ФЗ) — при оформлении заказа.</li>
            <li>Требований законодательства РФ (п. 2 ч. 1 ст. 6 152-ФЗ).</li>
          </ul>
        </SECTION>

        <SECTION title="5. Сроки хранения данных">
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            <li>Данные аккаунта — до момента удаления аккаунта пользователем или в течение 3 лет с последней активности.</li>
            <li>Данные заказов — 5 лет (требования законодательства о бухгалтерском учёте).</li>
            <li>Технические данные (логи) — не более 12 месяцев.</li>
            <li>Данные сессий (cookie) — до 30 дней или до закрытия браузера.</li>
          </ul>
        </SECTION>

        <SECTION title="6. Передача данных третьим лицам">
          <p>
            Персональные данные могут передаваться следующим категориям получателей:
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0' }}>
            <li>
              <strong>ООО «Яндекс.Облако» (Yandex Cloud)</strong> — для хранения файлов (изображения, аватары)
              на территории РФ в соответствии с требованиями ст. 18 152-ФЗ.
            </li>
            <li>
              <strong>SMTP-провайдер</strong> (для отправки email с кодами авторизации).
            </li>
            <li>
              <strong>Служба доставки</strong> — адрес доставки передаётся при оформлении отправления.
            </li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Мы не продаём и не передаём данные третьим лицам в коммерческих или рекламных целях.
          </p>
        </SECTION>

        <SECTION title="7. Cookies">
          <p>
            Сайт использует cookie-файлы для обеспечения работы личного кабинета и сессии авторизации.
            Cookie не используются для рекламного таргетинга или аналитики третьих лиц.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Вы можете управлять cookie через настройки браузера. Отключение сессионных cookie
            сделает невозможным использование личного кабинета.
          </p>
        </SECTION>

        <SECTION title="8. Права субъекта персональных данных">
          <p>В соответствии с 152-ФЗ вы вправе:</p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0' }}>
            <li>Получить информацию об обработке ваших персональных данных.</li>
            <li>Потребовать уточнения, блокирования или уничтожения данных.</li>
            <li>Отозвать согласие на обработку данных.</li>
            <li>Обжаловать действия оператора в Роскомнадзоре (rkn.gov.ru).</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Для реализации прав направьте запрос на: <strong>iakimow2@yandex.ru</strong>
          </p>
        </SECTION>

        <SECTION title="9. Защита данных">
          <p>
            Мы применяем технические и организационные меры защиты: шифрование соединений (HTTPS),
            хэширование токенов авторизации, ограничение доступа к данным для сотрудников.
          </p>
        </SECTION>

        <SECTION title="10. Изменения политики">
          <p>
            Мы вправе вносить изменения в настоящую Политику. Актуальная версия всегда доступна
            на этой странице. При существенных изменениях мы уведомим пользователей по email.
          </p>
        </SECTION>

        {/* Back link bottom */}
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
