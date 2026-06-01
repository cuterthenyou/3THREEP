import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'
import { queryMany, queryOne } from '@/lib/db'

function periodFilter(period: string) {
  switch (period) {
    case 'today': return `AND created_at >= CURRENT_DATE`
    case '7d':    return `AND created_at >= NOW() - INTERVAL '7 days'`
    case '30d':   return `AND created_at >= NOW() - INTERVAL '30 days'`
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

  const [kpi, topProducts, sizeBreakdown, dailyRevenue] = await Promise.all([
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
  ])

  return NextResponse.json({ kpi, topProducts, sizeBreakdown, dailyRevenue })
}
