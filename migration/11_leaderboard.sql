-- ─────────────────────────────────────────────────────────────────────────────
-- 11_leaderboard.sql — выделенная таблица лидерборда игры «Охота»
--
-- Формат строки: Место · Никнейм · Уровень(профиля) · Платформа · Сложность · Очки
-- Пишется в конце игры через /api/leaderboard (платформа из UA на сервере,
-- ник+уровень из профиля сессии — клиент НЕ может подделать). Гости — nickname
-- = NULL, level = NULL. Идемпотентно: можно прогонять повторно.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL у гостей
  nickname    TEXT,                                          -- снапшот имени на момент игры
  level       INTEGER,                                       -- уровень профиля на момент игры
  platform    TEXT NOT NULL DEFAULT 'desktop',               -- desktop | mobile (из UA)
  difficulty  TEXT NOT NULL DEFAULT 'normal',                -- normal | death
  score       INTEGER NOT NULL,
  win         BOOLEAN NOT NULL DEFAULT false,                -- пройден ли финал
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Топы: быстрый ORDER BY score DESC внутри каждой доски (платформа+сложность).
CREATE INDEX IF NOT EXISTS idx_leaderboard_board ON leaderboard (platform, difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user  ON leaderboard (user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard (created_at DESC);
