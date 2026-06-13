import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/isAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const email = session.user.email ?? null;
  const callerIsAdmin = isAdmin(email);

  // Базовый ответ — только статус самого вызывающего (не утекает чужих данных).
  const base = { email, isAdmin: callerIsAdmin };

  // Подсказки про ADMIN_EMAIL (кол-во, префикс) — ТОЛЬКО админу, иначе это утечка.
  if (!callerIsAdmin) return NextResponse.json(base);

  const adminEmails = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json({
    ...base,
    adminEmailConfigured: adminEmails.length > 0,
    adminEmailHint: adminEmails.length > 0
      ? `задан (${adminEmails.length} email(s), первый начинается с "${adminEmails[0].slice(0, 4)}...")`
      : '⚠️ НЕ ЗАДАН — установи ADMIN_EMAIL на Amvera',
    match: adminEmails.includes((email ?? '').toLowerCase()),
  });
}
