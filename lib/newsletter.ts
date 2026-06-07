import { query } from '@/lib/db'

let tablesReady = false

export async function ensureNewsletterTables() {
  if (tablesReady) return
  // ALTER TABLE and CREATE TABLE are independent — run in parallel
  await Promise.all([
    query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_subscription BOOLEAN DEFAULT false`),
    query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        subscribed_at TIMESTAMPTZ DEFAULT now()
      )
    `),
  ])
  // Index depends on the table existing
  await query(`CREATE INDEX IF NOT EXISTS idx_newsletter_subs_email ON newsletter_subscribers(email)`)
  tablesReady = true
}
