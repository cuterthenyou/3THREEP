import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { queryOne, query } from '@/lib/db'

const DEFAULT_CONFIG = { hiddenCollections: [], customItems: [], collectionsOrder: [] }

export async function GET() {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const row = await queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'nav_config'`)
    return NextResponse.json(row?.value ? JSON.parse(row.value) : DEFAULT_CONFIG)
  } catch {
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const config = await req.json()
    await query(
      `INSERT INTO site_settings (key, value) VALUES ('nav_config', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(config)]
    )
    // Сбрасываем кэш главной (revalidate=60) — кастомные пункты/порядок видны сразу
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[nav-config POST]', e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
