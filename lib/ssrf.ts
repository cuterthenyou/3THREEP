// ════════════════════════════════════════════════════════════════════
// Анти-SSRF: проверка, что хост запроса не указывает во внутреннюю сеть.
// Используется прокси-роутом (/api/proxy), который тянет внешние картинки/SVG.
// Блокируем loopback/private/link-local/reserved диапазоны и метадату облака.
// Доменные имена дополнительно РЕЗОЛВИМ (assertSafeResolvedHost) и проверяем
// КАЖДЫЙ полученный IP — это закрывает базовый DNS-rebinding (домен → приватный
// IP). Остаточный TOCTOU (резолв при fetch может отличаться от проверочного)
// для картиночного прокси приемлем — отмечено как follow-up.
// ════════════════════════════════════════════════════════════════════

import { lookup } from 'dns/promises'

function ipv4Blocked(ip: string): boolean {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  if (a > 255 || b > 255 || Number(m[3]) > 255 || Number(m[4]) > 255) return true
  if (a === 0) return true                    // 0.0.0.0/8
  if (a === 10) return true                   // 10.0.0.0/8 private
  if (a === 127) return true                  // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true     // 169.254.0.0/16 link-local (метадата облака)
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true     // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64.0.0/10 CGNAT
  if (a >= 224) return true                   // multicast/reserved
  return false
}

/** true → хост запрещён (внутренний/зарезервированный). */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '') // снять скобки IPv6
  if (!h) return true
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.lan')) return true

  // IPv6 loopback / unique-local / link-local
  if (h === '::1' || h === '::') return true
  if (h.startsWith('fc') || h.startsWith('fd')) return true // fc00::/7 ULA
  if (h.startsWith('fe8') || h.startsWith('fe9') || h.startsWith('fea') || h.startsWith('feb')) return true // fe80::/10
  // IPv4-mapped IPv6 (::ffff:10.0.0.1)
  const mapped = h.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return ipv4Blocked(mapped[1])

  return ipv4Blocked(h)
}

/** Полная валидация URL для прокси: только http/https, стандартные порты, не внутренний хост. */
export function isSafeProxyUrl(raw: string): boolean {
  let u: URL
  try { u = new URL(raw) } catch { return false }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
  if (u.port && u.port !== '80' && u.port !== '443') return false
  if (u.username || u.password) return false
  return !isBlockedHost(u.hostname)
}

/**
 * Резолвит хост URL и проверяет, что НИ ОДИН полученный IP не указывает во
 * внутреннюю сеть. Закрывает DNS-rebinding: домен прошёл isBlockedHost (не
 * литеральный приватный IP), но A/AAAA указывает на 169.254.169.254 / 10.x и т.п.
 * Если хост — уже литеральный IP, isBlockedHost его и так покрыл; резолв пропускаем.
 * @returns true — безопасно резолвится во внешний IP.
 */
export async function assertSafeResolvedHost(hostname: string): Promise<boolean> {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  // Литеральный IP — уже проверен синхронно, повторный резолв не нужен.
  if (/^[\d.]+$/.test(h) || h.includes(':')) return !isBlockedHost(h)
  try {
    const addrs = await lookup(h, { all: true })
    if (!addrs.length) return false
    return addrs.every((a) => !isBlockedHost(a.address))
  } catch {
    return false // не резолвится — не проксируем
  }
}
