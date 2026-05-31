import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdmin } from '@/lib/isAdmin';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith('https://'),
  });

  const { pathname } = request.nextUrl;

  console.log(`[middleware] ${pathname} | token: ${token ? 'YES' : 'NO'} | email: ${token?.email ?? 'none'}`);

  const isAccountPath = pathname.startsWith('/account');
  const isAdminPath = pathname.startsWith('/admin');

  // Не залогинен — редирект на авторизацию
  if ((isAccountPath || isAdminPath) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Залогинен, но не admin — редирект в аккаунт
  if (isAdminPath && !isAdmin(token?.email as string | undefined)) {
    console.log(`[middleware] ADMIN DENIED: ${token?.email ?? 'no email'} | ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? 'set' : 'NOT SET'}`);
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
