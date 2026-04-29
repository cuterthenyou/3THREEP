import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?next=/account')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  return (
    <OrderDetailClient
      order={order}
      messages={messages ?? []}
      userId={user.id}
    />
  )
}
