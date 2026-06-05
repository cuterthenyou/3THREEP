import { queryOne } from '@/lib/db'
import InfoClient, { INFO_DEFAULTS, type InfoContent } from './InfoClient'

export default async function InfoPage() {
  let content: InfoContent = INFO_DEFAULTS
  try {
    const row = await queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'info_content'`)
    if (row?.value) content = { ...INFO_DEFAULTS, ...JSON.parse(row.value) }
  } catch { /* table may not exist yet */ }

  return <InfoClient content={content} />
}
