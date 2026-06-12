'use client'

import { useState } from 'react'
import { AdminPageTitle } from '../components'
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

  // Числовое поле
  function Num({ label, value, onChange, step = 1, min, max, hint }: {
    label: string; value: number; onChange: (v: number) => void
    step?: number; min?: number; max?: number; hint?: string
  }) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>
          {label}{hint && <span style={{ opacity: 0.45, fontSize: '0.7rem' }}> · {hint}</span>}
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
        <Num label="Скорость пылесоса" value={cfg.roombaSpeed} onChange={v => set('roombaSpeed', v)} step={0.05} min={0.2} max={3} />
        <Num label="Скорость мышей" value={cfg.batSpeed} onChange={v => set('batSpeed', v)} step={0.05} min={0.2} max={3} />
        <Num label="Размер мышей" value={cfg.batScale} onChange={v => set('batScale', v)} step={0.05} min={0.4} max={2.5} />
        <Num label="Хаотичность полёта" value={cfg.chaos} onChange={v => set('chaos', v)} step={0.1} min={0} max={3} hint="резкость виражей" />
      </div>

      {/* Кривые сложности */}
      <div style={card}>
        <span style={sectionTitle}>Кривые сложности</span>
        <Num label="Мышей на 1-й волне" value={cfg.baseCount} onChange={v => set('baseCount', v)} step={1} min={1} max={10} />
        <Num label="Рост числа мышей" value={cfg.countGrowth} onChange={v => set('countGrowth', v)} step={0.1} min={0} max={5} hint="× √(волна-1)" />
        <Num label="Потолок (мобила)" value={cfg.capMobile} onChange={v => set('capMobile', v)} step={1} min={1} max={20} />
        <Num label="Потолок (десктоп)" value={cfg.capDesktop} onChange={v => set('capDesktop', v)} step={1} min={1} max={40} />
        <Num label="Прирост скорости/волну" value={cfg.speedGrowth} onChange={v => set('speedGrowth', v)} step={0.005} min={0} max={0.2} />
        <Num label="Интервал спавна, мс" value={cfg.spawnIntervalMs} onChange={v => set('spawnIntervalMs', v)} step={10} min={30} max={600} />
        <Num label="Бонус-волна каждые" value={cfg.bonusEvery} onChange={v => set('bonusEvery', v)} step={1} min={0} max={20} hint="0 = выкл" />
        <Num label="Респавн приманки: мин, мс" value={cfg.lureMinMs} onChange={v => set('lureMinMs', v)} step={500} min={1000} max={60000} hint="мышь до игры" />
        <Num label="Респавн приманки: макс, мс" value={cfg.lureMaxMs} onChange={v => set('lureMaxMs', v)} step={1000} min={2000} max={120000} hint="чаще ближе к мин" />
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
        <Num label="Босс каждые N уровней" value={cfg.bossEvery} onChange={v => set('bossEvery', v)} step={1} min={0} max={50} hint="0 = выкл" />
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-involve)', fontSize: '0.8rem' }}>Уровни мегабоссов</span>
          <input type="text" value={cfg.megaWaves.join(', ')}
            onChange={e => set('megaWaves', e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n)))}
            style={{ ...inputStyle, width: '9rem', fontFamily: 'monospace' }} placeholder="33, 66, 99" />
        </label>
        <Num label="HP обычного босса" value={cfg.bossHp} onChange={v => set('bossHp', v)} step={1} min={1} max={60} />
        <Num label="HP мегабосса" value={cfg.bossMegaHp} onChange={v => set('bossMegaHp', v)} step={1} min={1} max={120} />
        <Num label="Фаза щита, мс" value={cfg.bossShieldMs} onChange={v => set('bossShieldMs', v)} step={100} min={200} max={6000} />
        <Num label="Окно уязвимости, мс" value={cfg.bossVulnMs} onChange={v => set('bossVulnMs', v)} step={100} min={200} max={6000} />
        <Num label="Тайм-аут на убийство, мс" value={cfg.bossTimeoutMs} onChange={v => set('bossTimeoutMs', v)} step={1000} min={5000} max={180000} />
        <Num label="Размер обычного босса" value={cfg.bossScale} onChange={v => set('bossScale', v)} step={0.1} min={1} max={6} />
        <Num label="Размер мегабосса" value={cfg.bossMegaScale} onChange={v => set('bossMegaScale', v)} step={0.1} min={1} max={8} />
      </div>
    </div>
  )
}
