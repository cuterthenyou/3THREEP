// ════════════════════════════════════════════════════════════════════
// Уровни / искры (XP) / скидки — чистая логика (без БД).
// Конфиг тюнится из админки (site_settings.leveling_config); здесь дефолты.
// См. .claude/skills/threep-backend.
// ════════════════════════════════════════════════════════════════════

export interface LevelingConfig {
  /** искры за сам факт оплаченного заказа */
  spark_per_order: number
  /** искры за каждую вещь сверх первой в заказе */
  spark_per_extra_unit: number
  /** кумулятивные искры для достижения уровня (index+1); thresholds[0]=0 → ур.1 */
  thresholds: number[]
  /** прирост порога за каждый уровень сверх таблицы */
  increment_after: number
  /** максимальная скидка, % */
  discount_max: number
}

export const DEFAULT_LEVELING: LevelingConfig = {
  spark_per_order: 100,
  spark_per_extra_unit: 20,
  thresholds: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],
  increment_after: 600,
  discount_max: 13,
}

export function parseLevelingConfig(value?: string | null): LevelingConfig {
  if (!value) return DEFAULT_LEVELING
  try {
    return { ...DEFAULT_LEVELING, ...JSON.parse(value) }
  } catch {
    return DEFAULT_LEVELING
  }
}

/** Кумулятивные искры, необходимые чтобы быть НА уровне `level` (level 1 → 0). */
export function sparksToReachLevel(level: number, cfg: LevelingConfig = DEFAULT_LEVELING): number {
  const t = cfg.thresholds
  if (level <= 1) return 0
  if (level <= t.length) return t[level - 1]
  return t[t.length - 1] + (level - t.length) * cfg.increment_after
}

/** Текущий уровень по накопленным искрам. */
export function getLevel(sparks: number, cfg: LevelingConfig = DEFAULT_LEVELING): number {
  const t = cfg.thresholds
  let level = 1
  for (let i = 1; i < t.length; i++) {
    if (sparks >= t[i]) level = i + 1
    else return level
  }
  // искр хватает на последний табличный порог → продолжаем по формуле
  let need = t[t.length - 1]
  while (sparks >= need + cfg.increment_after) {
    need += cfg.increment_after
    level += 1
  }
  return level
}

/**
 * Скидка (%) по уровню. L1 (нет покупок) = 0 — скидка начинается только
 * после первой (доставленной) покупки, которая поднимает на L2.
 * L2-4=1, L5-9=2, L10=3, далее +1/ур до discount_max.
 */
export function getDiscount(level: number, cfg: LevelingConfig = DEFAULT_LEVELING): number {
  if (level <= 1) return 0
  if (level <= 4) return 1
  if (level <= 9) return 2
  if (level === 10) return 3
  return Math.min(3 + (level - 10), cfg.discount_max)
}

/** Прогресс до следующего уровня — для горизонтальной шкалы искр. */
export function levelProgress(sparks: number, cfg: LevelingConfig = DEFAULT_LEVELING) {
  const level = getLevel(sparks, cfg)
  const floor = sparksToReachLevel(level, cfg)
  const ceil = sparksToReachLevel(level + 1, cfg)
  const span = ceil - floor
  const into = sparks - floor
  const pct = span > 0 ? Math.max(0, Math.min(1, into / span)) : 1
  return { level, sparks, floor, ceil, into, span, pct, toNext: Math.max(0, ceil - sparks) }
}

/** Искры за заказ (гибрид): база + бонус за каждую вещь сверх первой. */
export function sparksForOrder(totalUnits: number, cfg: LevelingConfig = DEFAULT_LEVELING): number {
  const units = Math.max(1, Math.floor(totalUnits || 0))
  return cfg.spark_per_order + cfg.spark_per_extra_unit * (units - 1)
}

// ── Тиры уровней (Steam-like) — цвета/рамки задаются в CSS по ключу тира ──
export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'prestige'

export interface LevelTier {
  key: TierKey
  label: string
  minLevel: number
}

const TIERS: LevelTier[] = [
  { key: 'bronze',   label: 'БРОНЗА',   minLevel: 1 },
  { key: 'silver',   label: 'СЕРЕБРО',  minLevel: 5 },
  { key: 'gold',     label: 'ЗОЛОТО',   minLevel: 10 },
  { key: 'platinum', label: 'ПЛАТИНА',  minLevel: 15 },
  { key: 'prestige', label: 'ПРЕСТИЖ',  minLevel: 20 },
]

export function getTier(level: number): LevelTier {
  let tier = TIERS[0]
  for (const t of TIERS) if (level >= t.minLevel) tier = t
  return tier
}
