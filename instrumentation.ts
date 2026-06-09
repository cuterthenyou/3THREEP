export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { pool } = await import('./lib/db')
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS bg_url TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS modal_bg_url TEXT;
      CREATE TABLE IF NOT EXISTS site_settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
      INSERT INTO site_settings (key, value) VALUES
        ('hero_video_url', 'https://storage.yandexcloud.net/threep-media/assets/hero.webm'),
        ('profile_bg_url', NULL)
      ON CONFLICT (key) DO NOTHING;
    `).catch((e: Error) => console.error('[migration] failed:', e.message))

    const footerDefault = JSON.stringify({
      contact_heading: 'Пиши ёпта',
      contact_subtext: 'Хочешь заказать, есть вопрос или просто хочешь поговорить — пиши напрямую',
      vk_direct_url: 'https://vk.me/3threep_shop',
      tg_url: 'http://t.me/arasuka333',
      follow_heading: 'Смотри чё творим',
      follow_subtext: 'Следи за нами — там самое свежее',
      vk_community_url: 'https://vk.com/3threep_shop',
      tiktok_url: 'https://www.tiktok.com/@3threep.shop',
      instagram_url: 'https://www.instagram.com/3threep.shop/',
      meta_disclaimer: '*Meta Platforms признана экстремистской организацией в РФ',
      copyright: '© 2024 THREEP. All rights reserved. Custom streetwear for the bold.',
    })

    const infoDefault = JSON.stringify({
      tab1_label: 'Отгрузка',
      tab2_label: 'Связь',
      tab3_label: 'Суть',
      delivery_intro: 'После оформления заказа мы свяжемся с тобой в чате заказа и пришлём реквизиты для перевода.',
      payment_heading: 'Оплата',
      payment_text: 'Перевод на карту — СБП, Tinkoff, Сбер.',
      delivery_heading: 'Доставка',
      delivery_text: 'СДЭК, Почта России, Boxberry — по всей России.',
      delivery_note: 'Срок обработки 1–3 рабочих дня. Стоимость согласовывается в чате заказа.',
      write_heading: 'Написать нам',
      vk_label: 'VK',
      vk_url: 'https://vk.me/3threep_shop',
      vk_handle: 'vk.me/3threep_shop',
      tg_label: 'TG',
      tg_url: 'http://t.me/arasuka333',
      tg_handle: '@arasuka333',
      mail_label: 'MAIL',
      mail_email: '3threep.work@gmail.com',
      follow_heading: 'Следить за нами',
      vk_community_url: 'https://vk.com/3threep_shop',
      vk_community_handle: 'vk.com/3threep_shop',
      tiktok_url: 'https://www.tiktok.com/@3threep.shop',
      tiktok_handle: '@3threep.shop',
      instagram_url: 'https://www.instagram.com/3threep.shop/',
      instagram_handle: '@3threep.shop',
      contacts_meta_disclaimer: '* Meta признана экстремистской организацией в РФ',
      location_heading: 'Где мы',
      location_text: 'Пермь, Россия. Made in Russia.',
      what_heading: 'Что мы',
      what_text: 'THREEP — экспериментальный уличный бренд. Атмосфера, визуальный язык, смешанная эстетика.',
      what_subtext: 'Не мода — ощущение.',
      how_heading: 'Как мы делаем',
      how_text: 'Каждая вещь — это ручная работа. Хлор, ткань, история. Нет двух одинаковых.',
    })

    const privacyDefault = JSON.stringify([
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
    ])

    // Product extended fields migration
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS grade TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS series TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS article TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS cut TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
    `).catch((e: Error) => console.error('[migration] product fields failed:', e.message))

    // Light/dark card bg + modal bg variants
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS bg_url_dark TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS modal_bg_url_dark TEXT;
    `).catch((e: Error) => console.error('[migration] bg dark variants failed:', e.message))

    // Guest checkout + newsletter + custom emojis migrations
    await pool.query(`
      ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name  TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_subscription BOOLEAN DEFAULT false;
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        email TEXT PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        subscribed_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS custom_emojis (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `).catch((e: Error) => console.error('[migration] guest/newsletter/emoji failed:', e.message))

    // Analytics: page_views extra columns + generic events table
    await pool.query(`
      ALTER TABLE page_views ADD COLUMN IF NOT EXISTS referrer   TEXT;
      ALTER TABLE page_views ADD COLUMN IF NOT EXISTS user_agent TEXT;
      CREATE TABLE IF NOT EXISTS events (
        id         BIGSERIAL PRIMARY KEY,
        session_id TEXT,
        user_id    UUID,
        type       TEXT NOT NULL,
        meta       JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    `).catch((e: Error) => console.error('[migration] analytics events failed:', e.message))

    const navConfigDefault = JSON.stringify({ hiddenCollections: [], customItems: [], collectionsOrder: [] })

    for (const [key, value] of [
      ['footer_content', footerDefault],
      ['info_content', infoDefault],
      ['privacy_content', privacyDefault],
      ['nav_config', navConfigDefault],
    ] as [string, string][]) {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
        [key, value]
      ).catch((e: Error) => console.error('[seed]', key, e.message))
    }
  }
}
