import { query } from '@/lib/db'

export async function ensureNewsletterTables() {
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_subscription BOOLEAN DEFAULT false`)
  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      subscribed_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_newsletter_subs_email ON newsletter_subscribers(email)`)
}
