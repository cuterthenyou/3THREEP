# 🚀 Быстрый старт Yandex Storage

## ✅ Что уже сделано в коде:
- Установлен `@aws-sdk/client-s3`
- Созданы утилиты для работы с Yandex Storage
- Переписаны API routes для загрузки файлов
- Обновлены статические ссылки на hero-видео
- Настроен `next.config.ts`

## 📋 Что нужно сделать тебе:

### 1️⃣ Локально (для разработки)

Создай файл `.env.local` в корне проекта и скопируй содержимое из `SETUP_ENV_LOCAL.txt`

### 2️⃣ В Amvera (для продакшена)

Открой `AMVERA_ENV_SETUP.md` и следуй инструкциям.

**Коротко:**
- **3 переменные** в этап "Сборка" (все `NEXT_PUBLIC_*`)
- **5 переменных** в этап "Запуск" (все Yandex переменные)
- Отметь как секрет: `YANDEX_STORAGE_ACCESS_KEY` и `YANDEX_STORAGE_SECRET_KEY`

### 3️⃣ Проверь публичный доступ к бакету

В Yandex Cloud:
- Object Storage → Buckets → `threep-media`
- Access → Public access → включи **Read**

### 4️⃣ Протестируй

```bash
npm run dev
```

Проверь:
- Hero-видео загружается
- Загрузка товара в `/admin/products` работает
- URL файлов начинаются с `https://storage.yandexcloud.net/threep-media/`

---

## 📁 Полезные файлы:

- `SETUP_ENV_LOCAL.txt` — готовый `.env.local` с твоими ключами
- `AMVERA_ENV_SETUP.md` — подробная инструкция для Amvera
- `YANDEX_STORAGE_SETUP.md` — полная документация по настройке

---

## 🎯 Итог

После выполнения всех шагов:
- ✅ Новые файлы будут загружаться в Yandex Storage
- ✅ Hero-видео грузится из Yandex
- ✅ Старые Supabase URL продолжат работать
- ✅ Проект готов к деплою на Amvera
