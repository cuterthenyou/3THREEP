import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { queryMany, queryOne } from '@/lib/db'
import { deviceFromUA, browserFromUA } from '@/lib/ua'

function hostFromReferrer(ref: string): string {
  try {
    return new URL(ref).hostname.replace(/^www\./, '')
  } catch {
    return ref.slice(0, 60)
  }
}

function periodFilter(period: string, col = 'created_at') {
  switch (period) {
    case 'today': return `AND ${col} >= CURRENT_DATE`
    case '7d':    return `AND ${col} >= NOW() - INTERVAL '7 days'`
    case '30d':   return `AND ${col} >= NOW() - INTERVAL '30 days'`
    default:      return ''
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email ?? null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const period = req.nextUrl.searchParams.get('period') ?? 'all'
  const pf = periodFilter(period)

  const [kpi, topProducts, sizeBreakdown, dailyRevenue, analytics] = await Promise.all([
    queryOne(`
      SELECT
        COUNT(*) FILTER (WHERE status <> 'cancelled') AS orders,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled')), 0) AS revenue,
        COALESCE(AVG(total) FILTER (WHERE status NOT IN ('cancelled')), 0) AS avg_check,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS returns
      FROM orders WHERE 1=1 ${pf}
    `),

    queryMany(`
      SELECT oi.product_name,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.price * oi.quantity) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled' ${pf}
      GROUP BY oi.product_name
      ORDER BY units_sold DESC
      LIMIT 10
    `),

    queryMany(`
      SELECT oi.size,
        SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled' AND oi.size IS NOT NULL ${pf}
      GROUP BY oi.size
      ORDER BY total_sold DESC
    `),

    queryMany(`
      SELECT
        DATE_TRUNC('day', created_at)::date AS day,
        SUM(total) AS revenue
      FROM orders
      WHERE status <> 'cancelled' ${pf}
      GROUP BY day
      ORDER BY day ASC
      LIMIT 60
    `),

    // Analytics: views, unique sessions, new users, total newsletter subscribers
    queryOne(`
      SELECT
        (SELECT COUNT(*) FROM page_views WHERE 1=1 ${periodFilter(period)}) AS views,
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE 1=1 ${periodFilter(period)}) AS unique_visits,
        (SELECT COUNT(*) FROM users WHERE 1=1 ${periodFilter(period)}) AS new_users,
        (SELECT COUNT(*) FROM newsletter_subscribers) AS newsletter
    `).catch(() => ({ views: '0', unique_visits: '0', new_users: '0', newsletter: '0' })),
  ])

  // ── Expanded analytics (events table may not exist on first run → defaults) ──
  const [
    uaRows, referrerRows, sessionMetrics, funnel, productViews, repeat, batScoresDesktop, batScoresMobile, batPlays,
  ] = await Promise.all([
    queryMany(`
      SELECT user_agent, COUNT(*) AS c
      FROM page_views WHERE user_agent IS NOT NULL ${pf}
      GROUP BY user_agent
    `).catch(() => [] as Array<{ user_agent: string; c: string }>),

    queryMany(`
      SELECT referrer, COUNT(DISTINCT session_id) AS c
      FROM page_views WHERE referrer IS NOT NULL AND referrer <> '' ${pf}
      GROUP BY referrer ORDER BY c DESC LIMIT 50
    `).catch(() => [] as Array<{ referrer: string; c: string }>),

    queryOne(`
      WITH s AS (
        SELECT session_id,
          COUNT(*) AS views,
          EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS dur
        FROM page_views WHERE 1=1 ${pf} GROUP BY session_id
      )
      SELECT
        COUNT(*) AS sessions,
        COALESCE(AVG(views), 0) AS avg_pages,
        COALESCE(AVG(dur), 0) AS avg_dur,
        COUNT(*) FILTER (WHERE views = 1) AS bounces
      FROM s
    `).catch(() => ({ sessions: '0', avg_pages: '0', avg_dur: '0', bounces: '0' })),

    queryOne(`
      SELECT
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE 1=1 ${pf}) AS visits,
        (SELECT COUNT(DISTINCT session_id) FROM events WHERE type='product_view' ${pf}) AS product_views,
        (SELECT COUNT(DISTINCT session_id) FROM events WHERE type='cart_add' ${pf}) AS cart_adds,
        (SELECT COUNT(DISTINCT session_id) FROM events WHERE type='checkout_start' ${pf}) AS checkouts,
        (SELECT COUNT(*) FROM orders WHERE status <> 'cancelled' ${pf}) AS orders
    `).catch(() => ({ visits: '0', product_views: '0', cart_adds: '0', checkouts: '0', orders: '0' })),

    queryMany(`
      SELECT meta->>'name' AS name, COUNT(*) AS views
      FROM events WHERE type='product_view' AND meta->>'name' IS NOT NULL ${pf}
      GROUP BY meta->>'name' ORDER BY views DESC LIMIT 10
    `).catch(() => [] as Array<{ name: string; views: string }>),

    queryOne(`
      WITH u AS (
        SELECT user_id, COUNT(*) AS orders FROM orders
        WHERE user_id IS NOT NULL AND status <> 'cancelled' ${pf}
        GROUP BY user_id
      )
      SELECT COUNT(*) AS buyers, COUNT(*) FILTER (WHERE orders >= 2) AS repeat_buyers FROM u
    `).catch(() => ({ buyers: '0', repeat_buyers: '0' })),

    queryMany(`
      SELECT score, level, created_at, nickname AS player, difficulty, win
      FROM leaderboard
      WHERE platform = 'desktop' ${periodFilter(period, 'created_at')}
      ORDER BY score DESC LIMIT 10
    `).catch(() => [] as Array<{ score: number; level: number | null; created_at: string; player: string | null; difficulty: string; win: boolean }>),

    queryMany(`
      SELECT score, level, created_at, nickname AS player, difficulty, win
      FROM leaderboard
      WHERE platform = 'mobile' ${periodFilter(period, 'created_at')}
      ORDER BY score DESC LIMIT 10
    `).catch(() => [] as Array<{ score: number; level: number | null; created_at: string; player: string | null; difficulty: string; win: boolean }>),

    queryOne(`
      SELECT COUNT(*) AS plays, COUNT(DISTINCT COALESCE(user_id::text, nickname, id::text)) AS players
      FROM leaderboard WHERE TRUE ${pf}
    `).catch(() => ({ plays: '0', players: '0' })),
  ])

  // Aggregate UA rows into device + browser buckets (JS-side parsing)
  const devices: Record<string, number> = {}
  const browsers: Record<string, number> = {}
  for (const row of uaRows) {
    const n = parseInt(row.c, 10) || 0
    const d = deviceFromUA(row.user_agent)
    const b = browserFromUA(row.user_agent)
    devices[d] = (devices[d] ?? 0) + n
    browsers[b] = (browsers[b] ?? 0) + n
  }

  // Aggregate referrers by host
  const refMap: Record<string, number> = {}
  for (const row of referrerRows) {
    const host = hostFromReferrer(row.referrer)
    refMap[host] = (refMap[host] ?? 0) + (parseInt(row.c, 10) || 0)
  }
  const referrers = Object.entries(refMap)
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const toArr = (obj: Record<string, number>) =>
    Object.entries(obj).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)

  return NextResponse.json({
    kpi, topProducts, sizeBreakdown, dailyRevenue, analytics,
    devices: toArr(devices),
    browsers: toArr(browsers),
    referrers,
    sessionMetrics,
    funnel,
    productViews,
    repeat,
    batScoresDesktop,
    batScoresMobile,
    batPlays,
  })
}
