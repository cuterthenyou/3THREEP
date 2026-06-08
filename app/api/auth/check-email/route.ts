import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ exists: false })
  try {
    const row = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    )
    return NextResponse.json({ exists: !!row })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
