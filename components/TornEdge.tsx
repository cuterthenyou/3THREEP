const TORN_PATH =
  'M 0 160' +
  ' L 0 138 L 22 135 L 42 128 L 58 118 L 72 98 L 82 80 L 90 95 L 102 118 L 122 135 L 145 138' +
  ' L 170 136 L 195 138 L 220 136 L 248 138 L 272 135 L 295 138' +
  ' L 318 132 L 335 118 L 350 98 L 362 72 L 372 48 L 380 28 L 388 15' +
  ' L 395 28 L 400 12 L 408 32 L 418 58 L 432 88 L 448 118 L 462 135 L 482 138' +
  ' L 508 136 L 535 138 L 560 136' +
  ' L 582 132 L 595 118 L 605 98 L 613 75 L 620 55 L 628 38' +
  ' L 635 52 L 641 35 L 647 20 L 654 35 L 661 50 L 668 35 L 673 20' +
  ' L 680 35 L 688 55 L 696 42 L 702 58 L 712 78 L 725 105 L 740 128 L 758 138' +
  ' L 780 136 L 805 138 L 828 136 L 852 138' +
  ' L 872 135 L 885 122 L 896 105 L 905 82 L 913 60 L 920 42 L 926 28 L 932 15' +
  ' L 938 8 L 943 16 L 948 6 L 954 20 L 962 40 L 972 68 L 985 98 L 1000 122 L 1018 135 L 1038 138' +
  ' L 1062 136 L 1086 138 L 1110 136' +
  ' L 1132 132 L 1148 118 L 1160 98 L 1170 78 L 1178 58 L 1186 40' +
  ' L 1193 28 L 1200 40 L 1206 28 L 1214 48 L 1226 72 L 1240 98 L 1256 120 L 1272 135 L 1288 138' +
  ' L 1305 135 L 1320 128 L 1332 112 L 1342 90 L 1350 68 L 1358 48 L 1365 30' +
  ' L 1372 42 L 1378 28 L 1385 16 L 1392 30 L 1400 52 L 1412 82 L 1425 112 L 1438 132 L 1440 138' +
  ' L 1440 160 Z'

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
              baseFrequency="0.055 0.008"
              numOctaves="5"
              seed="23"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="9"
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
