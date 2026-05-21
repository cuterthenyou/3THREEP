# 📊 Статус миграции с Supabase на Amvera

## ✅ Что уже сделано (код готов)

### 1. Инфраструктура
- ✅ `package.json` — добавлены зависимости (next-auth, pg, nodemailer)
- ✅ `lib/db.ts` — PostgreSQL клиент с пулом подключений
- ✅ `lib/email.ts` — отправка email через Yandex SMTP
- ✅ `lib/auth.ts` — NextAuth конфигурация с Magic Link
- ✅ `app/api/auth/[...nextauth]/route.ts` — API routes для NextAuth

### 2. Миграционные скрипты
- ✅ `migration/01_export_supabase.sql` — экспорт данных из Supabase
- ✅ `migration/02_amvera_schema.sql` — схема БД для Amvera
- ✅ `migration/README.md` — быстрый старт

### 3. Документация
- ✅ `MIGRATION_GUIDE.md` — подробное руководство по миграции
- ✅ `.env.migration.example` — пример переменных окружения
- ✅ `amvera.env.example` — обновлён для новой инфраструктуры

---

## ⏳ Что нужно сделать вручную

### 1. Установить зависимости
```bash
npm install
```

Это установит:
- `next-auth@5.0.0-beta.25`
- `nodemailer@6.9.16`
- `pg@8.13.1`
- И их типы

### 2. Создать БД на Amvera
1. Открой https://amvera.ru/databases
2. Создай PostgreSQL БД (регион Москва_0)
3. Скопируй Connection String

### 3. Настроить Yandex SMTP
1. Открой https://id.yandex.ru/security
2. Создай пароль приложения
3. Скопируй пароль

### 4. Создать .env.local
```bash
cp .env.migration.example .env.local
```

Заполни все переменные (см. `MIGRATION_GUIDE.md`)

### 5. Экспортировать данные из Supabase
Выполни `migration/01_export_supabase.sql` в Supabase SQL Editor

### 6. Создать схему в Amvera PostgreSQL
```bash
psql $DATABASE_URL < migration/02_amvera_schema.sql
```

### 7. Импортировать данные
Вручную импортируй CSV из Supabase в Amvera

---

## 🚧 Что ещё нужно переписать (код)

### Файлы, которые используют Supabase и нужно переписать на PostgreSQL:

**API Routes:**
- `app/api/admin/products/route.ts` — CRUD товаров
- `app/api/admin/products/[id]/route.ts` — редактирование товара
- `app/api/admin/orders/route.ts` — список заказов
- `app/api/admin/orders/[id]/route.ts` — детали заказа
- `app/api/admin/collections/route.ts` — коллекции
- `app/api/admin/media/route.ts` — медиа
- `app/api/orders/route.ts` — создание заказа
- `app/api/account/avatar/route.ts` — загрузка аватара (уже использует Yandex Storage, но нужно обновить БД запрос)

**Server Components:**
- `app/account/page.tsx` — профиль пользователя
- `app/account/orders/[id]/page.tsx` — детали заказа
- `app/admin/products/page.tsx` — админка товаров
- `app/admin/orders/page.tsx` — админка заказов
- `app/admin/orders/[id]/page.tsx` — админка деталей заказа
- `app/admin/collections/page.tsx` — админка коллекций

**Middleware:**
- `proxy.ts` — проверка авторизации (заменить `supabase.auth.getUser()` на `auth()`)

**Client Components:**
- `app/auth/AuthForm.tsx` — форма входа (переписать на NextAuth)
- `app/account/AccountClient.tsx` — клиентская часть профиля
- `app/admin/orders/[id]/OrderAdminClient.tsx` — клиентская часть админки заказа

---

## 📝 Следующие шаги

### Сейчас:
1. **Установи зависимости**: `npm install`
2. **Создай БД на Amvera** и получи Connection String
3. **Настрой Yandex SMTP** и получи пароль приложения
4. **Создай `.env.local`** с правильными переменными

### Потом:
5. **Экспортируй данные** из Supabase
6. **Создай схему** в Amvera PostgreSQL
7. **Импортируй данные** в Amvera
8. **Переписываем код** (API routes, components, proxy.ts)
9. **Тестируем локально**
10. **Деплоим на Amvera**

---

## 🎯 Оценка оставшегося времени

| Задача | Время |
|--------|-------|
| Установка зависимостей | 5 мин |
| Создание БД на Amvera | 10 мин |
| Настройка Yandex SMTP | 10 мин |
| Экспорт данных из Supabase | 15 мин |
| Импорт данных в Amvera | 20 мин |
| Переписывание API routes | 2 часа |
| Переписывание components | 1 час |
| Обновление proxy.ts | 30 мин |
| Переписывание AuthForm | 1 час |
| Тестирование | 30 мин |
| Деплой | 15 мин |
| **ИТОГО** | **~6 часов** |

---

## 📞 Нужна помощь?

Смотри подробные инструкции:
- `MIGRATION_GUIDE.md` — полное руководство
- `migration/README.md` — быстрый старт
- `.env.migration.example` — пример переменных

---

## ⚠️ Важно

- Не удаляй Supabase проект сразу (подожди неделю после миграции)
- Сделай бэкап всех данных перед началом
- Тестируй локально перед деплоем на продакшен
- Все секретные ключи храни в `.env.local` (не коммить в Git!)
