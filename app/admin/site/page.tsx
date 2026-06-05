import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import SiteClient from './SiteClient'

export default async function SitePage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin')

  let settings: Record<string, string | null> = {}
  try {
    const rows = await queryMany('SELECT key, value FROM site_settings')
    for (const row of rows) settings[row.key] = row.value
  } catch { /* table may not exist yet if migration not run */ }

  return <SiteClient initialSettings={settings} />
}
