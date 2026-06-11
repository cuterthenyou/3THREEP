import { queryOne, queryMany } from '@/lib/db'
import InfoClient, { INFO_DEFAULTS, type InfoContent } from './InfoClient'
import { DEFAULT_GAME_CONFIG, type GameConfig } from '@/components/BatAnimation'

export default async function InfoPage() {
  let content: InfoContent = INFO_DEFAULTS
  let gameConfig: GameConfig = DEFAULT_GAME_CONFIG
  try {
    const [row, gameRows] = await Promise.all([
      queryOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = 'info_content'`),
      queryMany<{ key: string; value: string | null }>(
        `SELECT key, value FROM site_settings WHERE key IN
         ('game_roomba_speed','game_bat_speed','game_bat_scale','game_powerup_chance')`
      ).catch(() => [] as { key: string; value: string | null }[]),
    ])
    if (row?.value) content = { ...INFO_DEFAULTS, ...JSON.parse(row.value) }
    const g: Record<string, string | null> = {}
    for (const r of gameRows) g[r.key] = r.value
    const num = (k: string, def: number) => { const v = parseFloat(g[k] ?? ''); return isNaN(v) ? def : v }
    gameConfig = {
      roombaSpeed:   num('game_roomba_speed', 1),
      batSpeed:      num('game_bat_speed', 1),
      batScale:      num('game_bat_scale', 1),
      powerupChance: num('game_powerup_chance', 1),
    }
  } catch { /* table may not exist yet */ }

  return <InfoClient content={content} gameConfig={gameConfig} />
}
