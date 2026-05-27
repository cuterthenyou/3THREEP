import NextAuth, { type DefaultSession } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { query, queryOne } from './db'
import { sendMagicLinkDirect } from './email'
import { randomBytes, createHash } from 'crypto'

// Хеширование токена (NextAuth использует SHA-256)
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

// Расширяем типы NextAuth для наших полей
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      emailVerified: Date | null
    } & DefaultSession['user']
  }
  
  interface User {
    id: string
    email: string
    emailVerified: Date | null
  }
}

// Кастомный адаптер для PostgreSQL
function PostgresAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await queryOne<{ id: string; email: string; email_confirmed_at: string | null }>(
        `INSERT INTO users (email, email_confirmed_at) 
         VALUES ($1, $2) 
         RETURNING id, email, email_confirmed_at`,
        [user.email, null]
      )
      
      if (!result) throw new Error('Failed to create user')
      
      // Создаём профиль
      await query(
        `INSERT INTO profiles (id, email) VALUES ($1, $2)`,
        [result.id, result.email]
      )
      
      return {
        id: result.id,
        email: result.email,
        emailVerified: result.email_confirmed_at ? new Date(result.email_confirmed_at) : null,
      }
    },

    async getUser(id) {
      const user = await queryOne<{ id: string; email: string; email_confirmed_at: string | null }>(
        `SELECT id, email, email_confirmed_at FROM users WHERE id = $1`,
        [id]
      )
      
      if (!user) return null
      
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      }
    },

    async getUserByEmail(email) {
      const user = await queryOne<{ id: string; email: string; email_confirmed_at: string | null }>(
        `SELECT id, email, email_confirmed_at FROM users WHERE email = $1`,
        [email]
      )
      
      if (!user) return null
      
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      // Не используем OAuth провайдеры
      return null
    },

    async updateUser(user) {
      const result = await queryOne<{ id: string; email: string; email_confirmed_at: string | null }>(
        `UPDATE users 
         SET email = COALESCE($2, email),
             email_confirmed_at = COALESCE($3, email_confirmed_at)
         WHERE id = $1
         RETURNING id, email, email_confirmed_at`,
        [user.id, user.email, user.emailVerified]
      )
      
      if (!result) throw new Error('User not found')
      
      return {
        id: result.id,
        email: result.email,
        emailVerified: result.email_confirmed_at ? new Date(result.email_confirmed_at) : null,
      }
    },

    async deleteUser(userId) {
      await query(`DELETE FROM users WHERE id = $1`, [userId])
    },

    async linkAccount(account) {
      // Не используем OAuth
      return account as any
    },

    async unlinkAccount({ provider, providerAccountId }) {
      // Не используем OAuth
    },

    async createSession({ sessionToken, userId, expires }) {
      // Используем JWT сессии, не храним в БД
      return { sessionToken, userId, expires }
    },

    async getSessionAndUser(sessionToken) {
      // Используем JWT сессии
      return null
    },

    async updateSession({ sessionToken }) {
      // Используем JWT сессии
      return null
    },

    async deleteSession(sessionToken) {
      // Используем JWT сессии
    },

    async createVerificationToken({ identifier, expires, token }) {
      // NextAuth передаёт УЖЕ ХЕШИРОВАННЫЙ токен (SHA-256)
      // Просто сохраняем его как есть
      console.log(`[Adapter] Saving hashed token for ${identifier}: ${token.substring(0, 10)}...`)
      
      await query(
        `INSERT INTO magic_links (email, token, expires_at) 
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE 
         SET token = $2, expires_at = $3, used = false`,
        [identifier, token, expires]
      )
      
      return { identifier, token, expires }
    },

    async useVerificationToken({ identifier, token }) {
      // NextAuth УЖЕ ХЕШИРУЕТ токен перед передачей сюда! Не хешируем второй раз.
      console.log(`[NextAuth] Verifying token for: ${identifier}`)
      console.log(`[NextAuth] Token (already hashed by NextAuth): ${token.substring(0, 10)}...`)
      
      const link = await queryOne<{ email: string; token: string; expires_at: Date; used: boolean }>(
        `SELECT email, token, expires_at, used 
         FROM magic_links 
         WHERE email = $1 AND token = $2`,
        [identifier, token]
      )
      
      if (!link) {
        console.log(`[NextAuth] Token not found in database`)
        return null
      }
      
      if (link.used) {
        console.log(`[NextAuth] Token already used`)
        return null
      }
      
      if (new Date() > new Date(link.expires_at)) {
        console.log(`[NextAuth] Token expired at ${link.expires_at}`)
        return null
      }
      
      // Помечаем как использованный
      await query(
        `UPDATE magic_links SET used = true WHERE email = $1 AND token = $2`,
        [identifier, token]
      )
      
      console.log(`[NextAuth] Token verified successfully for ${identifier}`)
      
      return {
        identifier: link.email,
        token: link.token,
        expires: link.expires_at,
      }
    },
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Доверяем всем хостам (для production)
  adapter: PostgresAdapter(),
  providers: [
    {
      id: 'email',
      type: 'email',
      name: 'Email',
      
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      maxAge: 15 * 60, // 15 минут
      
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          console.log(`[NextAuth] Sending magic link to: ${email}`)
          console.log(`[NextAuth] Callback URL: ${url}`)
          
          // Используем URL напрямую от NextAuth (прямой callback без промежуточной страницы)
          await sendMagicLinkDirect(email, url)
          
          console.log(`[NextAuth] Magic link sent successfully to ${email}`)
        } catch (error) {
          console.error(`[NextAuth] Error sending magic link:`, error)
          throw error
        }
      },
    },
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
  },
  pages: {
    signIn: '/auth',
    verifyRequest: '/auth?check=email',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Разрешаем вход всем верифицированным пользователям
      console.log(`[NextAuth] signIn callback for: ${user.email}`)
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        console.log(`[NextAuth] JWT callback - creating token for user: ${user.email}`)
        token.id = user.id
        token.email = user.email
        token.emailVerified = user.emailVerified
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      console.log(`[NextAuth] Redirect callback - url: ${url}, baseUrl: ${baseUrl}`)
      // После успешной верификации редиректим на /account
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/account`
    },
  },
})
