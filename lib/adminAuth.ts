import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/isAdmin'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) return null
  return session.user
}
