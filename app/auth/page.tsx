import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthForm from './AuthForm'

export const dynamic = 'force-dynamic'

// Страница входа — не индексируем.
export const metadata: Metadata = { title: 'Вход', robots: { index: false, follow: false } }

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}