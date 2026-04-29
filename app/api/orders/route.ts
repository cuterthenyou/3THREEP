import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { items, total, delivery_address, comment } = body

  if (!items?.length || !total || !delivery_address) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({ user_id: user.id, total, delivery_address, comment, status: 'new' })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message }, { status: 500 })
  }

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(items.map((i: Record<string, unknown>) => ({ ...i, order_id: order.id })))

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({ id: order.id })
}
