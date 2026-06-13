'use client'

import { useState } from 'react'
import { AdminPageTitle, InfoTip } from '../components'
import a from '../admin.module.css'
import { DEFAULT_GAME_CONFIG, ALL_POWERUPS, type GameConfig, type BatTypeCfg } from '@/lib/gameConfig'

const card: React.CSSProperties = {
  background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: 4,
  padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem',
}
const sectionTitle: React.CSSProperties = {
  color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: '0.72rem',
  letterSpacing: '0.14em', textTransform: 'uppercase',
}
const inputStyle: React.CSSProperties = {
  background: 'var(--bg-2)', color: 'var(--accent)', border: '1px solid var(--border)',
  fontFamily: 'monospace', fontSize: '0.82rem', borderRadius: 3, padding: '0.35rem 0.5rem',
  outline: 'none', width: '5.2rem',
}

// Живой график кривых: число мышей и относительная скорость по волнам (1..30).
// Считается ровно по той же формуле, что и в движке (наглядно «что я кручу»).
function CurvePreview({ cfg }: { cfg: GameConfig }) {
  const W = 300, H = 96, pad = 8, WAVES = 30
  const cap = cfg.capDesktop || 1
  const counts: number[] = []
  const speeds: number[] = []
  for (let i = 0; i < WAVES; i++) {
    const n = i + 1
    counts.push(Math.min(cap, Math.max(1, Math.round(cfg.baseCount + Math.sqrt(Math.max(0, n - 1)) * cfg.countGrowth))))
    speeds.push(1 + (n - 1) * cfg.speedGrowth)
  }
  const maxCount = Math.max(cap, ...counts, 1)
  const maxSpeed = Math.max(...speeds, 1.0001)
  const px = (i: number) => pad + (i / (WAVES - 1)) * (W - 2 * pad)
  const pyC = (v: number) => H - pad - (v / maxCount) * (H - 2 * pad)
  const pyS = (v: number) => H - pad - ((v - 1) / (maxSpeed - 1 || 1)) * (H - 2 * pad)
  const line = (arr: number[], y: (v: number) => number) =>
    arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="96" preserveAspectRatio="none"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 3 }}>
        {/* сетка */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={pad} x2={W - pad} y1={pad + f * (H - 2 * pad)} y2={pad + f * (H - 2 * pad)}
            stroke="var(--border-soft)" strokeWidth="1" />
        ))}
        <path d={line(counts, pyC)} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <path d={line(speeds, pyS)} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      </svg>
      <span style={{ color: 'var(--accent)', opacity: 0.55, fontFamily: 'var(--font-involve)', fontSize: '0.62rem', letterSpacing: '0.04em' }}>
        Волны 1–30 · ▬ мышей/волну (макс {maxCount}) · ┄ скорость (до ×{maxSpeed.toFixed(2)})
      </span>
    </div>
  )
}

