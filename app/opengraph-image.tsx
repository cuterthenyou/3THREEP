import { ImageResponse } from 'next/og'

// Брендовый OG-баннер (ссылки в соцсетях/мессенджерах). Цвета — литералы намеренно:
// Satori (next/og) не понимает CSS-переменные, это растровая картинка, не UI.
// Текст латиницей — дефолтный шрифт Satori без кириллических глифов.

export const alt = 'THREEP — Custom Streetwear'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#090909'
const ACCENT = '#f29774'
const PANEL = '#0e0e0e'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* рамка-HUD */}
        <div style={{ position: 'absolute', inset: 36, border: `1px solid ${ACCENT}`, opacity: 0.5, display: 'flex' }} />

        {/* скан-полоса */}
        <div style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', color: ACCENT, opacity: 0.16, fontSize: 26, letterSpacing: 8, display: 'flex', justifyContent: 'center' }}>
          ▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚
        </div>

        <div style={{ fontSize: 30, color: ACCENT, opacity: 0.55, letterSpacing: 14, marginBottom: 18, display: 'flex' }}>
          // EXPERIMENTAL STREETWEAR
        </div>
        <div style={{ fontSize: 200, fontWeight: 700, color: ACCENT, letterSpacing: 10, lineHeight: 1, display: 'flex', borderLeft: `10px solid ${ACCENT}`, paddingLeft: 36, background: PANEL }}>
          3THREEP
        </div>
        <div style={{ fontSize: 34, color: ACCENT, opacity: 0.7, letterSpacing: 10, marginTop: 30, display: 'flex' }}>
          CINEMATIC · ANALOG · RAW
        </div>
      </div>
    ),
    { ...size },
  )
}
