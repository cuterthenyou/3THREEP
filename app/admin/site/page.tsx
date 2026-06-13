import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import SiteClient, { type AdminAchievement } from './SiteClient'
import type { CustomFont } from '@/components/ThemeStyles'

export default async function SitePage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin')

  let settings: Record<string, string | null> = {}
  let customFonts: CustomFont[] = []
  let achievements: AdminAchievement[] = []
  try {
    const [settingsRows, fontRows, achRows] = await Promise.all([
      queryMany('SELECT key, value FROM site_settings'),
      queryMany('SELECT id, name, url FROM custom_fonts ORDER BY id'),
      queryMany<AdminAchievement>(
        `SELECT key, title, description, medal_key, condition_type, threshold
         FROM achievements ORDER BY sort_order, key`
      ),
    ])
    for (const row of settingsRows) settings[row.key] = row.value
    customFonts = fontRows
    achievements = achRows
  } catch { /* tables may not exist yet if migration not run */ }

  return <SiteClient initialSettings={settings} initialCustomFonts={customFonts} initialAchievements={achievements} variant="site" />
}
