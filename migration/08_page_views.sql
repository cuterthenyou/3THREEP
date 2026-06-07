-- Page views tracking table
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path       TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session    ON page_views(session_id);

-- New site_settings keys
INSERT INTO site_settings (key, value) VALUES
  ('grain_opacity_light', '0.08'),
  ('grain_opacity_dark',  '0.055'),
  ('glitter_enabled',     'true'),
  ('glitter_intensity',   '50')
ON CONFLICT (key) DO NOTHING;
