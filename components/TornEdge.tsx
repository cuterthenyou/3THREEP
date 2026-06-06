const DESKTOP_PATH = [
  'M 0 220 L 0 175',
  'L 20 80  L 41 170',
  'L 62 130 L 82 170',
  'L 103 70 L 123 170',
  'L 144 115 L 164 170',
  'L 185 60  L 205 170',
  'L 226 130 L 246 170',
  'L 267 90  L 287 170',
  'L 308 140 L 328 170',
  'L 349 65  L 369 170',
  'L 390 120 L 410 170',
  'L 431 85  L 451 170',
  'L 472 55  L 492 170',
  'L 513 130 L 533 170',
  'L 554 75  L 574 170',
  'L 595 110 L 615 170',
  'L 636 70  L 656 170',
  'L 677 140 L 697 170',
  'L 718 60  L 738 170',
  'L 759 125 L 779 170',
  'L 800 85  L 820 170',
  'L 841 65  L 861 170',
  'L 882 145 L 902 170',
  'L 923 80  L 943 170',
  'L 964 120 L 984 170',
  'L 1005 60  L 1025 170',
  'L 1046 125 L 1066 170',
  'L 1087 75  L 1107 170',
  'L 1128 105 L 1148 170',
  'L 1169 65  L 1189 170',
  'L 1210 135 L 1230 170',
  'L 1251 80  L 1271 170',
  'L 1292 120 L 1312 170',
  'L 1333 70  L 1353 170',
  'L 1374 130 L 1394 170',
  'L 1414 90  L 1440 175',
  'L 1440 220 Z',
].join(' ')

const MOBILE_PATH = [
  'M 0 140 L 0 95',
  'L 20 30  L 41 90',
  'L 62 80  L 82 90',
  'L 103 25 L 123 90',
  'L 144 70 L 164 90',
  'L 185 35 L 205 90',
  'L 226 85 L 246 90',
  'L 267 30 L 287 90',
  'L 308 75 L 328 90',
  'L 349 40 L 368 90',
  'L 389 65 L 414 95',
  'L 414 140 Z',
].join(' ')

const filterProps = {
  x: '-2%', y: '-25%', width: '104%', height: '150%',
}

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
    </div>
  )
}
