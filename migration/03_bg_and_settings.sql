-- Add transparent PNG background URL to products (card background in catalog)
ALTER TABLE products ADD COLUMN IF NOT EXISTS bg_url TEXT;

-- Add transparent PNG background URL to categories (modal background)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS modal_bg_url TEXT;

-- Global site settings (hero video, profile background, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO site_settings (key, value) VALUES
  ('hero_video_url', 'https://storage.yandexcloud.net/threep-media/assets/hero.webm'),
  ('profile_bg_url', NULL)
ON CONFLICT (key) DO NOTHING;
