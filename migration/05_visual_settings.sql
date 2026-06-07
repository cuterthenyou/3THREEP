-- Visual settings: logos, colors, fonts, effects
INSERT INTO site_settings (key, value) VALUES
  ('logo_icon_url',       NULL),
  ('logo_text_url',       NULL),
  ('color_bg_light',      NULL),
  ('color_text_light',    NULL),
  ('color_accent_light',  NULL),
  ('color_bg_dark',       NULL),
  ('color_text_dark',     NULL),
  ('color_accent_dark',   NULL),
  ('font_heading',        NULL),
  ('font_body',           NULL),
  ('font_price',          NULL),
  ('grain_opacity',       NULL),
  ('border_radius_scale', NULL),
  ('animation_speed',     NULL)
ON CONFLICT (key) DO NOTHING;