export default function GameClient({ initialConfig }: { initialConfig: GameConfig }) {
  const [cfg, setCfg] = useState<GameConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function set<K extends keyof GameConfig>(key: K, value: GameConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: value }))
  }
  function setType(which: 'typeNormal' | 'typeGold' | 'typeArmored', field: keyof BatTypeCfg, value: number) {
    setCfg(prev => ({ ...prev, [which]: { ...prev[which], [field]: value } }))
  }
  function togglePowerup(key: string) {
    setCfg(prev => ({
      ...prev,
      powerupPool: prev.powerupPool.includes(key)
        ? prev.powerupPool.filter(k => k !== key)
        : [...prev.powerupPool, key],
    }))
  }

  async function save() {
    setSaving(true); setMsg('')
    try {
      await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'game_config', value: JSON.stringify(cfg) }),
      })
      setMsg('✓ Сохранено — обновляю страницу…')
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setSaving(false); setMsg('Ошибка сохранения')
    }
  }

  function resetDefaults() {
    setCfg(DEFAULT_GAME_CONFIG)
    setMsg('Сброшено к дефолтам — не забудь сохранить')
  }

  // Числовое поле (+ опц. тултип-пояснение)
  function Num({ label, value, onChange, step = 1, min, max, hint, tip }: {
    label: string; value: number; onChange: (v: number) => void
    step?: number; min?: number; max?: number; hint?: string; tip?: string
  }) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>
          {label}{hint && <span style={{ opacity: 0.45, fontSize: '0.7rem' }}> · {hint}</span>}
          {tip && <InfoTip text={tip} />}
        </span>
        <input type="number" value={value} step={step} min={min} max={max}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={inputStyle} />
      </label>
    )
  }

  // Строка типа мыши
  function TypeRow({ which, label }: { which: 'typeNormal' | 'typeGold' | 'typeArmored'; label: string }) {
    const t = cfg[which]
    const field = (f: keyof BatTypeCfg, ph: string, step = 1) => (
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ph}</span>
        <input type="number" value={t[f]} step={step} min={0}
          onChange={e => setType(which, f, parseFloat(e.target.value))}
          style={{ ...inputStyle, width: '4.2rem' }} />
      </label>
    )
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '0.6rem', padding: '0.5rem 0.6rem', background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 3 }}>
        <span style={{ flex: '1 0 100%', color: 'var(--accent)', fontFamily: 'var(--font-onder)', fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        {field('hp', 'HP')}
        {field('speed', 'Скорость', 0.05)}
        {field('weight', 'Вес')}
        {field('minWave', 'С волны')}
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <AdminPageTitle>Игра «Охота»</AdminPageTitle>
        <div className="flex items-center gap-2">
          <button onClick={resetDefaults} className={a.btnSecondary}>Сбросить</button>
          <button onClick={save} disabled={saving} className={a.btn}>{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </div>
      {msg && <p style={{ color: msg.startsWith('✓') ? 'var(--status-delivered)' : 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>{msg}</p>}

      {/* Глобальные множители */}
      <div style={card}>
        <span style={sectionTitle}>Глобально</span>
        <Num label="Скорость пылесоса" value={cfg.roombaSpeed} onChange={v => set('roombaSpeed', v)} step={0.05} min={0.2} max={3}
          tip="Скорость робота-пылесоса, который собирает кровь между волнами (×). 1 — норма." />
        <Num label="Скорость мышей" value={cfg.batSpeed} onChange={v => set('batSpeed', v)} step={0.05} min={0.2} max={3}
          tip="Глобальный множитель скорости всех мышей (×). Множится на прирост по волнам и тип мыши." />
        <Num label="Размер мышей" value={cfg.batScale} onChange={v => set('batScale', v)} step={0.05} min={0.4} max={2.5}
          tip="Глобальный масштаб спрайтов мышей (×). Больше — легче попадать." />
        <Num label="Хаотичность полёта" value={cfg.chaos} onChange={v => set('chaos', v)} step={0.1} min={0} max={3} hint="резкость виражей"
          tip="Резкость и частота виражей мышей. 0 — летят плавно/предсказуемо; 3 — дёрганые, трудно попасть." />
      </div>

      {/* Кривые сложности */}
      <div style={card}>
        <span style={sectionTitle}>Кривые сложности</span>
        {/* Живой график: как растут число мышей и скорость по волнам */}
        <CurvePreview cfg={cfg} />
        <Num label="Мышей на 1-й волне" value={cfg.baseCount} onChange={v => set('baseCount', v)} step={1} min={1} max={10}
          tip="Сколько мышей появляется на самой первой волне. От 1 до 10. Больше — сложнее сразу со старта." />
        <Num label="Рост числа мышей" value={cfg.countGrowth} onChange={v => set('countGrowth', v)} step={0.1} min={0} max={5} hint="× √(волна-1)"
          tip="Насколько быстро растёт число мышей с волнами (умножается на √(волна−1)). 0 — число не растёт; 1.7 — заметный рост. Упирается в потолок." />
        <Num label="Потолок (мобила)" value={cfg.capMobile} onChange={v => set('capMobile', v)} step={1} min={1} max={20}
          tip="Максимум мышей одновременно на телефоне (узкий экран). Дальше сложность растёт скоростью, а не количеством." />
        <Num label="Потолок (десктоп)" value={cfg.capDesktop} onChange={v => set('capDesktop', v)} step={1} min={1} max={40}
          tip="Максимум мышей одновременно на десктопе. Обычно больше мобильного потолка." />
        <Num label="Прирост скорости/волну" value={cfg.speedGrowth} onChange={v => set('speedGrowth', v)} step={0.005} min={0} max={0.2}
          tip="На сколько прибавляется скорость мышей за каждую волну. 0 — скорость постоянна; 0.035 ≈ +3.5%/волна. Главный рычаг сложности на высоких уровнях." />
        <Num label="Интервал спавна, мс" value={cfg.spawnIntervalMs} onChange={v => set('spawnIntervalMs', v)} step={10} min={30} max={600}
          tip="Пауза между появлением мышей в волне, в миллисекундах. Меньше — мыши вываливаются кучнее/резче." />
        <Num label="Бонус-волна каждые" value={cfg.bonusEvery} onChange={v => set('bonusEvery', v)} step={1} min={0} max={20} hint="0 = выкл"
          tip="Каждые N волн — «сварм»: больше мышей, быстрее, больше золота. 0 — выключить бонус-волны." />
        <Num label="Респавн приманки: мин, мс" value={cfg.lureMinMs} onChange={v => set('lureMinMs', v)} step={500} min={1000} max={60000} hint="мышь до игры"
          tip="Мышь-приманка до старта игры. Минимальная пауза до её повторного появления, мс." />
        <Num label="Респавн приманки: макс, мс" value={cfg.lureMaxMs} onChange={v => set('lureMaxMs', v)} step={1000} min={2000} max={120000} hint="чаще ближе к мин"
          tip="Максимальная пауза до появления приманки, мс. Реальная пауза случайна в диапазоне мин–макс, чаще ближе к минимуму." />
      </div>

      {/* Типы мышей */}
      <div style={card}>
        <span style={sectionTitle}>Типы мышей</span>
        <p style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.72rem' }}>
          Вес — относительная частота появления. С волны — когда тип начинает встречаться.
        </p>
        <TypeRow which="typeNormal" label="Обычная" />
        <TypeRow which="typeGold" label="Золотая (быстрая, даёт бонусы)" />
        <TypeRow which="typeArmored" label="Бронированная (живучая)" />
      </div>

      {/* Бонусы */}
      <div style={card}>
        <span style={sectionTitle}>Бонусы (пауэрапы)</span>
        <div className="flex flex-wrap gap-2">
          {ALL_POWERUPS.map(p => {
            const on = cfg.powerupPool.includes(p.key)
            return (
              <button key={p.key} onClick={() => togglePowerup(p.key)}
                className={on ? a.btn : a.btnSecondary} style={{ padding: '0.35rem 0.7rem' }}>
                {on ? '✓ ' : ''}{p.label}
              </button>
            )
          })}
        </div>
        <Num label="Глоб. множитель шанса" value={cfg.powerupChance} onChange={v => set('powerupChance', v)} step={0.1} min={0} max={3} />
        <Num label="Шанс дропа у золотой" value={cfg.goldDropChance} onChange={v => set('goldDropChance', v)} step={0.05} min={0} max={1} />
        <Num label="Шанс дропа у обычной" value={cfg.normalDropChance} onChange={v => set('normalDropChance', v)} step={0.05} min={0} max={1} />
      </div>

      {/* Боссы */}
      <div style={card}>
        <span style={sectionTitle}>Боссы и мегабоссы</span>
        <Num label="Босс каждые N уровней" value={cfg.bossEvery} onChange={v => set('bossEvery', v)} step={1} min={0} max={50} hint="0 = выкл"
          tip="Через сколько волн появляется босс. 10 = каждая 10-я волна. 0 — боссов нет." />
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Уровни мегабоссов</span>
          <input type="text" value={cfg.megaWaves.join(', ')}
            onChange={e => set('megaWaves', e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n)))}
            style={{ ...inputStyle, width: '9rem', fontFamily: 'monospace' }} placeholder="33, 66, 99" />
        </label>
        <Num label="HP обычного босса" value={cfg.bossHp} onChange={v => set('bossHp', v)} step={1} min={1} max={60}
          tip="Сколько попаданий В ОКНО УЯЗВИМОСТИ нужно, чтобы убить босса. Больше — дольше бой." />
        <Num label="HP мегабосса" value={cfg.bossMegaHp} onChange={v => set('bossMegaHp', v)} step={1} min={1} max={120}
          tip="HP мегабосса (волны из списка выше). Обычно заметно больше обычного." />
        <Num label="Фаза щита, мс" value={cfg.bossShieldMs} onChange={v => set('bossShieldMs', v)} step={100} min={200} max={6000}
          tip="Сколько босс держит щит (бить бесполезно), мс. Больше — реже окна для удара." />
        <Num label="Окно уязвимости, мс" value={cfg.bossVulnMs} onChange={v => set('bossVulnMs', v)} step={100} min={200} max={6000}
          tip="Длительность окна, когда босс уязвим (открыт «третий глаз»), мс. Больше — легче попасть." />
        <Num label="Тайм-аут на убийство, мс" value={cfg.bossTimeoutMs} onChange={v => set('bossTimeoutMs', v)} step={1000} min={5000} max={180000}
          tip="Сколько даётся на убийство босса до гейм-овера, мс. У мегабосса ×1.7. 45000 = 45 сек." />
        <Num label="Размер обычного босса" value={cfg.bossScale} onChange={v => set('bossScale', v)} step={0.1} min={1} max={6}
          tip="Масштаб спрайта обычного босса (×). 2.5 — крупнее обычной мыши в 2.5 раза." />
        <Num label="Размер мегабосса" value={cfg.bossMegaScale} onChange={v => set('bossMegaScale', v)} step={0.1} min={1} max={8}
          tip="Масштаб спрайта мегабосса (×). Обычно больше обычного босса." />
      </div>

      {/* Реплики боссов (MK-style диалог перед волной) */}
      <div style={card}>
        <span style={sectionTitle}>Реплики боссов</span>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>
            Диалог перед боссом<span style={{ opacity: 0.45, fontSize: '0.7rem' }}> · печатный текст в стиле MK</span>
          </span>
          <input type="checkbox" checked={cfg.bossSpeechEnabled !== false}
            onChange={e => set('bossSpeechEnabled', e.target.checked)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Реплики обычного босса · по одной на строку (выбор случайный)</span>
          <textarea rows={4} value={(cfg.bossSpeeches ?? []).join('\n')}
            onChange={e => set('bossSpeeches', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
            style={{ ...inputStyle, width: '100%', fontFamily: 'var(--font-involve)', resize: 'vertical' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-involve)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Реплики мегабосса · по одной на строку</span>
          <textarea rows={3} value={(cfg.bossMegaSpeeches ?? []).join('\n')}
            onChange={e => set('bossMegaSpeeches', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
            style={{ ...inputStyle, width: '100%', fontFamily: 'var(--font-involve)', resize: 'vertical' }} />
        </label>
      </div>
    </div>
  )
}
