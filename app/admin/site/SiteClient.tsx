'use client'

import { useState, useRef } from 'react'
import a from '../admin.module.css'
import { AdminSection, AdminPageTitle } from '../components'
import { CHECKBOARD_LIGHT, CHECKBOARD_DARK, INPUT_STYLE } from '../adminStyles'
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

// ── Color picker sub-component ──────────────────────────────────
function ColorPicker({
  label,
  value,
  cssVar,
  onChange,
}: {
  label: string
  value: string
  cssVar?: string
  onChange: (v: string) => void
}) {
  const [hex, setHex] = useState(value)

  function handleHexInput(v: string) {
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onChange(v)
      if (cssVar) document.documentElement.style.setProperty(cssVar, v)
    }
  }

  function handleColorPicker(v: string) {
    setHex(v)
    onChange(v)
    if (cssVar) document.documentElement.style.setProperty(cssVar, v)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex.length === 7 ? hex : '#000000'}
          onChange={e => handleColorPicker(e.target.value)}
          style={{
            width: 38, height: 38, padding: 3,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={hex}
          maxLength={7}
          onChange={e => handleHexInput(e.target.value)}
          style={{
            ...INPUT_STYLE,
            width: 110,
            padding: '0.3rem 0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: 28, height: 28,
            background: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

// ── Font selector sub-component ─────────────────────────────────
function FontSelect({
  label,
  value,
  onChange,
  previewText,
  allFonts,
}: {
  label: string
  value: FontName
  onChange: (v: FontName) => void
  previewText: string
  allFonts: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...INPUT_STYLE,
          padding: '0.4rem 0.6rem',
          fontSize: '0.82rem',
          borderRadius: 4,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {allFonts.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <p style={{ fontFamily: `'${value}', sans-serif`, fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.3 }}>
        {previewText}
      </p>
    </div>
  )
}

export default function SiteClient({ initialSettings, initialCustomFonts = [] }: Props) {
  // ── Hero video ──────────────────────────────────────────────────
  const [heroUrl, setHeroUrl] = useState<string | null>(initialSettings['hero_video_url'] ?? null)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [savingHero, setSavingHero] = useState(false)
  const [heroMsg, setHeroMsg] = useState('')
  const heroRef = useRef<HTMLInputElement>(null)

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
  const grainRaw = parseFloat(initialSettings['grain_opacity'] ?? '0.055')
  const [grainOpacity, setGrainOpacity] = useState(isNaN(grainRaw) ? 5.5 : Math.round(grainRaw * 1000) / 10)
  const [borderRadiusScale, setBorderRadiusScale] = useState(initialSettings['border_radius_scale'] ?? 'sharp')
  const [animationSpeed, setAnimationSpeed] = useState(initialSettings['animation_speed'] ?? 'normal')
  const [savingEffects, setSavingEffects] = useState(false)
  const [effectsMsg, setEffectsMsg] = useState('')

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
      saveSetting('grain_opacity',       String(grainOpacity / 100)),
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Зернистость (grain)</span>
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{grainOpacity.toFixed(1)}%</span>
            </div>

            {/* Live grain preview */}
            <div style={{ position: 'relative', height: 88, borderRadius: 6, overflow: 'hidden', background: 'linear-gradient(135deg, #141414 0%, #2a1a14 60%, #1a1a2a 100%)', border: '1px solid var(--border-soft)' }}>
              {/* Grain overlay */}
              <div style={{
                position: 'absolute', inset: 0, opacity: grainOpacity / 100,
                backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
                backgroundRepeat: 'repeat', backgroundSize: '200px 200px',
                mixBlendMode: 'overlay', pointerEvents: 'none',
              }} />
              {/* Sample content */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em' }}>THREEP</span>
                <span style={{ fontFamily: 'var(--font-involve)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.25em' }}>PREVIEW</span>
              </div>
            </div>

            <input
              type="range" min={0} max={20} step={0.5}
              value={grainOpacity}
              onChange={e => {
                const v = parseFloat(e.target.value)
                setGrainOpacity(v)
                document.documentElement.style.setProperty('--grain-opacity', String(v / 100))
              }}
              style={{ accentColor: 'var(--accent)', width: '100%' }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-involve)' }}>
              <span>Нет</span><span>Слабо</span><span>Сильно</span>
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
          Видео показывается на главной странице поверх всего. Рекомендуется WebM или MP4.
        </p>
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
            {uploadingHero ? 'Загружаем...' : savingHero ? 'Сохраняем...' : 'Загрузить видео'}
          </button>
          <input ref={heroRef} type="file" accept="video/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          {heroMsg && <span style={msgStyle(heroMsg)}>{heroMsg}</span>}
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
    </div>
  )
}
