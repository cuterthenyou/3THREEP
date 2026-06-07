'use client'

import { useState, useRef } from 'react'
import a from '../admin.module.css'
import { AdminSection, AdminPageTitle } from '../components'
import { CHECKBOARD_LIGHT, CHECKBOARD_DARK, INPUT_STYLE } from '../adminStyles'

interface Props {
  initialSettings: Record<string, string | null>
}

const FONT_OPTIONS = ['ONDER', 'Involve', 'DeutschGothic'] as const
type FontName = typeof FONT_OPTIONS[number]

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
}: {
  label: string
  value: FontName
  onChange: (v: FontName) => void
  previewText: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as FontName)}
        style={{
          ...INPUT_STYLE,
          padding: '0.4rem 0.6rem',
          fontSize: '0.82rem',
          borderRadius: 4,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {FONT_OPTIONS.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <p style={{ fontFamily: `'${value}', sans-serif`, fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.3 }}>
        {previewText}
      </p>
    </div>
  )
}

export default function SiteClient({ initialSettings }: Props) {
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
  const [fontHeading, setFontHeading] = useState<FontName>((initialSettings['font_heading'] as FontName) ?? 'ONDER')
  const [fontBody, setFontBody] = useState<FontName>((initialSettings['font_body'] as FontName) ?? 'Involve')
  const [fontPrice, setFontPrice] = useState<FontName>((initialSettings['font_price'] as FontName) ?? 'DeutschGothic')
  const [savingFonts, setSavingFonts] = useState(false)
  const [fontsMsg, setFontsMsg] = useState('')

  // ── Effects ─────────────────────────────────────────────────────
  const grainRaw = parseFloat(initialSettings['grain_opacity'] ?? '0.055')
  const [grainOpacity, setGrainOpacity] = useState(isNaN(grainRaw) ? 5.5 : Math.round(grainRaw * 1000) / 10)
  const [borderRadiusScale, setBorderRadiusScale] = useState(initialSettings['border_radius_scale'] ?? 'sharp')
  const [animationSpeed, setAnimationSpeed] = useState(initialSettings['animation_speed'] ?? 'normal')
  const [savingEffects, setSavingEffects] = useState(false)
  const [effectsMsg, setEffectsMsg] = useState('')

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
          Выбранный шрифт применяется ко всем соответствующим элементам сайта. Шрифты загружены локально.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FontSelect
            label="Заголовки"
            value={fontHeading}
            onChange={setFontHeading}
            previewText="THREEP STYLE"
          />
          <FontSelect
            label="Основной текст"
            value={fontBody}
            onChange={setFontBody}
            previewText="Уличная одежда ручной работы"
          />
          <FontSelect
            label="Цены"
            value={fontPrice}
            onChange={setFontPrice}
            previewText="6 333 RUB"
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
        <div className="flex flex-col gap-6">
          {/* Grain opacity */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Зернистость (grain)</span>
              <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{grainOpacity.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0} max={20} step={0.5}
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

          {/* Border radius */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скругление углов</span>
            <div className="flex gap-3 flex-wrap">
              {RADIUS_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    value={opt.value}
                    checked={borderRadiusScale === opt.value}
                    onChange={() => setBorderRadiusScale(opt.value)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="text-sm" style={{ fontFamily: 'var(--font-involve)', color: 'var(--text)' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Animation speed */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)' }}>Скорость анимаций</span>
            <div className="flex gap-3 flex-wrap">
              {SPEED_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="speed"
                    value={opt.value}
                    checked={animationSpeed === opt.value}
                    onChange={() => setAnimationSpeed(opt.value)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="text-sm" style={{ fontFamily: 'var(--font-involve)', color: 'var(--text)' }}>{opt.label}</span>
                </label>
              ))}
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
