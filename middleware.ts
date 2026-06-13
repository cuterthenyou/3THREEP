import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdmin } from '@/lib/isAdmin';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // ── CSRF-защита мутаций /api (defense-in-depth поверх SameSite=Lax cookie) ──
  // Меняющий состояние запрос обязан идти с того же origin. Браузер всегда шлёт
  // Origin на fetch/POST → если он есть и не совпадает с host, режем. Отсутствие
  // Origin (server-to-server вебхуки Supabase/Telegram со своим секретом) —
  // пропускаем: Lax-cookie всё равно не уедет на кросс-сайт.
  if (pathname.startsWith('/api') && !SAFE_METHODS.has(method)) {
    const origin = request.headers.get('origin');
    if (origin) {
      let originHost: string | null = null;
      try { originHost = new URL(origin).host; } catch { originHost = null; }
      // Допустимые хосты: текущий Host (за прокси может быть переписан) и
      // канонический NEXTAUTH_URL/forwarded-host — оба «свои».
      const allowed = new Set<string>();
      const host = request.headers.get('host');
      if (host) allowed.add(host);
      const fwd = request.headers.get('x-forwarded-host');
      if (fwd) allowed.add(fwd);
      try { if (process.env.NEXTAUTH_URL) allowed.add(new URL(process.env.NEXTAUTH_URL).host); } catch { /* ignore */ }
      if (!originHost || !allowed.has(originHost)) {
        return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // ── Гейтинг приватных страниц ──
  const isAccountPath = pathname.startsWith('/account');
  const isAdminPath = pathname.startsWith('/admin');
  if (!isAccountPath && !isAdminPath) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith('https://'),
  });

  // Не залогинен — редирект на авторизацию
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Залогинен, но не admin — редирект в аккаунт
  if (isAdminPath && !isAdmin(token.email as string | undefined)) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/api/:path*'],
};
