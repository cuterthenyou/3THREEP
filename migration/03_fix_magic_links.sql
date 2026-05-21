-- Исправление таблицы magic_links: добавляем UNIQUE constraint на email

-- Удаляем старую таблицу
DROP TABLE IF EXISTS magic_links;

-- Создаём заново с правильной структурой
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
