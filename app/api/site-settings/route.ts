import { queryMany } from '@/lib/db'
import { NextResponse } from 'next/server'

const PUBLIC_KEYS = new Set([
  'logo_icon_url',
  'logo_text_url',
  'color_bg_light',
  'color_text_light',
  'color_accent_light',
  'color_bg_dark',
  'color_text_dark',
  'color_accent_dark',
  'font_heading',
  'font_body',
  'font_price',
  'grain_opacity',
  'border_radius_scale',
  'animation_speed',
  'custom_cursor_enabled',
  'custom_cursor_svg_url',
  'custom_cursor_color_light',
  'custom_cursor_color_dark',
  'grain_opacity_light',
  'grain_opacity_dark',
  'glitter_enabled',
  'glitter_intensity',
  // Переход между страницами (RouteTransition читает их через этот API) —
  // без них тумблер «выкл» в админке игнорировался: ключ не доходил до клиента.
  'page_transition_enabled',
  'page_transition_intensity',
])

export async function GET() {
  try {
    const rows = await queryMany('SELECT key, value FROM site_settings')
    const settings: Record<string, string | null> = {}
    for (const row of rows) {
      if (PUBLIC_KEYS.has(row.key)) settings[row.key] = row.value
    }
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({})
  }
}
