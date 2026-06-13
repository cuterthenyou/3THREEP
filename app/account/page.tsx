import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountClient from './AccountClient'

// Приватный кабинет — не индексируем.
export const metadata: Metadata = { title: 'Личный кабинет', robots: { index: false, follow: false } }
import { queryOne, queryMany } from '@/lib/db'
import { parseLevelingConfig, levelProgress, getDiscount, getTier, sparksForOrder } from '@/lib/leveling'
import { awardAchievement } from '@/lib/gamification'
import type { Order } from '@/lib/types'

// Искры начисляются только за доставленные заказы (анти-чит) — fallback
// для пользователей до бэкфилла должен считать по тому же правилу.
const XP_STATUSES = ['delivered']
// Вещь «в инвентаре»/куплена = оплачена и не отменена.
const OWNED_STATUSES = ['paid', 'in_progress', 'shipped', 'delivered']

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

  const [profile, orders, settingsRows, userRow, catalogProductsRaw, catalogCategoriesRaw, achievementsCatalog, maxBatRow] = await Promise.all([
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
    queryMany(`SELECT * FROM achievements WHERE active = true ORDER BY sort_order`).catch(() => [] as any[]),
    queryOne<{ hs: number }>(
      `SELECT MAX((meta->>'score')::int) AS hs FROM events
       WHERE type = 'bat_score' AND user_id = $1 AND meta->>'score' ~ '^[0-9]+$'`,
      [user.id]
    ).catch(() => null),
  ]) as any[]

  // Коллекции = активные категории, у которых есть товары
  const inactiveCatSlugs = new Set(
    catalogCategoriesRaw.filter((c: { active?: boolean }) => c.active === false).map((c: { slug: string }) => c.slug)
  )
  const catalogProducts = catalogProductsRaw.filter((p: { category: string }) => !inactiveCatSlugs.has(p.category))
  const catalogCategories = catalogCategoriesRaw.filter((c: { active?: boolean }) => c.active !== false)

  const profileBg = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'profile_bg_url')?.value ?? null
  const profileBgDark = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'profile_bg_url_dark')?.value ?? null
  const levelTip = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'lk_level_tip')?.value ?? undefined
  const discountTip = settingsRows.find((r: {key: string; value: string | null}) => r.key === 'lk_discount_tip')?.value ?? undefined
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

  // ── Ачивки: idempotent-выдача детектируемых на загрузке + витрина ──────
  const ownedSet = new Set(
    orders
      .filter((o: Order) => OWNED_STATUSES.includes(o.status))
      .flatMap((o: Order) => (o.order_items ?? []).map((i) => i.product_id))
      .filter(Boolean) as string[]
  )
  const anyCollectionComplete = catalogCategories.some((c: { slug: string }) => {
    const items = catalogProducts.filter((p: any) => p.category === c.slug && !p.coming_soon)
    return items.length > 0 && items.every((p: any) => ownedSet.has(p.id))
  })
  try {
    const tasks: Promise<unknown>[] = [awardAchievement(user.id, 'profile_created')]
    const ownedOrders = orders.filter((o: Order) => OWNED_STATUSES.includes(o.status))
    if (ownedOrders.length) {
      tasks.push(awardAchievement(user.id, 'first_purchase'))
      const maxUnits = Math.max(0, ...ownedOrders.map((o: Order) => (o.order_items ?? []).reduce((q, i) => q + (i.quantity ?? 0), 0)))
      if (maxUnits >= 3) tasks.push(awardAchievement(user.id, 'multi_buy'))
    }
    if (anyCollectionComplete) tasks.push(awardAchievement(user.id, 'full_collection'))
    if ((maxBatRow?.hs ?? 0) >= 50) tasks.push(awardAchievement(user.id, 'game_hunter'))
    if ((maxBatRow?.hs ?? 0) >= 100) tasks.push(awardAchievement(user.id, 'game_master'))
    if (ownedOrders.length >= 5) tasks.push(awardAchievement(user.id, 'loyal_buyer'))
    await Promise.all(tasks)
  } catch (e) {
    console.error('[achievements] sync failed:', e)
  }

  const userAchRows = await queryMany<{ achievement_key: string; showcased: boolean }>(
    `SELECT achievement_key, showcased FROM user_achievements WHERE user_id = $1`,
    [user.id]
  ).catch(() => [] as { achievement_key: string; showcased: boolean }[])
  const unlockedMap = new Map(userAchRows.map((r) => [r.achievement_key, r.showcased]))
  const achievements = (achievementsCatalog as any[]).map((a) => ({
    key: a.key,
    title: a.title,
    description: a.description,
    medal_key: a.medal_key,
    unlocked: unlockedMap.has(a.key),
    showcased: unlockedMap.get(a.key) === true,
  }))

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
      achievements={achievements}
      levelTip={levelTip}
      discountTip={discountTip}
    />
  )
}
