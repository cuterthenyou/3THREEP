/**
 * Очистка БД Amvera PostgreSQL
 * 
 * ВНИМАНИЕ: Этот скрипт удаляет ВСЕ таблицы из БД!
 * Используй только если нужно запустить миграцию заново.
 */

const { Pool } = require('pg')

// Загрузка переменных окружения
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.migration' })

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function cleanDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('\n' + '='.repeat(60))
    log.warning('ОЧИСТКА БАЗЫ ДАННЫХ')
    log.warning('Все таблицы будут удалены!')
    console.log('='.repeat(60) + '\n')
    
    // Проверка подключения
    log.info('Подключение к БД...')
    await client.query('SELECT NOW()')
    log.success('Подключение установлено')
    
    // Удаление таблиц в обратном порядке (из-за внешних ключей)
    const tables = [
      'magic_links',
      'messages',
      'order_items',
      'orders',
      'products',
      'categories',
      'profiles',
      'users',
    ]
    
    log.info('Удаление таблиц...')
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
        log.success(`Таблица ${table} удалена`)
      } catch (error) {
        log.warning(`Не удалось удалить ${table}: ${error.message}`)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    log.success('База данных очищена!')
    log.info('Теперь можно запустить миграцию: npm run migrate')
    console.log('='.repeat(60) + '\n')
    
  } catch (error) {
    log.error(`Ошибка очистки: ${error.message}`)
    console.error(error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

cleanDatabase()
