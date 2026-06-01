import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

export const revalidate = 60

export async function GET() {
  try {
    const collections = await queryMany(
      `SELECT slug, name FROM categories WHERE active = true ORDER BY created_at ASC`
    )
    return NextResponse.json({ collections })
  } catch {
    return NextResponse.json({ collections: [] })
  }
}
