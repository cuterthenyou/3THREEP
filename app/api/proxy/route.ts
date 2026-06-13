import { NextRequest, NextResponse } from 'next/server'
import { isSafeProxyUrl, assertSafeResolvedHost } from '@/lib/ssrf'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const MAX_BYTES = 5 * 1024 * 1024 // 5 МБ — прокси только для картинок/SVG
const FETCH_TIMEOUT = 6000

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !isSafeProxyUrl(url)) {
    return new NextResponse('bad url', { status: 400 })
  }

  // Анти-абуз пропускной способности: лимит обращений к прокси с одного IP.
  const rl = await rateLimit('proxy_ip', `ip:${clientIp(req)}`, 200, 60_000)
  if (!rl.ok) return new NextResponse('rate limited', { status: 429 })

  // Анти-DNS-rebinding: резолвим хост и проверяем фактические IP перед fetch.
  if (!(await assertSafeResolvedHost(new URL(url).hostname))) {
    return new NextResponse('blocked host', { status: 400 })
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
  try {
    // redirect:'manual' — НЕ ходим за редиректами (иначе внешний сервер мог бы
    // увести нас на внутренний хост в обход проверки). 3xx/opaque → отказ.
    const upstream = await fetch(url, { cache: 'force-cache', redirect: 'manual', signal: ctrl.signal })
    if (upstream.type === 'opaqueredirect' || (upstream.status >= 300 && upstream.status < 400)) {
      return new NextResponse('redirect blocked', { status: 400 })
    }
    if (!upstream.ok) return new NextResponse('upstream error', { status: upstream.status })

    // Прокси — только для изображений (логотипы/курсоры/SVG).
    const contentType = upstream.headers.get('content-type') || ''
    if (!/^image\//i.test(contentType) && !/svg/i.test(contentType)) {
      return new NextResponse('unsupported content-type', { status: 415 })
    }
    const declaredLen = Number(upstream.headers.get('content-length') || 0)
    if (declaredLen > MAX_BYTES) return new NextResponse('too large', { status: 413 })

    const bytes = await upstream.arrayBuffer()
    if (bytes.byteLength > MAX_BYTES) return new NextResponse('too large', { status: 413 })

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType || 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  } catch {
    return new NextResponse('proxy error', { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
