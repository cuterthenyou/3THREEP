import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { redirect } from 'next/navigation'
import { queryMany, queryOne } from '@/lib/db'
import MenuClient from './MenuClient'

export const dynamic = 'force-dynamic'

export default async function AdminMenuPage() {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) redirect('/admin')

  let allCollections: { slug: string; name: string }[] = []
  let navConfig = { hiddenCollections: [] as string[], customItems: [] as { label: string; href: string }[], collectionsOrder: [] as string[] }
  let menuFooterText = ''

  try {
    const [cats, navRow, footerRow] = await Promise.all([
      queryMany<{ slug: string; name: string }>(
        `SELECT p.category AS slug, COALESCE(cat.name, p.category) AS name
         FROM (SELECT DISTINCT category FROM products WHERE active = true AND category IS NOT NULL) p
         LEFT JOIN categories cat ON cat.slug = p.category
         ORDER BY p.category ASC`
      ),
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'nav_config'`).catch(() => null),
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'menu_footer_text'`).catch(() => null),
    ])
    allCollections = cats
    if (navRow?.value) navConfig = JSON.parse(navRow.value)
    if (footerRow?.value) menuFooterText = footerRow.value
  } catch (e) {
    console.error('[admin/menu]', e)
  }

  return <MenuClient allCollections={allCollections} initialConfig={navConfig} initialFooterText={menuFooterText} />
}
