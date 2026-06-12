'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import BatAnimation, { DEFAULT_GAME_CONFIG, type GameConfig } from './BatAnimation'

/**
 * Глобальный маунт игры «Охота»: нетопырь летает по ЛЮБОЙ странице сайта.
 * Игноришь — просто летает и исчезает; кликнул — запускается игра (выбор
 * сложности → волны → боссы). Скрыт там, где игра мешает: админка, чекаут, авторизация.
 * Баланс берём из site_settings (ленивая загрузка; применяется к новым спавнам).
 */
export default function GameMount() {
  const pathname = usePathname()
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => (r.ok ? r.json() : {}))
      .then((g: Record<string, string>) => {
        const num = (k: string, def: number) => { const v = parseFloat(g[k] ?? ''); return isNaN(v) ? def : v }
        setConfig({
          roombaSpeed:   num('game_roomba_speed', DEFAULT_GAME_CONFIG.roombaSpeed),
          batSpeed:      num('game_bat_speed', DEFAULT_GAME_CONFIG.batSpeed),
          batScale:      num('game_bat_scale', DEFAULT_GAME_CONFIG.batScale),
          powerupChance: num('game_powerup_chance', DEFAULT_GAME_CONFIG.powerupChance),
          bossHp:        num('game_boss_hp', DEFAULT_GAME_CONFIG.bossHp),
          bossMegaHp:    num('game_boss_mega_hp', DEFAULT_GAME_CONFIG.bossMegaHp),
          bossShieldMs:  num('game_boss_shield_ms', DEFAULT_GAME_CONFIG.bossShieldMs),
          bossVulnMs:    num('game_boss_vuln_ms', DEFAULT_GAME_CONFIG.bossVulnMs),
          bossTimeoutMs: num('game_boss_timeout_ms', DEFAULT_GAME_CONFIG.bossTimeoutMs),
        })
      })
      .catch(() => {})
  }, [])

  // Не мешаем на служебных страницах
  if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/auth')) {
    return null
  }
  return <BatAnimation config={config} />
}
