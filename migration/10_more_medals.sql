-- ── Доп. медали для ЛК (Phase 3) ────────────────────────────────────────────
-- Идемпотентно: ON CONFLICT DO NOTHING. Применять на живой БД (Amvera) и локально.
-- Медали показываются в ряду ачивок ЛК; награждение — в app/account/page.tsx.

INSERT INTO achievements (key, title, description, medal_key, condition_type, threshold, sort_order) VALUES
  ('game_master', 'МАСТЕР ОХОТЫ',  'Набрал 100+ очков в игре «Охота»', 'skull', 'game_score',  100, 60),
  ('loyal_buyer', 'СВОЙ ЧЕЛОВЕК',  'Оформил 5+ оплаченных заказов',    'crown', 'order_count', 5,   70)
ON CONFLICT (key) DO NOTHING;
