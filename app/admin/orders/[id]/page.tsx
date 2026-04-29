import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OrderAdminClient from './OrderAdminClient'

export const revalidate = 0

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*), profiles(email, name)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: messages } = await admin
    .from('messages')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  return <OrderAdminClient order={order} messages={messages ?? []} />
}
