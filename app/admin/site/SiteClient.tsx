'use client'

import { useState, useRef, useEffect } from 'react'
import a from '../admin.module.css'
import { AdminSection, AdminPageTitle, AdminTabContext, InfoTip } from '../components'
import { CHECKBOARD_LIGHT, CHECKBOARD_DARK, INPUT_STYLE } from '../adminStyles'
import { ColorPicker, FontSelect, GlitterPreview } from './parts'
import { parseLevelingConfig, getDiscount } from '@/lib/leveling'
import { PALETTES, DEFAULT_ENABLED } from '@/lib/palettes'
import type { CustomFont } from '@/components/ThemeStyles'

type SettingsTab = 'general' | 'colors' | 'fonts' | 'type' | 'effects' | 'animations' | 'catalog' | 'account' | 'content' | 'menu'

// Разделы по темам (страница /admin/themes) и по сайту (/admin/site).
const THEME_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'colors',  label: 'Цвета' },
  { id: 'fonts',   label: 'Шрифты' },
  { id: 'type',    label: 'Типографика' },
  { id: 'effects', label: 'Эффекты' },
  { id: 'animations', label: 'Анимации' },
]
const SITE_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'Бренд' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'account', label: 'Личный кабинет' },
  { id: 'content', label: 'Контент' },
  { id: 'menu',    label: 'Меню' },
]

// Медаль-ачивка для редактора текстов (title/description) в админке.
export interface AdminAchievement {
  key: string
  title: string
  description: string | null
  medal_key: string | null
  condition_type: string
  threshold: number
}

interface Props {
  initialSettings: Record<string, string | null>
  initialCustomFonts?: CustomFont[]
  initialAchievements?: AdminAchievement[]
  variant?: 'site' | 'themes'
}

const BUILTIN_FONTS = ['ONDER', 'Involve', 'DeutschGothic'] as const
type FontName = string

// Legacy-пресет → числовой множитель (для старых сохранённых значений animation_speed)
const LEGACY_SPEED: Record<string, number> = { off: 1, slow: 2, normal: 1, fast: 0.5 }

// Готовые палитры — клик заполняет все цвета (light/dark/trip), затем «Сохранить цвета»
interface ThemePreset {
  name: string
  bgL: string; textL: string; accentL: string
  bgD: string; textD: string; accentD: string
  bgT: string; textT: string; accentT: string
}
const THEME_PRESETS: ThemePreset[] = [
  { name: 'Терракота',
    bgL: '#a9342a', textL: '#f29774', accentL: '#f29774',
    bgD: '#1c1c1e', textD: '#FCB0B2', accentD: '#FCB0B2',
    bgT: '#160a2b', textT: '#cdbcff', accentT: '#ff5ad0' },
  { name: 'Неон-нуар',
    bgL: '#18181b', textL: '#d6f7ff', accentL: '#34e2ff',
    bgD: '#0b0b10', textD: '#d6f7ff', accentD: '#34e2ff',
    bgT: '#08010f', textT: '#ffd6f5', accentT: '#ff3bd0' },
  { name: 'Кислота',
    bgL: '#14160c', textL: '#e7ff8a', accentL: '#c6ff3a',
    bgD: '#0c0e08', textD: '#e7ff8a', accentD: '#aaff00',
    bgT: '#0a1402', textT: '#d6ffe0', accentT: '#6bff5a' },
  { name: 'Кровь',
    bgL: '#2a0d0d', textL: '#f0b9b9', accentL: '#e23b3b',
    bgD: '#140808', textD: '#f0b9b9', accentD: '#ff4d4d',
    bgT: '#16020a', textT: '#ffc2d6', accentT: '#ff2d6b' },
]

