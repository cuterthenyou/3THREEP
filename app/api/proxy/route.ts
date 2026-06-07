import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !/^https?:\/\//.test(url)) {
    return new NextResponse('bad url', { status: 400 })
  }

  try {
    const upstream = await fetch(url, { cache: 'force-cache' })
    if (!upstream.ok) return new NextResponse('upstream error', { status: upstream.status })

    const bytes = await upstream.arrayBuffer()
    const contentType = upstream.headers.get('content-type') || 'image/svg+xml'

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  } catch {
    return new NextResponse('proxy error', { status: 502 })
  }
}
