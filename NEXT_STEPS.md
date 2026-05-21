# ✅ Что уже готово:

1. ✅ БД создана на Amvera: `threep-db`
2. ✅ Connection String готов
3. ✅ NEXTAUTH_SECRET сгенерирован
4. ✅ Yandex SMTP настроен
5. ✅ `.env.migration.example` заполнен

---

# 📝 Следующие шаги:

## 1. Создай `.env.local`

**ВАЖНО:** Файл `.env.local` защищён `.gitignore` и не коммитится в Git!

Открой файл `CREATE_ENV_LOCAL.txt` и скопируй всё содержимое в новый файл `.env.local` в корне проекта.

**Или создай вручную:**

```bash
# В корне проекта g:\Merch\threep создай файл .env.local
```

И скопируй туда содержимое из `CREATE_ENV_LOCAL.txt`.

---

## 2. Установи зависимости

```bash
npm install
```

Это установит:
- `next-auth@5.0.0-beta.25`
- `nodemailer@6.9.16`
- `pg@8.13.1`
- И их типы

---

## 3. Экспорт данных из Supabase

### 3.1. Открой Supabase SQL Editor
https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql/new

### 3.2. Выполни скрипт экспорта
Открой файл `migration/01_export_supabase.sql` и выполни его в SQL Editor.

Это создаст CSV-файлы для экспорта:
- `profiles.csv`
- `products.csv`
- `orders.csv`
- `order_items.csv`
- `messages.csv`

### 3.3. Скачай CSV
Скачай все CSV-файлы из результатов запроса.

---

## 4. Создай схему в Amvera PostgreSQL

```bash
psql postgresql://threep_user:64p-a5R-vuT-8ts@threep-db-threep.db-msk0.amvera.tech:5432/threep < migration/02_amvera_schema.sql
```

Или через pgAdmin/DBeaver:
1. Подключись к БД
2. Открой `migration/02_amvera_schema.sql`
3. Выполни скрипт

---

## 5. Импортируй данные в Amvera

Через pgAdmin/DBeaver:
1. Открой таблицу `users`
2. Import Data → выбери `profiles.csv`
3. Повтори для всех таблиц

---

## 6. Тестируй локально

```bash
npm run dev
```

Открой http://localhost:3000/auth и попробуй войти через Magic Link!

---

## 7. Деплой на Amvera

После успешного теста:

```bash
git add .
git commit -m "Migrate to Amvera PostgreSQL + NextAuth"
git push origin main
```

Amvera автоматически подхватит изменения.

**Не забудь добавить переменные окружения в Amvera!**

---

# 🔧 Полезные команды

## Проверить подключение к БД
```bash
psql postgresql://threep_user:64p-a5R-vuT-8ts@threep-db-threep.db-msk0.amvera.tech:5432/threep
```

## Посмотреть таблицы
```sql
\dt
```

## Выйти из psql
```
\q
```

---

# 📚 Документация

- `MIGRATION_GUIDE.md` — подробное руководство
- `MIGRATION_STATUS.md` — статус миграции
- `migration/README.md` — быстрый старт

---

# ⚠️ Важно

- Не удаляй Supabase проект сразу (подожди неделю)
- Сделай бэкап всех данных
- Проверь все переменные окружения
- Тестируй локально перед деплоем
