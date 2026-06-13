const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

/**
 * Экранирует пользовательский текст перед вставкой в сообщение Telegram с
 * parse_mode:'HTML'. Без этого адрес/ник/текст с `<`/`&` ломают разметку или
 * протаскивают теги (<a href>…) в админский чат. Статические теги-обёртки
 * (<b>/<code>) добавляем уже ВОКРУГ экранированного значения.
 */
export function escapeTgHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendTelegram(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) return
  const body: Record<string, unknown> = { chat_id: CHAT_ID, text, parse_mode: 'HTML' }
  if (process.env.TELEGRAM_THREAD_ID) {
    body.message_thread_id = Number(process.env.TELEGRAM_THREAD_ID)
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('[Telegram] Error:', JSON.stringify(err))
    }
  } catch (err) {
    console.error('[Telegram] Fetch error:', err)
  }
}
