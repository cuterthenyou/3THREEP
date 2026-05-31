import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth?next=/account')
  }

  const supabase = await createClient()

  const user = {
    id: session.user.id,
    email: session.user.email ?? '',
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('ACCOUNT PAGE')
  console.log('USER ID:', user.id)
  console.log('PROFILE:', profile)

  return (
    <AccountClient
      user={{ id: user.id, email: user.email ?? '' }}
      profile={profile}
      orders={orders ?? []}
    />
  )
}
