'use client'

import { useState, useRef } from 'react'
import a from '../admin.module.css'

const LABEL_STYLE = { color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-onder)" }
const SECTION_TITLE = { color: 'var(--accent)', fontFamily: "var(--font-involve)", fontWeight: 800, fontSize: '1rem' }

interface Props {
  initialSettings: Record<string, string | null>
}

export default function SiteClient({ initialSettings }: Props) {
  const [heroUrl, setHeroUrl] = useState<string | null>(initialSettings['hero_video_url'] ?? null)
  const [profileBg, setProfileBg] = useState<string | null>(initialSettings['profile_bg_url'] ?? null)
  const [profileBgDark, setProfileBgDark] = useState<string | null>(initialSettings['profile_bg_url_dark'] ?? null)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingProfileDark, setUploadingProfileDark] = useState(false)
  const [savingHero, setSavingHero] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingProfileDark, setSavingProfileDark] = useState(false)
  const [heroMsg, setHeroMsg] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileDarkMsg, setProfileDarkMsg] = useState('')
  const heroRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLInputElement>(null)
  const profileDarkRef = useRef<HTMLInputElement>(null)

  async function saveSetting(key: string, value: string | null) {
    await fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  }

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

  async function uploadProfileBg(file: File) {
    setUploadingProfile(true)
    setProfileMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingProfile(false)
    if (!data.url) { setProfileMsg('Ошибка загрузки'); return }
    setProfileBg(data.url)
    setSavingProfile(true)
    await saveSetting('profile_bg_url', data.url)
    setSavingProfile(false)
    setProfileMsg('✓ Фон профиля обновлён')
  }

  async function removeProfileBg() {
    setProfileBg(null)
    setSavingProfile(true)
    await saveSetting('profile_bg_url', null)
    setSavingProfile(false)
    setProfileMsg('✓ Фон профиля удалён')
  }

  async function uploadProfileBgDark(file: File) {
    setUploadingProfileDark(true)
    setProfileDarkMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingProfileDark(false)
    if (!data.url) { setProfileDarkMsg('Ошибка загрузки'); return }
    setProfileBgDark(data.url)
    setSavingProfileDark(true)
    await saveSetting('profile_bg_url_dark', data.url)
    setSavingProfileDark(false)
    setProfileDarkMsg('✓ Фон обновлён')
  }

  async function removeProfileBgDark() {
    setProfileBgDark(null)
    setSavingProfileDark(true)
    await saveSetting('profile_bg_url_dark', null)
    setSavingProfileDark(false)
    setProfileDarkMsg('✓ Фон удалён')
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="uppercase tracking-widest" style={{ color: 'var(--accent)', fontFamily: "var(--font-onder)", fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
        Настройки сайта
      </h1>

      {/* ── Hero video ── */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
        <p style={SECTION_TITLE}>Видео Hero секции</p>
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
          Видео показывается на главной странице поверх всего. Рекомендуется WebM или MP4.
        </p>

        {heroUrl && (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 240, background: '#000' }}>
            <video
              key={heroUrl}
              src={heroUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ maxHeight: 240 }}
            />
          </div>
        )}
        {heroUrl && (
          <p className="text-xs truncate" style={{ color: 'var(--accent)', opacity: 0.45, fontFamily: "var(--font-involve)" }}>
            {heroUrl.split('/').pop()}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => heroRef.current?.click()}
            disabled={uploadingHero || savingHero}
            className={a.btn}
          >
            {uploadingHero ? 'Загружаем...' : savingHero ? 'Сохраняем...' : 'Загрузить видео'}
          </button>
          <input ref={heroRef} type="file" accept="video/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          {heroMsg && <span className="text-xs" style={{ color: heroMsg.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)', fontFamily: "var(--font-involve)" }}>{heroMsg}</span>}
        </div>
      </div>

      {/* ── Profile background ── */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
        <p style={SECTION_TITLE}>Фон страницы профиля</p>
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
          PNG с прозрачностью — показывается как фон для всех профилей пользователей.
        </p>

        {profileBg && (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 200, background: 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 0 0 / 8px 8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileBg} alt="" className="w-full object-contain" style={{ maxHeight: 200 }} />
          </div>
        )}
        {!profileBg && (
          <div className="rounded-xl flex items-center justify-center h-24" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: "var(--font-involve)" }}>Фон не задан</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => profileRef.current?.click()}
            disabled={uploadingProfile || savingProfile}
            className={a.btn}
          >
            {uploadingProfile ? 'Загружаем...' : savingProfile ? 'Сохраняем...' : 'Загрузить PNG'}
          </button>
          <input ref={profileRef} type="file" accept="image/png" className="hidden"
            onChange={e => e.target.files?.[0] && uploadProfileBg(e.target.files[0])} />
          {profileBg && (
            <button
              onClick={removeProfileBg}
              disabled={savingProfile}
              className={a.btnDanger}
            >
              Удалить фон
            </button>
          )}
          {profileMsg && <span className="text-xs" style={{ color: profileMsg.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)', fontFamily: "var(--font-involve)" }}>{profileMsg}</span>}
        </div>
      </div>

      {/* ── Profile background dark ── */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
        <p style={SECTION_TITLE}>Фон профиля (тёмная тема)</p>
        <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: "var(--font-involve)" }}>
          PNG-фон для тёмной темы. Если не задан — используется светлый фон.
        </p>

        {profileBgDark && (
          <div className="rounded-xl overflow-hidden" style={{ maxHeight: 200, background: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 0 0 / 8px 8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileBgDark} alt="" className="w-full object-contain" style={{ maxHeight: 200 }} />
          </div>
        )}
        {!profileBgDark && (
          <div className="rounded-xl flex items-center justify-center h-24" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.3, fontFamily: "var(--font-involve)" }}>Фон не задан</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => profileDarkRef.current?.click()}
            disabled={uploadingProfileDark || savingProfileDark}
            className={a.btn}
          >
            {uploadingProfileDark ? 'Загружаем...' : savingProfileDark ? 'Сохраняем...' : 'Загрузить PNG'}
          </button>
          <input ref={profileDarkRef} type="file" accept="image/png" className="hidden"
            onChange={e => e.target.files?.[0] && uploadProfileBgDark(e.target.files[0])} />
          {profileBgDark && (
            <button
              onClick={removeProfileBgDark}
              disabled={savingProfileDark}
              className={a.btnDanger}
            >
              Удалить фон
            </button>
          )}
          {profileDarkMsg && <span className="text-xs" style={{ color: profileDarkMsg.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)', fontFamily: "var(--font-involve)" }}>{profileDarkMsg}</span>}
        </div>
      </div>
    </div>
  )
}
