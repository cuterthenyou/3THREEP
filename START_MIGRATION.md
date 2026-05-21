# 🚀 СТАРТ МИГРАЦИИ - БЫСТРАЯ ИНСТРУКЦИЯ

## ✅ Всё готово к запуску!

Проверено:
- ✅ `.env.local` создан
- ✅ CSV файлы экспортированы (7 файлов, 44 записи)
- ✅ Скрипт миграции готов
- ✅ БД Amvera PostgreSQL доступна

---

## 🎯 ЗАПУСК В 2 КОМАНДЫ:

### 1. Установи зависимости (если ещё не установлены)

```bash
npm install
```

### 2. Запусти миграцию

```bash
npm run migrate
```

**ВСЁ!** Скрипт сделает всё автоматически! ✨

---

## 📊 Что произойдёт:

1. ✅ Подключение к Amvera PostgreSQL
2. ✅ Создание 8 таблиц (users, categories, profiles, products, orders, order_items, messages, magic_links)
3. ✅ Импорт 44 записей из CSV
4. ✅ Проверка данных
5. ✅ Отчёт о миграции

**Время выполнения:** ~10-30 секунд

---

## 🎉 После успешной миграции:

### Запусти приложение локально:

```bash
npm run dev
```

### Проверь работу:

1. **Авторизация:** http://localhost:3000/auth
   - Введи email: `iakimow2@yandex.ru`
   - Получи Magic Link на почту
   - Войди в систему

2. **Профиль:** http://localhost:3000/account
   - Проверь, что профиль загружается
   - Проверь аватар (если есть)

3. **Главная страница:** http://localhost:3000
   - Проверь, что товары отображаются
   - Проверь изображения из Yandex Storage

---

## ⚠️ Если что-то пошло не так:

### Ошибка: "relation already exists"

Таблицы уже созданы. Очисти БД и запусти заново:

```bash
npm run clean-db
npm run migrate
```

### Ошибка: "CSV файл не найден"

Проверь, что все CSV файлы в папке `Supabase CSV/`:
- users.csv
- categories_rows.csv
- profiles_rows.csv
- products_rows.csv
- orders_rows.csv
- order_items_rows.csv
- messages_rows.csv

### Ошибка подключения к БД

Проверь `.env.local`:
```env
DATABASE_URL=postgresql://threep_user:64p-a5R-vuT-8ts@threep-db-threep.db-msk0.amvera.tech:5432/threep
```

---

## 📝 Подробная документация:

- `MIGRATION_RUN.md` — подробная инструкция по миграции
- `EXPORT_VERIFICATION.md` — отчёт о проверке экспорта
- `NEXT_STEPS.md` — что делать после миграции

---

## 🚀 ГОТОВ? ЗАПУСКАЙ!

```bash
npm run migrate
```

Жди зелёных галочек! ✅✅✅
