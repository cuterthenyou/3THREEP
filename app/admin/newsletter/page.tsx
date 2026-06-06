import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import { ensureNewsletterTables } from '@/lib/newsletter'
import NewsletterClient from './NewsletterClient'

export const dynamic = 'force-dynamic'

export interface Subscriber {
  email: string
  subscribed_at: string
  name: string | null
}

export default async function NewsletterAdminPage() {
  await requireAdmin()
  await ensureNewsletterTables()
  const subscribers = await queryMany<Subscriber>(
    `SELECT ns.email, ns.subscribed_at, u.name
     FROM newsletter_subscribers ns
     LEFT JOIN users u ON u.id = ns.user_id
     ORDER BY ns.subscribed_at DESC`
  )
  return <NewsletterClient subscribers={subscribers} />
}
