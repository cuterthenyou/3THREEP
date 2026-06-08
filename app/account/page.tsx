import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountClient from './AccountClient'
import { queryOne, queryMany } from '@/lib/db'

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

  const [profile, orders, settingsRows, userRow] = await Promise.all([
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
  ])

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

  return (
    <AccountClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      orders={orders}
      profileBg={profileBg}
      profileBgDark={profileBgDark}
      newsletterSubscribed={userRow?.newsletter_subscription === true}
      tickerTexts={tickerTexts}
    />
  )
}
