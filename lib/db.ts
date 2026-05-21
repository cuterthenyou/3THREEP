import { Pool, QueryResult } from 'pg'

// Создаём пул подключений к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Универсальная функция для выполнения SQL запросов
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  const client = await pool.connect()
  
  try {
    const result = await client.query<T>(text, params)
    const duration = Date.now() - start
    
    // Логируем медленные запросы (>100ms)
    if (duration > 100) {
      console.warn('Slow query:', { text, duration, rows: result.rowCount })
    }
    
    return result
  } catch (error) {
    console.error('Database query error:', { text, params, error })
    throw error
  } finally {
    client.release()
  }
}

// Хелпер для получения одной записи
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.rows[0] || null
}

// Хелпер для получения массива записей
export async function queryMany<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

// Экспортируем пул для использования в транзакциях
export { pool }
