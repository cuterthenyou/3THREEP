import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/isAdmin'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdmin(user?.email) ? user : null
}

export async function POST(req: NextRequest) {
  const admin_user = await checkAdmin()
  if (!admin_user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const admin = await createAdminClient()
  const { data, error } = await admin.from('products').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
