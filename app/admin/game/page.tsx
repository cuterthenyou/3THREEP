import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/adminAuth'
import { queryMany } from '@/lib/db'
import { DEFAULT_GAME_CONFIG, type GameConfig } from '@/lib/gameConfig'
import GameClient from './GameClient'

export default async function GamePage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin')

  const settings: Record<string, string | null> = {}
  try {
    const rows = await queryMany('SELECT key, value FROM site_settings')
    for (const row of rows) settings[row.key] = row.value
  } catch { /* table may not exist yet */ }

  // Legacy числовые ключи + структурный JSON → начальный конфиг (defaults < legacy < json)
  const num = (k: string, def: number) => { const v = parseFloat(settings[k] ?? ''); return isNaN(v) ? def : v }
  const legacy: Partial<GameConfig> = {
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
  let structured: Partial<GameConfig> = {}
  if (settings.game_config) {
    try { structured = JSON.parse(settings.game_config) as Partial<GameConfig> } catch { /* invalid */ }
  }
  const initialConfig: GameConfig = { ...DEFAULT_GAME_CONFIG, ...legacy, ...structured }

  return <GameClient initialConfig={initialConfig} />
}
