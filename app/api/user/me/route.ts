import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getLevel, getDiscount, parseLevelingConfig } from '@/lib/leveling'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ user: null })

    const [profile, cfgRow] = await Promise.all([
      queryOne<{ name: string | null; sparks: number | null; discount_percent: number | null }>(
        'SELECT name, sparks, discount_percent FROM profiles WHERE id = $1', [session.user.id]
      ),
      queryOne<{ value: string }>(
        `SELECT value FROM site_settings WHERE key = 'leveling_config'`
      ).catch(() => null),
    ])

    const display = profile?.name ?? session.user.email?.split('@')[0] ?? 'user'
    const cfg = parseLevelingConfig(cfgRow?.value)
    const level = getLevel(profile?.sparks ?? 0, cfg)
    // Совпадает с каталогом/ЛК: кэш discount_percent, иначе считаем от уровня.
    const discount = profile?.discount_percent && profile.discount_percent > 0
      ? profile.discount_percent
      : getDiscount(level, cfg)

    return NextResponse.json({ user: { name: display, level, discount } })
  } catch {
    return NextResponse.json({ user: null })
  }
}
