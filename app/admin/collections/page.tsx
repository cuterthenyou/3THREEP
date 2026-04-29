import { createAdminClient } from '@/lib/supabase/server'
import CollectionsClient from './CollectionsClient'
import type { Category } from '@/lib/types'

export const revalidate = 0

export default async function CollectionsPage() {
  let collections: Category[] = []
  try {
    const admin = await createAdminClient()
    const { data } = await admin.from('categories').select('*').order('name')
    collections = data ?? []
  } catch { /* table may not exist yet */ }

  return <CollectionsClient collections={collections} />
}
