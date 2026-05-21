-- Добавление недостающих колонок в Supabase
-- Выполни это ПЕРЕД экспортом данных, если колонки отсутствуют

-- 1. Добавить avatar_url в profiles (если нет)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Добавить product_type в products (если нет)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT;

-- Проверка
SELECT 'profiles' as table_name, column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('avatar_url')
UNION ALL
SELECT 'products' as table_name, column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN ('product_type');
