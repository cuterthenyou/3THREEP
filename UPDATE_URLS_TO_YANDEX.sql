-- SQL скрипт для замены Supabase URL на Yandex URL в БД
-- Выполни это в Supabase SQL Editor: https://supabase.com/dashboard/project/wfgzofrtiinageegztux/sql

-- 1. Обновить URL картинок товаров в таблице products
-- Заменяет https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/products/
-- на https://storage.yandexcloud.net/threep-media/products/

UPDATE products
SET images = (
  SELECT array_agg(
    replace(
      elem,
      'https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/products/',
      'https://storage.yandexcloud.net/threep-media/products/'
    )
  )
  FROM unnest(images) AS elem
)
WHERE array_to_string(images, ',') LIKE '%wfgzofrtiinageegztux.supabase.co%';

-- 2. Обновить URL аватаров в таблице profiles
UPDATE profiles
SET avatar_url = replace(
  avatar_url,
  'https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/avatars/',
  'https://storage.yandexcloud.net/threep-media/avatars/'
)
WHERE avatar_url LIKE '%wfgzofrtiinageegztux.supabase.co%';

-- 3. Обновить URL картинок товаров в order_items (если есть)
UPDATE order_items
SET product_image = replace(
  product_image,
  'https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/products/',
  'https://storage.yandexcloud.net/threep-media/products/'
)
WHERE product_image LIKE '%wfgzofrtiinageegztux.supabase.co%';

-- Проверка результатов:
-- SELECT id, name, images FROM products LIMIT 5;
-- SELECT id, avatar_url FROM profiles WHERE avatar_url IS NOT NULL LIMIT 5;
