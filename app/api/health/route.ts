import { NextResponse } from 'next/server'

// Лёгкий healthcheck для Amvera: отвечает 200 мгновенно, БЕЗ обращения к БД и
// без тяжёлого SSR. Укажи этот путь в настройках healthcheck платформы, чтобы
// проба не зависела от рендера главной/доступности БД.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}

export function HEAD() {
  return new Response(null, { status: 200 })
}
