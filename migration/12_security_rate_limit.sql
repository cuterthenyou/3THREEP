-- ─────────────────────────────────────────────────────────────────────────────
-- 12_security_rate_limit.sql — безопасность бэкенда, чанк #1
--
--   1) rate_limits      — фиксированное окно для анти-брута/спама OTP (по email и IP).
--   2) order_idempotency — дедуп двойного сабмита заказа (Idempotency-Key → order_id).
--
-- Серверный пересчёт суммы заказа (бэк НЕ верит фронту: цены/скидка считаются из БД)
-- схему не меняет — это правки в app/api/orders/route.ts. Идемпотентно: можно
-- прогонять повторно. Применять на Amvera через pgAdmin.
-- ─────────────────────────────────────────────────────────────────────────────

-- Фиксированное окно: одна строка на (bucket, identifier). Когда window_start
-- старше окна — счётчик сбрасывается (логика в lib/rate-limit.ts одним UPSERT).
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket        TEXT NOT NULL,                         -- 'otp_send' | 'otp_verify' | …
  identifier    TEXT NOT NULL,                          -- 'email:foo@bar' | 'ip:1.2.3.4'
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  count         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, identifier)
);

-- Подчистка старых окон (опционально гонять по крону; индекс для этого).
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

-- Дедуп заказов: клиент шлёт Idempotency-Key (UUID на сабмит). Повторный POST с
-- тем же ключом возвращает уже созданный заказ, а не плодит дубль.
CREATE TABLE IF NOT EXISTS order_idempotency (
  key         TEXT PRIMARY KEY,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_idempotency_created ON order_idempotency (created_at);
