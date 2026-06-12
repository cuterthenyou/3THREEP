import nodemailer, { type Transporter } from 'nodemailer'

// Транспорт создаётся ЛЕНИВО (на первой реальной отправке), а не при импорте —
// иначе при сборке (нет SMTP-секретов) сыпались бы ❌-ошибки и DEBUG-логи nodemailer.
let _transporter: Transporter | null = null
function getTransporter(): Transporter {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.yandex.ru',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return _transporter
}

function hasSmtp() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function verifyEmailConnection() {
  if (!hasSmtp()) { console.warn('[email] SMTP не настроен'); return false }
  try {
    await getTransporter().verify()
    return true
  } catch (error) {
    console.error('[email] SMTP connection failed:', error)
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
            <!-- Brand logo (inline SVG — guaranteed accent color across all clients) -->
            <svg width="186" height="23" viewBox="0 0 461 57" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:36px;max-width:220px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M124.199 0H129.771C130.242 0 130.646 0.197208 130.934 0.568513C131.223 0.938277 131.316 1.38045 131.2 1.83496L128.614 12.0867C128.498 12.5427 128.591 12.9834 128.88 13.3547C129.168 13.7244 129.573 13.9232 130.043 13.9232H139.569C140.039 13.9232 140.443 14.1204 140.732 14.4917C141.021 14.8614 141.113 15.3021 140.999 15.7581L139.793 20.5373C139.734 20.7654 139.78 20.9857 139.925 21.1706C140.07 21.3554 140.272 21.454 140.506 21.454H141.634C142.051 21.454 142.412 21.6081 142.7 21.9101L152.176 31.8182C152.465 32.1202 152.825 32.2743 153.242 32.2743H181.933C182.617 32.2743 183.195 31.8229 183.363 31.1604L185.965 20.8532C186.131 20.1907 186.709 19.7393 187.393 19.7393H210.218C210.687 19.7393 211.093 19.938 211.381 20.3078C211.67 20.6791 211.763 21.1197 211.647 21.5742L211.505 22.1381C211.337 22.8021 210.76 23.252 210.076 23.252H205.598C205.045 23.252 204.569 23.534 204.304 24.0193C204.097 24.3967 204.063 24.8143 204.199 25.1994C204.435 25.8712 204.168 26.5984 203.555 26.9589L202.113 27.8063C201.408 28.2223 200.95 28.8324 200.748 29.6274L194.123 55.8868C193.957 56.5493 193.379 56.9992 192.695 56.9992H166.121C165.651 56.9992 165.246 56.802 164.958 56.4307C164.669 56.0609 164.576 55.6203 164.691 55.1642L164.803 54.7205C164.97 54.058 165.548 53.6081 166.232 53.6081H176.551C177.235 53.6081 177.813 53.1567 177.979 52.4942L180.795 41.3397C180.909 40.8867 180.818 40.4507 180.535 40.0809C180.251 39.7112 179.852 39.5109 179.387 39.5047C178.982 39.4985 178.631 39.3445 178.347 39.0487L175.568 36.1429C175.28 35.841 174.92 35.6869 174.502 35.6869H157.414C157.138 35.6869 156.903 35.7516 156.667 35.8918L154.461 37.1891C153.986 37.4679 153.515 37.5958 152.965 37.5958H143.522C142.687 37.5958 141.968 37.2892 141.392 36.6853L137.823 32.9553C137.633 32.7565 137.368 32.6826 137.102 32.7519C136.835 32.8212 136.643 33.0169 136.576 33.285L131.91 51.7716C131.795 52.2277 131.887 52.6683 132.177 53.0396C132.465 53.4094 132.87 53.6081 133.34 53.6081H143.853C144.323 53.6081 144.727 53.8054 145.016 54.1767C145.304 54.5464 145.397 54.987 145.281 55.4431L145.17 55.8868C145.003 56.5493 144.425 56.9992 143.741 56.9992H94.371C93.9012 56.9992 93.4976 56.802 93.208 56.4307C92.9199 56.0609 92.8275 55.6203 92.943 55.1642L93.0539 54.7205C93.2218 54.058 93.7995 53.6081 94.4835 53.6081H110.245C110.929 53.6081 111.507 53.1567 111.675 52.4942L122.523 9.50603C122.658 8.96987 122.501 8.43987 122.095 8.06395C121.689 7.68802 121.149 7.57093 120.623 7.74811L86.8659 19.0845C81.9673 20.7299 78.529 24.443 77.2643 29.4533L71.6324 51.7716C71.5169 52.2277 71.6093 52.6683 71.8989 53.0396C72.187 53.4094 72.5921 53.6081 73.062 53.6081H78.3719C78.8417 53.6081 79.2469 53.8054 79.5349 54.1767C79.8245 54.5464 79.917 54.987 79.8014 55.4431L79.6905 55.8868C79.5226 56.5493 78.9449 56.9992 78.261 56.9992H32.4141C31.9442 56.9992 31.5391 56.802 31.251 56.4307C30.9614 56.0609 30.869 55.6203 30.9845 55.1642C31.0215 55.0163 31.06 54.8684 31.097 54.7205C31.2634 54.058 31.8426 53.6081 32.5265 53.6081H48.119C48.8029 53.6081 49.3806 53.1567 49.547 52.4942L56.4713 25.0577L20.055 14.6565L19.5267 14.5086C18.2558 14.1543 16.9557 14.6535 16.2486 15.7658L10.3256 25.0716C10.0467 25.5091 9.6 25.7541 9.08241 25.7541C8.11655 25.7541 7.15069 25.7541 6.18636 25.7541C5.63334 25.7541 5.16042 25.4737 4.89393 24.9884C4.62743 24.5046 4.64591 23.953 4.94322 23.4877L11.4963 13.1913C11.6257 12.988 11.6488 12.7584 11.5641 12.535C11.4809 12.3116 11.3114 12.1545 11.0819 12.0867L10.4811 11.911C10.2208 11.8355 10.0159 11.7107 9.82799 11.5151L5.12037 6.59413C4.74296 6.19818 4.32704 5.94704 3.8002 5.79606L1.07361 5.01801C0.611471 4.88551 0.271032 4.57275 0.100042 4.12441C-0.0694078 3.67453 -0.0231943 3.21387 0.235601 2.80867L1.58812 0.682523C1.86694 0.244969 2.31367 0 2.83126 0H24.9398C25.2156 0 25.4528 0.140202 25.5853 0.38209C25.7193 0.623977 25.71 0.89976 25.5622 1.13394L24.7426 2.41888C24.4654 2.85643 24.0186 3.1014 23.4995 3.1014H17.1282C17.0912 3.1014 17.0604 3.12759 17.0558 3.16457C17.0496 3.20154 17.0727 3.23544 17.1082 3.24622L53.1917 13.5534C53.6245 13.6767 53.9712 13.8646 54.3116 14.1604L56.5298 16.0832C56.7301 16.2558 56.9843 16.3082 57.2354 16.2296C57.4865 16.151 57.6636 15.9615 57.7283 15.7057L59.3674 9.20868C59.4259 8.98065 59.3797 8.76034 59.2349 8.57545C59.0901 8.38903 58.8883 8.29043 58.6526 8.29043H58.4277C58.2182 8.29043 58.0379 8.21493 57.8947 8.06395L56.3619 6.46163C56.0015 6.08262 55.8705 5.58807 55.9984 5.08118L56.5129 3.04593C56.6793 2.3819 57.2569 1.93202 57.9409 1.93202H67.1559C67.5733 1.93202 67.9338 2.08609 68.2219 2.38806L69.1538 3.36177C69.4419 3.66375 69.8024 3.81782 70.2198 3.81782H83.5463C84.2518 3.81782 84.8587 4.11363 85.2916 4.66982C85.7245 5.226 85.8631 5.88696 85.6906 6.56948L85.039 9.15167C84.8372 9.95745 85.0713 10.7524 85.6813 11.3163C86.2898 11.8802 87.1001 12.0543 87.8873 11.7893L121.853 0.383631C122.648 0.117092 123.362 0 124.199 0ZM379.376 0H395.719C396.136 0 396.497 0.154068 396.785 0.456043L399.565 3.36177C399.853 3.66375 400.212 3.81782 400.63 3.81782H413.18C413.73 3.81782 414.201 3.6884 414.674 3.40954L416.495 2.33876C416.969 2.0599 417.441 1.93202 417.989 1.93202H458.045C458.985 1.93202 459.795 2.32798 460.371 3.06904C460.949 3.81011 461.134 4.69139 460.904 5.60193L454.236 32.0278C453.399 35.3449 450.511 37.5958 447.09 37.5958H421.909C421.492 37.5958 421.133 37.4433 420.845 37.1413L419.89 36.1429C419.602 35.841 419.241 35.6869 418.824 35.6869H407.298C406.748 35.6869 406.277 35.8163 405.802 36.0952L400.699 39.098C400.224 39.3753 399.753 39.5047 399.203 39.5047H395.004C394.169 39.5047 393.451 39.1966 392.873 38.5942L387.748 33.2372C387.559 33.0385 387.295 32.963 387.027 33.0338C386.762 33.1047 386.568 33.2988 386.502 33.5669L381.995 51.4312C381.157 54.7482 378.268 56.9992 374.847 56.9992C331.534 56.9992 288.223 56.9992 244.91 56.9992C244.357 56.9992 243.884 56.7188 243.618 56.235C243.353 55.7497 243.37 55.1997 243.667 54.7328L251.204 42.8911C251.574 42.3103 251.502 41.5754 251.026 41.0793L248.564 38.5063C247.988 37.9039 247.27 37.5958 246.435 37.5958H236.082C235.664 37.5958 235.304 37.4433 235.016 37.1413L234.061 36.1429C233.773 35.841 233.414 35.6869 232.996 35.6869H214.933C214.463 35.6869 214.058 35.4897 213.77 35.1184C213.482 34.7486 213.388 34.308 213.503 33.8519L213.62 33.3866C213.788 32.7242 214.366 32.2743 215.05 32.2743H242.687C243.371 32.2743 243.949 31.8229 244.117 31.1604L248.402 14.1758C248.518 13.7198 248.425 13.2792 248.136 12.9094C247.848 12.5381 247.444 12.3409 246.973 12.3409C230.43 12.3409 213.225 12.3409 196.709 12.3409C196.193 12.3409 195.748 12.0975 195.469 11.6614L190.874 4.49572C190.594 4.05971 190.15 3.81782 189.632 3.81782H179.541C179.071 3.81782 178.666 3.61907 178.378 3.24931C178.088 2.878 177.996 2.43736 178.111 1.98132L178.33 1.11392C178.498 0.44988 179.076 0 179.76 0H198.807C199.323 0 199.769 0.243428 200.047 0.677902L201.625 3.13838C201.904 3.57439 202.349 3.81782 202.867 3.81782H226.328C226.876 3.81782 227.347 3.6884 227.822 3.40954L229.641 2.33876C230.116 2.0599 230.587 1.93202 231.137 1.93202H273.085C273.555 1.93202 273.96 2.12923 274.248 2.50053C274.538 2.8703 274.63 3.31247 274.514 3.76698L267.393 31.9877C267.227 32.6456 266.891 33.1632 266.356 33.5839L260.207 38.4185C259.621 38.8792 259.469 39.6896 259.849 40.3305L264.924 48.8829C265.13 49.2311 265.184 49.6039 265.085 49.9968L264.637 51.7716C264.522 52.2277 264.614 52.6683 264.904 53.0396C265.192 53.4094 265.597 53.6081 266.067 53.6081C277.531 53.6081 290.671 53.6081 302.061 53.6081C302.745 53.6081 303.322 53.1567 303.489 52.4942L307.449 36.8039C307.771 35.5236 307.549 34.2957 306.799 33.2079C306.051 32.1217 304.98 31.4793 303.669 31.3268L293.242 30.1189C290.731 29.8338 288.579 29.6936 286.054 29.6536L283.264 29.6104C283.03 29.6073 282.831 29.5072 282.69 29.3223C282.548 29.1374 282.503 28.9187 282.56 28.6937L282.736 27.9973C282.821 27.6661 283.109 27.4411 283.451 27.4411H286.427C289.093 27.4411 291.365 27.3225 294.018 27.0483L305.209 25.8897C308.347 25.5646 310.826 23.42 311.598 20.3602L315.31 5.65277C315.424 5.19673 315.332 4.75609 315.044 4.38633C314.754 4.01503 314.35 3.81782 313.881 3.81782H298.085C297.615 3.81782 297.211 3.61907 296.922 3.24931C296.634 2.878 296.541 2.43736 296.655 1.98132L296.876 1.11392C297.042 0.44988 297.62 0 298.304 0H352.976C353.446 0 353.851 0.197208 354.139 0.568513C354.428 0.938277 354.521 1.38045 354.405 1.83496L354.187 2.7039C354.019 3.3664 353.441 3.81782 352.757 3.81782H338.023C336.655 3.81782 335.498 4.71758 335.164 6.04411L331.545 20.3833C331.22 21.6759 331.448 22.9162 332.214 24.007C332.979 25.0978 334.07 25.7356 335.396 25.8666L347.558 27.0775C350.111 27.3318 352.295 27.4411 354.86 27.4411H357.066C357.3 27.4411 357.502 27.5397 357.646 27.7246C357.791 27.9095 357.836 28.1298 357.779 28.3579L357.609 29.0327C357.525 29.367 357.232 29.5935 356.885 29.5889L355.075 29.5688C352.031 29.5349 349.434 29.6644 346.407 29.9817L333.776 31.3036C330.642 31.6318 328.168 33.7749 327.397 36.8301L323.624 51.7716C323.51 52.2261 323.602 52.6683 323.891 53.0396C324.18 53.4094 324.584 53.6081 325.054 53.6081C337.887 53.6081 350.719 53.6081 363.551 53.6081C364.235 53.6081 364.813 53.1567 364.98 52.4942L372.683 21.9671C373.019 20.6406 374.174 19.7393 375.543 19.7393H397.156C397.624 19.7393 398.029 19.938 398.317 20.3078C398.607 20.6791 398.699 21.1197 398.584 21.5742L398.442 22.1381C398.274 22.8021 397.697 23.252 397.013 23.252H394.123L401.882 31.3637C402.458 31.9661 403.178 32.2743 404.012 32.2743H428.17C429.539 32.2743 430.695 31.373 431.029 30.0464L435.086 13.9679L434.821 12.8432L433.722 12.3409H398.384C397.55 12.3409 396.831 12.0328 396.253 11.4303L389.843 4.72682C389.266 4.12441 388.548 3.81782 387.711 3.81782H379.157C378.686 3.81782 378.282 3.61907 377.994 3.24931C377.705 2.878 377.612 2.43736 377.728 1.98132L377.946 1.11392C378.114 0.44988 378.692 0 379.376 0Z" fill="#F29774"/></svg>

            <!-- Scanline divider -->
            <div style="font-size:11px;line-height:1;letter-spacing:0.1em;color:#f29774;opacity:0.16;font-family:monospace,Courier,Arial,sans-serif;margin-bottom:22px;overflow:hidden;white-space:nowrap;">▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚</div>

            <!-- Pre-code label -->
            <div style="font-size:10px;letter-spacing:0.22em;color:#f29774;opacity:0.5;text-transform:uppercase;margin-bottom:18px;font-family:monospace,Courier,Arial,sans-serif;">
              // ${c.preCodeText}
            </div>

            <!-- Code block with HUD corner glyphs -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr>
                <td width="16" valign="top" style="font-size:16px;line-height:14px;color:#f29774;opacity:0.55;font-family:monospace,Courier,Arial,sans-serif;">&#9484;</td>
                <td></td>
                <td width="16" valign="top" align="right" style="font-size:16px;line-height:14px;color:#f29774;opacity:0.55;font-family:monospace,Courier,Arial,sans-serif;">&#9488;</td>
              </tr>
              <tr>
                <td colspan="3" style="background:#0e0e0e;border-left:3px solid #f29774;padding:22px 16px;text-align:center;">
                  <span style="font-size:44px;letter-spacing:0.38em;color:#f29774;font-family:monospace,Courier,Arial,sans-serif;font-weight:700;">${code}</span>
                </td>
              </tr>
              <tr>
                <td width="16" valign="bottom" style="font-size:16px;line-height:14px;color:#f29774;opacity:0.55;font-family:monospace,Courier,Arial,sans-serif;">&#9492;</td>
                <td></td>
                <td width="16" valign="bottom" align="right" style="font-size:16px;line-height:14px;color:#f29774;opacity:0.55;font-family:monospace,Courier,Arial,sans-serif;">&#9496;</td>
              </tr>
            </table>

            <!-- Actions: copy (best-effort, работает в вебмейле/браузере) + переход на сайт.
                 Почтовые клиенты вырезают JS, поэтому кнопка «копировать» — best-effort,
                 а ссылка «ввести код» работает всегда (открывает вход с подставленным e-mail;
                 на iOS/Android код подставляется из письма автозаполнением клавиатуры). -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding-right:10px;">
                  <button type="button"
                    onclick="try{navigator.clipboard.writeText('${code}');var b=this;b.innerHTML='СКОПИРОВАНО';setTimeout(function(){b.innerHTML='КОПИРОВАТЬ КОД'},1800);}catch(e){}return false;"
                    style="cursor:pointer;background:#0e0e0e;color:#f29774;border:1px solid #f29774;box-shadow:2px 2px 0 #f29774;padding:10px 18px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-family:monospace,Courier,Arial,sans-serif;">
                    КОПИРОВАТЬ КОД
                  </button>
                </td>
                <td>
                  <a href="${siteUrl}/auth?email=${encodeURIComponent(email)}&step=code"
                    style="display:inline-block;background:#f29774;color:#0e0e0e;border:1px solid #f29774;box-shadow:2px 2px 0 #0e0e0e;padding:11px 18px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-family:monospace,Courier,Arial,sans-serif;text-decoration:none;">
                    ВВЕСТИ КОД
                  </a>
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

  if (!hasSmtp()) { console.warn('[email] SMTP не настроен — OTP не отправлен'); throw new Error('SMTP not configured') }
  try {
    await getTransporter().sendMail({
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
  if (!adminEmail || !hasSmtp()) return

  const html = `
    <h2>Новый заказ #${orderData.orderId}</h2>
    <p><strong>Email:</strong> ${orderData.userEmail}</p>
    <p><strong>Сумма:</strong> ${orderData.total} ₽</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin/orders/${orderData.orderId}">Посмотреть заказ</a></p>
  `

  try {
    await getTransporter().sendMail({
      from: `"threep" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Новый заказ #${orderData.orderId}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send order notification:', error)
  }
}
