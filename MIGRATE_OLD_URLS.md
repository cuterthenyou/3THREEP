# Миграция старых URL с Supabase на Yandex //sdfdfdfdf

## Проблема

Старые товары и аватары в БД содержат URL с Supabase Storage:
```
https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/products/...
```

Новые загрузки идут в Yandex Storage:
```
https://storage.yandexcloud.net/threep-media/products/...
```

## Решение

### Вариант 1: Оставить как есть (рекомендую для начала)

**Плюсы:**
- Ничего не нужно делать
- Оба storage работают параллельно
- Старые файлы остаются доступными

**Минусы:**
- Зависимость от двух сервисов
- Нужно хранить файлы в двух местах

**Когда использовать:**
- Если файлов немного
- Если не хочешь рисковать с миграцией данных
- Если нужно быстро запустить

---

### Вариант 2: Обновить URL в БД (полная миграция)

**Что делает:**
- Заменяет все Supabase URL на Yandex URL в БД
- Обновляет таблицы: `products`, `profiles`, `order_items`

**Требования:**
- Все файлы уже должны быть загружены в Yandex Storage
- У тебя есть доступ к Supabase SQL Editor

**Шаги:**

#### 1. Убедись, что файлы в Yandex

Проверь, что все файлы из Supabase уже скопированы в Yandex Storage:
- `threep-media/products/` — все картинки товаров
- `threep-media/avatars/` — все аватары
- `threep-media/assets/` — hero-видео

#### 2. Выполни SQL-скрипт

1. Открой Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql
   ```

2. Скопируй содержимое файла `UPDATE_URLS_TO_YANDEX.sql`

3. Вставь в SQL Editor и нажми **Run**

4. Проверь результат:
   ```sql
   SELECT id, name, images FROM products LIMIT 5;
   SELECT id, avatar_url FROM profiles WHERE avatar_url IS NOT NULL LIMIT 5;
   ```

#### 3. Проверь сайт

1. Открой https://3threep.ru/
2. Открой DevTools → Network
3. Проверь, что картинки грузятся с `storage.yandexcloud.net`

#### 4. Если что-то пошло не так

**Откат изменений:**

```sql
-- Вернуть Supabase URL в products
UPDATE products
SET images = (
  SELECT jsonb_agg(
    replace(
      elem::text,
      '"https://storage.yandexcloud.net/threep-media/products/',
      '"https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/products/'
    )::jsonb
  )
  FROM jsonb_array_elements(images) elem
)
WHERE images::text LIKE '%storage.yandexcloud.net%';

-- Вернуть Supabase URL в profiles
UPDATE profiles
SET avatar_url = replace(
  avatar_url,
  'https://storage.yandexcloud.net/threep-media/avatars/',
  'https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/avatars/'
)
WHERE avatar_url LIKE '%storage.yandexcloud.net%';
```

---

## Рекомендация

**Для начала используй Вариант 1** (оставить как есть):
- Старые товары грузятся с Supabase
- Новые товары грузятся с Yandex
- Оба работают параллельно

**Потом, когда убедишься что Yandex работает стабильно:**
- Выполни SQL-скрипт из Варианта 2
- Полностью перейди на Yandex
- Можешь отключить Supabase Storage

---

## Проверка текущего состояния

Проверь, сколько товаров с каким URL:

```sql
-- Товары с Supabase URL
SELECT COUNT(*) as supabase_count
FROM products
WHERE images::text LIKE '%wfgzofrtiinageegztux.supabase.co%';

-- Товары с Yandex URL
SELECT COUNT(*) as yandex_count
FROM products
WHERE images::text LIKE '%storage.yandexcloud.net%';

-- Все товары
SELECT COUNT(*) as total FROM products;
```
