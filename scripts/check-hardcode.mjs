#!/usr/bin/env node
/**
 * THREEP — страж дизайн-системы: ругается на хардкод цветов (#hex, rgb()/rgba()/
 * hsl()) в брендовых компонентах. Всё должно идти через CSS-переменные/токены.
 *
 * Использование:
 *   node scripts/check-hardcode.mjs            # все брендовые файлы
 *   node scripts/check-hardcode.mjs <files...> # только указанные (вызывает pre-commit)
 *
 * Выход 1 при нарушениях. Разрешённые места (определения токенов, админка-тулза,
 * пиксель-арт игры) в ALLOW — там цвета задаются намеренно.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()

// Файлы/папки, где хардкод цветов допустим (токены, админ-превью, арт игры)
const ALLOW = [
  'app/globals.css',
  'components/ThemeStyles.tsx',
  'components/BatAnimation.tsx',
  'components/BatAnimation.module.css',
  'components/GlitterCanvas.tsx',   // canvas-арт (динамические rgb)
  'components/RouteTransition.module.css', // VHS-арт: хром-аберрация = намеренные red/cyan
  'app/admin/',          // админка — внутренний инструмент, не бренд-витрина
  'scripts/',
  'node_modules/',
  '.next/',
]

// Сканируем только бренд-поверхности
const SCAN_DIRS = ['components', 'app']
const EXT = /\.(tsx|module\.css)$/

const HEX_G  = /#[0-9a-fA-F]{3,8}\b/g
const FUNC_G = /\b(rgba?|hsla?)\s*\(([^)]*)\)/gi

// Структурные цвета (маски/тени/скримы) — чёрный/белый — это НЕ тема, пропускаем.
const isStructHex = h => /^#(0{3,8}|f{3,8})$/i.test(h)
function isStructFunc(name, args) {
  if (/^hsl/i.test(name)) return false // hsl всегда «настоящий» цвет
  const n = args.split(',').map(s => parseFloat(s.trim()))
  const [r, g, b] = n
  const black = r === 0 && g === 0 && b === 0
  const white = r === 255 && g === 255 && b === 255
  return black || white
}

// Найти первый «настоящий» (не структурный) цветовой литерал в строке
function findColor(line) {
  if (/var\(--|data:image/.test(line)) return null
  for (const m of line.matchAll(HEX_G)) if (!isStructHex(m[0])) return m[0]
  for (const m of line.matchAll(FUNC_G)) if (!isStructFunc(m[1], m[2])) return `${m[1]}(...)`
  return null
}

function norm(p) { return relative(ROOT, p).split(sep).join('/') }
function allowed(rel) { return ALLOW.some(a => rel === a || rel.startsWith(a)) }

function walk(dir, out) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const full = join(dir, e)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walk(full, out)
    else if (EXT.test(e)) out.push(full)
  }
}

function collectFiles() {
  const argv = process.argv.slice(2).filter(a => !a.startsWith('-'))
  if (argv.length) {
    return argv.map(a => join(ROOT, a)).filter(f => EXT.test(f))
  }
  const out = []
  for (const d of SCAN_DIRS) walk(join(ROOT, d), out)
  return out
}

const violations = []
for (const file of collectFiles()) {
  const rel = norm(file)
  if (allowed(rel)) continue
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  text.split('\n').forEach((line, i) => {
    const hit = findColor(line)
    if (hit) violations.push({ rel, line: i + 1, hit, text: line.trim().slice(0, 90) })
  })
}

if (violations.length === 0) {
  console.log('✓ Хардкод цветов не найден — дизайн-система чиста.')
  process.exit(0)
}

console.error(`\n✗ Найден хардкод цветов (${violations.length}). Используй токены: var(--accent), var(--bg) и т.д.\n`)
for (const v of violations) {
  console.error(`  ${v.rel}:${v.line}  «${v.hit}»  ${v.text}`)
}
console.error('\nЕсли цвет действительно нужен литералом (арт/токен) — добавь файл в ALLOW в scripts/check-hardcode.mjs.\n')
process.exit(1)
