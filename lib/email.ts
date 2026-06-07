import nodemailer from 'nodemailer'

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ SMTP credentials not found in environment variables!')
  console.error('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'MISSING')
  console.error('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'MISSING')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  logger: true,
  debug: true,
})

export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ SMTP connection verified')
    return true
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    return false
  }
}

export type EmailAuthContent = {
  subject: string
  preCodeText: string
  expiryText: string
  footerText: string
}

export const EMAIL_AUTH_DEFAULTS: EmailAuthContent = {
  subject: 'Авторизация · 3THREEP',
  preCodeText: 'твой код для входа',
  expiryText: 'код действителен 15 минут',
  footerText: 'если ты не запрашивал вход — просто игнорируй это письмо',
}

async function fetchEmailContent(): Promise<EmailAuthContent> {
  try {
    const { queryMany } = await import('./db')
    const rows = await queryMany("SELECT value FROM site_settings WHERE key = 'email_auth_content' LIMIT 1")
    if (rows.length && rows[0].value) {
      return { ...EMAIL_AUTH_DEFAULTS, ...JSON.parse(rows[0].value) }
    }
  } catch {
    // DB not available — fall through to defaults
  }
  return EMAIL_AUTH_DEFAULTS
}

export async function sendOTP(email: string, code: string) {
  const c = await fetchEmailContent()
  const siteUrl = process.env.NEXTAUTH_URL || ''

  // Prefer uploaded logo_text_url from DB; fall back to static file
  let logoSrc = `${siteUrl}/images/logo-text-63.svg`
  try {
    const { queryMany } = await import('./db')
    const logoRows = await queryMany("SELECT value FROM site_settings WHERE key = 'logo_text_url' LIMIT 1")
    if (logoRows.length && logoRows[0].value) logoSrc = logoRows[0].value
  } catch {}

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#090909;font-family:monospace,Courier,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090909;padding:48px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;border:1px solid #1e1e1e;">
        <tr>
          <td style="padding:48px 44px 0;">
            <!-- Brand logo -->
            <img src="${logoSrc}" alt="3THREEP" width="186" height="23" style="display:block;margin-bottom:36px;height:23px;width:auto;max-width:220px;border:0;" />

            <!-- Pre-code label -->
            <div style="font-size:10px;letter-spacing:0.22em;color:#f29774;opacity:0.5;text-transform:uppercase;margin-bottom:20px;font-family:monospace,Courier,Arial,sans-serif;">
              ${c.preCodeText}
            </div>

            <!-- Code block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#0e0e0e;border:1px solid #242424;border-left:3px solid #f29774;padding:24px 16px;text-align:center;">
                  <span style="font-size:44px;letter-spacing:0.38em;color:#f29774;font-family:monospace,Courier,Arial,sans-serif;font-weight:700;">${code}</span>
                </td>
              </tr>
            </table>

            <!-- Expiry -->
            <div style="font-size:10px;letter-spacing:0.16em;color:#f29774;opacity:0.3;text-transform:uppercase;font-family:monospace,Courier,Arial,sans-serif;margin-bottom:48px;">
              ${c.expiryText}
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 44px;border-top:1px solid #181818;">
            <div style="font-size:9px;letter-spacing:0.12em;color:#f29774;opacity:0.18;text-transform:uppercase;font-family:monospace,Courier,Arial,sans-serif;line-height:1.6;">
              ${c.footerText}
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `3THREEP\n\n${c.preCodeText.toUpperCase()}\n\n${code}\n\n${c.expiryText}\n\n${c.footerText}`

  try {
    await transporter.sendMail({
      from: `3THREEP <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: c.subject,
      text,
      html,
    })
    console.log(`✅ OTP sent to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send OTP:', error)
    throw error
  }
}

export async function sendOrderNotification(orderData: {
  orderId: string
  userEmail: string
  total: number
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const html = `
    <h2>Новый заказ #${orderData.orderId}</h2>
    <p><strong>Email:</strong> ${orderData.userEmail}</p>
    <p><strong>Сумма:</strong> ${orderData.total} ₽</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin/orders/${orderData.orderId}">Посмотреть заказ</a></p>
  `

  try {
    await transporter.sendMail({
      from: `"threep" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Новый заказ #${orderData.orderId}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send order notification:', error)
  }
}
