// Torn edge path — sparse big features left, increasingly dense small peaks right
// ViewBox 0 0 1440 160. Base ~y=130. Peaks down to y=6 (tallest).
const TORN_PATH = [
  'M 0 160',
  'L 0 130',
  // ── BIG LEFT SWOOP (x 0-122) ──────────────────────────────────────
  'L 8 115 L 18 88 L 26 62 L 34 40 L 40 25 L 46 14',
  'L 52 8',                          // tallest left peak
  'L 58 16 L 64 10',                 // double tip
  'L 70 24 L 78 45 L 88 72 L 98 102 L 110 122 L 122 130',
  // ── SHORT CALM + MEDIUM FEATURE (x 122-252) ────────────────────────
  'L 138 130 L 152 128',
  'L 162 118 L 172 98 L 180 75 L 186 58',
  'L 192 45 L 198 55 L 204 42',      // cluster mini
  'L 210 58 L 218 80 L 228 105 L 240 122 L 252 130',
  // ── LONG CALM + MEDIUM-TALL (x 252-470) ────────────────────────────
  'L 270 130 L 290 128 L 312 130 L 332 128',
  'L 348 118 L 362 100 L 374 78 L 384 55 L 392 38 L 398 25',
  'L 404 35 L 410 28',               // double tip
  'L 415 40 L 422 60 L 432 85 L 445 110 L 458 126 L 470 130',
  // ── MEDIUM CALM + ULTRA DOUBLE PEAK (x 470-678) ────────────────────
  'L 488 128 L 505 130 L 522 128',
  'L 535 118 L 548 100 L 558 75 L 568 48 L 576 28 L 582 14',
  'L 588 6',                         // ultra peak
  'L 594 14 L 600 6',                // secondary even higher
  'L 606 18 L 614 38 L 624 62 L 636 90 L 650 115 L 664 128 L 678 130',
  // ── SHORT CALM + TIGHT CLUSTER (x 678-818) ─────────────────────────
  'L 692 128 L 705 130',
  'L 715 120 L 725 105 L 735 85 L 742 65',
  'L 748 45 L 754 62 L 760 45 L 766 58', // jagged cluster top
  'L 772 75 L 780 95 L 792 115 L 805 126 L 818 130',
  // ── MEDIUM CALM + MEDIUM FEATURE (x 818-960) ───────────────────────
  'L 832 128 L 848 130',
  'L 860 120 L 870 105 L 880 85 L 888 65 L 895 48',
  'L 902 60 L 908 48',               // double tip
  'L 915 65 L 924 88 L 935 110 L 948 125 L 960 130',
  // ── TRANSITION TO DENSE (x 960-1050) ───────────────────────────────
  'L 972 124 L 980 114 L 988 104 L 995 114 L 1002 106',
  'L 1010 116 L 1018 108 L 1026 118 L 1034 110 L 1042 120',
  // ── MEDIUM DENSE ~12px spacing (x 1050-1104) ───────────────────────
  'L 1050 113 L 1056 106 L 1062 113 L 1068 106 L 1074 116',
  'L 1080 110 L 1086 118 L 1092 112 L 1098 120 L 1104 114',
  // ── HIGH DENSITY ~8px spacing (x 1104-1160) ────────────────────────
  'L 1108 108 L 1112 114 L 1116 106 L 1120 112 L 1124 106',
  'L 1128 114 L 1132 108 L 1136 116 L 1140 110 L 1144 118',
  'L 1148 112 L 1152 120 L 1156 114 L 1160 108',
  // ── MAX DENSITY ~4px spacing (x 1160-1440) ─────────────────────────
  'L 1164 114 L 1168 106 L 1172 112 L 1176 106 L 1180 114',
  'L 1184 108 L 1188 116 L 1192 110 L 1196 118 L 1200 112',
  'L 1204 120 L 1208 114 L 1212 108 L 1216 114 L 1220 106',
  'L 1224 112 L 1228 116 L 1232 110 L 1236 118 L 1240 112',
  'L 1244 120 L 1248 114 L 1252 108 L 1256 114 L 1260 106',
  'L 1264 112 L 1268 116 L 1272 110 L 1276 118 L 1280 112',
  'L 1284 120 L 1288 114 L 1292 108 L 1296 114 L 1300 110',
  'L 1304 118 L 1308 112 L 1312 120 L 1316 114 L 1320 108',
  'L 1324 114 L 1328 106 L 1332 112 L 1336 116 L 1340 110',
  'L 1344 118 L 1348 112 L 1352 120 L 1356 114 L 1360 108',
  'L 1364 114 L 1368 106 L 1372 112 L 1376 116 L 1380 110',
  'L 1384 118 L 1388 112 L 1392 120 L 1396 114 L 1400 106',
  'L 1404 112 L 1408 116 L 1412 110 L 1416 118 L 1420 112',
  'L 1424 120 L 1428 114 L 1432 108 L 1436 114 L 1440 110',
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
              baseFrequency="0.075 0.012"
              numOctaves="5"
              seed="23"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="7"
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
