import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountClient from './AccountClient'
import { queryOne, queryMany } from '@/lib/db'
import { parseLevelingConfig, levelProgress, getDiscount, getTier, sparksForOrder } from '@/lib/leveling'
import type { Order } from '@/lib/types'

// Искры начисляются только за доставленные заказы (анти-чит) — fallback
// для пользователей до бэкфилла должен считать по тому же правилу.
const XP_STATUSES = ['delivered']

export default async function AccountPage() {
  const session = await auth()
  console.log('[ACCOUNT] session exists:', !!session, '| user id:', session?.user?.id ?? 'none', '| email:', session?.user?.email ?? 'none')

  if (!session?.user) {
    console.log('[ACCOUNT] no session → redirect to auth')
    redirect('/auth?callbackUrl=/account')
  }

  const user = {
    id: session.user.id,
    email: session.user.email ?? '',
  }

  const [profile, orders, settingsRows, userRow, catalogProductsRaw, catalogCategoriesRaw] = await Promise.all([
    queryOne(`SELECT * FROM profiles WHERE id = $1`, [user.id]),
    queryMany(
      `SELECT o.*,
        COALESCE(
          json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS order_items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user.id]
    ),
    queryMany(`SELECT key, value FROM site_settings`).catch(() => [] as Array<{key: string; value: string | null}>),
    queryOne(`SELECT newsletter_subscription FROM users WHERE id = $1`, [user.id]).catch(() => null),
    queryMany(`SELECT * FROM products WHERE active = true OR coming_soon = true ORDER BY created_at`).catch(() => [] as any[]),
    queryMany(`SELECT * FROM categories`).catch(() => [] as any[]),
  ])

  // Коллекции = активные категории, у которых есть товары
  const inactiveCatSlugs = new Set(
    catalogCategoriesRaw.filter((c: { active?: boolean }) => c.active === false).map((c: { slug: string }) => c.slug)
  )
  const catalogProducts = catalogProductsRaw.filter((p: { category: string }) => !inactiveCatSlugs.has(p.category))
  const catalogCategories = catalogCategoriesRaw.filter((c: { active?: boolean }) => c.active !== false)

  const profileBg = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'profile_bg_url')?.value ?? null
  const profileBgDark = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'profile_bg_url_dark')?.value ?? null
  const TICKER_DEFAULTS = [
    'THREEP — ЭТО СОСТОЯНИЕ ДУШИ',
    'НОВАЯ ДРОПА УЖЕ БЛИЗКО',
    'STREETWEAR ДЛЯ ТЕХ КТО ЧУВСТВУЕТ А НЕ ПРОСТО НОСИТ',
    'СДЕЛАНО ПОД ВЛИЯНИЕМ АТМОСФЕРЫ',
    'КАЖДАЯ ВЕЩЬ — ЭТО ИСТОРИЯ',
    'UNDERGROUND. ЭКСПЕРИМЕНТАЛЬНО. ЖИВО.',
    'ЕСЛИ ВИДИШЬ ЭТО — ТЫ УЖЕ ЧАСТЬ THREEP',
  ]
  const tickerRaw = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'ticker_texts')?.value ?? null
  const tickerTexts: string[] = tickerRaw ? JSON.parse(tickerRaw) : TICKER_DEFAULTS

  const ACCOUNT_TICKER_DEFAULTS = [
    'ТВОЙ ПРОФИЛЬ — ТВОЯ ИСТОРИЯ',
    'УРОВЕНЬ РАСТЁТ С КАЖДЫМ ЗАКАЗОМ',
    'THREEP COMMUNITY MEMBER',
    'СОБЕРИ ВСЕ КОЛЛЕКЦИИ',
    'СТАТУС ОБНОВЛЯЕТСЯ',
  ]
  const accountTickerRaw = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'ticker_texts_account')?.value ?? null
  const accountTickerTexts: string[] = accountTickerRaw ? JSON.parse(accountTickerRaw) : ACCOUNT_TICKER_DEFAULTS

  // ── Геймификация: уровень/искры/скидка ──────────────────────────────
  const levelingRaw = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'leveling_config')?.value ?? null
  const cfg = parseLevelingConfig(levelingRaw)
  // Источник истины — кэш profiles.sparks; для пользователей до бэкфилла
  // (кэш ещё 0) выводим значение из оплаченных заказов по той же формуле.
  let sparks = profile?.sparks ?? 0
  if (!sparks) {
    sparks = orders
      .filter((o: Order) => XP_STATUSES.includes(o.status))
      .reduce((sum: number, o: Order) => {
        const units = (o.order_items ?? []).reduce((q, i) => q + (i.quantity ?? 0), 0)
        return sum + sparksForOrder(units, cfg)
      }, 0)
  }
  const progress = levelProgress(sparks, cfg)
  const discount = getDiscount(progress.level, cfg)
  const tier = getTier(progress.level)

  return (
    <AccountClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      orders={orders}
      profileBg={profileBg}
      profileBgDark={profileBgDark}
      newsletterSubscribed={userRow?.newsletter_subscription === true}
      tickerTexts={tickerTexts}
      accountTickerTexts={accountTickerTexts}
      gamification={{
        sparks,
        level: progress.level,
        discount,
        progressPct: progress.pct,
        toNext: progress.toNext,
        tierKey: tier.key,
        tierLabel: tier.label,
      }}
      catalogProducts={catalogProducts}
      catalogCategories={catalogCategories}
    />
  )
}
