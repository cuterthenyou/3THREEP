'use client'

import { useState, useRef, useEffect } from 'react'
import a from '../admin.module.css'
import { AdminSection, AdminPageTitle } from '../components'
import { CHECKBOARD_LIGHT, CHECKBOARD_DARK, INPUT_STYLE } from '../adminStyles'
import { ColorPicker, FontSelect, GlitterPreview } from './parts'
import type { CustomFont } from '@/components/ThemeStyles'

interface Props {
  initialSettings: Record<string, string | null>
  initialCustomFonts?: CustomFont[]
}

const BUILTIN_FONTS = ['ONDER', 'Involve', 'DeutschGothic'] as const
type FontName = string

const RADIUS_OPTIONS = [
  { value: 'sharp',   label: 'Острые' },
  { value: 'slight',  label: 'Лёгкие' },
  { value: 'rounded', label: 'Скруглённые' },
] as const

const SPEED_OPTIONS = [
  { value: 'off',    label: 'Выкл' },
  { value: 'slow',   label: 'Медленно' },
  { value: 'normal', label: 'Нормально' },
  { value: 'fast',   label: 'Быстро' },
] as const

export default function SiteClient({ initialSettings, initialCustomFonts = [] }: Props) {
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
  const [borderRadiusScale, setBorderRadiusScale] = useState(initialSettings['border_radius_scale'] ?? 'sharp')
  const [animationSpeed, setAnimationSpeed] = useState(initialSettings['animation_speed'] ?? 'normal')
  const [savingEffects, setSavingEffects] = useState(false)
  const [effectsMsg, setEffectsMsg] = useState('')

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
    ])
    setSavingColors(false); setColorsMsg('✓ Цвета сохранены — перезагрузите страницу для проверки')
  }

  // ── Save fonts ──────────────────────────────────────────────────
  async function saveFonts() {
    setSavingFonts(true); setFontsMsg('')
    await Promise.all([
      saveSetting('font_heading', fontHeading),
      saveSetting('font_body',    fontBody),
      saveSetting('font_price',   fontPrice),
    ])
    setSavingFonts(false); setFontsMsg('✓ Шрифты сохранены — перезагрузите страницу для проверки')
  }

  // ── Save effects ────────────────────────────────────────────────
  async function saveEffects() {
    setSavingEffects(true); setEffectsMsg('')
    await Promise.all([
      saveSetting('grain_opacity_light', String(grainLight / 100)),
      saveSetting('grain_opacity_dark',  String(grainDark  / 100)),
      saveSetting('grain_size',          String(grainScale)),
      saveSetting('border_radius_scale', borderRadiusScale),
      saveSetting('animation_speed',     animationSpeed),
    ])
    setSavingEffects(false); setEffectsMsg('✓ Эффекты сохранены — перезагрузите страницу для проверки')
  }

  const msgStyle = (m: string) => ({ color: m.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)', fontFamily: 'var(--font-involve)', fontSize: '0.75rem' })

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-8">
      <AdminPageTitle>Настройки сайта</AdminPageTitle>

      {/* ── Логотипы ── */}
      <AdminSection title="Логотипы сайта">
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

      {/* ── Цвета ── */}
      <AdminSection title="Цвета">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          Кликните на цвет для визуального выбора или введите HEX вручную. Предпросмотр применяется сразу на страницу, сохранение — постоянно.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Light theme */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>☀ Светлая тема</span>
            </div>
            <ColorPicker label="Фон (bg)" value={colorBgLight} cssVar="--bg" onChange={setColorBgLight} />
            <ColorPicker label="Текст" value={colorTextLight} cssVar="--text" onChange={setColorTextLight} />
            <ColorPicker label="Акцент" value={colorAccentLight} cssVar="--accent" onChange={setColorAccentLight} />
          </div>

          {/* Dark theme */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-involve)', color: 'var(--accent)' }}>☾ Тёмная тема</span>
            </div>
            <ColorPicker label="Фон (bg)" value={colorBgDark} onChange={setColorBgDark} />
            <ColorPicker label="Текст" value={colorTextDark} onChange={setColorTextDark} />
            <ColorPicker label="Акцент" value={colorAccentDark} onChange={setColorAccentDark} />
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
      <AdminSection title="Шрифты">
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

      {/* ── Визуальные эффекты ── */}
      <AdminSection title="Визуальные эффекты">
        {/* Animation keyframes */}
        <style>{`
          @keyframes eff-sweep {
            0%   { transform: translateX(-120%); }
            100% { transform: translateX(420%); }
          }
          @keyframes eff-pulse {
            0%, 100% { opacity: 0.25; transform: scale(0.9); }
            50%       { opacity: 1;    transform: scale(1); }
          }
        `}</style>

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
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Крупность зерна</span>
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

          {/* ── Border radius ── */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скругление углов</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {RADIUS_OPTIONS.map(opt => {
                const r = { sharp: 0, slight: 6, rounded: 14 }[opt.value as 'sharp' | 'slight' | 'rounded']
                const active = borderRadiusScale === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setBorderRadiusScale(opt.value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: '14px 10px', cursor: 'pointer',
                      borderRadius: 6,
                      background: active ? 'var(--accent-2)' : 'var(--bg-2)',
                      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-soft)'}`,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {/* Card shape demo */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ height: 34, borderRadius: r, background: active ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--bg-subtle)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border-soft)'}` }} />
                      <div style={{ height: 14, borderRadius: r, background: active ? 'color-mix(in srgb, var(--accent) 50%, transparent)' : 'var(--border-soft)', width: '70%', margin: '0 auto' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: active ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-involve)' }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Animation speed ── */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скорость анимаций</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {SPEED_OPTIONS.map(opt => {
                const dur = ({ off: 0, slow: 2200, normal: 800, fast: 280 } as Record<string, number>)[opt.value] ?? 800
                const active = animationSpeed === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnimationSpeed(opt.value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: '12px 6px', cursor: 'pointer', overflow: 'hidden',
                      borderRadius: 6,
                      background: active ? 'var(--accent-2)' : 'var(--bg-2)',
                      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-soft)'}`,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {/* Animation demo */}
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-subtle)', overflow: 'hidden', position: 'relative' }}>
                      {dur === 0 ? (
                        <div style={{ width: '100%', height: '100%', background: active ? 'var(--accent)' : 'var(--border-soft)', opacity: 0.35 }} />
                      ) : (
                        <div style={{
                          position: 'absolute', width: '35%', height: '100%', borderRadius: 3,
                          background: active ? 'var(--accent)' : 'var(--border)',
                          animation: `eff-sweep ${dur}ms linear infinite`,
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: active ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-involve)', whiteSpace: 'nowrap' }}>{opt.label}</span>
                  </button>
                )
              })}
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

      {/* ── Блёстки ── */}
      <AdminSection title="Блёстки (тёмная тема)">
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
      <AdminSection title="Кастомный курсор">
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
      <AdminSection title="Видео Hero секции">
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
          WebM — основное видео для десктопа и Android. MP4 (H.264) обязателен для iPhone/iPad —
          Safari не умеет проигрывать WebM. Постер показывается, пока видео грузится.
        </p>

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
      <AdminSection title="Фон страницы профиля">
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
      <AdminSection title="Фон профиля (тёмная тема)">
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
      <AdminSection title="Фразы загрузки">
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
      <AdminSection title="Бегущая строка — Футер">
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
      <AdminSection title="Бегущая строка — Личный кабинет">
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
    </div>
  )
}
