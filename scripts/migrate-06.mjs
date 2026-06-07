// Run: node scripts/migrate-06.mjs
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const { Pool } = require('pg')
const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch {
  console.error('No .env.local found — using existing process.env')
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const sql = readFileSync(join(__dirname, '..', 'migration', '06_custom_fonts.sql'), 'utf8')

try {
  await pool.query(sql)
  console.log('✅ Migration 06_custom_fonts.sql applied successfully')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
} finally {
  await pool.end()
}
