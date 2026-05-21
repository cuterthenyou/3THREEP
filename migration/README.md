# Миграция с Supabase на Amvera PostgreSQL

## 🚀 Быстрый старт

### 1. Установи зависимости
```bash
npm install
```

### 2. Создай БД на Amvera
- Открой https://amvera.ru/databases
- Создай PostgreSQL БД (регион Москва_0)
- Скопируй Connection String

### 3. Настрой Yandex SMTP
- Открой https://id.yandex.ru/security
- Создай пароль приложения для "Почтовая программа"
- Скопируй пароль

### 4. Создай .env.local
```bash
cp .env.migration.example .env.local
```

Заполни все переменные:
- `DATABASE_URL` — из Amvera
- `NEXTAUTH_SECRET` — сгенерируй: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `SMTP_USER` и `SMTP_PASS` — из Yandex

### 5. Подготовь Supabase к экспорту

**ВАЖНО:** Сначала добавь недостающие колонки в Supabase!

Выполни в Supabase SQL Editor:
```sql
-- Из файла migration/00_add_missing_columns_supabase.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT;
```

### 6. Экспортируй данные из Supabase
Выполни `migration/01_export_supabase.sql` в Supabase SQL Editor

Скачай CSV для каждой таблицы:
- users (из auth.users)
- profiles
- products
- orders
- order_items
- messages

### 7. Создай схему в Amvera
```bash
psql $DATABASE_URL < migration/02_amvera_schema.sql
```

### 8. Импортируй данные
Вручную импортируй CSV из Supabase в Amvera PostgreSQL через pgAdmin/DBeaver

### 9. Запусти локально
```bash
npm run dev
```

Проверь http://localhost:3000/auth

### 10. Деплой на Amvera
```bash
git add .
git commit -m "Migrate to Amvera PostgreSQL + NextAuth"
git push origin main
```

---

## 📁 Файлы миграции

- `00_check_supabase_schema.sql` — проверка текущей схемы Supabase
- `00_add_missing_columns_supabase.sql` — добавление недостающих колонок в Supabase
- `01_export_supabase.sql` — экспорт данных из Supabase
- `02_amvera_schema.sql` — создание схемы в Amvera
- `README.md` — этот файл

---

## 📚 Подробная инструкция

Смотри `MIGRATION_GUIDE.md` в корне проекта.

---

## ⚠️ Важно

- Не удаляй Supabase проект сразу (подожди неделю)
- Сделай бэкап данных перед миграцией
- Проверь все переменные окружения
- Протестируй локально перед деплоем
