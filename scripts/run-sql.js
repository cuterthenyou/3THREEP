/**
 * Применить один SQL-файл к БД (DATABASE_URL).
 * Использование:  node scripts/run-sql.js migration/09_account_systems.sql
 *
 * Безопасно для идемпотентных миграций (CREATE TABLE IF NOT EXISTS,
 * ADD COLUMN IF NOT EXISTS, ON CONFLICT DO NOTHING).
 */
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.migration' })

const file = process.argv[2]
if (!file) {
  console.error('❌ Укажи путь к .sql файлу: node scripts/run-sql.js migration/09_account_systems.sql')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), file)
if (!fs.existsSync(sqlPath)) {
  console.error(`❌ Файл не найден: ${sqlPath}`)
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  const client = await pool.connect()
  try {
    console.log(`🚀 Применяю ${file} ...`)
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ Готово')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ Ошибка:', e.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

run()
