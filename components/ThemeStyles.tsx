import { queryMany } from '@/lib/db'

export interface CustomFont { id: number; name: string; url: string }

const DEFAULTS = {
  color_bg_light:     '#a9342a',
  color_text_light:   '#f29774',
  color_accent_light: '#f29774',
  color_bg_dark:      '#1c1c1e',
  color_text_dark:    '#FCB0B2',
  color_accent_dark:  '#FCB0B2',
  // trip — скрытая психоделическая тема (теперь конфигурируется из админки)
  color_bg_trip:      '#160a2b',
  color_text_trip:    '#cdbcff',
  color_accent_trip:  '#ff5ad0',
  font_heading:       'ONDER',
  font_body:          'Involve',
  font_price:         'DeutschGothic',
  grain_opacity:      '0.055',
  border_radius_scale: 'sharp',
  animation_speed:    'normal',
}

const RADIUS_MAP: Record<string, string> = {
  sharp:   '0px',
  slight:  '4px',
  rounded: '10px',
}

const SPEED_MAP: Record<string, string> = {
  off:    '0',
  slow:   '2',
  normal: '1',
  fast:   '0.5',
}

function isHex(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v.trim())
}

function fontFormat(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = { woff2: 'woff2', woff: 'woff', otf: 'opentype', ttf: 'truetype' }
  return map[ext] ?? 'truetype'
}

/** Clamp a numeric setting to a range, falling back to a default if NaN. */
function num(raw: string | null | undefined, def: number, min: number, max: number): number {
  const v = parseFloat(raw ?? '')
  if (isNaN(v)) return def
  return Math.min(max, Math.max(min, v))
}

