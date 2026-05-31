import { queryMany } from '@/lib/db'
import ProductsClient from './ProductsClient'

export const revalidate = 0

export default async function AdminProductsPage() {
  const products = await queryMany(
    `SELECT * FROM products ORDER BY created_at DESC`
  )

  return <ProductsClient products={products} />
}
