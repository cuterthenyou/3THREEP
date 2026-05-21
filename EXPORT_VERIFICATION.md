# ✅ Проверка экспорта данных из Supabase

## 📊 Результаты проверки

Дата: 22 мая 2026, 01:00

### Экспортированные файлы:

| № | Файл | Записей | Размер | Статус |
|---|------|---------|--------|--------|
| 1 | `users.csv` | 3 | 394 bytes | ✅ |
| 2 | `categories_rows.csv` | 2 | 958 bytes | ✅ |
| 3 | `profiles_rows.csv` | 3 | 516 bytes | ✅ |
| 4 | `products_rows.csv` | 4 | 3058 bytes | ✅ |
| 5 | `orders_rows.csv` | 7 | 1209 bytes | ✅ |
| 6 | `order_items_rows.csv` | 9 | 2159 bytes | ✅ |
| 7 | `messages_rows.csv` | 16 | 2860 bytes | ✅ |

**Итого:** 44 записи, 11.1 KB

---

## ✅ Проверка данных

### 1. Users (3 записи)
- ✅ `70f5dc46-2014-4813-a0fc-2abcd1cac320` — yakimowivan@gmail.com
- ✅ `160fe245-8b38-40b4-a2a1-d4e40d55820d` — iakimow2@yandex.ru
- ✅ `9c7e3fd7-a202-42ec-a87a-1f9a10e43eb3` — kerryroutt@gmail.com

### 2. Categories (2 записи)
- ✅ `aero+` — AERO+ (active: true)
- ✅ `soon` — SOON (active: false)

### 3. Profiles (3 записи)
- ✅ Все профили с `avatar_url`
- ✅ 2 профиля с аватарами из Yandex Storage
- ✅ 1 профиль без аватара

### 4. Products (4 товара)
- ✅ Dumbrush — 6333 руб, 6 изображений
- ✅ Mouse Deathtrap — 6333 руб, 3 изображения
- ✅ Dredd Dolphin — 6333 руб, 6 изображений
- ✅ SOON — 1 руб, 1 изображение

### 5. Orders (7 заказов)
- ✅ Все заказы экспортированы

### 6. Order Items (9 позиций)
- ✅ Все позиции заказов экспортированы

### 7. Messages (16 сообщений)
- ✅ Все сообщения экспортированы

---

## 🔍 Обнаруженные проблемы и исправления

### ❌ Проблема 1: Таблица `categories` отсутствовала в схеме миграции

**Решение:**
- ✅ Добавлена таблица `categories` в `migration/02_amvera_schema.sql`
- ✅ Добавлен экспорт категорий в `migration/01_export_supabase.sql`
- ✅ Добавлен индекс `idx_categories_active`

### ✅ Проблема 2: Колонки `avatar_url` и `product_type`

**Статус:** Колонки уже существуют в Supabase!
- ✅ `profiles.avatar_url` — есть
- ✅ `products.product_type` — есть

---

## 📋 Структура данных

### Categories
```
slug (PK) | name | texture_url | logo_top_url | logo_bottom_url | texture_url_2 | texture_url_3 | active
```

### Profiles
```
id (PK) | name | email | avatar_url | created_at
```

### Products
```
id (PK) | name | description | price | images[] | sizes[] | colors[] | stock | active | category | product_type | created_at
```

---

## 🎯 Следующие шаги

### 1. Создай схему в Amvera PostgreSQL

```bash
psql postgresql://threep_user:64p-a5R-vuT-8ts@threep-db-threep.db-msk0.amvera.tech:5432/threep < migration/02_amvera_schema.sql
```

### 2. Импортируй данные в правильном порядке

**ВАЖНО:** Соблюдай порядок из-за внешних ключей!

1. `users.csv` → таблица `users`
2. `categories_rows.csv` → таблица `categories`
3. `profiles_rows.csv` → таблица `profiles`
4. `products_rows.csv` → таблица `products`
5. `orders_rows.csv` → таблица `orders`
6. `order_items_rows.csv` → таблица `order_items`
7. `messages_rows.csv` → таблица `messages`

### 3. Проверь количество записей после импорта

```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM categories) as categories_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM products) as products_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM order_items) as order_items_count,
  (SELECT COUNT(*) FROM messages) as messages_count;
```

**Ожидаемый результат:**
```
users: 3
categories: 2
profiles: 3
products: 4
orders: 7
order_items: 9
messages: 16
```

---

## ✅ Готово к импорту!

Все данные экспортированы корректно. Схема миграции обновлена и включает таблицу `categories`.

Переходи к созданию схемы в Amvera PostgreSQL!
