import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import TextsClient from './TextsClient'
import { INFO_DEFAULTS, type InfoContent } from '@/app/info/InfoClient'
import { FOOTER_DEFAULTS, type FooterContent } from '@/components/Footer'

export type PrivacySection = { heading: string; body: string }

const PRIVACY_FALLBACK: PrivacySection[] = [
  { heading: 'Раздел 1', body: '' },
]

export default async function TextsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin')

  let settings: Record<string, string | null> = {}
  try {
    const rows = await queryMany("SELECT key, value FROM site_settings WHERE key IN ('footer_content', 'info_content', 'privacy_content')")
    for (const row of rows) settings[row.key] = row.value
  } catch { /* table may not exist yet */ }

  const footerContent: FooterContent = settings['footer_content']
    ? { ...FOOTER_DEFAULTS, ...JSON.parse(settings['footer_content']) }
    : FOOTER_DEFAULTS

  const infoContent: InfoContent = settings['info_content']
    ? { ...INFO_DEFAULTS, ...JSON.parse(settings['info_content']) }
    : INFO_DEFAULTS

  const privacySections: PrivacySection[] = settings['privacy_content']
    ? JSON.parse(settings['privacy_content'])
    : PRIVACY_FALLBACK

  return (
    <TextsClient
      initialFooter={footerContent}
      initialInfo={infoContent}
      initialPrivacy={privacySections}
    />
  )
}
