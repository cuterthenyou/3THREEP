/**
 * Автоматическая миграция данных из Supabase в Amvera PostgreSQL
 * 
 * Этот скрипт:
 * 1. Подключается к Amvera PostgreSQL
 * 2. Создаёт все таблицы
 * 3. Импортирует данные из CSV файлов
 * 4. Проверяет количество записей
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Загрузка переменных окружения
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.migration' })

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`),
}

// Подключение к БД
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Чтение SQL файла
function readSQL(filename) {
  const filePath = path.join(__dirname, '..', 'migration', filename)
  return fs.readFileSync(filePath, 'utf-8')
}

// Чтение CSV файла
function readCSV(filename) {
  const filePath = path.join(__dirname, '..', 'Supabase CSV', filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV файл не найден: ${filename}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

// Парсинг CSV в массив объектов
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }
  
  return rows
}

// Парсинг строки CSV с учётом кавычек и массивов
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  let inArray = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"' && nextChar === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === '[' && !inQuotes) {
      inArray = true
      current += char
    } else if (char === ']' && !inQuotes) {
      inArray = false
      current += char
    } else if (char === ',' && !inQuotes && !inArray) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}

// Преобразование значения для PostgreSQL
function formatValue(value, columnName) {
  if (value === '' || value === 'NULL' || value === null) {
    return null
  }
  
  // Массивы (images, sizes, colors)
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value)
      return parsed
    } catch (e) {
      log.warning(`Не удалось распарсить массив: ${value}`)
      return []
    }
  }
  
  // Boolean
  if (value === 'true' || value === 'TRUE') return true
  if (value === 'false' || value === 'FALSE') return false
  
  // Числа
  if (columnName === 'price' || columnName === 'stock' || columnName === 'quantity') {
    return parseInt(value, 10)
  }
  
  return value
}

// Создание таблиц
async function createTables(client) {
  log.step('Создание таблиц...')
  
  const schema = readSQL('02_amvera_schema.sql')
  await client.query(schema)
  
  log.success('Таблицы созданы')
}

// Импорт данных из CSV
async function importCSV(client, tableName, csvFilename, columns) {
  log.step(`Импорт ${tableName}...`)
  
  const csvContent = readCSV(csvFilename)
  const rows = parseCSV(csvContent)
  
  if (rows.length === 0) {
    log.warning(`${tableName}: нет данных для импорта`)
    return 0
  }
  
  let imported = 0
  
  for (const row of rows) {
    const values = columns.map(col => formatValue(row[col], col))
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
    
    try {
      await client.query(query, values)
      imported++
    } catch (error) {
      log.error(`Ошибка при импорте в ${tableName}: ${error.message}`)
      console.error('Данные:', row)
      throw error
    }
  }
  
  log.success(`${tableName}: импортировано ${imported} записей`)
  return imported
}

// Проверка количества записей
async function verifyData(client) {
  log.step('Проверка данных...')
  
  const result = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users_count,
      (SELECT COUNT(*) FROM categories) as categories_count,
      (SELECT COUNT(*) FROM profiles) as profiles_count,
      (SELECT COUNT(*) FROM products) as products_count,
      (SELECT COUNT(*) FROM orders) as orders_count,
      (SELECT COUNT(*) FROM order_items) as order_items_count,
      (SELECT COUNT(*) FROM messages) as messages_count
  `)
  
  const counts = result.rows[0]
  
  console.log('\n📊 Количество записей:')
  console.log(`   users: ${counts.users_count}`)
  console.log(`   categories: ${counts.categories_count}`)
  console.log(`   profiles: ${counts.profiles_count}`)
  console.log(`   products: ${counts.products_count}`)
  console.log(`   orders: ${counts.orders_count}`)
  console.log(`   order_items: ${counts.order_items_count}`)
  console.log(`   messages: ${counts.messages_count}`)
  console.log('')
  
  // Проверка ожидаемых значений
  const expected = {
    users_count: 3,
    categories_count: 2,
    profiles_count: 3,
    products_count: 4,
    orders_count: 7,
    order_items_count: 9,
    messages_count: 16,
  }
  
  let allMatch = true
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (parseInt(counts[key]) !== expectedValue) {
      log.error(`${key}: ожидалось ${expectedValue}, получено ${counts[key]}`)
      allMatch = false
    }
  }
  
  if (allMatch) {
    log.success('Все данные импортированы корректно!')
  } else {
    log.warning('Обнаружены расхождения в количестве записей')
  }
  
  return allMatch
}

// Основная функция миграции
async function migrate() {
  const client = await pool.connect()
  
  try {
    console.log('\n' + '='.repeat(60))
    log.info('Миграция данных из Supabase в Amvera PostgreSQL')
    console.log('='.repeat(60) + '\n')
    
    // Проверка подключения
    log.step('Проверка подключения к БД...')
    await client.query('SELECT NOW()')
    log.success('Подключение установлено')
    
    // Создание таблиц
    await createTables(client)
    
    // Импорт данных в правильном порядке (из-за внешних ключей)
    await importCSV(client, 'users', 'users.csv', ['id', 'email', 'created_at', 'email_confirmed_at'])
    
    await importCSV(client, 'categories', 'categories_rows.csv', [
      'slug', 'name', 'texture_url', 'logo_top_url', 'logo_bottom_url',
      'texture_url_2', 'texture_url_3', 'active'
    ])
    
    await importCSV(client, 'profiles', 'profiles_rows.csv', [
      'id', 'name', 'email', 'avatar_url', 'created_at'
    ])
    
    await importCSV(client, 'products', 'products_rows.csv', [
      'id', 'name', 'description', 'price', 'images', 'sizes', 'colors',
      'stock', 'active', 'category', 'created_at', 'product_type'
    ])
    
    await importCSV(client, 'orders', 'orders_rows.csv', [
      'id', 'user_id', 'status', 'total', 'delivery_address',
      'tracking_number', 'comment', 'created_at'
    ])
    
    await importCSV(client, 'order_items', 'order_items_rows.csv', [
      'id', 'order_id', 'product_id', 'product_name', 'product_image',
      'size', 'color', 'quantity', 'price'
    ])
    
    await importCSV(client, 'messages', 'messages_rows.csv', [
      'id', 'order_id', 'sender_id', 'is_admin', 'text', 'created_at'
    ])
    
    // Проверка данных
    const success = await verifyData(client)
    
    console.log('\n' + '='.repeat(60))
    if (success) {
      log.success('🎉 Миграция завершена успешно!')
    } else {
      log.warning('⚠️  Миграция завершена с предупреждениями')
    }
    console.log('='.repeat(60) + '\n')
    
  } catch (error) {
    log.error(`Ошибка миграции: ${error.message}`)
    console.error(error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// Запуск миграции
migrate()
