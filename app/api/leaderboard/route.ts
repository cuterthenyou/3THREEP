import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryMany } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getLevel, parseLevelingConfig } from '@/lib/leveling'

// Запись результата игры «Охота» в лидерборд. Платформа берётся из UA на сервере,
// ник+уровень — из профиля сессии (клиент не может подделать). Гости → NULL/NULL.
// Таблица — migration/11_leaderboard.sql; ensure() лишь страховка для dev.

let ready = false
async function ensureTable() {
  if (ready) return
  await query(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id          BIGSERIAL PRIMARY KEY,
      user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      nickname    TEXT,
      level       INTEGER,
      platform    TEXT NOT NULL DEFAULT 'desktop',
      difficulty  TEXT NOT NULL DEFAULT 'normal',
      score       INTEGER NOT NULL,
      win         BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_board ON leaderboard (platform, difficulty, score DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC)`)
  ready = true
}

const DIFFICULTIES = new Set(['normal', 'death'])

// Публичный топ-100 (лучший результат на зарегистрированного игрока) + ранг текущего
// юзера. user_id наружу не отдаём — только флаг isMe. Гости в рейтинг не входят.
export async function GET() {
  let myId: string | null = null
  try {
    const session = await auth()
    myId = session?.user?.id ?? null
  } catch { /* anon */ }

  try {
    const rows = await queryMany<{
      user_id: string; nickname: string | null; level: number | null
      platform: string; difficulty: string; score: number; win: boolean; rank: string
    }>(`
      WITH best AS (
        SELECT DISTINCT ON (user_id)
          user_id, nickname, level, platform, difficulty, score, win, created_at
        FROM leaderboard
        WHERE user_id IS NOT NULL
        ORDER BY user_id, score DESC, created_at DESC
      )
      SELECT user_id, nickname, level, platform, difficulty, score, win,
             ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) AS rank
      FROM best
      ORDER BY score DESC, created_at ASC
      LIMIT 100
    `)

    let me: { rank: number; score: number } | null = null
    if (myId) {
      const row = await queryOne<{ score: number; rank: string }>(`
        WITH best AS (
          SELECT user_id, MAX(score) AS score FROM leaderboard
          WHERE user_id IS NOT NULL GROUP BY user_id
        )
        SELECT b.score, (SELECT COUNT(*) + 1 FROM best b2 WHERE b2.score > b.score) AS rank
        FROM best b WHERE b.user_id = $1
      `, [myId])
      if (row) me = { rank: Number(row.rank), score: Number(row.score) }
    }

    const top = rows.map(r => ({
      rank: Number(r.rank),
      nickname: r.nickname,
      level: r.level,
      platform: r.platform,
      difficulty: r.difficulty,
      score: r.score,
      win: r.win,
      isMe: myId != null && r.user_id === myId,
    }))

    return NextResponse.json({ top, me })
  } catch {
    return NextResponse.json({ top: [], me: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { score, difficulty, win } = await req.json()
    const s = Math.floor(Number(score))
    if (!Number.isFinite(s) || s <= 0 || s > 10_000_000) return new NextResponse(null, { status: 204 })
    const diff = DIFFICULTIES.has(String(difficulty)) ? String(difficulty) : 'normal'

    // Платформа — из UA на сервере (клиент не подделает). iPad/тач → mobile.
    const ua = req.headers.get('user-agent') || ''
    const platform = /Mobi|Android|iPhone|iPad|iPod|Tablet|Touch/i.test(ua) ? 'mobile' : 'desktop'

    // Ник + уровень — из профиля сессии (cookies едут с sendBeacon, same-origin).
    let userId: string | null = null
    let nickname: string | null = null
    let level: number | null = null
    try {
      const session = await auth()
      userId = session?.user?.id ?? null
      if (userId) {
        const [prof, cfgRow] = await Promise.all([
          queryOne<{ name: string | null; sparks: number }>(`SELECT name, sparks FROM profiles WHERE id = $1`, [userId]),
          queryOne<{ value: string | null }>(`SELECT value FROM site_settings WHERE key = 'leveling_config'`).catch(() => null),
        ])
        if (prof) {
          nickname = prof.name?.trim() || null
          level = getLevel(prof.sparks ?? 0, parseLevelingConfig(cfgRow?.value ?? null))
        }
      }
    } catch { /* anonymous */ }

    await ensureTable()
    await query(
      `INSERT INTO leaderboard (user_id, nickname, level, platform, difficulty, score, win)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, nickname, level, platform, diff, s, Boolean(win)]
    )
  } catch {
    // silent — never breaks the game
  }
  return new NextResponse(null, { status: 204 })
}
