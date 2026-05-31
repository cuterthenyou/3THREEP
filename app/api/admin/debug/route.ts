import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/isAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const email = session.user.email ?? null;
  const adminEmailEnv = process.env.ADMIN_EMAIL ?? '';
  const adminEmails = adminEmailEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json({
    email,
    isAdmin: isAdmin(email),
    adminEmailConfigured: adminEmails.length > 0,
    adminEmailHint: adminEmails.length > 0
      ? `задан (${adminEmails.length} email(s), первый начинается с "${adminEmails[0].slice(0, 4)}...")`
      : '⚠️ НЕ ЗАДАН — установи ADMIN_EMAIL на Amvera',
    match: adminEmails.includes((email ?? '').toLowerCase()),
  });
}
