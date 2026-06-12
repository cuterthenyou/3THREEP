// Структурный конфиг игры «Охота» — единый источник для движка (BatAnimation),
// глобального маунта (GameMount) и админ-редактора (/admin/game GameClient).
// Хранится в site_settings.game_config (JSON). Без хардкода: всё крутится отсюда.

// Настройка одного типа мыши.
export interface BatTypeCfg {
  hp: number       // попаданий чтобы убить
  speed: number    // множитель скорости
  weight: number   // вес в случайном выборе типа
  minWave: number  // тип доступен начиная с этой волны
}

export interface GameConfig {
  // глобальные множители
  roombaSpeed: number
  batSpeed: number
  batScale: number
  powerupChance: number
  // кривые сложности
  baseCount: number
  countGrowth: number
  capMobile: number
  capDesktop: number
  speedGrowth: number
  spawnIntervalMs: number
  bonusEvery: number
  chaos: number
  // респавн мыши-приманки после исчезновения: случайная пауза в диапазоне,
  // со смещением к меньшим значениям (чаще ближе к минимуму)
  lureMinMs: number
  lureMaxMs: number
  // типы мышей
  typeNormal: BatTypeCfg
  typeGold: BatTypeCfg
  typeArmored: BatTypeCfg
  // пауэрапы
  powerupPool: string[]
  goldDropChance: number
  normalDropChance: number
  // боссы
  bossEvery: number
  megaWaves: number[]
  bossHp: number
  bossMegaHp: number
  bossShieldMs: number
  bossVulnMs: number
  bossTimeoutMs: number
  bossScale: number
  bossMegaScale: number
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  roombaSpeed: 1, batSpeed: 1, batScale: 1, powerupChance: 1,
  baseCount: 1, countGrowth: 1.7, capMobile: 6, capDesktop: 11,
  speedGrowth: 0.035, spawnIntervalMs: 150, bonusEvery: 5, chaos: 1,
  lureMinMs: 4000, lureMaxMs: 30000,
  typeNormal:  { hp: 1, speed: 1.0,  weight: 70, minWave: 1 },
  typeGold:    { hp: 1, speed: 1.6,  weight: 8,  minWave: 2 },
  typeArmored: { hp: 2, speed: 0.92, weight: 22, minWave: 2 },
  powerupPool: ['slowmo', 'freeze', 'double'],
  goldDropChance: 0.45, normalDropChance: 0.14,
  bossEvery: 10, megaWaves: [33, 66, 99],
  bossHp: 8, bossMegaHp: 18, bossShieldMs: 1600, bossVulnMs: 1500, bossTimeoutMs: 45000,
  bossScale: 2.5, bossMegaScale: 3.4,
}

export const ALL_POWERUPS: { key: string; label: string }[] = [
  { key: 'slowmo', label: 'Замедление' },
  { key: 'freeze', label: 'Заморозка' },
  { key: 'double', label: 'Очки ×2' },
]
