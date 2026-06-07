import { queryMany } from '@/lib/db'

const DEFAULTS = {
  color_bg_light:     '#a9342a',
  color_text_light:   '#f29774',
  color_accent_light: '#f29774',
  color_bg_dark:      '#1c1c1e',
  color_text_dark:    '#FCB0B2',
  color_accent_dark:  '#FCB0B2',
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

export default async function ThemeStyles() {
  let settings: Record<string, string | null> = {}
  try {
    const rows = await queryMany('SELECT key, value FROM site_settings')
    for (const row of rows) settings[row.key] = row.value
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

  const fontHeading  = get('font_heading')
  const fontBody     = get('font_body')
  const fontPrice    = get('font_price')

  const grainRaw     = parseFloat(get('grain_opacity'))
  const grainOpacity = isNaN(grainRaw) ? '0.055' : String(Math.min(1, Math.max(0, grainRaw)))

  const radiusScale  = get('border_radius_scale')
  const radiusValue  = RADIUS_MAP[radiusScale] ?? '0px'

  const speedScale   = get('animation_speed')
  const speedValue   = SPEED_MAP[speedScale] ?? '1'

  // Only emit overrides when they differ from CSS defaults, to avoid unnecessary style bloat.
  // We always emit so that admin changes apply instantly without globals.css edits.
  // Font aliases: override the named vars so all CSS modules (var(--font-onder) etc.) also respond
  const fontOnder   = fontHeading
  const fontInvolve = fontBody
  const fontDeutsch = fontPrice

  const css = `
:root {
  --bg:         ${bgLight};
  --bg-2:       color-mix(in srgb, ${bgLight} 80%, black);
  --text:       ${textLight};
  --text-muted: color-mix(in srgb, ${textLight} 60%, transparent);
  --accent:     ${accentLight};
  --accent-2:   color-mix(in srgb, ${accentLight} 25%, transparent);
  --border:     color-mix(in srgb, ${accentLight} 20%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bgLight} 82%, transparent);
  --bg-subtle:  color-mix(in srgb, ${accentLight} 8%, transparent);
  --border-soft: color-mix(in srgb, ${accentLight} 12%, transparent);
  --border-mid:  color-mix(in srgb, ${accentLight} 30%, transparent);
  --accent-glow: color-mix(in srgb, ${accentLight} 35%, transparent);
  --bg-card:    ${accentLight};
  --text-on-card: ${bgLight};
  --font-heading:  '${fontHeading}', sans-serif;
  --font-body:     '${fontBody}', sans-serif;
  --font-price:    '${fontPrice}', sans-serif;
  --font-onder:    '${fontOnder}', sans-serif;
  --font-involve:  '${fontInvolve}', sans-serif;
  --font-deutsch:  '${fontDeutsch}', sans-serif;
  --grain-opacity: ${grainOpacity};
  --radius-base:   ${radiusValue};
  --animation-speed: ${speedValue};
}
[data-theme="dark"] {
  --bg:         ${bgDark};
  --bg-2:       color-mix(in srgb, ${bgDark} 60%, black);
  --text:       ${textDark};
  --text-muted: color-mix(in srgb, ${textDark} 55%, transparent);
  --accent:     ${accentDark};
  --accent-2:   color-mix(in srgb, ${accentDark} 25%, transparent);
  --border:     color-mix(in srgb, ${accentDark} 18%, transparent);
  --header-scrolled-bg: color-mix(in srgb, ${bgDark} 88%, transparent);
  --bg-subtle:  color-mix(in srgb, ${accentDark} 8%, transparent);
  --border-soft: color-mix(in srgb, ${accentDark} 12%, transparent);
  --border-mid:  color-mix(in srgb, ${accentDark} 30%, transparent);
  --accent-glow: color-mix(in srgb, ${accentDark} 35%, transparent);
  --bg-card:    ${accentDark};
  --text-on-card: ${bgDark};
}
`.trim()

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
