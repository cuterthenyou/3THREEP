import { Suspense } from 'react'
import AuthForm from './AuthForm'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}