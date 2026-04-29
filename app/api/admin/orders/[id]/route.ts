import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/isAdmin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const admin = await createAdminClient()

  const { error } = await admin.from('orders').update(body).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
