// Dense jagged peaks across the full width.
// Height envelope varies in clusters — no isolated dramatic spikes.
// ViewBox 0 0 1440 160. Base y≈148. Peak range y=65–122.
const TORN_PATH = [
  'M 0 160 L 0 115',
  // ── medium-small zone (x 0–180) y 95–118 ────────────────────────────
  'L 8 110 L 14 118 L 20 108 L 26 116 L 32 108',
  'L 38 115 L 44 106 L 50 114 L 56 105 L 62 112',
  'L 68 104 L 75 112 L 82 103 L 88 112 L 94 104',
  'L 100 114 L 108 105 L 115 113 L 122 104 L 128 113',
  'L 135 105 L 142 114 L 150 106 L 158 115 L 165 107',
  'L 172 116 L 180 108',
  // ── taller zone (x 180–350) y 72–108 ────────────────────────────────
  'L 188 100 L 195 108 L 202 95 L 208 106 L 215 90',
  'L 222 102 L 228 85 L 235 97 L 242 80 L 248 93',
  'L 255 76 L 262 90 L 268 78 L 275 92 L 282 80',
  'L 288 94 L 295 82 L 302 96 L 308 84 L 315 98',
  'L 322 88 L 330 100 L 338 90 L 345 102 L 350 94',
  // ── medium-small zone (x 350–490) y 106–120 ─────────────────────────
  'L 358 108 L 365 116 L 372 108 L 380 118 L 388 110',
  'L 395 118 L 402 108 L 410 116 L 418 108 L 426 118',
  'L 434 110 L 442 118 L 448 108 L 455 116 L 462 108',
  'L 470 118 L 478 110 L 485 118 L 490 110',
  // ── medium rise (x 490–640) y 78–110 ────────────────────────────────
  'L 498 106 L 505 95 L 512 106 L 518 88 L 525 100',
  'L 532 82 L 538 95 L 545 80 L 552 92 L 558 82',
  'L 565 94 L 572 83 L 580 96 L 588 84 L 595 98',
  'L 602 88 L 608 100 L 615 90 L 622 102 L 628 92',
  'L 635 104 L 640 96',
  // ── small zone (x 640–810) y 108–122 ────────────────────────────────
  'L 648 110 L 655 118 L 662 112 L 670 120 L 678 112',
  'L 686 120 L 694 112 L 702 120 L 710 112 L 718 120',
  'L 726 112 L 734 120 L 742 112 L 750 122 L 758 114',
  'L 766 120 L 774 112 L 782 120 L 790 114 L 800 120',
  'L 808 114 L 810 120',
  // ── tallest zone (x 810–955) y 65–105 ──────────────────────────────
  'L 818 110 L 825 98 L 832 88 L 838 75 L 845 88',
  'L 851 74 L 858 66 L 865 78 L 870 68 L 878 80',
  'L 884 70 L 892 82 L 898 72 L 905 84 L 912 74',
  'L 918 88 L 925 78 L 932 92 L 940 82 L 948 96 L 955 88',
  // ── small zone (x 955–1095) y 108–120 ──────────────────────────────
  'L 962 110 L 970 120 L 978 112 L 986 120 L 994 112',
  'L 1002 120 L 1010 112 L 1018 120 L 1026 112 L 1034 120',
  'L 1042 114 L 1050 120 L 1058 112 L 1066 120 L 1074 112',
  'L 1082 120 L 1090 114 L 1095 120',
  // ── medium zone (x 1095–1252) y 85–114 ─────────────────────────────
  'L 1103 112 L 1110 100 L 1118 110 L 1125 88 L 1132 100',
  'L 1138 86 L 1145 98 L 1152 88 L 1160 100 L 1168 90',
  'L 1175 104 L 1182 92 L 1190 106 L 1198 94 L 1205 108',
  'L 1212 96 L 1220 108 L 1228 98 L 1235 110 L 1242 100',
  'L 1248 112 L 1252 104',
  // ── small zone (x 1252–1440) y 110–122 ─────────────────────────────
  'L 1260 110 L 1268 120 L 1276 112 L 1284 120 L 1292 114',
  'L 1300 122 L 1308 114 L 1316 122 L 1324 114 L 1332 120',
  'L 1340 112 L 1348 120 L 1356 112 L 1364 120 L 1372 112',
  'L 1380 120 L 1388 114 L 1396 122 L 1404 114 L 1412 120',
  'L 1420 112 L 1428 120 L 1436 114 L 1440 118',
  'L 1440 160 Z',
].join(' ')

export default function TornEdge() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        marginTop: '-130px',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'block',
        lineHeight: 0,
      }}
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter id="torn-texture" x="-2%" y="-25%" width="104%" height="150%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.09 0.015"
              numOctaves="4"
              seed="23"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <path
          style={{ fill: 'var(--bg)' }}
          filter="url(#torn-texture)"
          d={TORN_PATH}
        />
      </svg>
    </div>
  )
}
