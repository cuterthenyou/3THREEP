# Настройка Yandex Object Storage для threep-shop

## 1. Создание статических ключей доступа

### Шаги в консоли Yandex Cloud:

1. Открой https://console.yandex.cloud/
2. Выбери свой каталог (folder)
3. Перейди в **Service Accounts** (Сервисные аккаунты)
4. Создай новый сервисный аккаунт:
   - Имя: `threep-storage-sa` (или любое другое)
   - Роль: `storage.editor` (для загрузки/удаления файлов)
5. Открой созданный сервисный аккаунт
6. Перейди на вкладку **Access keys** → **Create new key** → **Static access key**
7. **ВАЖНО:** Сохрани **Access Key ID** и **Secret Key** — они покажутся только один раз!

## 2. Настройка публичного доступа к бакету

1. Перейди в **Object Storage** → **Buckets** → `threep-media`
2. Настройки бакета → **Access** → **Public access**
3. Включи **Read** для публичного доступа (чтобы файлы были доступны по прямым ссылкам)
4. Сохрани изменения

## 3. Добавление переменных окружения

### Локально (`.env.local`):

Создай или обнови файл `.env.local` в корне проекта:

```env
# Yandex Object Storage
YANDEX_STORAGE_ENDPOINT=https://storage.yandexcloud.net
YANDEX_STORAGE_BUCKET=threep-media
YANDEX_STORAGE_ACCESS_KEY=твой_access_key_id_из_шага_1
YANDEX_STORAGE_SECRET_KEY=твой_secret_key_из_шага_1
YANDEX_STORAGE_REGION=ru-central1
NEXT_PUBLIC_STORAGE_BASE_URL=https://storage.yandexcloud.net/threep-media
```

### На Amvera/Netlify:

Добавь те же переменные в панель управления хостингом:
- Amvera: Проект → Переменные окружения
- Netlify: Site settings → Environment variables

## 4. Проверка работы

После настройки переменных окружения:

1. Запусти проект локально: `npm run dev`
2. Зайди в админку: `/admin/products`
3. Попробуй загрузить изображение товара
4. Проверь, что URL начинается с `https://storage.yandexcloud.net/threep-media/products/...`
5. Открой URL в браузере — файл должен загрузиться

## 5. Структура бакета

```
threep-media/
├── assets/          # Статические ресурсы (hero.webm, hero.av1.webm)
├── avatars/         # Аватары пользователей (user_id.jpg)
└── products/        # Изображения товаров (timestamp-random.jpg)
```

## Важные моменты

- **Безопасность:** Никогда не коммить `.env.local` в Git
- **Access Keys:** Храни их в безопасном месте (password manager)
- **Публичный доступ:** Бакет должен иметь публичный READ доступ для отображения файлов
- **Совместимость:** Старые файлы из Supabase продолжат работать, новые будут загружаться в Yandex

## Troubleshooting

### Ошибка "Access Denied"
- Проверь, что у сервисного аккаунта есть роль `storage.editor`
- Убедись, что бакет имеет публичный READ доступ

### Ошибка "Invalid credentials"
- Проверь правильность `YANDEX_STORAGE_ACCESS_KEY` и `YANDEX_STORAGE_SECRET_KEY`
- Убедись, что ключи скопированы полностью без пробелов

### Файлы не отображаются
- Проверь публичный доступ к бакету
- Открой URL файла напрямую в браузере для диагностики
