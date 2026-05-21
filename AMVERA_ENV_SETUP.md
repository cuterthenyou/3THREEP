# Как добавить переменные окружения в Amvera

## Какие переменные добавлять и в какой этап

### 📦 Этап "Сборка" (Build time)
Эти переменные нужны **во время сборки проекта** (`npm run build`). Они встраиваются в код.

**Добавь в "Сборка":**
```
NEXT_PUBLIC_SUPABASE_URL = https://wfgzofrtiinageegztux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (твой anon key из Amvera)
NEXT_PUBLIC_STORAGE_BASE_URL = https://storage.yandexcloud.net/threep-media
```

**Почему "Сборка"?**
- Все переменные с префиксом `NEXT_PUBLIC_*` используются в клиентском коде (браузере)
- Next.js встраивает их в бандл во время `npm run build`
- Они должны быть доступны на этапе сборки

---

### 🚀 Этап "Запуск" (Runtime)
Эти переменные нужны **во время работы сервера**. Они не попадают в клиентский код.

**Добавь в "Запуск":**
```
SUPABASE_SERVICE_ROLE_KEY = (твой service role key из Amvera)
YANDEX_STORAGE_ENDPOINT = https://storage.yandexcloud.net
YANDEX_STORAGE_BUCKET = threep-media
YANDEX_STORAGE_ACCESS_KEY = твой_yandex_access_key_id
YANDEX_STORAGE_SECRET_KEY = твой_yandex_secret_key
YANDEX_STORAGE_REGION = ru-central1
ADMIN_EMAIL = (твой email из Amvera)
```

**Почему "Запуск"?**
- Эти переменные используются только на сервере (в API routes)
- Они содержат секретные ключи, которые НЕ должны попасть в браузер
- Они нужны только когда сервер обрабатывает запросы

---

## 🔐 Какие переменные отметить как "Это секрет"

**Отметь галочкой "Это секрет":**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (уже отмечен)
- ✅ `YANDEX_STORAGE_ACCESS_KEY` ← **НОВЫЙ**
- ✅ `YANDEX_STORAGE_SECRET_KEY` ← **НОВЫЙ**
- ✅ `TELEGRAM_BOT_TOKEN` (уже отмечен)
- ✅ `WEBHOOK_SECRET` (уже отмечен)
- ✅ `WC_CONSUMER_KEY` (уже отмечен)
- ✅ `WC_CONSUMER_SECRET` (уже отмечен)

**НЕ отмечай как секрет:**
- ❌ `NEXT_PUBLIC_*` — это публичные переменные
- ❌ `ADMIN_EMAIL` — это не секрет
- ❌ `YANDEX_STORAGE_ENDPOINT` — публичный URL
- ❌ `YANDEX_STORAGE_BUCKET` — публичное имя бакета
- ❌ `YANDEX_STORAGE_REGION` — публичный регион

---

## 📝 Пошаговая инструкция

### 1. Добавь переменные для "Сборка"

1. Нажми **"Добавить переменные и секреты"**
2. Выбери этап: **"Сборка"**
3. Добавь по одной:

```
Название: NEXT_PUBLIC_SUPABASE_URL
Значение: https://wfgzofrtiinageegztux.supabase.co
Этап: Сборка
Это секрет: НЕТ
```

```
Название: NEXT_PUBLIC_SUPABASE_ANON_KEY
Значение: sb_publishable_AumgenscTXW2vMPcdMxbOA_tybf45si
Этап: Сборка
Это секрет: НЕТ
```

```
Название: NEXT_PUBLIC_STORAGE_BASE_URL
Значение: https://storage.yandexcloud.net/threep-media
Этап: Сборка
Это секрет: НЕТ
```

### 2. Добавь переменные для "Запуск"

1. Нажми **"Добавить переменные и секреты"**
2. Выбери этап: **"Запуск"**
3. Добавь по одной:

```
Название: YANDEX_STORAGE_ENDPOINT
Значение: https://storage.yandexcloud.net
Этап: Запуск
Это секрет: НЕТ
```

```
Название: YANDEX_STORAGE_BUCKET
Значение: threep-media
Этап: Запуск
Это секрет: НЕТ
```

```
Название: YANDEX_STORAGE_ACCESS_KEY
Значение: твой_yandex_access_key_id
Этап: Запуск
Это секрет: ДА ✓
```

```
Название: YANDEX_STORAGE_SECRET_KEY
Значение: твой_yandex_secret_key
Этап: Запуск
Это секрет: ДА ✓
```

```
Название: YANDEX_STORAGE_REGION
Значение: ru-central1
Этап: Запуск
Это секрет: НЕТ
```

### 3. Перезапусти контейнеры

После добавления всех переменных:
1. Amvera покажет уведомление: **"Для применения изменений необходимо перезапустить контейнеры"**
2. Нажми кнопку перезапуска или передеплой проект

---

## ✅ Итоговый список переменных в Amvera

### Сборка (3 переменные):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STORAGE_BASE_URL` ← **НОВАЯ**

### Запуск (13 переменных):
- `ADMIN_EMAIL`
- `TELEGRAM_THREAD_ID`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_BOT_TOKEN` 🔒
- `WEBHOOK_SECRET` 🔒
- `SUPABASE_SERVICE_ROLE_KEY` 🔒
- `WC_CONSUMER_KEY` 🔒
- `WC_CONSUMER_SECRET` 🔒
- `YANDEX_STORAGE_ENDPOINT` ← **НОВАЯ**
- `YANDEX_STORAGE_BUCKET` ← **НОВАЯ**
- `YANDEX_STORAGE_ACCESS_KEY` 🔒 ← **НОВАЯ**
- `YANDEX_STORAGE_SECRET_KEY` 🔒 ← **НОВАЯ**
- `YANDEX_STORAGE_REGION` ← **НОВАЯ**

🔒 = отмечено как секрет

---

## 🎯 Быстрая шпаргалка

**Правило простое:**
- `NEXT_PUBLIC_*` → **Сборка**
- Всё остальное → **Запуск**
- Ключи и токены → **Секрет ✓**
