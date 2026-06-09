-- ════════════════════════════════════════════════════════════════════
-- 09 — Account systems: XP/levels/discounts, achievements, notifications
-- Idempotent: safe to run multiple times.
-- ════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Profiles: gamification cache (источник истины — xp_events) ──────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sparks            INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level             INTEGER NOT NULL DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discount_percent  INTEGER NOT NULL DEFAULT 0;

-- ── XP journal — детерминированный, идемпотентный источник искр ─────────
CREATE TABLE IF NOT EXISTS xp_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source     TEXT NOT NULL,            -- 'order' | 'achievement' | 'manual'
  ref_id     TEXT,                     -- напр. order id (для дедупликации)
  amount     INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Один и тот же источник+ref не начисляется дважды (заказ → искры один раз)
CREATE UNIQUE INDEX IF NOT EXISTS xp_events_source_ref_uniq
  ON xp_events (source, ref_id) WHERE ref_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS xp_events_user_idx ON xp_events (user_id);

-- ── Achievements ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  key            TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  medal_key      TEXT,                 -- идентификатор медальки (svg)
  condition_type TEXT NOT NULL,        -- profile_created|first_purchase|multi_buy|full_collection|game_score
  threshold      INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  active         BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL REFERENCES achievements(key) ON DELETE CASCADE,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  showcased       BOOLEAN NOT NULL DEFAULT false,  -- «витринная» ачивка (как в Steam)
  PRIMARY KEY (user_id, achievement_key)
);

-- ── Notifications (колокольчик в навбаре) ───────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,            -- order_status|chat_message|achievement|level_up
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications (user_id, read, created_at DESC);

-- ── Products: GRADE R «секретка» / coming-soon слот в ЛК ────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN NOT NULL DEFAULT false;

-- ── Конфиг гейміфикации (тюнится из админки в Фазе 7) ───────────────────
--   thresholds[i] — кумулятивные искры для достижения уровня (i+1);
--   за пределами массива: threshold(L) = last + (L - len + 1) * increment_after.
INSERT INTO site_settings (key, value) VALUES
  ('leveling_config',
   '{"spark_per_order":100,"spark_per_extra_unit":20,"thresholds":[0,100,250,450,700,1000,1350,1750,2200,2700],"increment_after":600,"discount_max":13}')
ON CONFLICT (key) DO NOTHING;

-- ── Стартовый набор ачивок ──────────────────────────────────────────────
INSERT INTO achievements (key, title, description, medal_key, condition_type, threshold, sort_order) VALUES
  ('profile_created', 'ПОЗЫВНОЙ ПОЛУЧЕН', 'Создал профиль в THREEP',        'signal',     'profile_created', 0, 10),
  ('first_purchase',  'ПЕРВАЯ ОХОТА',     'Совершил первую покупку',        'first',      'first_purchase',  0, 20),
  ('multi_buy',       'ОПТОВИК',          'Купил 3+ вещей в одном заказе',  'multi',      'multi_buy',       3, 30),
  ('full_collection', 'КОЛЛЕКЦИОНЕР',     'Собрал коллекцию целиком',       'collection', 'full_collection', 0, 40),
  ('game_hunter',     'ОХОТНИК',          'Набрал 50+ очков в игре',        'game',       'game_score',     50, 50)
ON CONFLICT (key) DO NOTHING;
