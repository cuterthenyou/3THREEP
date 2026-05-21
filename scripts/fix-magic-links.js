require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.migration' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function fixMagicLinks() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Исправление таблицы magic_links...')
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../migration/03_fix_magic_links.sql'),
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('✅ Таблица magic_links исправлена!')
  } catch (error) {
    console.error('❌ Ошибка:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixMagicLinks()
