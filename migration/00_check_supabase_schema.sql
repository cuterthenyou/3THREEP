-- Проверка текущей схемы Supabase
-- Выполни это в Supabase SQL Editor

-- 1. Проверка колонок таблицы profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Проверка колонок таблицы products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Проверка колонок таблицы orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- 4. Проверка колонок таблицы order_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
ORDER BY ordinal_position;

-- 5. Проверка колонок таблицы messages
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;
