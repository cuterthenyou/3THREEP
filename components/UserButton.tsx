'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import s from './Header.module.css'

interface UserData {
  name: string
  level: number
  discount?: number
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ flexShrink: 0 }}>
      <polygon points="7,0.5 9.5,3 9.5,6 7,8.5 4.5,6 4.5,3"/>
      <path d="M1,14 L3.5,8.5 H10.5 L13,14 Z"/>
    </svg>
  )
}

export default function UserButton() {
  const [user, setUser] = useState<UserData | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (!open) return
    const onOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    setUser(null)
    await signOut({ redirect: false })
    // Жёсткий reload на главную — гарантированно сбрасывает состояние сессии/настроек
    window.location.href = '/'
  }

  if (user === undefined) return <div className="w-9 h-9 flex-shrink-0" />

  if (!user) {
    return (
      <Link href="/auth" aria-label="Войти" className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.navBtn}`}>
        <PersonIcon />
      </Link>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.navBtn}`}
        aria-label="Аккаунт"
      >
        <PersonIcon />
      </button>

      {open && (
        <div className={s.userDropdown}>
          {/* Шапка аккаунта — имя + уровень + скидка (как в ЛК / бургер-меню) */}
          <div className={s.userDropdownHead}>
            <span className={s.userDropdownName}>{user.name}</span>
            <span className={s.menuUserMeta}>
              <span className={s.menuUserLevel}>LVL {user.level}</span>
              {!!user.discount && user.discount > 0 && (
                <span className={s.menuUserDiscount}>−{user.discount}%</span>
              )}
            </span>
          </div>
          <Link href="/account" onClick={() => setOpen(false)} className={s.userDropdownItem}>
            Личный кабинет
          </Link>
          <button onClick={handleSignOut} className={s.userDropdownItem}>
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}
