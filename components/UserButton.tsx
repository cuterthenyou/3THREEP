'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import s from './Header.module.css'

interface UserData {
  name: string
  level: number
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function UserButton() {
  const [user, setUser] = useState<UserData | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
    router.push('/')
    router.refresh()
  }

  if (user === undefined) return null

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
