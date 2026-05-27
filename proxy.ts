import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const user = session?.user

  const isProtected = request.nextUrl.pathname.startsWith('/account') ||
    request.nextUrl.pathname.startsWith('/admin')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin(user?.email)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}

export default proxy
