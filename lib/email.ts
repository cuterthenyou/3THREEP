import nodemailer from 'nodemailer'

// Проверяем наличие SMTP переменных
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ SMTP credentials not found in environment variables!')
  console.error('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'MISSING')
  console.error('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'MISSING')
}

// Создаём транспорт для SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  logger: true, // Включаем логирование
  debug: true, // Включаем debug режим
})

// Проверка подключения к SMTP (опционально, для дебага)
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

// Отправка OTP кода (6 цифр)
export async function sendOTP(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background: #1a1a1a;
            color: #F29774;
            padding: 40px 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #A9342A;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            background: #F29774;
            color: #A9342A;
            padding: 20px 40px;
            border-radius: 8px;
            display: inline-block;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Авторизация в личный кабинет</h1>
          <p>Введи этот код на странице входа:</p>
          
          <div class="code">${code}</div>
          
          <p>Код действителен 15 минут.</p>
          
          <div class="footer">
            <p>Если ты не запрашивал вход — просто проигнорируй это письмо.</p>
          </div>
        </div>
      </body>
    </html>
   `

  const text = `
Авторизация в личный кабинет.

Твой кодик: ${code}

Код действителен 15 минут,потом он самоудалится.

Если ты не ты и запрашивал вход — просто забей. Кайфуй!
  `

  try {
    await transporter.sendMail({
      from: `3THREEP <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Авторизация',
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

// Отправка уведомления о новом заказе (для админа)
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
