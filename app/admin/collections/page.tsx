import { queryMany } from '@/lib/db'
import CollectionsClient from './CollectionsClient'
import type { Category } from '@/lib/types'

export const revalidate = 0

export default async function CollectionsPage() {
  let collections: Category[] = []
  try {
    collections = await queryMany(`SELECT * FROM categories ORDER BY name`)
  } catch { /* table may not exist yet */ }

  return <CollectionsClient collections={collections} />
}
