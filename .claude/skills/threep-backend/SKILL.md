---
name: threep-backend
description: 3THREEP backend conventions — Next.js App Router data flow, the raw-SQL db layer (queryOne/queryMany), PostgreSQL schema, site_settings key-value store, auth (OTP) and admin patterns. Use when touching API routes, DB queries, migrations, server components, settings or auth on the 3THREEP project.
---

# THREEP — Backend & data conventions

Стек: **Next.js 16 App Router + TypeScript**, **PostgreSQL** (Amvera, pooled) через **сырой SQL** (без ORM), **NextAuth 5 beta** (email + 6-значный OTP). Файлы S3/Yandex через `@aws-sdk/client-s3` + `sharp`. См. [[threep-design]].

## Слой данных — `lib/db.ts`
- `queryOne(sql, params?)` → одна строка или `null`
- `queryMany(sql, params?)` → массив строк
- Параметризованные запросы (`$1, $2`), пул на 20 коннектов. Используй ИХ для всех новых запросов — не открывай свои коннекты.
- Типы — в `lib/types.ts` (`Order`, `Profile`, `OrderStatus`, `ORDER_STATUS_LABELS`, `STATUS_COLORS` и т.д.).

## Поток данных (server/client split)
- `page.tsx` (server component) тянет данные через `lib/db` + `auth()` и передаёт пропсами в `*Client.tsx` (`'use client'`), который держит состояние/интерактив. Пример: `app/account/page.tsx` → `AccountClient.tsx`.
- API-роуты в `app/api/**/route.ts` (методы GET/POST/PATCH/DELETE).

## Схема (PostgreSQL, `migration/02_amvera_schema.sql` и др.)
`users` (auth) · `profiles` (id→users, name, email, avatar_url) · `products` (price INT, images[], sizes[], colors[], stock, active, category, product_type, grade, series, article, material, cut, bg_url[_dark]) · `orders` (user_id, status `new|paid|in_progress|shipped|delivered|cancelled`, total, delivery_address, tracking_number, comment) · `order_items` (order_id, product_id, snapshot полей + price) · `messages` (чат заказа: order_id, sender_id, is_admin, text) · `magic_links` (OTP, SHA-256) · `categories` (slug PK = коллекции, текстуры/лого/modal_bg) · `site_settings` (key-value) · `newsletter_subscribers` · `page_views` · `events` (funnel + `bat_score`, meta JSONB).

«Коллекция» = строка в `categories`; товары связаны через `products.category` (slug) + `product_type` + `grade`.

## Миграции
Новые `.sql` в `migration/` по образцу существующих (нумерация по порядку). Идемпотентность: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`. Применять командой, согласованной с пользователем (БД на Amvera).

## site_settings (key-value store)
Все визуальные/контентные настройки — строки (JSON для массивов). Примеры ключей: `color_*_light/dark`, `font_*`, `grain_opacity_*`, `grain_size`, `hero_video_url`/`_mp4`/`hero_poster_url`, `profile_bg_url[_dark]`, `ticker_texts`, `ticker_texts_account`, `loading_phrases`, `custom_cursor_*`. Читаются публично через `/api/site-settings`, пишутся админом через `/api/admin/site-settings`. Динамические темы генерит `components/ThemeStyles.tsx`. **Для нового настраиваемого параметра — заводи ключ в settings, а не хардкодь.**

## Auth
NextAuth 5 (`lib/auth.ts`), кастомный email-провайдер: ввод email → 6-значный код (хэш SHA-256 в `magic_links`) → вход. Письма — `lib/email.ts` (Nodemailer). Проверка существования email — `/api/auth/check-email`. UI — `app/auth/AuthForm.tsx` (автосабмит, вставка, shake).

## Admin
Доступ по списку email в `ADMIN_EMAIL` (`lib/adminAuth.ts` / `lib/isAdmin.ts`). Страницы в `app/admin/*`: dashboard (аналитика + топ игры), `site` (визуал/настройки, `SiteClient.tsx`), products, collections, orders, newsletter, media, texts, emojis, menu.

## Конвенции
- Деньги: цены INT, кратны 3; скидки округляй **вниз** до кратного 3.
- Снапшоть цену/имя товара в `order_items` при создании заказа (история не должна плыть).
- Не дублируй начисления (идемпотентность через таблицы-журналы вроде `xp_events`).
