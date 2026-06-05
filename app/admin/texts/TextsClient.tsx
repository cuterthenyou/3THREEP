'use client'

import { useState } from 'react'
import type { FooterContent } from '@/components/Footer'
import type { InfoContent } from '@/app/info/InfoClient'
import type { PrivacySection } from './page'
import a from '../admin.module.css'

interface Props {
  initialFooter: FooterContent
  initialInfo: InfoContent
  initialPrivacy: PrivacySection[]
}

type MainTab = 'footer' | 'info' | 'privacy'
type InfoTab = 'delivery' | 'contacts' | 'about'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-2)',
  border: '1px solid var(--border-soft)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  color: 'var(--text)',
  fontFamily: 'var(--font-involve)',
  fontSize: '0.85rem',
  outline: 'none',
  resize: 'vertical' as const,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-onder)',
  fontSize: '0.52rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  opacity: 0.45,
  color: 'var(--accent)',
  marginBottom: '0.25rem',
  display: 'block',
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-onder)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  opacity: 0.6,
  marginBottom: '0.75rem',
  marginTop: '1.25rem',
}

function Field({ label, value, onChange, rows }: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
      <label style={labelStyle}>{label}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.45rem 1rem',
        fontFamily: 'var(--font-onder)',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text)',
        background: active ? 'var(--accent-2)' : 'none',
        border: 'none',
        borderRadius: '0.4rem',
        cursor: 'pointer',
        opacity: active ? 1 : 0.45,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function SaveBtn({ onClick, saving, msg }: { onClick: () => void; saving: boolean; msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
      <button
        onClick={onClick}
        disabled={saving}
        className={a.btn}
      >
        {saving ? 'Сохраняем...' : 'Сохранить'}
      </button>
      {msg && (
        <span style={{
          fontFamily: 'var(--font-involve)',
          fontSize: '0.8rem',
          color: msg.startsWith('✓') ? 'var(--status-delivered)' : 'var(--status-error)',
        }}>
          {msg}
        </span>
      )}
    </div>
  )
}

async function saveSetting(key: string, value: object | object[]) {
  const res = await fetch('/api/admin/site-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value: JSON.stringify(value) }),
  })
  return res.ok
}