export default async function ThemeStyles() {
  let settings: Record<string, string | null> = {}
  let customFonts: CustomFont[] = []
  try {
    const [settingsRows, fontRows] = await Promise.all([
      queryMany('SELECT key, value FROM site_settings'),
      queryMany('SELECT id, name, url FROM custom_fonts ORDER BY id'),
    ])
    for (const row of settingsRows) settings[row.key] = row.value
    customFonts = fontRows
  } catch {
    // DB unavailable — fall through to defaults
  }

  function get(key: keyof typeof DEFAULTS) {
    return settings[key] ?? DEFAULTS[key]
  }

  const bgLight      = isHex(get('color_bg_light'))     ? get('color_bg_light')     : DEFAULTS.color_bg_light
  const textLight    = isHex(get('color_text_light'))    ? get('color_text_light')   : DEFAULTS.color_text_light
  const accentLight  = isHex(get('color_accent_light'))  ? get('color_accent_light') : DEFAULTS.color_accent_light
  const bgDark       = isHex(get('color_bg_dark'))       ? get('color_bg_dark')      : DEFAULTS.color_bg_dark
  const textDark     = isHex(get('color_text_dark'))     ? get('color_text_dark')    : DEFAULTS.color_text_dark
  const accentDark   = isHex(get('color_accent_dark'))   ? get('color_accent_dark')  : DEFAULTS.color_accent_dark
  const bgTrip       = isHex(get('color_bg_trip'))       ? get('color_bg_trip')      : DEFAULTS.color_bg_trip
  const textTrip     = isHex(get('color_text_trip'))     ? get('color_text_trip')    : DEFAULTS.color_text_trip
  const accentTrip   = isHex(get('color_accent_trip'))   ? get('color_accent_trip')  : DEFAULTS.color_accent_trip

  const fontHeading  = get('font_heading')
  const fontBody     = get('font_body')
  const fontPrice    = get('font_price')

  const grainLightRaw = parseFloat(settings['grain_opacity_light'] ?? settings['grain_opacity'] ?? '0.08')
  const grainDarkRaw  = parseFloat(settings['grain_opacity_dark']  ?? settings['grain_opacity'] ?? '0.055')
  const grainLight = isNaN(grainLightRaw) ? '0.08'  : String(Math.min(1, Math.max(0, grainLightRaw)))
  const grainDark  = isNaN(grainDarkRaw)  ? '0.055' : String(Math.min(1, Math.max(0, grainDarkRaw)))

  const grainSizeRaw = parseInt(settings['grain_size'] ?? '256', 10)
  const grainSize    = isNaN(grainSizeRaw) ? 256 : Math.max(64, Math.min(512, grainSizeRaw))

  // Скругление: новый числовой ключ border_radius_px (0–24px); fallback на старый пресет.
  const radiusValue  = settings['border_radius_px'] != null
    ? `${num(settings['border_radius_px'], 0, 0, 24)}px`
    : (RADIUS_MAP[get('border_radius_scale')] ?? '0px')
  // Радиус кнопок — отдельный регулятор (Яна: «менее острые кнопки»); по умолчанию = базовому.
  const radiusBtn    = settings['button_radius_px'] != null
    ? `${num(settings['button_radius_px'], 0, 0, 24)}px`
    : radiusValue

  const speedScale   = get('animation_speed')
  const speedValue   = SPEED_MAP[speedScale] ?? '1'

  // ── Типографика (множители-шкалы + межстрочные) ──
  const typeHeadingScale   = num(settings['type_heading_scale'],   1,   0.6, 1.8)
  const typeHeadingLeading = num(settings['type_heading_leading'], 1.3, 0.9, 2.0)
  const typeBodyScale      = num(settings['type_body_scale'],      1,   0.6, 1.8)
  const typeBodyLeading    = num(settings['type_body_leading'],    1.6, 1.0, 2.4)
  const typePriceScale     = num(settings['type_price_scale'],     1,   0.6, 1.8)
  // Пер-секционные оверрайды (по умолчанию наследуют глобальные)
  const tCatHeading  = num(settings['type_catalog_heading_scale'], typeHeadingScale, 0.6, 1.8)
  const tCatBody     = num(settings['type_catalog_body_scale'],    typeBodyScale,    0.6, 1.8)
  const tCatBodyLead = num(settings['type_catalog_body_leading'],  1.8,              1.0, 2.4)
  const tFootHeading = num(settings['type_footer_heading_scale'],  typeHeadingScale, 0.6, 1.8)
  const tFootHeadLead = num(settings['type_footer_heading_leading'], typeHeadingLeading, 0.9, 2.0)
  const tFootBody    = num(settings['type_footer_body_scale'],     typeBodyScale,    0.6, 1.8)
  const tFootBodyLead = num(settings['type_footer_body_leading'],  typeBodyLeading,  1.0, 2.4)
  const tModalBody   = num(settings['type_modal_body_scale'],      typeBodyScale,    0.6, 1.8)
  const tModalBodyLead = num(settings['type_modal_body_leading'],  typeBodyLeading,  1.0, 2.4)

  // ── Скорость видео Hero (дефолт) ──
  const heroSpeed = num(settings['hero_speed_default'], 1, 0.25, 3)

  // ── Trip-эффекты ──
  const tripBreathe   = settings['trip_breathe'] !== 'false'   // дыхание цвета вкл/выкл
  const tripDriftSec  = num(settings['trip_drift_speed'], 16, 4, 60)   // период дрейфа пятен, сек
  const tripBlobOpacity = num(settings['trip_blob_opacity'], 1, 0, 1)  // интенсивность blobs

  // Font aliases: override the named vars so all CSS modules (var(--font-onder) etc.) also respond
  const fontOnder   = fontHeading
  const fontInvolve = fontBody
  const fontDeutsch = fontPrice

  // @font-face rules for custom uploaded fonts
  const fontFaces = customFonts.map(f =>
    `@font-face { font-family: '${f.name}'; src: url('${f.url}') format('${fontFormat(f.url)}'); font-display: swap; }`
  ).join('\n')

  const cursorColorLightRaw = settings['custom_cursor_color_light']
  const cursorColorDarkRaw  = settings['custom_cursor_color_dark']
  const cursorColorLight = cursorColorLightRaw && isHex(cursorColorLightRaw) ? cursorColorLightRaw : null
  const cursorColorDark  = cursorColorDarkRaw  && isHex(cursorColorDarkRaw)  ? cursorColorDarkRaw  : null

  let loadingPhrases: string[] | null = null
  try {
    const raw = settings['loading_phrases']
    if (raw) loadingPhrases = JSON.parse(raw)
  } catch { /* invalid JSON — ignore */ }

  // Общие токены, не зависящие от темы (типографика, радиусы, скорости)
  const sharedTokens = `
  --font-heading:  '${fontHeading}', sans-serif;
  --font-body:     '${fontBody}', sans-serif;
  --font-price:    '${fontPrice}', sans-serif;
  --font-onder:    '${fontOnder}', sans-serif;
  --font-involve:  '${fontInvolve}', sans-serif;
  --font-deutsch:  '${fontDeutsch}', sans-serif;
  --grain-size:    ${grainSize}px;
  --radius-base:   ${radiusValue};
  --radius-btn:    ${radiusBtn};
  --animation-speed: ${speedValue};
  --type-heading-scale:   ${typeHeadingScale};
  --type-heading-leading: ${typeHeadingLeading};
  --type-body-scale:      ${typeBodyScale};
  --type-body-leading:    ${typeBodyLeading};
  --type-price-scale:     ${typePriceScale};
  --type-catalog-heading-scale: ${tCatHeading};
  --type-catalog-body-scale:    ${tCatBody};
  --type-catalog-body-leading:  ${tCatBodyLead};
  --type-footer-heading-scale:  ${tFootHeading};
  --type-footer-heading-leading: ${tFootHeadLead};
  --type-footer-body-scale:     ${tFootBody};
  --type-footer-body-leading:   ${tFootBodyLead};
  --type-modal-body-scale:      ${tModalBody};
  --type-modal-body-leading:    ${tModalBodyLead};
  --hero-speed: ${heroSpeed};
  --trip-drift-dur: ${tripDriftSec}s;
  --trip-blob-opacity: ${tripBlobOpacity};`

  const css = `${fontFaces ? fontFaces + '\n' : ''}
:root {
  --bg:         ${bgLight};
  --bg-2:       color-mix(in srgb, ${bgLight} 80%, black);
  --text:       ${textLight};
  --text-muted: color-mix(in srgb, ${textLight} 60%, transparent);
  --accent:     ${accentLight};
  --accent-2:   color-mix(in srgb, ${accentLight} 25%, transparent);
  --border:     color-mix(in srgb, ${accentLight} 20%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bgLight} 56%, transparent);
  --bg-subtle:  color-mix(in srgb, ${accentLight} 8%, transparent);
  --border-soft: color-mix(in srgb, ${accentLight} 12%, transparent);
  --border-mid:  color-mix(in srgb, ${accentLight} 30%, transparent);
  --accent-glow: color-mix(in srgb, ${accentLight} 35%, transparent);
  --bg-card:    ${accentLight};
  --text-on-card: ${bgLight};
  /* legacy aliases — держим синхронно с темой, чтобы перекрашивалось ВСЁ */
  --color-accent:  ${accentLight};
  --color-primary: ${bgLight};
  --color-bg:      ${bgLight};
  --color-bg-dark: color-mix(in srgb, ${bgLight} 80%, black);
${sharedTokens}
  --grain-opacity: ${grainLight};
  --cursor-color: ${cursorColorLight ?? 'var(--accent)'};
}
[data-theme="dark"] {
  --bg:         ${bgDark};
  --bg-2:       color-mix(in srgb, ${bgDark} 60%, black);
  --text:       ${textDark};
  --text-muted: color-mix(in srgb, ${textDark} 55%, transparent);
  --accent:     ${accentDark};
  --accent-2:   color-mix(in srgb, ${accentDark} 25%, transparent);
  --border:     color-mix(in srgb, ${accentDark} 18%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bgDark} 60%, transparent);
  --bg-subtle:  color-mix(in srgb, ${accentDark} 8%, transparent);
  --border-soft: color-mix(in srgb, ${accentDark} 12%, transparent);
  --border-mid:  color-mix(in srgb, ${accentDark} 30%, transparent);
  --accent-glow: color-mix(in srgb, ${accentDark} 35%, transparent);
  --bg-card:    ${accentDark};
  --text-on-card: ${bgDark};
  --color-accent:  ${accentDark};
  --color-primary: ${bgDark};
  --color-bg:      ${bgDark};
  --color-bg-dark: color-mix(in srgb, ${bgDark} 60%, black);
  --grain-opacity: ${grainDark};
  --cursor-color: ${cursorColorDark ?? 'var(--accent)'};
}
html[data-theme="trip"] {
  --bg:         ${bgTrip};
  --bg-2:       color-mix(in srgb, ${bgTrip} 70%, white);
  --text:       ${textTrip};
  --text-muted: color-mix(in srgb, ${textTrip} 60%, transparent);
  --accent:     ${accentTrip};
  --accent-2:   color-mix(in srgb, ${accentTrip} 25%, transparent);
  --border:     color-mix(in srgb, ${accentTrip} 28%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bgTrip} 60%, transparent);
  --bg-subtle:  color-mix(in srgb, ${accentTrip} 10%, transparent);
  --border-soft: color-mix(in srgb, ${accentTrip} 16%, transparent);
  --border-mid:  color-mix(in srgb, ${accentTrip} 32%, transparent);
  --overlay-bg:  color-mix(in srgb, ${bgTrip} 96%, black);
  --accent-glow: color-mix(in srgb, ${accentTrip} 45%, transparent);
  --bg-card:    ${accentTrip};
  --text-on-card: ${bgTrip};
  --color-accent:  ${accentTrip};
  --color-primary: ${bgTrip};
  --color-bg:      ${bgTrip};
  --color-bg-dark: color-mix(in srgb, ${bgTrip} 70%, black);
  --grain-opacity: 0.06;
  --cursor-color: var(--accent);
}
${tripBreathe ? '' : 'html[data-theme="trip"] .trip-breathe { display: none; }'}
`.trim()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {loadingPhrases && (
        <script dangerouslySetInnerHTML={{
          __html: `window.__THREEP_LOADING_PHRASES__=${JSON.stringify(loadingPhrases)};`
        }} />
      )}
    </>
  )
}
