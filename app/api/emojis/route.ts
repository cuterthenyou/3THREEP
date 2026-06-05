import { queryMany } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const emojis = await queryMany(
      'SELECT id, name, url FROM custom_emojis ORDER BY created_at DESC'
    )
    return NextResponse.json(emojis)
  } catch {
    return NextResponse.json([])
  }
}