export default function TextsClient({ initialFooter, initialInfo, initialPrivacy }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>('footer')
  const [infoTab, setInfoTab] = useState<InfoTab>('delivery')

  const [footer, setFooter] = useState<FooterContent>(initialFooter)
  const [info, setInfo] = useState<InfoContent>(initialInfo)
  const [privacy, setPrivacy] = useState<PrivacySection[]>(initialPrivacy)

  const [savingFooter, setSavingFooter] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [footerMsg, setFooterMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const [privacyMsg, setPrivacyMsg] = useState('')

  function setF<K extends keyof FooterContent>(key: K, val: FooterContent[K]) {
    setFooter(prev => ({ ...prev, [key]: val }))
  }
  function setI<K extends keyof InfoContent>(key: K, val: InfoContent[K]) {
    setInfo(prev => ({ ...prev, [key]: val }))
  }

  async function handleSaveFooter() {
    setSavingFooter(true)
    setFooterMsg('')
    const ok = await saveSetting('footer_content', footer)
    setSavingFooter(false)
    setFooterMsg(ok ? '✓ Футер сохранён' : 'Ошибка сохранения')
  }

  async function handleSaveInfo() {
    setSavingInfo(true)
    setInfoMsg('')
    const ok = await saveSetting('info_content', info)
    setSavingInfo(false)
    setInfoMsg(ok ? '✓ ИНФА сохранена' : 'Ошибка сохранения')
  }

  async function handleSavePrivacy() {
    setSavingPrivacy(true)
    setPrivacyMsg('')
    const ok = await saveSetting('privacy_content', privacy)
    setSavingPrivacy(false)
    setPrivacyMsg(ok ? '✓ Политика сохранена' : 'Ошибка сохранения')
  }

  function updateSection(i: number, field: keyof PrivacySection, val: string) {
    setPrivacy(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  function addSection() {
    setPrivacy(prev => [...prev, { heading: 'Новый раздел', body: '' }])
  }
  function removeSection(i: number) {
    setPrivacy(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '760px' }}>
      <h1 style={{ fontFamily: 'var(--font-onder)', fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.5rem' }}>
        Редактирование текстов
      </h1>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.75rem', background: 'var(--bg-subtle)', padding: '0.3rem', borderRadius: '0.6rem', width: 'fit-content' }}>
        <TabBtn active={mainTab === 'footer'} onClick={() => setMainTab('footer')}>Футер</TabBtn>
        <TabBtn active={mainTab === 'info'} onClick={() => setMainTab('info')}>ИНФА</TabBtn>
        <TabBtn active={mainTab === 'privacy'} onClick={() => setMainTab('privacy')}>Политика</TabBtn>
      </div>

      {/* ── FOOTER ── */}
      {mainTab === 'footer' && (
        <div>
          <p style={sectionTitleStyle}>Блок «Написать нам»</p>
          <Field label="Заголовок" value={footer.contact_heading} onChange={v => setF('contact_heading', v)} />
          <Field label="Подзаголовок" value={footer.contact_subtext} onChange={v => setF('contact_subtext', v)} rows={2} />
          <Field label="URL ВКонтакте (прямые сообщения)" value={footer.vk_direct_url} onChange={v => setF('vk_direct_url', v)} />
          <Field label="URL Telegram" value={footer.tg_url} onChange={v => setF('tg_url', v)} />

          <p style={sectionTitleStyle}>Блок «Следить за нами»</p>
          <Field label="Заголовок" value={footer.follow_heading} onChange={v => setF('follow_heading', v)} />
          <Field label="Подзаголовок" value={footer.follow_subtext} onChange={v => setF('follow_subtext', v)} rows={2} />
          <Field label="URL ВКонтакте (сообщество)" value={footer.vk_community_url} onChange={v => setF('vk_community_url', v)} />
          <Field label="URL TikTok" value={footer.tiktok_url} onChange={v => setF('tiktok_url', v)} />
          <Field label="URL Instagram" value={footer.instagram_url} onChange={v => setF('instagram_url', v)} />
          <Field label="Дисклеймер про Meta" value={footer.meta_disclaimer} onChange={v => setF('meta_disclaimer', v)} />

          <p style={sectionTitleStyle}>Низ страницы</p>
          <Field label="Копирайт" value={footer.copyright} onChange={v => setF('copyright', v)} />

          <SaveBtn onClick={handleSaveFooter} saving={savingFooter} msg={footerMsg} />
        </div>
      )}

      {/* ── INFO ── */}
      {mainTab === 'info' && (
        <div>
          {/* Info sub-tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '0.3rem', borderRadius: '0.6rem', width: 'fit-content' }}>
            <TabBtn active={infoTab === 'delivery'} onClick={() => setInfoTab('delivery')}>{info.tab1_label || 'Отгрузка'}</TabBtn>
            <TabBtn active={infoTab === 'contacts'} onClick={() => setInfoTab('contacts')}>{info.tab2_label || 'Связь'}</TabBtn>
            <TabBtn active={infoTab === 'about'} onClick={() => setInfoTab('about')}>{info.tab3_label || 'Суть'}</TabBtn>
          </div>

          {infoTab === 'delivery' && (
            <div>
              <Field label="Название вкладки" value={info.tab1_label} onChange={v => setI('tab1_label', v)} />
              <Field label="Вводный текст" value={info.delivery_intro} onChange={v => setI('delivery_intro', v)} rows={2} />
              <Field label="Заголовок «Оплата»" value={info.payment_heading} onChange={v => setI('payment_heading', v)} />
              <Field label="Текст оплаты" value={info.payment_text} onChange={v => setI('payment_text', v)} rows={2} />
              <Field label="Заголовок «Доставка»" value={info.delivery_heading} onChange={v => setI('delivery_heading', v)} />
              <Field label="Текст доставки" value={info.delivery_text} onChange={v => setI('delivery_text', v)} rows={2} />
              <Field label="Примечание (мелкий текст)" value={info.delivery_note} onChange={v => setI('delivery_note', v)} rows={2} />
            </div>
          )}

          {infoTab === 'contacts' && (
            <div>
              <Field label="Название вкладки" value={info.tab2_label} onChange={v => setI('tab2_label', v)} />
              <p style={sectionTitleStyle}>Блок «Написать нам»</p>
              <Field label="Заголовок" value={info.write_heading} onChange={v => setI('write_heading', v)} />
              <Field label="Лейбл ВК" value={info.vk_label} onChange={v => setI('vk_label', v)} />
              <Field label="URL ВК" value={info.vk_url} onChange={v => setI('vk_url', v)} />
              <Field label="Хэндл ВК (отображается)" value={info.vk_handle} onChange={v => setI('vk_handle', v)} />
              <Field label="Лейбл Telegram" value={info.tg_label} onChange={v => setI('tg_label', v)} />
              <Field label="URL Telegram" value={info.tg_url} onChange={v => setI('tg_url', v)} />
              <Field label="Хэндл Telegram (отображается)" value={info.tg_handle} onChange={v => setI('tg_handle', v)} />
              <Field label="Лейбл Email" value={info.mail_label} onChange={v => setI('mail_label', v)} />
              <Field label="Email адрес" value={info.mail_email} onChange={v => setI('mail_email', v)} />
              <p style={sectionTitleStyle}>Блок «Следить за нами»</p>
              <Field label="Заголовок" value={info.follow_heading} onChange={v => setI('follow_heading', v)} />
              <Field label="URL ВК (сообщество)" value={info.vk_community_url} onChange={v => setI('vk_community_url', v)} />
              <Field label="Хэндл ВК (отображается)" value={info.vk_community_handle} onChange={v => setI('vk_community_handle', v)} />
              <Field label="URL TikTok" value={info.tiktok_url} onChange={v => setI('tiktok_url', v)} />
              <Field label="Хэндл TikTok (отображается)" value={info.tiktok_handle} onChange={v => setI('tiktok_handle', v)} />
              <Field label="URL Instagram" value={info.instagram_url} onChange={v => setI('instagram_url', v)} />
              <Field label="Хэндл Instagram (отображается)" value={info.instagram_handle} onChange={v => setI('instagram_handle', v)} />
              <Field label="Дисклеймер про Meta" value={info.contacts_meta_disclaimer} onChange={v => setI('contacts_meta_disclaimer', v)} />
            </div>
          )}

          {infoTab === 'about' && (
            <div>
              <Field label="Название вкладки" value={info.tab3_label} onChange={v => setI('tab3_label', v)} />
              <p style={sectionTitleStyle}>Блоки</p>
              <Field label="Заголовок «Где мы»" value={info.location_heading} onChange={v => setI('location_heading', v)} />
              <Field label="Текст" value={info.location_text} onChange={v => setI('location_text', v)} rows={2} />
              <Field label="Заголовок «Что мы»" value={info.what_heading} onChange={v => setI('what_heading', v)} />
              <Field label="Текст" value={info.what_text} onChange={v => setI('what_text', v)} rows={3} />
              <Field label="Подтекст (курсив)" value={info.what_subtext} onChange={v => setI('what_subtext', v)} />
              <Field label="Заголовок «Как мы делаем»" value={info.how_heading} onChange={v => setI('how_heading', v)} />
              <Field label="Текст" value={info.how_text} onChange={v => setI('how_text', v)} rows={2} />
            </div>
          )}

          <SaveBtn onClick={handleSaveInfo} saving={savingInfo} msg={infoMsg} />
        </div>
      )}

      {/* ── PRIVACY ── */}
      {mainTab === 'privacy' && (
        <div>
          <p style={{ fontFamily: 'var(--font-involve)', fontSize: '0.78rem', opacity: 0.5, marginBottom: '1rem' }}>
            Для списков используй • в начале строки. Пустая строка = новый абзац.
          </p>

          {privacy.map((section, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-soft)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-onder)', fontSize: '0.58rem', letterSpacing: '0.1em', opacity: 0.4, textTransform: 'uppercase' }}>
                  Раздел {i + 1}
                </span>
                <button
                  onClick={() => removeSection(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', opacity: 0.4, fontSize: '1rem', lineHeight: 1, padding: '0.1rem 0.3rem' }}
                  title="Удалить раздел"
                >
                  ✕
                </button>
              </div>
              <Field
                label="Заголовок раздела"
                value={section.heading}
                onChange={v => updateSection(i, 'heading', v)}
              />
              <Field
                label="Текст (Enter = новая строка, • = пункт списка)"
                value={section.body}
                onChange={v => updateSection(i, 'body', v)}
                rows={5}
              />
            </div>
          ))}

          <button
            onClick={addSection}
            className={a.btn}
            style={{ marginBottom: '0.5rem' }}
          >
            + Добавить раздел
          </button>

          <SaveBtn onClick={handleSavePrivacy} saving={savingPrivacy} msg={privacyMsg} />
        </div>
      )}
    </div>
  )
}
