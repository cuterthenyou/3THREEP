const DESKTOP_PATH = [
  'M 0 220 L 0 175',
  'L 24 132  L 48 170',
  'L 72 148  L 96 170',
  'L 120 118 L 144 170',
  'L 168 143 L 192 170',
  'L 216 128 L 240 170',
  'L 264 138 L 288 170',
  'L 312 115 L 336 170',
  'L 360 146 L 384 170',
  'L 408 124 L 432 170',
  'L 456 136 L 480 170',
  'L 504 120 L 528 170',
  'L 552 150 L 576 170',
  'L 600 130 L 624 170',
  'L 648 116 L 672 170',
  'L 696 145 L 720 170',
  'L 744 128 L 768 170',
  'L 792 118 L 816 170',
  'L 840 144 L 864 170',
  'L 888 125 L 912 170',
  'L 936 138 L 960 170',
  'L 984 115 L 1008 170',
  'L 1032 148 L 1056 170',
  'L 1080 132 L 1104 170',
  'L 1128 119 L 1152 170',
  'L 1176 143 L 1200 170',
  'L 1224 125 L 1248 170',
  'L 1272 135 L 1296 170',
  'L 1320 115 L 1344 170',
  'L 1368 142 L 1392 170',
  'L 1416 130 L 1440 175',
  'L 1440 220 Z',
].join(' ')

const MOBILE_PATH = [
  'M 0 140 L 0 95',
  'L 20 58  L 41 90',
  'L 62 68  L 82 90',
  'L 103 54 L 123 90',
  'L 144 74 L 164 90',
  'L 185 62 L 205 90',
  'L 226 72 L 246 90',
  'L 267 56 L 287 90',
  'L 308 78 L 328 90',
  'L 349 64 L 368 90',
  'L 389 73 L 414 95',
  'L 414 140 Z',
].join(' ')

const filterProps = {
  x: '-2%', y: '-25%', width: '104%', height: '150%',
}

const GRAIN_DATA_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function TornEdge() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width: '100%', zIndex: 5, pointerEvents: 'none', lineHeight: 0 }}
    >
      {/* Desktop: ~35 peaks */}
      <div
        className="hidden sm:block"
        style={{ height: '220px', marginTop: '-185px' }}
      >
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <filter id="torn-texture-d" {...filterProps}>
              <feTurbulence type="fractalNoise" baseFrequency="0.09 0.015" numOctaves="4" seed="23" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
          <path style={{ fill: 'var(--bg)' }} filter="url(#torn-texture-d)" d={DESKTOP_PATH}/>
        </svg>
      </div>

      {/* Mobile: ~10 peaks */}
      <div
        className="block sm:hidden"
        style={{ height: '140px', marginTop: '-110px' }}
      >
        <svg
          viewBox="0 0 414 140"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <filter id="torn-texture-m" {...filterProps}>
              <feTurbulence type="fractalNoise" baseFrequency="0.09 0.015" numOctaves="4" seed="23" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
          <path style={{ fill: 'var(--bg)' }} filter="url(#torn-texture-m)" d={MOBILE_PATH}/>
        </svg>
      </div>

      {/* Grain overlay — viewport-anchored to match global grain layer */}
      <div
        className="grain-fixed"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN_DATA_URI,
          backgroundRepeat: 'repeat',
          backgroundSize: 'var(--grain-size, 256px) var(--grain-size, 256px)',
          backgroundAttachment: 'fixed',
        }}
      />
    </div>
  )
}
