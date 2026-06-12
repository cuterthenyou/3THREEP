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
         ('game_roomba_speed','game_bat_speed','game_bat_scale','game_powerup_chance',
          'game_boss_hp','game_boss_mega_hp','game_boss_shield_ms','game_boss_vuln_ms','game_boss_timeout_ms')`
      ).catch(() => [] as { key: string; value: string | null }[]),
    ])
    if (row?.value) content = { ...INFO_DEFAULTS, ...JSON.parse(row.value) }
    const g: Record<string, string | null> = {}
    for (const r of gameRows) g[r.key] = r.value
    const num = (k: string, def: number) => { const v = parseFloat(g[k] ?? ''); return isNaN(v) ? def : v }
    gameConfig = {
      roombaSpeed:   num('game_roomba_speed', DEFAULT_GAME_CONFIG.roombaSpeed),
      batSpeed:      num('game_bat_speed', DEFAULT_GAME_CONFIG.batSpeed),
      batScale:      num('game_bat_scale', DEFAULT_GAME_CONFIG.batScale),
      powerupChance: num('game_powerup_chance', DEFAULT_GAME_CONFIG.powerupChance),
      bossHp:        num('game_boss_hp', DEFAULT_GAME_CONFIG.bossHp),
      bossMegaHp:    num('game_boss_mega_hp', DEFAULT_GAME_CONFIG.bossMegaHp),
      bossShieldMs:  num('game_boss_shield_ms', DEFAULT_GAME_CONFIG.bossShieldMs),
      bossVulnMs:    num('game_boss_vuln_ms', DEFAULT_GAME_CONFIG.bossVulnMs),
      bossTimeoutMs: num('game_boss_timeout_ms', DEFAULT_GAME_CONFIG.bossTimeoutMs),
    }
  } catch { /* table may not exist yet */ }

  return <InfoClient content={content} gameConfig={gameConfig} />
}
