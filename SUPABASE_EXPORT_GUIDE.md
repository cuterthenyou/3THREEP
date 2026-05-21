# 📦 Руководство по экспорту данных из Supabase

## ✅ Проверка скриптов миграции

Скрипты проверены и готовы! Вот что было исправлено:

### Найденные проблемы:
1. ❌ В Supabase схеме отсутствует колонка `avatar_url` в таблице `profiles`
2. ❌ В Supabase схеме отсутствует колонка `product_type` в таблице `products`
3. ✅ Но эти колонки используются в коде приложения!

### Решение:
Добавлены скрипты для подготовки Supabase перед экспортом.

---

## 🚀 Пошаговая инструкция

### Шаг 1: Проверь текущую схему Supabase

Открой Supabase SQL Editor:
https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql/new

Выполни скрипт `migration/00_check_supabase_schema.sql`:

```sql
-- Проверка колонок таблицы profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

**Ожидаемый результат:**
- `id` (uuid)
- `name` (text)
- `email` (text)
- `created_at` (timestamptz)
- `avatar_url` (text) ← **Если этой колонки нет, переходи к Шагу 2**

---

### Шаг 2: Добавь недостающие колонки

Выполни скрипт `migration/00_add_missing_columns_supabase.sql`:

```sql
-- Добавить avatar_url в profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Добавить product_type в products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT;
```

**Результат:**
```
ALTER TABLE
ALTER TABLE
```

---

### Шаг 3: Экспортируй данные

Теперь выполни скрипт `migration/01_export_supabase.sql` **по частям**:

#### 3.1. Экспорт пользователей (auth.users)

```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at;
```

**Действия:**
1. Выполни запрос
2. Нажми "Download CSV" или скопируй результат
3. Сохрани как `users.csv`

---

#### 3.2. Экспорт профилей

```sql
SELECT 
  id,
  name,
  email,
  avatar_url,
  created_at
FROM public.profiles 
ORDER BY created_at;
```

**Действия:**
1. Выполни запрос
2. Сохрани как `profiles.csv`

---

#### 3.3. Экспорт товаров

```sql
SELECT 
  id,
  name,
  description,
  price,
  images,
  sizes,
  colors,
  stock,
  active,
  category,
  product_type,
  created_at
FROM public.products 
ORDER BY created_at;
```

**Действия:**
1. Выполни запрос
2. Сохрани как `products.csv`

---

#### 3.4. Экспорт заказов

```sql
SELECT * FROM public.orders ORDER BY created_at;
```

**Действия:**
1. Выполни запрос
2. Сохрани как `orders.csv`

---

#### 3.5. Экспорт позиций заказов

```sql
SELECT * FROM public.order_items ORDER BY id;
```

**Действия:**
1. Выполни запрос
2. Сохрани как `order_items.csv`

---

#### 3.6. Экспорт сообщений

```sql
SELECT * FROM public.messages ORDER BY created_at;
```

**Действия:**
1. Выполни запрос
2. Сохрани как `messages.csv`

---

### Шаг 4: Проверка количества записей

Выполни финальный запрос для проверки:

```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.orders) as orders_count,
  (SELECT COUNT(*) FROM public.order_items) as order_items_count,
  (SELECT COUNT(*) FROM public.messages) as messages_count;
```

**Запиши результаты!** Они понадобятся для проверки после импорта в Amvera.

---

## 📂 Итоговые файлы

После экспорта у тебя должны быть:

- ✅ `users.csv` — пользователи из auth.users
- ✅ `profiles.csv` — профили
- ✅ `products.csv` — товары
- ✅ `orders.csv` — заказы
- ✅ `order_items.csv` — позиции заказов
- ✅ `messages.csv` — сообщения

---

## 🎯 Следующий шаг

После экспорта переходи к созданию схемы в Amvera PostgreSQL:

```bash
psql postgresql://threep_user:64p-a5R-vuT-8ts@threep-db-threep.db-msk0.amvera.tech:5432/threep < migration/02_amvera_schema.sql
```

Или смотри `NEXT_STEPS.md` для подробной инструкции.

---

## ⚠️ Важно

- Не удаляй данные из Supabase сразу после экспорта
- Сохрани CSV-файлы в надёжном месте
- Проверь, что все файлы скачались полностью
- Запиши количество записей для проверки после импорта
