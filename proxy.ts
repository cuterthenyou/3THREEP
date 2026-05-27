import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAdmin } from '@/lib/isAdmin'

export async function proxy(request: NextRequest) {
  // Edge-compatible: используем getToken вместо auth() (без обращения к БД)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith('https://'),
  })

  const isProtected = request.nextUrl.pathname.startsWith('/account') ||
    request.nextUrl.pathname.startsWith('/admin')

  console.log(`[proxy] ${request.nextUrl.pathname} | token: ${token ? 'YES' : 'NO'} | email: ${token?.email || 'none'}`)

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin(token?.email as string | undefined)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}

export default proxy
