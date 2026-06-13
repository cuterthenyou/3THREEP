import { handlers } from '@/lib/auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { NextResponse, type NextRequest } from 'next/server'

// ── Анти-брут/спам OTP по IP + email ──────────────────────────────────────────
// Отправка кода (POST …/signin) и проверка кода (GET …/callback/email) проходят
// через этот catch-all. Лимит по IP здесь (фронт перехватывает 429); лимит по
// email — дополнительно внутри lib/auth.ts (sendVerificationRequest/
// useVerificationToken), где он чисто интегрируется с NextAuth.
const WINDOW = 15 * 60 * 1000 // 15 минут
const SEND_IP_LIMIT = 20      // отправок кода с одного IP / 15 мин (общий NAT ок)
const VERIFY_IP_LIMIT = 40    // проверок кода с одного IP / 15 мин

const tooMany = () =>
  NextResponse.json(
    { error: 'RateLimit', message: 'Слишком много попыток. Подожди немного.' },
    { status: 429 },
  )

export async function POST(req: NextRequest) {
  // Отправка OTP: POST на …/signin(/email)
  if (req.nextUrl.pathname.includes('/signin')) {
    const ip = clientIp(req)
    const r = await rateLimit('otp_send_ip', `ip:${ip}`, SEND_IP_LIMIT, WINDOW)
    if (!r.ok) return tooMany()
  }
  return handlers.POST(req)
}

export async function GET(req: NextRequest) {
  // Проверка OTP: GET на …/callback/email
  if (req.nextUrl.pathname.includes('/callback/email')) {
    const ip = clientIp(req)
    const r = await rateLimit('otp_verify_ip', `ip:${ip}`, VERIFY_IP_LIMIT, WINDOW)
    if (!r.ok) return tooMany()
  }
  return handlers.GET(req)
}
