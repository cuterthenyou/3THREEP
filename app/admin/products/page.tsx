import { createAdminClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export const revalidate = 0

export default async function AdminProductsPage() {
  const admin = await createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <ProductsClient products={products ?? []} />
}
