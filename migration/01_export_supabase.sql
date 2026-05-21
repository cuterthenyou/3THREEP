-- Экспорт данных из Supabase для миграции на Amvera
-- Выполни это в Supabase SQL Editor: https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql

-- ВАЖНО: Перед экспортом выполни 00_add_missing_columns_supabase.sql
-- чтобы добавить недостающие колонки (avatar_url, product_type)

-- 1. Экспорт пользователей из auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at;

-- Сохрани результат как CSV или скопируй в Excel

-- 2. Экспорт профилей
SELECT 
  id,
  name,
  email,
  avatar_url,
  created_at
FROM public.profiles 
ORDER BY created_at;

-- 3. Экспорт категорий
SELECT 
  slug,
  name,
  texture_url,
  logo_top_url,
  logo_bottom_url,
  texture_url_2,
  texture_url_3,
  active
FROM public.categories
ORDER BY slug;

-- 4. Экспорт товаров
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

-- 5. Экспорт заказов
SELECT * FROM public.orders ORDER BY created_at;

-- 6. Экспорт позиций заказов
SELECT * FROM public.order_items ORDER BY id;

-- 7. Экспорт сообщений
SELECT * FROM public.messages ORDER BY created_at;

-- 8. Проверка количества записей
SELECT 
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.orders) as orders_count,
  (SELECT COUNT(*) FROM public.order_items) as order_items_count,
  (SELECT COUNT(*) FROM public.messages) as messages_count;
