import NextAuth, { type DefaultSession } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { query, queryOne } from './db'
import { sendOTP } from './email'
import { randomBytes, createHash } from 'crypto'

// Хеширование токена (NextAuth использует SHA-256)
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

// Временное хранилище для OTP (email -> код)
const otpStore = new Map<string, string>()

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
      // NextAuth передаёт уже готовый OTP (из generateVerificationToken)
      console.log(`[Adapter] Saving OTP for ${identifier}: ${token}`)
      
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
      console.log(`[Adapter] Verifying OTP for: ${identifier}, input token: ${token.substring(0, 10)}...`)
      
      // Получаем сохранённый OTP
      const storedOtp = otpStore.get(identifier)
      if (!storedOtp) {
        console.log(`[Adapter] No OTP found in store for ${identifier}`)
        return null
      }
      
      console.log(`[Adapter] Stored OTP: ${storedOtp}`)
      console.log("SECRET:", process.env.NEXTAUTH_SECRET)
      console.log("TOKEN:", token)
      console.log("OTP:", storedOtp)

      console.log(
        "OTP HASH:",
        createHash("sha256")
          .update(storedOtp)
          .digest("hex")
      )

      console.log(
        "OTP+SECRET HASH:",
        createHash("sha256")
          .update(`${storedOtp}${process.env.NEXTAUTH_SECRET}`)
          .digest("hex")
      )
      
      // NextAuth хеширует токен перед передачей сюда
      // Проверяем: token == hash(storedOtp)?
      const hashedStoredOtp = hashToken(storedOtp)
      
      if (token !== hashedStoredOtp) {
        console.log(`[Adapter] Token mismatch: expected hash ${hashedStoredOtp.substring(0, 10)}..., got ${token.substring(0, 10)}...`)
        return null
      }
      
      // Проверяем в БД
      const link = await queryOne<{ email: string; token: string; expires_at: Date; used: boolean }>(
        `SELECT email, token, expires_at, used 
         FROM magic_links 
         WHERE email = $1 AND token = $2`,
        [identifier, hashedStoredOtp]
      )
      
      if (!link) {
        console.log(`[Adapter] OTP not found in DB`)
        otpStore.delete(identifier)
        return null
      }
      
      if (link.used) {
        console.log(`[Adapter] OTP already used`)
        otpStore.delete(identifier)
        return null
      }
      
      if (new Date() > new Date(link.expires_at)) {
        console.log(`[Adapter] OTP expired`)
        otpStore.delete(identifier)
        return null
      }
      
      // Помечаем как использованный
      await query(
        `UPDATE magic_links SET used = true WHERE email = $1 AND token = $2`,
        [identifier, hashedStoredOtp]
      )
      
      // Удаляем из временного хранилища
      otpStore.delete(identifier)
      
      console.log(`[Adapter] OTP verified successfully for ${identifier}`)
      
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
      
      // Переопределяем генерацию токена - создаём 6-значный OTP
      generateVerificationToken: () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        console.log(`[NextAuth] Generated OTP: ${otp}`)
        return otp
      },
      
      async sendVerificationRequest({ identifier: email, token }) {
        try {
          // Сохраняем оригинальный OTP (token ещё не хеширован здесь)
          otpStore.set(email, token)
          console.log(`[NextAuth] Stored OTP for ${email}: ${token}`)
          console.log(`[NextAuth] Sending OTP to: ${email}`)
          
          // Отправляем OTP код (не ссылку!)
          await sendOTP(email, token)
          
          console.log(`[NextAuth] OTP sent successfully to ${email}`)
        } catch (error) {
          console.error(`[NextAuth] Error sending OTP:`, error)
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
