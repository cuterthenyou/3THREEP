import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import SiteClient from './SiteClient'
import type { CustomFont } from '@/components/ThemeStyles'

export default async function SitePage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin')

  let settings: Record<string, string | null> = {}
  let customFonts: CustomFont[] = []
  try {
    const [settingsRows, fontRows] = await Promise.all([
      queryMany('SELECT key, value FROM site_settings'),
      queryMany('SELECT id, name, url FROM custom_fonts ORDER BY id'),
    ])
    for (const row of settingsRows) settings[row.key] = row.value
    customFonts = fontRows
  } catch { /* tables may not exist yet if migration not run */ }

  return <SiteClient initialSettings={settings} initialCustomFonts={customFonts} />
}
