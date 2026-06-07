CREATE TABLE IF NOT EXISTS custom_fonts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
