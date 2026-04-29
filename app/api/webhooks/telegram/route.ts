import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID
const SECRET = process.env.WEBHOOK_SECRET

async function sendTelegram(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) return
  const body: Record<string, unknown> = { chat_id: CHAT_ID, text, parse_mode: 'HTML' }
  if (process.env.TELEGRAM_THREAD_ID) {
    body.message_thread_id = Number(process.env.TELEGRAM_THREAD_ID)
  }
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    console.error('[Telegram] Error:', JSON.stringify(err))
  }
}

export async function POST(req: NextRequest) {
  if (SECRET) {
    const headerSecret = req.headers.get('x-webhook-secret')
    if (headerSecret !== SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json()
  const { type, table, record } = body

  if (type !== 'INSERT' || !record) {
    return NextResponse.json({ ok: true })
  }

  try {
    if (table === 'messages' && record.is_admin === false) {
      const orderId = String(record.order_id).slice(0, 8)
      const text = record.text?.slice(0, 200) || ''
      await sendTelegram(
        `💬 <b>Новое сообщение по заказу</b>\n\n` +
        `Заказ: <code>#${orderId}</code>\n` +
        `Текст: ${text}\n\n` +
        `👉 https://3threep.ru/admin/orders/${record.order_id}`
      )
    }

    if (table === 'orders') {
      const orderId = String(record.id).slice(0, 8)
      const total = Number(record.total).toLocaleString('ru-RU')
      await sendTelegram(
        `🛒 <b>Новый заказ!</b>\n\n` +
        `Заказ: <code>#${orderId}</code>\n` +
        `Сумма: ${total} ₽\n` +
        `Адрес: ${record.delivery_address || '—'}\n\n` +
        `👉 https://3threep.ru/admin/orders/${record.id}`
      )
    }
  } catch {
    // не блокируем ответ если Telegram недоступен
  }

  return NextResponse.json({ ok: true })
}
