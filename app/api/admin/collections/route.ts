import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/isAdmin'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdmin(user?.email) ? user : null
}

export async function GET() {
  const admin = await createAdminClient()
  const { data, error } = await admin.from('categories').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const admin = await createAdminClient()
  const { data, error } = await admin.from('categories').upsert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/')
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { slug } = await req.json()
  const admin = await createAdminClient()
  const { error } = await admin.from('categories').delete().eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
