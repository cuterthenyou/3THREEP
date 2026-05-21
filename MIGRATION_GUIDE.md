# Руководство по миграции с Supabase на Amvera PostgreSQL

## 🎯 Что мы делаем

Переносим весь проект с Supabase на собственную инфраструктуру:
- **БД**: Supabase PostgreSQL → Amvera PostgreSQL
- **Auth**: Supabase Auth → NextAuth + Magic Link
- **Email**: Supabase Email → Yandex SMTP
- **Storage**: Supabase Storage → Yandex Object Storage ✅ (уже сделано)

---

## 📋 Шаг 1: Установка зависимостей

```bash
npm install
```

Это установит:
- `next-auth@5.0.0-beta.25` — авторизация
- `nodemailer` — отправка email
- `pg` — PostgreSQL клиент

---

## 📋 Шаг 2: Создание БД на Amvera

### 2.1. Создай PostgreSQL БД

1. Открой https://amvera.ru/databases
2. Нажми **"Создать базу данных"**
3. Выбери **PostgreSQL**
4. Регион: **Москва_0**
5. Название: `threep-db`
6. Нажми **"Создать"**

### 2.2. Получи connection string

После создания БД скопируй **Connection String**:
```
postgresql://user:password@host:port/database
```

### 2.3. Добавь переменные окружения

**Локально** — добавь в `.env.local`:
```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=сгенерируй_случайную_строку_32_символа

# Yandex SMTP
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=твой@yandex.ru
SMTP_PASS=пароль_приложения_yandex
SMTP_FROM=noreply@3threep.ru
```

**На Amvera** — добавь в "Переменные окружения" → "Запуск":
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://3threep.ru
NEXTAUTH_SECRET=...
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

---

## 📋 Шаг 3: Настройка Yandex SMTP

### 3.1. Создай пароль приложения

1. Открой https://id.yandex.ru/security
2. Прокрути до **"Пароли приложений"**
3. Нажми **"Создать пароль"**
4. Выбери **"Почтовая программа"**
5. Скопируй пароль (показывается один раз!)

### 3.2. Проверь настройки

Убедись, что в `.env.local` правильные данные:
```env
SMTP_USER=твой@yandex.ru
SMTP_PASS=скопированный_пароль_приложения
```

---

## 📋 Шаг 4: Экспорт данных из Supabase

### 4.1. Открой Supabase SQL Editor

https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql

### 4.2. Выполни скрипт экспорта

Открой файл `migration/01_export_supabase.sql` и выполни каждый запрос по очереди.

Сохрани результаты в CSV или Excel:
- `users.csv` — пользователи
- `profiles.csv` — профили
- `products.csv` — товары
- `orders.csv` — заказы
- `order_items.csv` — позиции заказов
- `messages.csv` — сообщения

---

## 📋 Шаг 5: Создание схемы в Amvera PostgreSQL

### 5.1. Подключись к БД

```bash
psql "postgresql://user:password@host:port/database"
```

Или используй GUI клиент (DBeaver, pgAdmin).

### 5.2. Выполни скрипт создания схемы

Скопируй содержимое `migration/02_amvera_schema.sql` и выполни в psql или GUI клиенте.

Это создаст таблицы:
- `users` — пользователи
- `profiles` — профили
- `products` — товары
- `orders` — заказы
- `order_items` — позиции заказов
- `messages` — сообщения
- `magic_links` — для авторизации

---

## 📋 Шаг 6: Импорт данных

### 6.1. Импорт пользователей

```sql
-- Из CSV файла users.csv
INSERT INTO users (id, email, email_verified, created_at)
VALUES 
  ('uuid-1', 'user1@email.com', true, '2024-01-01'),
  ('uuid-2', 'user2@email.com', true, '2024-01-02');
```

### 6.2. Импорт профилей

```sql
-- Из CSV файла profiles.csv
INSERT INTO profiles (id, name, email, avatar_url, created_at)
VALUES 
  ('uuid-1', 'User 1', 'user1@email.com', 'https://...', '2024-01-01');
```

### 6.3. Импорт товаров

```sql
-- Из CSV файла products.csv
INSERT INTO products (id, name, description, price, images, sizes, colors, stock, active, category, product_type, created_at)
VALUES 
  ('uuid-1', 'Товар 1', 'Описание', 1000, ARRAY['url1'], ARRAY['M','L'], ARRAY['black'], 10, true, 'tshirts', 'T-SHIRT', '2024-01-01');
```

### 6.4. Импорт заказов и остального

Аналогично импортируй `orders`, `order_items`, `messages`.

---

## 📋 Шаг 7: Генерация NEXTAUTH_SECRET

```bash
# В терминале
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Скопируй результат и добавь в `.env.local` и Amvera.

---

## 📋 Шаг 8: Тестирование локально

### 8.1. Запусти dev сервер

```bash
npm run dev
```

### 8.2. Проверь авторизацию

1. Открой http://localhost:3000/auth
2. Введи email
3. Проверь почту — должно прийти письмо с Magic Link
4. Кликни по ссылке → должен войти

### 8.3. Проверь функционал

- ✅ Создание заказа
- ✅ Админ-панель
- ✅ Загрузка файлов
- ✅ Чат в заказе

---

## 📋 Шаг 9: Деплой на Amvera

### 9.1. Добавь переменные в Amvera

Все переменные из `.env.local` добавь в Amvera → "Переменные окружения" → "Запуск".

### 9.2. Закоммить и запушить

```bash
git add .
git commit -m "Migrate from Supabase to Amvera PostgreSQL + NextAuth"
git push origin main
```

### 9.3. Дождись деплоя

Amvera автоматически подхватит изменения и задеплоит.

---

## 📋 Шаг 10: Проверка на продакшене

1. Открой https://3threep.ru/auth
2. Проверь авторизацию
3. Проверь создание заказа
4. Проверь админку

---

## ⚠️ Откат в случае проблем

Если что-то пошло не так:

1. Откати коммит:
```bash
git revert HEAD
git push origin main
```

2. Верни переменные Supabase в Amvera

3. Передеплой

---

## 🎉 После успешной миграции

1. Подожди неделю, убедись что всё работает
2. Удали Supabase проект
3. Настрой автоматические бэкапы БД в Amvera
4. Добавь мониторинг (Sentry)

---

## 📞 Помощь

Если возникли проблемы:
1. Проверь логи в Amvera
2. Проверь переменные окружения
3. Проверь connection string к БД
4. Проверь настройки Yandex SMTP
