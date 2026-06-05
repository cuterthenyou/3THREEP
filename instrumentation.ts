export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { pool } = await import('./lib/db')
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS bg_url TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS modal_bg_url TEXT;
      CREATE TABLE IF NOT EXISTS site_settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
      INSERT INTO site_settings (key, value) VALUES
        ('hero_video_url', 'https://storage.yandexcloud.net/threep-media/assets/hero.webm'),
        ('profile_bg_url', NULL)
      ON CONFLICT (key) DO NOTHING;
    `).catch((e: Error) => console.error('[migration] failed:', e.message))
  }
}