export default function SiteClient({ initialSettings, initialCustomFonts = [], initialAchievements = [], variant = 'site' }: Props) {
  const TABS = variant === 'themes' ? THEME_TABS : SITE_TABS
  const [activeTab, setActiveTab] = useState<SettingsTab>(TABS[0].id)

  // ── Тюнер геймификации (leveling_config) ──
  const _lvl = parseLevelingConfig(initialSettings['leveling_config'])
  const [lvlSparkOrder, setLvlSparkOrder]   = useState(String(_lvl.spark_per_order))
  const [lvlSparkExtra, setLvlSparkExtra]   = useState(String(_lvl.spark_per_extra_unit))
  const [lvlThresholds, setLvlThresholds]   = useState(_lvl.thresholds.join(', '))
  const [lvlIncrement, setLvlIncrement]     = useState(String(_lvl.increment_after))
  const [lvlDiscountMax, setLvlDiscountMax] = useState(String(_lvl.discount_max))
  const [savingLvl, setSavingLvl] = useState(false)
  const [lvlMsg, setLvlMsg] = useState('')
  // ── Hero video ──────────────────────────────────────────────────
  const [heroUrl, setHeroUrl] = useState<string | null>(initialSettings['hero_video_url'] ?? null)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [savingHero, setSavingHero] = useState(false)
  const [heroMsg, setHeroMsg] = useState('')
  const heroRef = useRef<HTMLInputElement>(null)
  // Hero MP4 (iOS Safari can't decode WebM) + poster image
  const [heroMp4Url, setHeroMp4Url] = useState<string | null>(initialSettings['hero_video_url_mp4'] ?? null)
  const [uploadingHeroMp4, setUploadingHeroMp4] = useState(false)
  const [heroMp4Msg, setHeroMp4Msg] = useState('')
  const heroMp4Ref = useRef<HTMLInputElement>(null)
  const [heroPosterUrl, setHeroPosterUrl] = useState<string | null>(initialSettings['hero_poster_url'] ?? null)
  const [uploadingHeroPoster, setUploadingHeroPoster] = useState(false)
  const [heroPosterMsg, setHeroPosterMsg] = useState('')
  const heroPosterRef = useRef<HTMLInputElement>(null)

  // ── Profile backgrounds ─────────────────────────────────────────
  const [profileBg, setProfileBg] = useState<string | null>(initialSettings['profile_bg_url'] ?? null)
  const [profileBgDark, setProfileBgDark] = useState<string | null>(initialSettings['profile_bg_url_dark'] ?? null)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingProfileDark, setUploadingProfileDark] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingProfileDark, setSavingProfileDark] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileDarkMsg, setProfileDarkMsg] = useState('')
  const profileRef = useRef<HTMLInputElement>(null)
  const profileDarkRef = useRef<HTMLInputElement>(null)

  // ── Logos ───────────────────────────────────────────────────────
  const [logoIconUrl, setLogoIconUrl] = useState<string | null>(initialSettings['logo_icon_url'] ?? null)
  const [logoTextUrl, setLogoTextUrl] = useState<string | null>(initialSettings['logo_text_url'] ?? null)
  const [uploadingLogoIcon, setUploadingLogoIcon] = useState(false)
  const [uploadingLogoText, setUploadingLogoText] = useState(false)
  const [logoIconMsg, setLogoIconMsg] = useState('')
  const [logoTextMsg, setLogoTextMsg] = useState('')
  const logoIconRef = useRef<HTMLInputElement>(null)
  const logoTextRef = useRef<HTMLInputElement>(null)

  // ── Colors ──────────────────────────────────────────────────────
  const [colorBgLight, setColorBgLight] = useState(initialSettings['color_bg_light'] ?? '#a9342a')
  const [colorTextLight, setColorTextLight] = useState(initialSettings['color_text_light'] ?? '#f29774')
  const [colorAccentLight, setColorAccentLight] = useState(initialSettings['color_accent_light'] ?? '#f29774')
  const [colorBgDark, setColorBgDark] = useState(initialSettings['color_bg_dark'] ?? '#1c1c1e')
  const [colorTextDark, setColorTextDark] = useState(initialSettings['color_text_dark'] ?? '#FCB0B2')
  const [colorAccentDark, setColorAccentDark] = useState(initialSettings['color_accent_dark'] ?? '#FCB0B2')
  const [savingColors, setSavingColors] = useState(false)
  const [colorsMsg, setColorsMsg] = useState('')

  // ── Fonts ───────────────────────────────────────────────────────
  const [fontHeading, setFontHeading] = useState<FontName>(initialSettings['font_heading'] ?? 'ONDER')
  const [fontBody, setFontBody] = useState<FontName>(initialSettings['font_body'] ?? 'Involve')
  const [fontPrice, setFontPrice] = useState<FontName>(initialSettings['font_price'] ?? 'DeutschGothic')
  const [savingFonts, setSavingFonts] = useState(false)
  const [fontsMsg, setFontsMsg] = useState('')

  // ── Custom fonts ─────────────────────────────────────────────────
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(initialCustomFonts)
  const [pendingFontFile, setPendingFontFile] = useState<File | null>(null)
  const [pendingFontName, setPendingFontName] = useState('')
  const [uploadingFont, setUploadingFont] = useState(false)
  const [fontUploadMsg, setFontUploadMsg] = useState('')
  const fontFileRef = useRef<HTMLInputElement>(null)

  // ── Cursor ──────────────────────────────────────────────────────
  const [cursorEnabled, setCursorEnabled] = useState(initialSettings['custom_cursor_enabled'] === 'true')
  const [cursorSvgUrl, setCursorSvgUrl] = useState<string | null>(initialSettings['custom_cursor_svg_url'] ?? null)
  const [cursorColorLight, setCursorColorLight] = useState(initialSettings['custom_cursor_color_light'] ?? '#f29774')
  const [cursorColorDark, setCursorColorDark] = useState(initialSettings['custom_cursor_color_dark'] ?? '#FCB0B2')
  const [savingCursor, setSavingCursor] = useState(false)
  const [savingCursorColors, setSavingCursorColors] = useState(false)
  const [uploadingCursor, setUploadingCursor] = useState(false)
  const [cursorMsg, setCursorMsg] = useState('')
  const [cursorColorsMsg, setCursorColorsMsg] = useState('')
  const cursorSvgRef = useRef<HTMLInputElement>(null)

  // ── Effects ─────────────────────────────────────────────────────
  const grainLightRaw = parseFloat(initialSettings['grain_opacity_light'] ?? initialSettings['grain_opacity'] ?? '0.08')
  const grainDarkRaw  = parseFloat(initialSettings['grain_opacity_dark']  ?? initialSettings['grain_opacity'] ?? '0.055')
  const [grainLight, setGrainLight] = useState(isNaN(grainLightRaw) ? 8   : Math.round(grainLightRaw * 1000) / 10)
  const [grainDark,  setGrainDark]  = useState(isNaN(grainDarkRaw)  ? 5.5 : Math.round(grainDarkRaw  * 1000) / 10)
  const grainScaleRaw = parseInt(initialSettings['grain_size'] ?? '256', 10)
  const [grainScale, setGrainScale] = useState(isNaN(grainScaleRaw) ? 256 : Math.max(64, Math.min(512, grainScaleRaw)))
  const [savingEffects, setSavingEffects] = useState(false)
  const [effectsMsg, setEffectsMsg] = useState('')

  // ── Анимации (вкладка «Анимации») ───────────────────────────────
  const _rawSpeed = initialSettings['animation_speed']
  const _speedNum = _rawSpeed != null && !isNaN(parseFloat(_rawSpeed)) ? parseFloat(_rawSpeed) : (LEGACY_SPEED[_rawSpeed ?? 'normal'] ?? 1)
  const [animSpeed, setAnimSpeed] = useState(Math.min(2, Math.max(0.5, _speedNum)))
  const [animReveal, setAnimReveal]   = useState(initialSettings['anim_reveal_enabled']  !== 'false')
  const [animHover, setAnimHover]     = useState(initialSettings['anim_hover_enabled']   !== 'false')
  const [animAmbient, setAnimAmbient] = useState(initialSettings['anim_ambient_enabled'] !== 'false')
  const [savingAnim, setSavingAnim] = useState(false)
  const [animMsg, setAnimMsg] = useState('')
  const [animPreviewKey, setAnimPreviewKey] = useState(0)

  // Скругление — ползунки в px (новые ключи; fallback на старый пресет)
  const presetRadiusPx = ({ sharp: 0, slight: 4, rounded: 10 } as Record<string, number>)[initialSettings['border_radius_scale'] ?? 'sharp'] ?? 0
  const [radiusPx, setRadiusPx] = useState(
    initialSettings['border_radius_px'] != null ? Math.round(parseFloat(initialSettings['border_radius_px'])) : presetRadiusPx
  )
  const [btnRadiusPx, setBtnRadiusPx] = useState(
    initialSettings['button_radius_px'] != null ? Math.round(parseFloat(initialSettings['button_radius_px'])) : presetRadiusPx
  )

  // ── Типографика (шкалы + межстрочное заголовков) ──
  const numInit = (k: string, def: number) => { const v = parseFloat(initialSettings[k] ?? ''); return isNaN(v) ? def : v }
  const [typeHeadingScale,   setTypeHeadingScale]   = useState(numInit('type_heading_scale', 1))
  const [typeHeadingLeading, setTypeHeadingLeading] = useState(numInit('type_heading_leading', 1.3))
  const [typeBodyScale,      setTypeBodyScale]      = useState(numInit('type_body_scale', 1))
  const [typeBodyLeading,    setTypeBodyLeading]    = useState(numInit('type_body_leading', 1.6))
  const [typePriceScale,     setTypePriceScale]     = useState(numInit('type_price_scale', 1))
  const [typeCatHeading, setTypeCatHeading] = useState(numInit('type_catalog_heading_scale', 1))
  const [typeCatBody,    setTypeCatBody]    = useState(numInit('type_catalog_body_scale', 1))
  const [typeCatBodyLead, setTypeCatBodyLead] = useState(numInit('type_catalog_body_leading', 1.8))
  const [typeFootHeading,setTypeFootHeading]= useState(numInit('type_footer_heading_scale', 1))
  const [typeFootHeadLead, setTypeFootHeadLead] = useState(numInit('type_footer_heading_leading', 1.3))
  const [typeFootBody,   setTypeFootBody]   = useState(numInit('type_footer_body_scale', 1))
  const [typeFootBodyLead, setTypeFootBodyLead] = useState(numInit('type_footer_body_leading', 1.6))
  const [typeModalBody,  setTypeModalBody]  = useState(numInit('type_modal_body_scale', 1))
  const [typeModalBodyLead, setTypeModalBodyLead] = useState(numInit('type_modal_body_leading', 1.6))
  const [savingType, setSavingType] = useState(false)
  const [typeMsg, setTypeMsg] = useState('')

  // ── Trip-тема (цвета + эффекты) ──
  const [colorBgTrip, setColorBgTrip]         = useState(initialSettings['color_bg_trip'] ?? '#160a2b')
  const [colorTextTrip, setColorTextTrip]     = useState(initialSettings['color_text_trip'] ?? '#cdbcff')
  const [colorAccentTrip, setColorAccentTrip] = useState(initialSettings['color_accent_trip'] ?? '#ff5ad0')
  const [tripBreathe, setTripBreathe]   = useState(initialSettings['trip_breathe'] !== 'false')
  const [tripDriftSpeed, setTripDriftSpeed] = useState(numInit('trip_drift_speed', 16))
  const [tripBlobOpacity, setTripBlobOpacity] = useState(numInit('trip_blob_opacity', 1))
  const [tripDesync, setTripDesync] = useState(numInit('trip_desync', 1))
  const [tripWarp, setTripWarp] = useState(initialSettings['trip_warp_enabled'] !== 'false')
  const [tripWarpInt, setTripWarpInt] = useState(numInit('trip_warp_intensity', 1))
  const [tripTapMs, setTripTapMs] = useState(Math.round(numInit('trip_tap_window_ms', 500)))
  const [savingTrip, setSavingTrip] = useState(false)
  const [tripMsg, setTripMsg] = useState('')

  // ── Скорость видео Hero (дефолт) ──
  const [heroSpeedDefault, setHeroSpeedDefault] = useState(numInit('hero_speed_default', 1))
  const [savingHeroSpeed, setSavingHeroSpeed] = useState(false)
  const [heroSpeedMsg, setHeroSpeedMsg] = useState('')

  // Игра вынесена в отдельный раздел /admin/game (структурный game_config).

  // ── Переход между страницами (VHS) ──
  const [pageTransition, setPageTransition] = useState(initialSettings['page_transition_enabled'] !== 'false')
  const [pageTransIntensity, setPageTransIntensity] = useState(numInit('page_transition_intensity', 1))
  const [savingPageTrans, setSavingPageTrans] = useState(false)
  const [pageTransMsg, setPageTransMsg] = useState('')

  // ── Подпись в бургер-меню (внизу) ──
  const DEFAULT_MENU_FOOTER = '333 · РУССКО-НАРОДНЫЙ · СДЕЛАНО ХЛОРКОЙ'
  const [menuFooterText, setMenuFooterText] = useState(initialSettings['menu_footer_text'] ?? DEFAULT_MENU_FOOTER)
  const [savingMenuFooter, setSavingMenuFooter] = useState(false)
  const [menuFooterMsg, setMenuFooterMsg] = useState('')
  async function saveMenuFooter() {
    setSavingMenuFooter(true); setMenuFooterMsg('')
    await saveSetting('menu_footer_text', menuFooterText.trim() || DEFAULT_MENU_FOOTER)
    setSavingMenuFooter(false); setMenuFooterMsg('✓ Сохранено — обновляю страницу…'); reloadAfterSave()
  }

  // ── Тумблеры тем-палитр (enabled_themes) ──
  const [enabledThemes, setEnabledThemes] = useState<string[]>(() => {
    try { const p = JSON.parse(initialSettings['enabled_themes'] ?? ''); if (Array.isArray(p) && p.length) return p } catch {}
    return DEFAULT_ENABLED
  })
  const [savingThemes, setSavingThemes] = useState(false)
  const [themesMsg, setThemesMsg] = useState('')
  function toggleThemeKey(key: string) {
    setEnabledThemes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    setThemesMsg('')
  }
  async function saveEnabledThemes() {
    setSavingThemes(true); setThemesMsg('')
    await saveSetting('enabled_themes', JSON.stringify(enabledThemes))
    setSavingThemes(false); setThemesMsg('✓ Сохранено — обновляю страницу…'); reloadAfterSave()
  }

  // ── Тултипы ЛК (уровень / скидка) ──
  const [lkLevelTip, setLkLevelTip] = useState(initialSettings['lk_level_tip'] ?? '')
  const [lkDiscountTip, setLkDiscountTip] = useState(initialSettings['lk_discount_tip'] ?? '')
  const [savingLkTips, setSavingLkTips] = useState(false)
  const [lkTipsMsg, setLkTipsMsg] = useState('')
  async function saveLkTips() {
    setSavingLkTips(true); setLkTipsMsg('')
    await Promise.all([
      saveSetting('lk_level_tip', lkLevelTip.trim()),
      saveSetting('lk_discount_tip', lkDiscountTip.trim()),
    ])
    setSavingLkTips(false); setLkTipsMsg('✓ Сохранено — обновляю страницу…'); reloadAfterSave()
  }

  // ── Тексты медалей (achievements: title/description) ──
  const [medals, setMedals] = useState<AdminAchievement[]>(initialAchievements)
  const [savingMedalKey, setSavingMedalKey] = useState<string | null>(null)
  const [medalMsg, setMedalMsg] = useState<Record<string, string>>({})
  function setMedalField(key: string, field: 'title' | 'description', value: string) {
    setMedals(prev => prev.map(m => (m.key === key ? { ...m, [field]: value } : m)))
    setMedalMsg(prev => ({ ...prev, [key]: '' }))
  }
  async function saveMedal(m: AdminAchievement) {
    setSavingMedalKey(m.key)
    const res = await fetch('/api/admin/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: m.key, title: m.title, description: m.description }),
    })
    setSavingMedalKey(null)
    setMedalMsg(prev => ({ ...prev, [m.key]: res.ok ? '✓ Сохранено' : 'Ошибка' }))
  }

  // Человекочитаемое описание условия выдачи (read-only контекст в редакторе).
  const MEDAL_CONDITION_LABEL: Record<string, (t: number) => string> = {
    profile_created: () => 'Выдаётся за создание профиля',
    first_purchase:  () => 'Выдаётся за первую покупку',
    multi_buy:       t => `Выдаётся за покупку ${t}+ вещей в одном заказе`,
    full_collection: () => 'Выдаётся за полностью собранную коллекцию',
    game_score:      t => `Выдаётся за ${t}+ очков в игре «Охота»`,
    order_count:     t => `Выдаётся за ${t}+ оплаченных заказов`,
  }

  // Текущая тема админки — чтобы живой предпросмотр цвета бил по нужной теме
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark' | 'trip'>('dark')
  useEffect(() => {
    const read = () => setAdminTheme((document.documentElement.dataset.theme as 'light' | 'dark' | 'trip') ?? 'dark')
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // ── Glitter ──────────────────────────────────────────────────────
  const [glitterEnabled,  setGlitterEnabled]  = useState(initialSettings['glitter_enabled']  !== 'false')
  const [glitterIntensity, setGlitterIntensity] = useState(parseInt(initialSettings['glitter_intensity'] ?? '50', 10))
  const [savingGlitter, setSavingGlitter] = useState(false)
  const [glitterMsg, setGlitterMsg] = useState('')

  // ── Loading phrases ─────────────────────────────────────────────
  const DEFAULT_LOADING_PHRASES_ADMIN = [
    'загрузка...', 'глажу котят', 'думаю', 'загружаю космическую станцию',
    'почти готово', 'собираю пазл', 'наношу дропс', 'калибрую вибрации',
    'настраиваю атмосферу', 'сканирую будущее',
  ]
  const [loadingPhrases, setLoadingPhrases] = useState(
    initialSettings['loading_phrases']
      ? (JSON.parse(initialSettings['loading_phrases']) as string[]).join('\n')
      : DEFAULT_LOADING_PHRASES_ADMIN.join('\n')
  )
  const [savingPhrases, setSavingPhrases] = useState(false)
  const [phrasesMsg, setPhrasesMsg] = useState('')

  // ── Ticker texts ────────────────────────────────────────────────
  const DEFAULT_TICKER_ADMIN = [
    'THREEP — ЭТО СОСТОЯНИЕ ДУШИ',
    'НОВАЯ ДРОПА УЖЕ БЛИЗКО',
    'STREETWEAR ДЛЯ ТЕХ КТО ЧУВСТВУЕТ А НЕ ПРОСТО НОСИТ',
    'СДЕЛАНО ПОД ВЛИЯНИЕМ АТМОСФЕРЫ',
    'КАЖДАЯ ВЕЩЬ — ЭТО ИСТОРИЯ',
    'UNDERGROUND. ЭКСПЕРИМЕНТАЛЬНО. ЖИВО.',
  ]
  const DEFAULT_TICKER_ACCOUNT = [
    'ТВОЙ ПРОФИЛЬ — ТВОЯ ИСТОРИЯ',
    'УРОВЕНЬ РАСТЁТ С КАЖДЫМ ЗАКАЗОМ',
    'THREEP COMMUNITY MEMBER',
    'СОБЕРИ ВСЕ КОЛЛЕКЦИИ',
    'СТАТУС ОБНОВЛЯЕТСЯ',
  ]
  const [tickerTexts, setTickerTexts] = useState(
    initialSettings['ticker_texts']
      ? (JSON.parse(initialSettings['ticker_texts']) as string[]).join('\n')
      : DEFAULT_TICKER_ADMIN.join('\n')
  )
  const [tickerTextsAccount, setTickerTextsAccount] = useState(
    initialSettings['ticker_texts_account']
      ? (JSON.parse(initialSettings['ticker_texts_account']) as string[]).join('\n')
      : DEFAULT_TICKER_ACCOUNT.join('\n')
  )
  const [savingTicker, setSavingTicker] = useState(false)
  const [tickerMsg, setTickerMsg] = useState('')
  const [savingTickerAccount, setSavingTickerAccount] = useState(false)
  const [tickerAccountMsg, setTickerAccountMsg] = useState('')

  // computed: built-in + custom font names for selectors
  const allFontNames = [...BUILTIN_FONTS, ...customFonts.map(f => f.name)]

  // ── Custom font upload ──────────────────────────────────────────
  function onFontFileSelected(file: File) {
    setPendingFontFile(file)
    const suggested = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    setPendingFontName(suggested)
    setFontUploadMsg('')
  }

  async function saveCustomFont() {
    if (!pendingFontFile || !pendingFontName.trim()) return
    setUploadingFont(true); setFontUploadMsg('')
    const fd = new FormData()
    fd.append('file', pendingFontFile)
    fd.append('folder', 'fonts')
    const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const upData = await upRes.json()
    if (!upData.url) { setFontUploadMsg(upData.error ?? 'Ошибка загрузки'); setUploadingFont(false); return }

    const saveRes = await fetch('/api/admin/fonts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pendingFontName.trim(), url: upData.url }),
    })
    setUploadingFont(false)
    if (!saveRes.ok) { setFontUploadMsg('Ошибка сохранения'); return }

    const newFont: CustomFont = { id: Date.now(), name: pendingFontName.trim(), url: upData.url }
    setCustomFonts(prev => [...prev.filter(f => f.name !== newFont.name), newFont])
    setPendingFontFile(null); setPendingFontName('')
    setFontUploadMsg('✓ Шрифт добавлен')
    if (fontFileRef.current) fontFileRef.current.value = ''
  }

  async function deleteCustomFont(font: CustomFont) {
    await fetch('/api/admin/fonts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: font.id, url: font.url }),
    })
    setCustomFonts(prev => prev.filter(f => f.id !== font.id))
    if (fontHeading === font.name) setFontHeading('ONDER')
    if (fontBody === font.name) setFontBody('Involve')
    if (fontPrice === font.name) setFontPrice('DeutschGothic')
  }

  // ── Shared helpers ──────────────────────────────────────────────
  async function saveSetting(key: string, value: string | null) {
    await fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  }

  // После сохранения настроек жёстко перезагружаем страницу — гарантированно
  // применяет всё (в т.ч. VHS-переход и серверные настройки, читаемые на mount).
  function reloadAfterSave(delay = 800) {
    setTimeout(() => window.location.reload(), delay)
  }

  function buildLevelingCfg() {
    const thresholds = lvlThresholds.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n))
    return {
      spark_per_order: parseInt(lvlSparkOrder, 10) || 0,
      spark_per_extra_unit: parseInt(lvlSparkExtra, 10) || 0,
      thresholds: thresholds.length ? thresholds : undefined,
      increment_after: parseInt(lvlIncrement, 10) || 0,
      discount_max: parseInt(lvlDiscountMax, 10) || 0,
    }
  }

  async function saveLeveling() {
    setSavingLvl(true)
    await saveSetting('leveling_config', JSON.stringify(buildLevelingCfg()))
    setSavingLvl(false)
    setLvlMsg('✓ Сохранено — обновляю страницу…')
    reloadAfterSave()
  }

  async function uploadFile(
    file: File,
    folder: string,
    onUploading: (v: boolean) => void,
    onSave: (url: string) => void,
    onMsg: (m: string) => void,
    settingKey: string,
  ) {
    onUploading(true)
    onMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    onUploading(false)
    if (!data.url) { onMsg(data.error ?? 'Ошибка загрузки'); return }
    onSave(data.url)
    await saveSetting(settingKey, data.url)
    onMsg('✓ Сохранено')
  }

  // ── Hero ────────────────────────────────────────────────────────
  async function uploadHero(file: File) {
    setUploadingHero(true)
    setHeroMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingHero(false)
    if (!data.url) { setHeroMsg(data.error ?? 'Ошибка загрузки'); return }
    setHeroUrl(data.url)
    setSavingHero(true)
    await saveSetting('hero_video_url', data.url)
    setSavingHero(false)
    setHeroMsg('✓ Видео обновлено')
  }

  async function uploadHeroMp4(file: File) {
    setUploadingHeroMp4(true); setHeroMp4Msg('')
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingHeroMp4(false)
    if (!data.url) { setHeroMp4Msg(data.error ?? 'Ошибка загрузки'); return }
    setHeroMp4Url(data.url)
    await saveSetting('hero_video_url_mp4', data.url)
    setHeroMp4Msg('✓ MP4 обновлён')
  }

  async function uploadHeroPoster(file: File) {
    setUploadingHeroPoster(true); setHeroPosterMsg('')
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingHeroPoster(false)
    if (!data.url) { setHeroPosterMsg(data.error ?? 'Ошибка загрузки'); return }
    setHeroPosterUrl(data.url)
    await saveSetting('hero_poster_url', data.url)
    setHeroPosterMsg('✓ Постер обновлён')
  }

  // ── Profile bg ──────────────────────────────────────────────────
  async function uploadProfileBg(file: File) {
    setUploadingProfile(true); setProfileMsg('')
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingProfile(false)
    if (!data.url) { setProfileMsg('Ошибка загрузки'); return }
    setProfileBg(data.url); setSavingProfile(true)
    await saveSetting('profile_bg_url', data.url)
    setSavingProfile(false); setProfileMsg('✓ Фон обновлён')
  }
  async function removeProfileBg() {
    setProfileBg(null); setSavingProfile(true)
    await saveSetting('profile_bg_url', null)
    setSavingProfile(false); setProfileMsg('✓ Удалён')
  }
  async function uploadProfileBgDark(file: File) {
    setUploadingProfileDark(true); setProfileDarkMsg('')
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingProfileDark(false)
    if (!data.url) { setProfileDarkMsg('Ошибка загрузки'); return }
    setProfileBgDark(data.url); setSavingProfileDark(true)
    await saveSetting('profile_bg_url_dark', data.url)
    setSavingProfileDark(false); setProfileDarkMsg('✓ Обновлён')
  }
  async function removeProfileBgDark() {
    setProfileBgDark(null); setSavingProfileDark(true)
    await saveSetting('profile_bg_url_dark', null)
    setSavingProfileDark(false); setProfileDarkMsg('✓ Удалён')
  }

  // ── Save colors ─────────────────────────────────────────────────
  async function saveColors() {
    setSavingColors(true); setColorsMsg('')
    await Promise.all([
      saveSetting('color_bg_light',     colorBgLight),
      saveSetting('color_text_light',   colorTextLight),
      saveSetting('color_accent_light', colorAccentLight),
      saveSetting('color_bg_dark',      colorBgDark),
      saveSetting('color_text_dark',    colorTextDark),
      saveSetting('color_accent_dark',  colorAccentDark),
      saveSetting('color_bg_trip',      colorBgTrip),
      saveSetting('color_text_trip',    colorTextTrip),
      saveSetting('color_accent_trip',  colorAccentTrip),
    ])
    setSavingColors(false); setColorsMsg('✓ Цвета сохранены — обновляю страницу…'); reloadAfterSave()
  }

  // Применить пресет: заполнить все 9 цветов + живой предпросмотр текущей темы
  function applyPreset(p: ThemePreset) {
    setColorBgLight(p.bgL);   setColorTextLight(p.textL);   setColorAccentLight(p.accentL)
    setColorBgDark(p.bgD);    setColorTextDark(p.textD);    setColorAccentDark(p.accentD)
    setColorBgTrip(p.bgT);    setColorTextTrip(p.textT);    setColorAccentTrip(p.accentT)
    const root = document.documentElement.style
    const set = (bg: string, text: string, accent: string) => {
      root.setProperty('--bg', bg); root.setProperty('--text', text); root.setProperty('--accent', accent)
    }
    if (adminTheme === 'dark') set(p.bgD, p.textD, p.accentD)
    else if (adminTheme === 'trip') set(p.bgT, p.textT, p.accentT)
    else set(p.bgL, p.textL, p.accentL)
    setColorsMsg('Палитра применена — нажми «Сохранить цвета»')
  }

  // ── Save fonts ──────────────────────────────────────────────────
  async function saveFonts() {
    setSavingFonts(true); setFontsMsg('')
    await Promise.all([
      saveSetting('font_heading', fontHeading),
      saveSetting('font_body',    fontBody),
      saveSetting('font_price',   fontPrice),
    ])
    setSavingFonts(false); setFontsMsg('✓ Шрифты сохранены — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save effects ────────────────────────────────────────────────
  async function saveEffects() {
    setSavingEffects(true); setEffectsMsg('')
    await Promise.all([
      saveSetting('grain_opacity_light', String(grainLight / 100)),
      saveSetting('grain_opacity_dark',  String(grainDark  / 100)),
      saveSetting('grain_size',          String(grainScale)),
      saveSetting('border_radius_px',    String(radiusPx)),
      saveSetting('button_radius_px',    String(btnRadiusPx)),
    ])
    setSavingEffects(false); setEffectsMsg('✓ Эффекты сохранены — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save typography ─────────────────────────────────────────────
  async function saveTypography() {
    setSavingType(true); setTypeMsg('')
    await Promise.all([
      saveSetting('type_heading_scale',   String(typeHeadingScale)),
      saveSetting('type_heading_leading', String(typeHeadingLeading)),
      saveSetting('type_body_scale',      String(typeBodyScale)),
      saveSetting('type_body_leading',    String(typeBodyLeading)),
      saveSetting('type_price_scale',     String(typePriceScale)),
      saveSetting('type_catalog_heading_scale', String(typeCatHeading)),
      saveSetting('type_catalog_body_scale',    String(typeCatBody)),
      saveSetting('type_catalog_body_leading',  String(typeCatBodyLead)),
      saveSetting('type_footer_heading_scale',  String(typeFootHeading)),
      saveSetting('type_footer_heading_leading', String(typeFootHeadLead)),
      saveSetting('type_footer_body_scale',     String(typeFootBody)),
      saveSetting('type_footer_body_leading',   String(typeFootBodyLead)),
      saveSetting('type_modal_body_scale',      String(typeModalBody)),
      saveSetting('type_modal_body_leading',    String(typeModalBodyLead)),
    ])
    setSavingType(false); setTypeMsg('✓ Типографика сохранена — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save trip effects (цвета trip сохраняются кнопкой «Сохранить цвета») ──
  async function saveTrip() {
    setSavingTrip(true); setTripMsg('')
    await Promise.all([
      saveSetting('trip_breathe',      String(tripBreathe)),
      saveSetting('trip_drift_speed',  String(tripDriftSpeed)),
      saveSetting('trip_blob_opacity', String(tripBlobOpacity)),
      saveSetting('trip_desync',       String(tripDesync)),
      saveSetting('trip_warp_enabled',   String(tripWarp)),
      saveSetting('trip_warp_intensity', String(tripWarpInt)),
      saveSetting('trip_tap_window_ms',  String(tripTapMs)),
    ])
    setSavingTrip(false); setTripMsg('✓ Trip-эффекты сохранены — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save hero speed default ─────────────────────────────────────
  async function saveHeroSpeed() {
    setSavingHeroSpeed(true); setHeroSpeedMsg('')
    await saveSetting('hero_speed_default', String(heroSpeedDefault))
    setSavingHeroSpeed(false); setHeroSpeedMsg('✓ Сохранено — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save animations ─────────────────────────────────────────────
  async function saveAnimations() {
    setSavingAnim(true); setAnimMsg('')
    await Promise.all([
      saveSetting('animation_speed',      String(animSpeed)),
      saveSetting('anim_reveal_enabled',  String(animReveal)),
      saveSetting('anim_hover_enabled',   String(animHover)),
      saveSetting('anim_ambient_enabled', String(animAmbient)),
    ])
    setSavingAnim(false); setAnimMsg('✓ Анимации сохранены — обновляю страницу…'); reloadAfterSave()
  }

  // ── Save page transition ────────────────────────────────────────
  async function savePageTrans() {
    setSavingPageTrans(true); setPageTransMsg('')
    await Promise.all([
      saveSetting('page_transition_enabled', String(pageTransition)),
      saveSetting('page_transition_intensity', String(pageTransIntensity)),
    ])
    setSavingPageTrans(false); setPageTransMsg('✓ Сохранено — обновляю страницу…'); reloadAfterSave()
  }

  const msgStyle = (m: string) => ({ color: m.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)', fontFamily: 'var(--font-involve)', fontSize: '0.75rem' })

  // Переиспользуемый ползунок с живым предпросмотром через CSS-переменную
  function RangeRow({ label, value, set, cssVar, min, max, step, suffix = '×', info }: {
    label: string; value: number; set: (v: number) => void; cssVar: string
    min: number; max: number; step: number; suffix?: string; info?: string
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>{label}{info && <> <InfoTip text={info} /></>}</span>
          <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{value.toFixed(2)}{suffix}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => { const v = parseFloat(e.target.value); set(v); document.documentElement.style.setProperty(cssVar, suffix === 'px' ? `${v}px` : String(v)) }}
          style={{ accentColor: 'var(--accent)', width: '100%' }}
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-8">
      <AdminPageTitle>{variant === 'themes' ? 'Темы' : 'Настройки сайта'}</AdminPageTitle>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? a.btn : a.btnSecondary}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminTabContext.Provider value={activeTab}>

      {/* ── Логотипы ── */}
      <AdminSection title="Логотипы сайта" tab="general">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          SVG-логотипы отображаются в шапке сайта. Иконка — слева, текстовый — по центру (только на широких экранах).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Icon logo */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Иконка</span>
            <div className="rounded-xl flex items-center justify-center h-20" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
              {logoIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoIconUrl} alt="Logo Icon" className="theme-img h-12 w-auto" />
              ) : (
                <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>Не загружен</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => logoIconRef.current?.click()} disabled={uploadingLogoIcon} className={a.btn}>
                {uploadingLogoIcon ? 'Загружаем...' : 'Загрузить SVG'}
              </button>
              {logoIconUrl && (
                <button onClick={async () => { setLogoIconUrl(null); await saveSetting('logo_icon_url', null); setLogoIconMsg('✓ Удалён') }} className={a.btnDanger}>Удалить</button>
              )}
              <input ref={logoIconRef} type="file" accept="image/svg+xml,image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'assets', setUploadingLogoIcon, setLogoIconUrl, setLogoIconMsg, 'logo_icon_url')} />
            </div>
            {logoIconMsg && <span style={msgStyle(logoIconMsg)}>{logoIconMsg}</span>}
          </div>

          {/* Text logo */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Текстовый</span>
            <div className="rounded-xl flex items-center justify-center h-20" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
              {logoTextUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoTextUrl} alt="Logo Text" className="theme-img h-8 w-auto" />
              ) : (
                <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>Не загружен</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => logoTextRef.current?.click()} disabled={uploadingLogoText} className={a.btn}>
                {uploadingLogoText ? 'Загружаем...' : 'Загрузить SVG'}
              </button>
              {logoTextUrl && (
                <button onClick={async () => { setLogoTextUrl(null); await saveSetting('logo_text_url', null); setLogoTextMsg('✓ Удалён') }} className={a.btnDanger}>Удалить</button>
              )}
              <input ref={logoTextRef} type="file" accept="image/svg+xml,image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'assets', setUploadingLogoText, setLogoTextUrl, setLogoTextMsg, 'logo_text_url')} />
            </div>
            {logoTextMsg && <span style={msgStyle(logoTextMsg)}>{logoTextMsg}</span>}
          </div>
        </div>
      </AdminSection>

      {/* ── Темы-палитры: тумблеры ВКЛ/ВЫКЛ ── */}
      <AdminSection title="Темы (вкл/выкл)" tab="colors">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Какие темы доступны для переключения на сайте (кнопка темы в шапке циклит включённые).
          <b> TRIP</b> — секретная: даже включённая, активируется только тройным быстрым тапом по кнопке темы.
        </p>
        <div className="flex flex-col gap-2">
          {PALETTES.map(p => {
            const on = enabledThemes.includes(p.key)
            return (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.45rem 0.7rem', background: 'var(--bg-2)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border-soft)'}`, borderRadius: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: 32, height: 16, borderRadius: 2, border: '1px solid var(--border)', background: `linear-gradient(90deg, ${p.bg} 0 50%, ${p.accent} 50% 100%)` }} />
                  <span style={{ fontFamily: 'var(--font-onder)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--accent)' }}>{p.label}</span>
                  {p.hidden && <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.6rem', opacity: 0.5, color: 'var(--accent)' }}>секретная · тройной тап</span>}
                </span>
                <input type="checkbox" checked={on} onChange={() => toggleThemeKey(p.key)} />
              </label>
            )
          })}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={savingThemes} onClick={saveEnabledThemes} className={a.btn}>
            {savingThemes ? 'Сохраняем...' : 'Сохранить темы'}
          </button>
          {themesMsg && <span style={msgStyle(themesMsg)}>{themesMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Цвета ── */}
      <AdminSection title="Цвета" tab="colors">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Кликните на цвет или введите HEX. Живой предпросмотр применяется к <b>текущей теме админки</b>
          (сейчас: {adminTheme === 'dark' ? '☾ тёмная' : adminTheme === 'trip' ? '✦ trip' : '☀ светлая'}).
          После сохранения перекрашивается весь сайт — перезагрузите страницу для финальной проверки.
        </p>

        {/* Пресеты — палитры в один клик */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Готовые палитры</span>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map(p => {
              const sw = adminTheme === 'dark' ? [p.bgD, p.accentD, p.textD]
                       : adminTheme === 'trip' ? [p.bgT, p.accentT, p.textT]
                       : [p.bgL, p.accentL, p.textL]
              return (
                <button key={p.name} onClick={() => applyPreset(p)} className={a.btnSecondary}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {sw.map((c, i) => <span key={i} style={{ width: 12, height: 14, background: c }} />)}
                  </span>
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Light theme */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>☀ Светлая тема</span>
            </div>
            <ColorPicker label="Фон (bg)" value={colorBgLight} cssVar={adminTheme === 'light' ? '--bg' : undefined} onChange={setColorBgLight} />
            <ColorPicker label="Текст" value={colorTextLight} cssVar={adminTheme === 'light' ? '--text' : undefined} onChange={setColorTextLight} />
            <ColorPicker label="Акцент" value={colorAccentLight} cssVar={adminTheme === 'light' ? '--accent' : undefined} onChange={setColorAccentLight} />
          </div>

          {/* Dark theme */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>☾ Тёмная тема</span>
            </div>
            <ColorPicker label="Фон (bg)" value={colorBgDark} cssVar={adminTheme === 'dark' ? '--bg' : undefined} onChange={setColorBgDark} />
            <ColorPicker label="Текст" value={colorTextDark} cssVar={adminTheme === 'dark' ? '--text' : undefined} onChange={setColorTextDark} />
            <ColorPicker label="Акцент" value={colorAccentDark} cssVar={adminTheme === 'dark' ? '--accent' : undefined} onChange={setColorAccentDark} />
          </div>

          {/* Trip theme (скрытая психоделика) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>✦ Trip (скрытая)</span>
            </div>
            <ColorPicker label="Фон (bg)" value={colorBgTrip} cssVar={adminTheme === 'trip' ? '--bg' : undefined} onChange={setColorBgTrip} />
            <ColorPicker label="Текст" value={colorTextTrip} cssVar={adminTheme === 'trip' ? '--text' : undefined} onChange={setColorTextTrip} />
            <ColorPicker label="Акцент" value={colorAccentTrip} cssVar={adminTheme === 'trip' ? '--accent' : undefined} onChange={setColorAccentTrip} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveColors} disabled={savingColors} className={a.btn}>
            {savingColors ? 'Сохраняем...' : 'Сохранить цвета'}
          </button>
          {colorsMsg && <span style={msgStyle(colorsMsg)}>{colorsMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Шрифты ── */}
      <AdminSection title="Шрифты" tab="fonts">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Выбранный шрифт применяется ко всем элементам сайта. Загрузи свой шрифт ниже — он сразу появится в списке.
        </p>

        {/* ── Загрузка своего шрифта ── */}
        <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>Загрузить шрифт</span>

          {/* Uploaded fonts list */}
          {customFonts.length > 0 && (
            <div className="flex flex-col gap-2">
              {customFonts.map(f => (
                <div key={f.id} className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs" style={{ fontFamily: 'var(--font-involve)', color: 'var(--text-muted)' }}>TTF</span>
                    <span style={{ fontFamily: `'${f.name}', sans-serif`, fontSize: '1rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  </div>
                  <button onClick={() => deleteCustomFont(f)} className={a.btnDanger} style={{ flexShrink: 0, padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Pending file input */}
          {pendingFontFile ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs truncate" style={{ color: 'var(--accent)', opacity: 0.6, fontFamily: 'var(--font-involve)' }}>Файл: {pendingFontFile.name}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pendingFontName}
                  onChange={e => setPendingFontName(e.target.value)}
                  placeholder="Название шрифта (font-family)"
                  style={{ ...INPUT_STYLE, flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.82rem', borderRadius: 4 }}
                />
                <button onClick={saveCustomFont} disabled={uploadingFont || !pendingFontName.trim()} className={a.btn}>
                  {uploadingFont ? 'Загружаем...' : 'Сохранить'}
                </button>
                <button onClick={() => { setPendingFontFile(null); setPendingFontName(''); if (fontFileRef.current) fontFileRef.current.value = '' }} className={a.btnSecondary}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => fontFileRef.current?.click()} className={a.btnSecondary}>
                + Выбрать файл (.ttf .otf .woff .woff2)
              </button>
            </div>
          )}
          <input ref={fontFileRef} type="file" accept=".ttf,.otf,.woff,.woff2,font/*" className="hidden"
            onChange={e => e.target.files?.[0] && onFontFileSelected(e.target.files[0])} />
          {fontUploadMsg && <span style={msgStyle(fontUploadMsg)}>{fontUploadMsg}</span>}
        </div>

        {/* Font role selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FontSelect
            label="Заголовки"
            value={fontHeading}
            onChange={setFontHeading}
            previewText="THREEP STYLE"
            allFonts={allFontNames}
          />
          <FontSelect
            label="Основной текст"
            value={fontBody}
            onChange={setFontBody}
            previewText="Уличная одежда ручной работы"
            allFonts={allFontNames}
          />
          <FontSelect
            label="Цены"
            value={fontPrice}
            onChange={setFontPrice}
            previewText="6 333 RUB"
            allFonts={allFontNames}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveFonts} disabled={savingFonts} className={a.btn}>
            {savingFonts ? 'Сохраняем...' : 'Сохранить шрифты'}
          </button>
          {fontsMsg && <span style={msgStyle(fontsMsg)}>{fontsMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Типографика ── */}
      <AdminSection title="Типографика — глобально" tab="type">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Множители размера и межстрочные применяются ко всему сайту. Пер-секционные оверрайды — ниже.
          Предпросмотр сразу, сохранение — постоянно (одна кнопка сохраняет всю типографику).
        </p>

        {/* Live preview */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: `calc(1.6rem * var(--type-heading-scale, 1))`, lineHeight: 'var(--type-heading-leading, 1.3)', color: 'var(--accent)', textTransform: 'uppercase' }}>THREEP STYLE<br/>ВТОРАЯ СТРОКА</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: `calc(0.9rem * var(--type-body-scale, 1))`, lineHeight: 'var(--type-body-leading, 1.6)', color: 'var(--text)' }}>Уличная одежда ручной работы — атмосфера первой, информация второй. Каждая вещь — это история.</span>
          <span style={{ fontFamily: 'var(--font-price)', fontSize: `calc(1.4rem * var(--type-price-scale, 1))`, color: 'var(--accent)' }}>6 333 ₽</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <RangeRow label="Заголовки — размер" value={typeHeadingScale} set={setTypeHeadingScale} cssVar="--type-heading-scale" min={0.6} max={1.8} step={0.05} info="Множитель размера всех заголовков сайта. 1× — базовый размер из дизайна." />
          <RangeRow label="Заголовки — межстрочное" value={typeHeadingLeading} set={setTypeHeadingLeading} cssVar="--type-heading-leading" min={0.9} max={2} step={0.02} suffix="" info="Расстояние между строками в многострочных заголовках (line-height)." />
          <RangeRow label="Текст — размер" value={typeBodyScale} set={setTypeBodyScale} cssVar="--type-body-scale" min={0.6} max={1.8} step={0.05} info="Множитель размера основного текста (описания, абзацы)." />
          <RangeRow label="Текст — межстрочное" value={typeBodyLeading} set={setTypeBodyLeading} cssVar="--type-body-leading" min={1} max={2.4} step={0.02} suffix="" info="Расстояние между строками основного текста (line-height)." />
          <RangeRow label="Цены — размер" value={typePriceScale} set={setTypePriceScale} cssVar="--type-price-scale" min={0.6} max={1.8} step={0.05} info="Множитель размера ценников (шрифт --font-price)." />
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveTypography} disabled={savingType} className={a.btn}>
            {savingType ? 'Сохраняем...' : 'Сохранить типографику'}
          </button>
          {typeMsg && <span style={msgStyle(typeMsg)}>{typeMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Типографика по секциям ── */}
      <AdminSection title="Типографика — по секциям" tab="type">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Отдельные размеры и межстрочные для каталога, футера и модалки. Если не трогать — наследуют глобальные.
        </p>

        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)' }}>Каталог</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
          <RangeRow label="Заголовки — размер" value={typeCatHeading} set={setTypeCatHeading} cssVar="--type-catalog-heading-scale" min={0.6} max={1.8} step={0.05} />
          <RangeRow label="Текст — размер" value={typeCatBody} set={setTypeCatBody} cssVar="--type-catalog-body-scale" min={0.6} max={1.8} step={0.05} />
          <RangeRow label="Текст — межстрочное" value={typeCatBodyLead} set={setTypeCatBodyLead} cssVar="--type-catalog-body-leading" min={1} max={2.4} step={0.02} suffix="" />
        </div>

        <p className="text-xs uppercase tracking-widest pt-1" style={{ color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)' }}>Футер</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <RangeRow label="Заголовки — размер" value={typeFootHeading} set={setTypeFootHeading} cssVar="--type-footer-heading-scale" min={0.6} max={1.8} step={0.05} />
          <RangeRow label="Заголовки — межстрочное" value={typeFootHeadLead} set={setTypeFootHeadLead} cssVar="--type-footer-heading-leading" min={0.9} max={2} step={0.02} suffix="" />
          <RangeRow label="Текст — размер" value={typeFootBody} set={setTypeFootBody} cssVar="--type-footer-body-scale" min={0.6} max={1.8} step={0.05} />
          <RangeRow label="Текст — межстрочное" value={typeFootBodyLead} set={setTypeFootBodyLead} cssVar="--type-footer-body-leading" min={1} max={2.4} step={0.02} suffix="" />
        </div>

        <p className="text-xs uppercase tracking-widest pt-1" style={{ color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)' }}>Модалка товара</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <RangeRow label="Текст — размер" value={typeModalBody} set={setTypeModalBody} cssVar="--type-modal-body-scale" min={0.6} max={1.8} step={0.05} />
          <RangeRow label="Текст — межстрочное" value={typeModalBodyLead} set={setTypeModalBodyLead} cssVar="--type-modal-body-leading" min={1} max={2.4} step={0.02} suffix="" />
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveTypography} disabled={savingType} className={a.btn}>
            {savingType ? 'Сохраняем...' : 'Сохранить типографику'}
          </button>
          {typeMsg && <span style={msgStyle(typeMsg)}>{typeMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Визуальные эффекты ── */}
      <AdminSection title="Визуальные эффекты" tab="effects">
        <div className="flex flex-col gap-8">

          {/* ── Grain opacity ── */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Зернистость (шум на фоне)</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light theme grain */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>☀ Светлая тема</span>
                  <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{grainLight.toFixed(1)}%</span>
                </div>
                <div style={{ position: 'relative', height: 72, borderRadius: 6, overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border-soft)' }}>
                  <div style={{
                    position: 'absolute', inset: 0, opacity: grainLight / 100,
                    backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
                    backgroundRepeat: 'repeat', backgroundSize: `${grainScale}px ${grainScale}px`,
                    mixBlendMode: 'overlay', pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text)', opacity: 0.6, letterSpacing: '0.12em' }}>THREEP</span>
                    <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.55rem', color: 'var(--text)', opacity: 0.3, letterSpacing: '0.2em' }}>PREVIEW</span>
                  </div>
                </div>
                <input type="range" min={0} max={20} step={0.5} value={grainLight}
                  onChange={e => { const v = parseFloat(e.target.value); setGrainLight(v); document.documentElement.style.setProperty('--grain-opacity', String(v / 100)) }}
                  style={{ accentColor: 'var(--accent)', width: '100%' }}
                />
              </div>

              {/* Dark theme grain */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>☾ Тёмная тема</span>
                  <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{grainDark.toFixed(1)}%</span>
                </div>
                <div style={{ position: 'relative', height: 72, borderRadius: 6, overflow: 'hidden', background: '#1c1c1e', border: '1px solid var(--border-soft)' }}>
                  <div style={{
                    position: 'absolute', inset: 0, opacity: grainDark / 100,
                    backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
                    backgroundRepeat: 'repeat', backgroundSize: `${grainScale}px ${grainScale}px`,
                    mixBlendMode: 'overlay', pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'rgba(252,176,178,0.55)', letterSpacing: '0.12em' }}>THREEP</span>
                    <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.55rem', color: 'rgba(252,176,178,0.25)', letterSpacing: '0.2em' }}>PREVIEW</span>
                  </div>
                </div>
                <input type="range" min={0} max={20} step={0.5} value={grainDark}
                  onChange={e => setGrainDark(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent)', width: '100%' }}
                />
              </div>
            </div>

            <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
              <span>0 — нет</span><span>10 — умеренно</span><span>20 — сильно</span>
            </div>
          </div>

          {/* ── Grain scale ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Крупность зерна <InfoTip text="Размер плитки шума в пикселях: меньше — мелкое плотное зерно, больше — крупная плёночная фактура." /></span>
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{grainScale}px</span>
            </div>
            <input type="range" min={64} max={512} step={32} value={grainScale}
              onChange={e => { const v = parseInt(e.target.value, 10); setGrainScale(v); document.documentElement.style.setProperty('--grain-size', `${v}px`) }}
              style={{ accentColor: 'var(--accent)', width: '100%' }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
              <span>64 — мелко</span><span>256 — стандарт</span><span>512 — крупно</span>
            </div>
          </div>

          {/* ── Border radius — ползунки (общий + кнопки отдельно) ── */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скругление углов</span>

            {/* Превью: карточка + кнопка */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, height: 52, borderRadius: radiusPx, background: 'var(--bg-subtle)', border: '1px solid var(--border-mid)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, padding: '0 18px', borderRadius: btnRadiusPx, background: 'var(--accent)', color: 'var(--bg)', fontFamily: 'var(--font-onder)', fontSize: '0.7rem', boxShadow: '2px 2px 0 var(--accent)' }}>КНОПКА</div>
            </div>

            {/* Общий радиус (карточки/блоки) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>Общий (карточки, блоки)</span>
                <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{radiusPx}px</span>
              </div>
              <input type="range" min={0} max={24} step={1} value={radiusPx}
                onChange={e => { const v = parseInt(e.target.value, 10); setRadiusPx(v); document.documentElement.style.setProperty('--radius-base', `${v}px`) }}
                style={{ accentColor: 'var(--accent)', width: '100%' }}
              />
            </div>

            {/* Радиус кнопок (Яна: «менее острые кнопки») */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>Кнопки</span>
                <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{btnRadiusPx}px</span>
              </div>
              <input type="range" min={0} max={24} step={1} value={btnRadiusPx}
                onChange={e => { const v = parseInt(e.target.value, 10); setBtnRadiusPx(v); document.documentElement.style.setProperty('--radius-btn', `${v}px`) }}
                style={{ accentColor: 'var(--accent)', width: '100%' }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
              <span>0 — острые</span><span>8 — лёгкие</span><span>24 — круглые</span>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveEffects} disabled={savingEffects} className={a.btn}>
            {savingEffects ? 'Сохраняем...' : 'Сохранить эффекты'}
          </button>
          {effectsMsg && <span style={msgStyle(effectsMsg)}>{effectsMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Анимации (скорость + категории) ── */}
      <AdminSection title="Анимации" tab="animations">
        <style>{`
          @keyframes anim-demo-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
          @keyframes anim-demo-glint {
            0% { left: -60%; opacity: 0; } 12% { opacity: 1; } 60% { opacity: 1; } 100% { left: 120%; opacity: 0; }
          }
        `}</style>
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Глобальный темп и категории движения по сайту. Скорость — множитель длительности появлений, ховеров и бликов.
          Тумблеры мгновенно гасят целые группы анимаций (для слабых устройств / accessibility).
        </p>

        {/* Скорость — числовой множитель */}
        <RangeRow
          label="Скорость анимаций"
          value={animSpeed}
          set={setAnimSpeed}
          cssVar="--animation-speed"
          min={0.5} max={2} step={0.05} suffix="×"
          info="Множитель длительности: 0.5× — резко и быстро, 1× — норма, 2× — медленно и плавно. Влияет на появления секций, ховер-блики и амбиент BLADE."
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
          <span>0.5× — резко</span><span>1× — норма</span><span>2× — плавно</span>
        </div>

        {/* Живой предпросмотр */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Предпросмотр</span>
            <button
              onClick={() => setAnimPreviewKey(k => k + 1)}
              className={a.btnSecondary}
              style={{ fontSize: '0.65rem', padding: '4px 10px' }}
            >
              ▷ Проиграть
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div
                key={`${animPreviewKey}-${i}`}
                style={{
                  flex: 1, height: 46, borderRadius: 6, position: 'relative', overflow: 'hidden',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)',
                  animation: animReveal ? `anim-demo-rise ${0.55 * animSpeed}s cubic-bezier(0.22,1,0.36,1) ${i * 0.09 * animSpeed}s both` : 'none',
                }}
              >
                {animAmbient && (
                  <span style={{
                    position: 'absolute', top: 0, bottom: 0, width: '40%', left: '-60%',
                    background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 55%, transparent), transparent)',
                    transform: 'skewX(-22deg)',
                    animation: `anim-demo-glint ${5 * animSpeed}s cubic-bezier(0.22,1,0.36,1) ${1 + i * 0.3}s infinite`,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Категории-тумблеры */}
        <div className="flex flex-col gap-3 pt-2">
          {([
            { label: 'Появления секций и карточек', state: animReveal, set: setAnimReveal, hint: 'Плавный «выезд» секций при прокрутке и каскад появления карточек каталога.' },
            { label: 'Ховер-блики (BLADE / glitch)', state: animHover, set: setAnimHover, hint: 'Блик-«клинок» и пиксель-распад при наведении на кнопки и элементы.' },
            { label: 'Амбиентный блик (BLADE)', state: animAmbient, set: setAnimAmbient, hint: 'Периодический проход блика по ключевым CTA без наведения.' },
          ] as const).map((row, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>
                {row.label} <InfoTip text={row.hint} />
              </span>
              <button
                onClick={() => row.set(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                  padding: '0.3rem 0.8rem', borderRadius: 20,
                  border: `1.5px solid ${row.state ? 'var(--accent)' : 'var(--border-soft)'}`,
                  background: row.state ? 'var(--accent-2)' : 'var(--bg-2)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.state ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {row.state ? 'вкл' : 'выкл'}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveAnimations} disabled={savingAnim} className={a.btn}>
            {savingAnim ? 'Сохраняем...' : 'Сохранить анимации'}
          </button>
          {animMsg && <span style={msgStyle(animMsg)}>{animMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Trip-тема (эффекты) ── */}
      <AdminSection title="Trip-тема — эффекты" tab="effects">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Скрытая психоделическая тема (3 быстрых нажатия на смену темы). Цвета — в блоке «Цвета» выше (колонка ✦ Trip).
          «BAD THREEP»: глитч-слой (сканлайны + срезы сигнала), скорость дрейфа фоновых пятен, их интенсивность. Заголовки в trip получают хром-аберрацию автоматически.
        </p>

        {/* Breathe toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTripBreathe(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.35rem 0.9rem', borderRadius: 20,
              border: `1.5px solid ${tripBreathe ? 'var(--accent)' : 'var(--border-soft)'}`,
              background: tripBreathe ? 'var(--accent-2)' : 'var(--bg-2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tripBreathe ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Глитч-слой: {tripBreathe ? 'вкл' : 'выкл'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>Скорость дрейфа</span>
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{tripDriftSpeed}с</span>
            </div>
            <input type="range" min={4} max={60} step={1} value={tripDriftSpeed}
              onChange={e => { const v = parseInt(e.target.value, 10); setTripDriftSpeed(v); document.documentElement.style.setProperty('--trip-drift-dur', `${v}s`) }}
              style={{ accentColor: 'var(--accent)', width: '100%' }}
            />
          </div>
          <RangeRow label="Интенсивность кругов" value={tripBlobOpacity} set={setTripBlobOpacity} cssVar="--trip-blob-opacity" min={0} max={1} step={0.05} suffix="" info="Видимость дрейфующих цветных пятен на фоне в trip-теме. 0 — пятна скрыты." />
          <RangeRow label="Рассинхрон дёрганья текста" value={tripDesync} set={setTripDesync} cssVar="--trip-desync" min={0} max={3} step={0.1} suffix="" info="Насколько вразнобой дёргаются заголовки h1/h2/h3. 0 — синхронно, выше — каждый трясётся со своей задержкой («пьяный» эффект)." />
        </div>

        {/* Liquid-варп — жидкое «плавление» (фон рябит как вода + марево поверх) */}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => setTripWarp(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.35rem 0.9rem', borderRadius: 20,
              border: `1.5px solid ${tripWarp ? 'var(--accent)' : 'var(--border-soft)'}`,
              background: tripWarp ? 'var(--accent-2)' : 'var(--bg-2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tripWarp ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Жидкий варп: {tripWarp ? 'вкл' : 'выкл'}
            </span>
          </button>
          <InfoTip text="Безопасное «плавление»: feDisplacementMap рябит фоновые пятна как воду + полупрозрачное марево поверх контента. Геометрия страницы (шапка/модалки) НЕ искажается." />
        </div>
        {tripWarp && (
          <RangeRow label="Интенсивность варпа" value={tripWarpInt} set={setTripWarpInt} cssVar="--trip-warp" min={0} max={2} step={0.05} suffix="×" info="Сила жидкого марева поверх контента. Дополнительно множится на «пьяность» из настроек шапки." />
        )}

        {/* Окно тройного тапа активации trip */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>
              Окно тройного тапа <InfoTip text="Насколько быстро надо трижды нажать на смену темы, чтобы открыть trip. Все 3 тапа должны уложиться в это окно. Меньше — строже (труднее активировать случайно), больше — легче. Дефолт 500мс." />
            </span>
            <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{tripTapMs}мс</span>
          </div>
          <input type="range" min={200} max={2000} step={50} value={tripTapMs}
            onChange={e => setTripTapMs(parseInt(e.target.value, 10))}
            style={{ accentColor: 'var(--accent)', width: '100%' }}
          />
          <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
            <span>200 — очень строго</span><span>500 — норма</span><span>2000 — легко</span>
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.35, fontFamily: 'var(--font-involve)' }}>
          Предпросмотр дрейфа/кругов/варпа виден только при активной trip-теме.
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={saveTrip} disabled={savingTrip} className={a.btn}>
            {savingTrip ? 'Сохраняем...' : 'Сохранить эффекты trip'}
          </button>
          {tripMsg && <span style={msgStyle(tripMsg)}>{tripMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Переход между страницами (VHS) ── */}
      <AdminSection title="Переход между страницами (VHS)" tab="effects">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Глитч-переход при смене страницы: вуаль-«срыв сигнала» + RGB-сплит + сканлайны + accent-полоса.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPageTransition(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.35rem 0.9rem', borderRadius: 20,
              border: `1.5px solid ${pageTransition ? 'var(--accent)' : 'var(--border-soft)'}`,
              background: pageTransition ? 'var(--accent-2)' : 'var(--bg-2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pageTransition ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Переход: {pageTransition ? 'вкл' : 'выкл'}
            </span>
          </button>
        </div>
        {pageTransition && (
          <RangeRow label="Сила эффекта" value={pageTransIntensity} set={setPageTransIntensity} cssVar="--rt-preview-noop" min={0.3} max={2} step={0.05} suffix="" info="Насколько резкий VHS-срыв при смене страницы: RGB-сплит, сканлайны и дрожь. Выше — агрессивнее." />
        )}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={savePageTrans} disabled={savingPageTrans} className={a.btn}>
            {savingPageTrans ? 'Сохраняем...' : 'Сохранить переход'}
          </button>
          {pageTransMsg && <span style={msgStyle(pageTransMsg)}>{pageTransMsg}</span>}
        </div>
      </AdminSection>

      {/* Игра «Охота» вынесена в отдельный раздел /admin/game */}

      {/* ── Блёстки ── */}
      <AdminSection title="Блёстки (тёмная тема)" tab="effects">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Анимированные частицы на фоне в тёмной теме.
        </p>

        {/* Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              const next = !glitterEnabled
              setGlitterEnabled(next)
              await saveSetting('glitter_enabled', String(next))
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.35rem 0.9rem', borderRadius: 20,
              border: `1.5px solid ${glitterEnabled ? 'var(--accent)' : 'var(--border-soft)'}`,
              background: glitterEnabled ? 'var(--accent-2)' : 'var(--bg-2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: glitterEnabled ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block', transition: 'background 0.2s' }} />
            <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {glitterEnabled ? 'Включены' : 'Выключены'}
            </span>
          </button>
        </div>

        {/* Intensity + preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Интенсивность</span>
            <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{glitterIntensity}%</span>
          </div>

          {/* Animated glitter preview */}
          <GlitterPreview intensity={glitterIntensity} enabled={glitterEnabled} />

          <input type="range" min={5} max={100} step={5}
            value={glitterIntensity}
            onChange={e => setGlitterIntensity(parseInt(e.target.value, 10))}
            style={{ accentColor: 'var(--accent)', width: '100%' }}
          />
          <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
            <span>Редко</span><span>Умеренно</span><span>Много</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={async () => {
              setSavingGlitter(true); setGlitterMsg('')
              await Promise.all([
                saveSetting('glitter_enabled',   String(glitterEnabled)),
                saveSetting('glitter_intensity', String(glitterIntensity)),
              ])
              setSavingGlitter(false); setGlitterMsg('✓ Сохранено')
            }}
            disabled={savingGlitter}
            className={a.btn}
          >
            {savingGlitter ? 'Сохраняем...' : 'Сохранить'}
          </button>
          {glitterMsg && <span style={msgStyle(glitterMsg)}>{glitterMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Курсор ── */}
      <AdminSection title="Кастомный курсор" tab="effects">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Только на десктопе (pointer: fine). Работает сразу после включения (перезагрузка не нужна).
        </p>

        {/* Toggle */}
        <div className="flex items-center gap-4">
          <button
            disabled={savingCursor}
            onClick={async () => {
              setSavingCursor(true)
              const next = !cursorEnabled
              setCursorEnabled(next)
              await saveSetting('custom_cursor_enabled', String(next))
              setSavingCursor(false)
              setCursorMsg(next ? '✓ Включён' : '✓ Выключен')
            }}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center',
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
              background: cursorEnabled ? 'var(--accent)' : 'var(--border)',
              border: 'none', padding: 0,
              transition: 'background 0.2s ease',
              opacity: savingCursor ? 0.6 : 1,
            }}
            aria-label={cursorEnabled ? 'Выключить курсор' : 'Включить курсор'}
          >
            <span style={{
              position: 'absolute',
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              top: 3, left: cursorEnabled ? 23 : 3,
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
          <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.82rem', color: 'var(--text)' }}>
            {cursorEnabled ? 'Включён' : 'Выключен'}
          </span>
          {cursorMsg && <span style={msgStyle(cursorMsg)}>{cursorMsg}</span>}
        </div>

        {/* SVG upload — only when enabled */}
        {cursorEnabled && (
          <div className="flex items-center gap-4 flex-wrap">
            {/* Preview */}
            <div style={{
              width: 52, height: 52, flexShrink: 0,
              borderRadius: 6, border: '1px solid var(--border-soft)',
              background: 'var(--bg-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {cursorSvgUrl ? (
                <div style={{
                  width: 28, height: 28,
                  backgroundColor: cursorColorLight || 'var(--accent)',
                  maskImage: `url(/api/proxy?url=${encodeURIComponent(cursorSvgUrl)})`,
                  WebkitMaskImage: `url(/api/proxy?url=${encodeURIComponent(cursorSvgUrl)})`,
                  maskSize: 'contain', WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center', WebkitMaskPosition: 'center',
                }} />
              ) : (
                <div style={{ position: 'relative', width: 20, height: 20 }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: cursorColorLight || 'var(--accent)', transform: 'translateY(-50%)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5, background: cursorColorLight || 'var(--accent)', transform: 'translateX(-50%)' }} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.45, fontFamily: 'var(--font-involve)' }}>
                {cursorSvgUrl ? 'Кастомный SVG' : 'По умолчанию (прицел)'}
              </span>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => cursorSvgRef.current?.click()} disabled={uploadingCursor} className={a.btn}>
                  {uploadingCursor ? 'Загружаем...' : 'Загрузить SVG'}
                </button>
                {cursorSvgUrl && (
                  <button onClick={async () => {
                    setCursorSvgUrl(null)
                    await saveSetting('custom_cursor_svg_url', null)
                    setCursorMsg('✓ Удалён')
                  }} className={a.btnDanger}>Удалить</button>
                )}
              </div>
            </div>

            <input ref={cursorSvgRef} type="file" accept="image/svg+xml" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(
                e.target.files[0], 'assets', setUploadingCursor, setCursorSvgUrl, setCursorMsg, 'custom_cursor_svg_url'
              )} />
          </div>
        )}

        {/* Color pickers — always visible in cursor section */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>
              Цвет курсора
            </span>
            <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)' }}>
              — если не задан, использует акцентный цвет темы
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorPicker
              label="☀ Светлая тема"
              value={cursorColorLight}
              cssVar="--cursor-color"
              onChange={setCursorColorLight}
            />
            <ColorPicker
              label="☾ Тёмная тема"
              value={cursorColorDark}
              onChange={setCursorColorDark}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={async () => {
                setSavingCursorColors(true); setCursorColorsMsg('')
                await Promise.all([
                  saveSetting('custom_cursor_color_light', cursorColorLight),
                  saveSetting('custom_cursor_color_dark',  cursorColorDark),
                ])
                setSavingCursorColors(false)
                setCursorColorsMsg('✓ Сохранено — перезагрузите страницу')
              }}
              disabled={savingCursorColors}
              className={a.btn}
            >
              {savingCursorColors ? 'Сохраняем...' : 'Сохранить цвет'}
            </button>
            {cursorColorsMsg && <span style={msgStyle(cursorColorsMsg)}>{cursorColorsMsg}</span>}
          </div>
        </div>
      </AdminSection>

      {/* ── Hero video ── */}
      <AdminSection title="Видео Hero секции" tab="catalog">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          WebM — основное видео для десктопа и Android. MP4 (H.264) обязателен для iPhone/iPad —
          Safari не умеет проигрывать WebM. Постер показывается, пока видео грузится.
        </p>

        {/* Скорость воспроизведения — дефолт (посетитель может менять пилюлей в шапке) */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скорость по умолчанию</span>
            <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{heroSpeedDefault.toFixed(2)}×</span>
          </div>
          <input type="range" min={0.25} max={2} step={0.05} value={heroSpeedDefault}
            onChange={e => setHeroSpeedDefault(parseFloat(e.target.value))}
            style={{ accentColor: 'var(--accent)', width: '100%' }}
          />
          <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
            <span>0.25× медленно</span><span>1× обычно</span><span>2× быстро</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button onClick={saveHeroSpeed} disabled={savingHeroSpeed} className={a.btn}>
              {savingHeroSpeed ? 'Сохраняем...' : 'Сохранить скорость'}
            </button>
            {heroSpeedMsg && <span style={msgStyle(heroSpeedMsg)}>{heroSpeedMsg}</span>}
          </div>
        </div>

        {/* WebM */}
        <p className="text-xs font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', letterSpacing: '0.08em' }}>WEBM (десктоп / Android)</p>
        {heroUrl && (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 240, background: 'var(--bg-2)' }}>
            <video key={heroUrl} src={heroUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" style={{ maxHeight: 240 }} />
          </div>
        )}
        {heroUrl && (
          <p className="text-xs truncate" style={{ color: 'var(--accent)', opacity: 0.45, fontFamily: 'var(--font-involve)' }}>{heroUrl.split('/').pop()}</p>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => heroRef.current?.click()} disabled={uploadingHero || savingHero} className={a.btn}>
            {uploadingHero ? 'Загружаем...' : savingHero ? 'Сохраняем...' : 'Загрузить WebM'}
          </button>
          <input ref={heroRef} type="file" accept="video/webm,video/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          {heroMsg && <span style={msgStyle(heroMsg)}>{heroMsg}</span>}
        </div>

        {/* MP4 — iOS */}
        <p className="text-xs font-semibold mt-4" style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', letterSpacing: '0.08em' }}>MP4 / H.264 (iPhone / iPad)</p>
        {heroMp4Url && (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 240, background: 'var(--bg-2)' }}>
            <video key={heroMp4Url} src={heroMp4Url} autoPlay muted loop playsInline className="w-full h-full object-cover" style={{ maxHeight: 240 }} />
          </div>
        )}
        {heroMp4Url && (
          <p className="text-xs truncate" style={{ color: 'var(--accent)', opacity: 0.45, fontFamily: 'var(--font-involve)' }}>{heroMp4Url.split('/').pop()}</p>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => heroMp4Ref.current?.click()} disabled={uploadingHeroMp4} className={a.btn}>
            {uploadingHeroMp4 ? 'Загружаем...' : 'Загрузить MP4'}
          </button>
          <input ref={heroMp4Ref} type="file" accept="video/mp4,video/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadHeroMp4(e.target.files[0])} />
          {heroMp4Msg && <span style={msgStyle(heroMp4Msg)}>{heroMp4Msg}</span>}
        </div>

        {/* Poster */}
        <p className="text-xs font-semibold mt-4" style={{ color: 'var(--accent)', fontFamily: 'var(--font-onder)', letterSpacing: '0.08em' }}>ПОСТЕР (заставка)</p>
        {heroPosterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPosterUrl} alt="poster" className="rounded-xl object-cover" style={{ maxHeight: 200, background: 'var(--bg-2)' }} />
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => heroPosterRef.current?.click()} disabled={uploadingHeroPoster} className={a.btn}>
            {uploadingHeroPoster ? 'Загружаем...' : 'Загрузить постер'}
          </button>
          <input ref={heroPosterRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadHeroPoster(e.target.files[0])} />
          {heroPosterMsg && <span style={msgStyle(heroPosterMsg)}>{heroPosterMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Profile bg light ── */}
      <AdminSection title="Фон страницы профиля" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          PNG с прозрачностью — фон для всех профилей пользователей (светлая тема).
        </p>
        {profileBg ? (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 200, background: CHECKBOARD_LIGHT }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileBg} alt="" className="w-full object-contain" style={{ maxHeight: 200 }} />
          </div>
        ) : (
          <div className="rounded-xl flex items-center justify-center h-24" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>Фон не задан</span>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => profileRef.current?.click()} disabled={uploadingProfile || savingProfile} className={a.btn}>
            {uploadingProfile ? 'Загружаем...' : savingProfile ? 'Сохраняем...' : 'Загрузить PNG'}
          </button>
          <input ref={profileRef} type="file" accept="image/png" className="hidden"
            onChange={e => e.target.files?.[0] && uploadProfileBg(e.target.files[0])} />
          {profileBg && <button onClick={removeProfileBg} disabled={savingProfile} className={a.btnDanger}>Удалить</button>}
          {profileMsg && <span style={msgStyle(profileMsg)}>{profileMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Profile bg dark ── */}
      <AdminSection title="Фон профиля (тёмная тема)" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          PNG-фон для тёмной темы. Если не задан — используется светлый.
        </p>
        {profileBgDark ? (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 200, background: CHECKBOARD_DARK }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileBgDark} alt="" className="w-full object-contain" style={{ maxHeight: 200 }} />
          </div>
        ) : (
          <div className="rounded-xl flex items-center justify-center h-24" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>Фон не задан</span>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => profileDarkRef.current?.click()} disabled={uploadingProfileDark || savingProfileDark} className={a.btn}>
            {uploadingProfileDark ? 'Загружаем...' : savingProfileDark ? 'Сохраняем...' : 'Загрузить PNG'}
          </button>
          <input ref={profileDarkRef} type="file" accept="image/png" className="hidden"
            onChange={e => e.target.files?.[0] && uploadProfileBgDark(e.target.files[0])} />
          {profileBgDark && <button onClick={removeProfileBgDark} disabled={savingProfileDark} className={a.btnDanger}>Удалить</button>}
          {profileDarkMsg && <span style={msgStyle(profileDarkMsg)}>{profileDarkMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Фразы загрузки ── */}
      <AdminSection title="Фразы загрузки" tab="content">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Фразы крутятся во время загрузки сайта. Одна фраза — одна строка.
        </p>
        <textarea
          value={loadingPhrases}
          onChange={e => setLoadingPhrases(e.target.value)}
          rows={10}
          style={{
            ...INPUT_STYLE,
            width: '100%',
            resize: 'vertical',
            fontFamily: 'var(--font-involve)',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            padding: '0.6rem 0.75rem',
          }}
          placeholder="Одна фраза на строку..."
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={savingPhrases}
            onClick={async () => {
              setSavingPhrases(true); setPhrasesMsg('')
              await saveSetting('loading_phrases', JSON.stringify(
                loadingPhrases.split('\n').map(s => s.trim()).filter(Boolean)
              ))
              setSavingPhrases(false); setPhrasesMsg('✓ Сохранено')
            }}
            className={a.btn}
          >
            {savingPhrases ? 'Сохраняем...' : 'Сохранить фразы'}
          </button>
          {phrasesMsg && <span style={msgStyle(phrasesMsg)}>{phrasesMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Бегущая строка ── */}
      <AdminSection title="Бегущая строка — Футер" tab="content">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Тексты для бегущей строки в футере. Одна строка — одна фраза.
        </p>
        <textarea
          value={tickerTexts}
          onChange={e => setTickerTexts(e.target.value)}
          rows={8}
          style={{
            ...INPUT_STYLE,
            width: '100%',
            resize: 'vertical',
            fontFamily: 'var(--font-involve)',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            padding: '0.6rem 0.75rem',
          }}
          placeholder="Одна фраза на строку..."
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={savingTicker}
            onClick={async () => {
              setSavingTicker(true); setTickerMsg('')
              await saveSetting('ticker_texts', JSON.stringify(
                tickerTexts.split('\n').map(s => s.trim()).filter(Boolean)
              ))
              setSavingTicker(false); setTickerMsg('✓ Сохранено')
            }}
            className={a.btn}
          >
            {savingTicker ? 'Сохраняем...' : 'Сохранить строку'}
          </button>
          {tickerMsg && <span style={msgStyle(tickerMsg)}>{tickerMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Бегущая строка — Личный кабинет ── */}
      <AdminSection title="Бегущая строка — Личный кабинет" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Тексты для бегущей строки в личном кабинете. Одна строка — одна фраза.
        </p>
        <textarea
          value={tickerTextsAccount}
          onChange={e => setTickerTextsAccount(e.target.value)}
          rows={6}
          style={{
            ...INPUT_STYLE,
            width: '100%',
            resize: 'vertical',
            fontFamily: 'var(--font-involve)',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            padding: '0.6rem 0.75rem',
          }}
          placeholder="Одна фраза на строку..."
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={savingTickerAccount}
            onClick={async () => {
              setSavingTickerAccount(true); setTickerAccountMsg('')
              await saveSetting('ticker_texts_account', JSON.stringify(
                tickerTextsAccount.split('\n').map(s => s.trim()).filter(Boolean)
              ))
              setSavingTickerAccount(false); setTickerAccountMsg('✓ Сохранено')
            }}
            className={a.btn}
          >
            {savingTickerAccount ? 'Сохраняем...' : 'Сохранить строку'}
          </button>
          {tickerAccountMsg && <span style={msgStyle(tickerAccountMsg)}>{tickerAccountMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Тюнер уровней / скидок ── */}
      <AdminSection title="Уровни и скидки" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Формула геймификации. Искры за заказ = «за заказ» + «за доп. вещь» × (кол-во вещей − 1).
          Пороги — кумулятивные искры для каждого уровня (через запятую); далее каждый уровень дороже на «шаг сверх таблицы».
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Искры за заказ <InfoTip text="Сколько искр начисляется за каждый доставленный заказ. Искры — это XP уровней." /></span>
            <input type="number" value={lvlSparkOrder} onChange={e => setLvlSparkOrder(e.target.value)} style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none' }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Искры за доп. вещь <InfoTip text="Доп. искры за каждую вещь в заказе сверх первой. Заказ из 3 вещей = «за заказ» + 2 × «за доп. вещь»." /></span>
            <input type="number" value={lvlSparkExtra} onChange={e => setLvlSparkExtra(e.target.value)} style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none' }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Шаг сверх таблицы <InfoTip text="Когда пороги из таблицы кончились — каждый следующий уровень стоит на столько искр дороже предыдущего." /></span>
            <input type="number" value={lvlIncrement} onChange={e => setLvlIncrement(e.target.value)} style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none' }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Макс. скидка, % <InfoTip text="Потолок скидки: выше этого % скидка не растёт, даже на максимальных уровнях. Цена округляется вниз до кратного 3." /></span>
            <input type="number" value={lvlDiscountMax} onChange={e => setLvlDiscountMax(e.target.value)} style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none' }} />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Пороги уровней (кумулятивно, через запятую) <InfoTip text="Сколько всего искр нужно накопить для каждого уровня, по порядку. Первое число — порог 1-го уровня (обычно 0)." /></span>
          <input value={lvlThresholds} onChange={e => setLvlThresholds(e.target.value)} style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none', fontFamily: 'var(--font-involve)' }} />
        </label>

        {/* Превью: уровень → скидка */}
        {(() => {
          const cfg = parseLevelingConfig(JSON.stringify(buildLevelingCfg()))
          const rows = [1, 2, 5, 10, 11, 15, 20]
          return (
            <div className="flex flex-wrap gap-2" style={{ marginTop: '0.25rem' }}>
              {rows.map(L => (
                <span key={L} style={{ fontFamily: 'var(--font-onder)', fontSize: '0.6rem', letterSpacing: '0.06em', color: 'var(--accent)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '2px', padding: '0.25rem 0.5rem' }}>
                  LVL {L} → {getDiscount(L, cfg)}%
                </span>
              ))}
            </div>
          )
        })()}

        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={savingLvl} onClick={saveLeveling} className={a.btn}>
            {savingLvl ? 'Сохраняем...' : 'Сохранить формулу'}
          </button>
          {lvlMsg && <span style={msgStyle(lvlMsg)}>{lvlMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Тултипы ЛК (наведение на бейджи уровня и скидки) ── */}
      <AdminSection title="Подсказки в ЛК (уровень / скидка)" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Текст всплывающей подсказки при наведении на бейдж «LVL» и на бейдж скидки в личном кабинете. Пусто — показывается дефолт.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Подсказка про уровень</span>
          <textarea value={lkLevelTip} onChange={e => setLkLevelTip(e.target.value)} rows={2} placeholder="Уровень растёт от искорок…" style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none', fontFamily: 'var(--font-involve)', resize: 'vertical' }} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Подсказка про скидку</span>
          <textarea value={lkDiscountTip} onChange={e => setLkDiscountTip(e.target.value)} rows={2} placeholder="Скидка применяется к ценам…" style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.5rem 0.75rem', outline: 'none', fontFamily: 'var(--font-involve)', resize: 'vertical' }} />
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={savingLkTips} onClick={saveLkTips} className={a.btn}>
            {savingLkTips ? 'Сохраняем...' : 'Сохранить подсказки'}
          </button>
          {lkTipsMsg && <span style={msgStyle(lkTipsMsg)}>{lkTipsMsg}</span>}
        </div>
      </AdminSection>

      {/* ── Тексты медалей (ачивки) ── */}
      <AdminSection title="Медали — тексты ачивок" tab="account">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Название и описание медалей, которые видны в ряду ачивок личного кабинета. Условие выдачи и порог
          задаются миграцией — здесь меняется только текст (каждая медаль сохраняется отдельно).
        </p>
        {medals.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'var(--font-involve)' }}>
            Ачивки не найдены — проверьте, применена ли миграция 09/10.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {medals.map(m => {
              const condLabel = (MEDAL_CONDITION_LABEL[m.condition_type]?.(m.threshold)) ?? `Условие: ${m.condition_type}`
              return (
                <div key={m.key} className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)' }}>{m.key}</span>
                    {m.medal_key && (
                      <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.4, fontFamily: 'monospace' }}>medal: {m.medal_key}</span>
                    )}
                    <InfoTip text={condLabel} />
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Название</span>
                    <input
                      value={m.title}
                      onChange={e => setMedalField(m.key, 'title', e.target.value)}
                      style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.45rem 0.7rem', outline: 'none', fontFamily: 'var(--font-onder)', letterSpacing: '0.06em' }}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Описание</span>
                    <textarea
                      value={m.description ?? ''}
                      onChange={e => setMedalField(m.key, 'description', e.target.value)}
                      rows={2}
                      style={{ ...INPUT_STYLE, borderRadius: '2px', padding: '0.45rem 0.7rem', outline: 'none', fontFamily: 'var(--font-involve)', resize: 'vertical' }}
                    />
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button disabled={savingMedalKey === m.key || !m.title.trim()} onClick={() => saveMedal(m)} className={a.btn}>
                      {savingMedalKey === m.key ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                    {medalMsg[m.key] && <span style={msgStyle(medalMsg[m.key])}>{medalMsg[m.key]}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AdminSection>

      {/* ── Меню (на отдельной странице) ── */}
      <AdminSection title="Меню сайта" tab="menu">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Видимость и порядок коллекций, кастомные пункты и превью бургер-меню — на отдельной странице.
        </p>
        <a href="/admin/menu" className={a.btn} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
          Открыть настройки меню →
        </a>

        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)' }}>
            Подпись внизу меню
          </span>
          <input value={menuFooterText} onChange={e => setMenuFooterText(e.target.value)}
            placeholder={DEFAULT_MENU_FOOTER}
            style={{ ...INPUT_STYLE, borderRadius: 4, padding: '0.5rem 0.7rem', outline: 'none' }} />
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={saveMenuFooter} disabled={savingMenuFooter} className={a.btn}>
              {savingMenuFooter ? 'Сохраняем...' : 'Сохранить подпись'}
            </button>
            {menuFooterMsg && <span style={msgStyle(menuFooterMsg)}>{menuFooterMsg}</span>}
          </div>
        </div>
      </AdminSection>

      </AdminTabContext.Provider>
    </div>
  )
}
