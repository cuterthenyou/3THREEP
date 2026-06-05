import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import EmojisClient from './EmojisClient'

export const dynamic = 'force-dynamic'

export default async function EmojisAdminPage() {
  await requireAdmin()
  const emojis = await queryMany<{ id: number; name: string; url: string; created_at: string }>(
    'SELECT id, name, url, created_at FROM custom_emojis ORDER BY created_at DESC'
  )
  return <EmojisClient initialEmojis={emojis} />
}
